function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}

function Track(positions) {
  this.bySecond_ = [];
  for (var i = 1; i < positions.length; i++) {
    var curPos = positions[i];
    var prevPos = positions[i - 1];
    var timeDiff = curPos.time.diff(prevPos.time, 'seconds');
    for (var sec = 0; sec < timeDiff; sec++) {
      var t = 1.0 - (timeDiff - sec) / timeDiff;
      var lat = lerp(prevPos.lat, curPos.lat, t);
      var lon = lerp(prevPos.lon, curPos.lon, t);
      this.bySecond_.push({lat: lat, lon: lon});
    }
  }
  this.bySecond_.push({lat: positions[positions.length - 1].lat,
                       lon: positions[positions.length - 1].lon});
};


Track.prototype.positionAtTimeOffset = function(secs) {
  return this.bySecond_[secs];
};

Track.prototype.positionAtTimeOffsetWrap = function(secs) {
  return this.bySecond_[secs % this.bySecond_.length];
};

Track.prototype.duration = function() {
  return this.bySecond_.length - 1;
};


module.exports = Track;
