// Holds collections of the Blocks and your sprite.
// Game.prototype.step method calls
//   Game.prototype.move on all the objects,
//   and Game.prototype.checkCollisions checks for colliding objects.
// Game.prototype.draw(ctx) draws the game.
// Keeps track of dimensions of the space;
//   wraps objects around when they drift off the screen.

var BlockMan = require('./block_man_sprite');
var LevelConstants = require('../constants/levels');
var ColorConstants = require('../constants/colors');
var KeyConstants = require('../constants/keys');

var Game = function () {
  this.block_man_sprite = new BlockMan();
  this.levels = LevelConstants;
  this.levelNumber = 1;
  this.currentLevel = this.levels[this.levelNumber];

  this.blockManPos = this.getBlockManPos();
  this.blockManDirection = "right";
  this.holdingBlock = false;
  this.heldBlockPosition = [];

  this.addKeyListener();
};

Game.prototype.addKeyListener = function () {
  document.addEventListener("keydown", this._keyDownHandler.bind(this));
};

Game.prototype._keyDownHandler = function(e) {
  switch (e.keyCode) {
    case KeyConstants.LEFT:
      this.moveBlockManLeftOrRight("left");
      // console.log(this.getBlockManPos());
      console.log(this.blockManPos);
      this.applyGravity();
      console.log(this.blockManPos);
      // console.log(this.getBlockManPos());
      break;
    case KeyConstants.RIGHT:
      this.moveBlockManLeftOrRight("right");
      console.log(this.blockManPos);
      this.applyGravity();
      console.log(this.blockManPos);
      break;
    case KeyConstants.UP:
      this.moveBlockManUp();
      this.applyGravity();
      break;
    case KeyConstants.DOWN:
      this.handleBlockLiftOrDrop();
      this.applyGravity();
      break;
    case KeyConstants.SPACE:
      console.log("SPACE PRESSED");
      break;
    case KeyConstants.RESET:
      console.log("RESET PRESSED");
      break;
  }
}

Game.prototype.getBlockManPos = function () {
  var pos;
  this.currentLevel.forEach(function(row, rowIdx){
    row.forEach(function(cell, cellIdx){
      if (cell === 3) {
        pos = [rowIdx, cellIdx];
      }
    });
  });
  return pos;
};

Game.prototype.moveBlockManLeftOrRight = function (direction) {
  var row = this.blockManPos[0];

  var addToColumn = this.addToColumn(direction);

  var oldColumnPos = this.blockManPos[1];
  var newColumnPos = oldColumnPos + addToColumn;

  // Checks if the position BlockMan is moving toward is empty
  if (this.currentLevel[row][newColumnPos] === 0) {
    // If he is holding a block, checks if the block's new position is empty
    if (this.holdingBlock){
      var heldBlockRow = this.heldBlockPosition[0];
      var heldBlockColumn = this.heldBlockPosition[1];
      if (this.currentLevel[heldBlockRow][newColumnPos] === 0){
        console.log(this.heldBlockPosition);
        this.currentLevel[heldBlockRow][heldBlockColumn] = 0;
        this.currentLevel[heldBlockRow][newColumnPos] = 2;
        this.heldBlockPosition = [heldBlockRow, newColumnPos];
        console.log(this.heldBlockPosition);
        this.currentLevel[row][oldColumnPos] = 0;
        this.currentLevel[row][newColumnPos] = 3;
      }
    } else {
      this.currentLevel[row][oldColumnPos] = 0;
      this.currentLevel[row][newColumnPos] = 3;
    }
  }
  else if (this.currentLevel[row][newColumnPos] === 4) {
    this.currentLevel[row][oldColumnPos] = 0;
    this.currentLevel[row][newColumnPos] = 3;
    console.log("YOU WIN!");
  };

  this.blockManPos = this.getBlockManPos();
};

Game.prototype.addToColumn = function (direction) {
  var addToColumn = -1;

  if (direction !== undefined ) {
    this.blockManDirection = direction;
  }

  if (this.blockManDirection === "right") {
    addToColumn = 1;
  }

  return addToColumn;
};

Game.prototype.moveBlockManUp = function () {
  var oldRowPos = this.blockManPos[0];
  var oldColumnPos = this.blockManPos[1];

  var addToColumn = this.addToColumn();

  var newRowPos = oldRowPos - 1;
  var newColumnPos = oldColumnPos + addToColumn;

  var platform = this.currentLevel[oldRowPos][newColumnPos];
  if ((this.currentLevel[newRowPos][newColumnPos] === 0) && ((platform === 1) || (platform === 2))) {
    this.currentLevel[oldRowPos][oldColumnPos] = 0;
    this.currentLevel[newRowPos][newColumnPos] = 3;
  }

  this.blockManPos = this.getBlockManPos();
};

Game.prototype.applyGravity = function () {
  var that = this;
  that.currentLevel.forEach(function(row, rowIdx){
    row.forEach(function(cell, cellIdx){
      if ((cell === 2) || (cell === 3)) {
        if (that.currentLevel[rowIdx + 1][cellIdx] === 0) {
          that.currentLevel[rowIdx][cellIdx] = 0;
          that.currentLevel[rowIdx + 1][cellIdx] = cell;
        }
      }
    });
  });
  that.blockManPos = that.getBlockManPos();
};

Game.prototype.handleBlockLiftOrDrop = function () {
  var addToColumn = this.addToColumn();

  // Handles dropping a block
  if (this.holdingBlock) {
    var oldBlockRow = this.heldBlockPosition[0];
    var oldBlockColumn = this.heldBlockPosition[1];
    var newBlockColumn = oldBlockColumn + addToColumn;
    if (this.currentLevel[oldBlockRow][newBlockColumn] === 0){
      this.currentLevel[oldBlockRow][newBlockColumn] = 2;
      this.currentLevel[oldBlockRow][oldBlockColumn] = 0;
      this.holdingBlock = false;
    }
  }
  // Handles lifting up a block
  else {
    var currentRow = this.blockManPos[0];
    var currentColumn = this.blockManPos[1]
    var potentialBlockColumn = currentColumn + addToColumn;
    if ((this.currentLevel[currentRow][potentialBlockColumn] === 2) && (this.currentLevel[currentRow - 1][currentColumn] === 0)){
      console.log(this.currentLevel);
      this.currentLevel[currentRow][potentialBlockColumn] = 0;
      this.currentLevel[currentRow - 1][currentColumn] = 2;
      this.heldBlockPosition = [currentRow - 1, currentColumn];
      console.log(this.heldBlockPosition);
      console.log(this.currentLevel);
      this.holdingBlock = true;
    }
  }
};

Game.prototype.currentWidth = function () {
  return 40 * this.currentLevel[0].length;
};

Game.prototype.currentHeight = function () {
  return 40 * this.currentLevel.length;
};

Game.prototype.populateGame = function (ctx) {
  this.currentLevel.forEach(function(row, rowIdx){
    row.forEach(function(cell, cellIdx){
      ctx.beginPath();
      ctx.rect(cellIdx * 40, rowIdx * 40, 40, 40);
      ctx.fillStyle = ColorConstants[cell];
      ctx.fill();
      ctx.closePath();
    });
  });
};



Game.prototype.draw = function (ctx) {
  ctx.clearRect(0, 0, this.currentWidth(), this.currentHeight());
  ctx.fillStyle = "rgb(81, 164, 182)";
  ctx.fillRect(0, 0, this.currentWidth(), this.currentHeight());

  this.populateGame(ctx);
};

module.exports = Game;
