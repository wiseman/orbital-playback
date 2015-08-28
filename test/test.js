var assert = require("assert");
var moment = require('moment');
var Track = require('../lib/track');


describe('Track', function() {
  var positions = [{time: moment('2015-03-03 00:00:00-08'), lat: 0, lon: 10},
                   {time: moment('2015-03-03 00:00:01-08'), lat: 1, lon: 20},
                   {time: moment('2015-03-03 00:00:11-08'), lat: 2, lon: 30}];
  var track = new Track(positions);

  describe('#positionAtTimeOffset()', function () {
    it('0 should be 0, 10', function () {
      assert.equal(0, track.positionAtTimeOffset(0).lat);
      assert.equal(10, track.positionAtTimeOffset(0).lon);
    });
    it('1 should be 1, 20', function () {
      assert.equal(1, track.positionAtTimeOffset(1).lat);
      assert.equal(20, track.positionAtTimeOffset(1).lon);
    });
    it('11 should be 2, 30', function () {
      assert.equal(2, track.positionAtTimeOffset(11).lat);
      assert.equal(30, track.positionAtTimeOffset(11).lon);
    });
  });

  describe('#positionAtTimeOffsetWrap()', function () {
    it('0 should be 0, 10', function () {
      assert.equal(0, track.positionAtTimeOffsetWrap(12).lat);
      assert.equal(10, track.positionAtTimeOffsetWrap(12).lon);
    });
  })

  describe('#duration', function() {
    it('duration should be 11', function() {
      assert.equal(11, track.duration());
    });
  });
});
