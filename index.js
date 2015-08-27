var Canvas = require('canvas');
var csvParser = require('csv-parse');
var fs = require('fs');
var geo = require('geodesy');
var leftpad = require('leftpad');
var moment = require('moment');
var ProgressBar = require('progress');

var positions = [];
var tracks = [];
var input = fs.createReadStream('N520PD.csv');
var parser = csvParser();


function parseRecord(record) {
  return {
    time: moment(record[0]),
    lat: record[1],
    lon: record[2]
  };
}

function partitionTracks(positions) {
  var tracks = [];
  var track = undefined;
  var lastTime = undefined;
  for (i = 0; i < positions.length; i++) {
    if (!lastTime || positions[i].time.diff(lastTime, 'seconds') > 300) {
      if (track) {
        tracks.push(track);
      }
      track = [];
    }
    track.push(positions[i]);
    lastTime = positions[i].time;
  }
  if (track) {
    tracks.push(track);
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
  // var centerLoc = new geo.LatLonEllipsoidal(34.1334732, -118.1925192);
  var centerLoc = new geo.LatLonEllipsoidal(34.156149756733,
                                            -118.222884689317);
  var width = 1920;
  var height = 1080;
  var metersPerPix = 20000.0 / 1920.0;
  var canvas = new Canvas(1920, 1080);
  var ctx = canvas.getContext('2d');
  var numFrames = 5916;

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
      var pos = track[frame % track.length];
      var loc = new geo.LatLonEllipsoidal(pos.lat, pos.lon);
      var dist = centerLoc.distanceTo(loc);
      var bearing = centerLoc.initialBearingTo(loc).toRadians() + 180;
      var x = width / 2 + dist * Math.cos(bearing) / metersPerPix;
      var y = height / 2 + dist * Math.sin(bearing) / metersPerPix;
      var ping = ((frame + i) % 20) == 0;
      ctx.fillStyle = color;
      if (ping) {
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
      'frames/' + leftpad(frame, 5) + '.png',
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
  tracks = partitionTracks(positions);
  console.log(tracks.length + ' tracks found.');
  var longTracks = tracks.filter(function(track) {
    return track.length > 1 && trackTime(track) > 20 * 60;
  });
  console.log(longTracks.length + ' long tracks found.');
  times = longTracks.map(function(t) { return trackTime(t); });
  console.log(times.sort()[times.length - 1]);
  render(longTracks);
});

input.pipe(parser);
