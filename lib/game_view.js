var ImageConstants = require('../constants/images');
var CellConstants = require('../constants/cells');

var GameView = function (game, canvasEl) {
  this.canvasEl = canvasEl;
  this.game = game;
};

GameView.prototype.start = function () {
  window.setInterval(function() {
    this.game.draw(this.canvasEl, this);
  }.bind(this), 10);
};

GameView.prototype.draw = function (ctx) {
  var that = this;
  var game = this.game;

  game.currentLevel.forEach(function(row, rowIdx){
    row.forEach(function(cell, cellIdx){
      var img = new Image();
      switch (cell) {
        case CellConstants.BLOCKMAN:
          img.src = that.insertBlockManImage(that.game.blockMan);
          break;
        case CellConstants.WALL:
          img.src = that.determineWall(row, rowIdx, cellIdx);
          break;
        default:
          img.src = ImageConstants[cell];
          break;
      };
      ctx.drawImage(img, cellIdx * 40, rowIdx * 40);
    });
  });
  this.insertLevelNumber(ctx);
  this.insertTime(ctx);
  if (game.startGame === false){
    this.insertStart(ctx);
  }
};

GameView.prototype.insertBlockManImage = function (blockMan) {
  if (blockMan.getPosition().toString() === this.game.exitPosition.toString()){
    return ImageConstants["EXIT_BLOCKMAN"];
  } else {
    return ImageConstants[blockMan.getDirection()];
  }
};

GameView.prototype.insertLevelNumber = function (ctx) {
  ctx.font = 'italic 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'red';
  ctx.fillText('Level ' + this.game.currentLevelNumber, 10, 20);
};

GameView.prototype.insertStart = function (ctx) {
  ctx.font = 'italic 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'red';
  ctx.fillText('PRESS ENTER TO START', 100, 100);
};

GameView.prototype.insertTime = function (ctx) {
  ctx.font = 'italic 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'red';
  ctx.fillText('Time: ' + this.game.time, 100, 20);
};

GameView.prototype.determineWall = function (row, rowIdx, cellIdx) {
  if (rowIdx === 0) {
    return ImageConstants["CAVE_CEILING"];
  } else if (cellIdx === 0) {
    return ImageConstants["CAVE_EAST_WALL"];
  } else if (cellIdx === row.length - 1){
    return ImageConstants["CAVE_WEST_WALL"];
  } else {
    return ImageConstants["CAVE_FLOOR"];
  }
};

module.exports = GameView;
