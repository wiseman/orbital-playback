var Canvas = require('canvas');
var csvParser = require('csv-parse');
var fs = require('fs');
var geo = require('geodesy');
var leftpad = require('leftpad');
var moment = require('moment');
var path = require('path');
var ProgressBar = require('progress');
var Track = require('./lib/track');
var argv = require('yargs')
      .usage('Usage: $0 [options] <input CSV>')
      .help('help')
      .demand(1, 1, 'Must specify input CSV file')
      .default('session-timeout', 300)
      .describe('session-timeout', 'Max seconds between pings')
      .default('output-path', 'frames')
      .describe('output-path', 'Directory for output frames')
      .default('num-secs', 5000)
      .describe('num-secs', 'Number of seconds of flights to render')
      .default('strobe-period', 20)
      .describe('strobe-period', 'Seconds between strobes')
      .default('lat', 34.156149756733)
      .describe('lat', 'Center latitude')
      .default('lon', -118.222884689317)
      .describe('lon', 'Center longitude')
      .default('meters-per-pixel', 20000 / 1920.0)
      .describe('meters-per-pixel', 'Map scale')
      .default('width', 1920)
      .describe('width', 'Frame width in pixels')
      .default('height', 1080)
      .describe('height', 'Frame height in pixels')
      .strict()
      .argv;


var positions = [];
var tracks = [];
var input = fs.createReadStream(argv._[0]);
var parser = csvParser();


function parseRecord(record) {
  return {
    time: moment(record[0]),
    lat: record[1],
    lon: record[2]
  };
}

function partitionTracks(positions, timeout) {
  var tracks = [];
  var track = undefined;
  var lastTime = undefined;
  for (i = 0; i < positions.length; i++) {
    if (!lastTime || positions[i].time.diff(lastTime, 'seconds') > timeout) {
      if (track) {
        tracks.push(new Track(track));
      }
      track = [];
    }
    track.push(positions[i]);
    lastTime = positions[i].time;
  }
  if (track) {
    tracks.push(new Track(track));
  }
  return tracks;
}

function trackTime(track) {
  return track[track.length - 1].time.diff(
    track[0].time,
    'seconds');
}

var colors = [
  '#66ccff',
  '#66ffff',
  '#99ccff',
  '#cc99ff',
  '#ccccff',
  '#ccff66',
  '#ccffff',
  '#ff99ff',
  '#ffcccc',
  '#ffffcc',
  '#ff9900',

  // '#87CC87',
  // '#739A73',
  // '#2E872E',
  // '#ACE6AC',
  // '#BCE6BC',
  // '#70A897',
  // '#5F8076',
  // '#266F59',
  // '#9FD5C4',
  // '#AED5C9',
  // '#C3E799',
  // '#9AAF82',
  // '#6A9934',
  // '#D7F3B6',
  // '#DFF3C7',
];

function render(tracks) {
  var centerLoc = new geo.LatLonEllipsoidal(argv.lat, argv.lon);
  var width = 1920;
  var height = 1080;
  var metersPerPix = argv.metersPerPixel;
  var canvas = new Canvas(argv.width, argv.height);
  var ctx = canvas.getContext('2d');
  var numFrames = argv.numSecs;

  var bar = new ProgressBar('Rendering [:bar] :percent :elapsed of :etas', {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: numFrames
  });

  for (var frame = 0; frame < numFrames; frame++) {
    bar.tick();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);
    for (var i = 0; i < tracks.length; i++) {
      var track = tracks[i];
      var color = colors[i % colors.length];
      var pos = track.positionAtTimeOffsetWrap(frame);
      var loc = new geo.LatLonEllipsoidal(pos.lat, pos.lon);
      var dist = centerLoc.distanceTo(loc);
      var bearing = centerLoc.initialBearingTo(loc).toRadians() + 180;
      var x = width / 2 + dist * Math.cos(bearing) / metersPerPix;
      var y = height / 2 + dist * Math.sin(bearing) / metersPerPix;
      var strobe = ((frame + i) % argv.strobePeriod) == 0;
      ctx.fillStyle = color;
      if (strobe) {
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = '#f00';
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    fs.writeFileSync(
      path.join(argv.outputPath, leftpad(frame, 5) + '.png'),
      canvas.toBuffer());
  }
}


parser.on('error', function(err) {
  console.log('ERROR');
  console.log(err.message);
});

parser.on('readable', function() {
  while (record = parser.read()) {
    positions.push(parseRecord(record));
  }
});

parser.on('finish', function() {
  tracks = partitionTracks(positions, argv.sessionTimeout);
  console.log(tracks.length + ' tracks found.');
  var longTracks = tracks.filter(function(track) {
    return track.duration() > 20 * 60;
  });
  console.log(longTracks.length + ' long tracks found.');
  //console.log(longTracks.map(function(t) { return t.duration(); }).sort()[longTracks.length - 1]);
  render(longTracks);
});

input.pipe(parser);
