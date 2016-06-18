var BlockManSprite = require('./block_man_sprite');
var LevelConstants = require('../constants/levels');
var ColorConstants = require('../constants/colors');
var KeyConstants = require('../constants/keys');
var DirectionConstants = require('../constants/directions');
var CellConstants = require('../constants/cells');

var Game = function () {
  this.levelsArray = Object.keys(LevelConstants);
  this.currentLevelNumber = this.levelsArray[0];
  this.originalLevel = LevelConstants[this.currentLevelNumber];
  this.currentLevel = LevelConstants[this.currentLevelNumber];
  this.blockMan = new BlockManSprite(this.getBlockManPos());
  this.heldBlockPosition = [];
  this.addKeyListener();
};

Game.prototype.addKeyListener = function () {
  document.addEventListener("keydown", this._keyDownHandler.bind(this));
};

Game.prototype._keyDownHandler = function(e) {
  switch (e.keyCode) {
    case KeyConstants.LEFT:

      // console.log("Before moving left");
      // console.log(this.blockMan.getPosition());
      // console.log(this.blockMan.getDirection());

      this.moveBlockManLeftOrRight(DirectionConstants.LEFT);

      // console.log("After moving left");
      // console.log(this.blockMan.getPosition());
      // console.log(this.blockMan.getDirection());

      break;
    case KeyConstants.RIGHT:

      // console.log("Before moving right");
      // console.log(this.blockMan.getPosition());
      // console.log(this.blockMan.getDirection());

      this.moveBlockManLeftOrRight(DirectionConstants.RIGHT);

      // console.log("After moving right");
      // console.log(this.blockMan.getPosition());
      // console.log(this.blockMan.getDirection());

      break;
    case KeyConstants.UP:

      // console.log("Before moving up");
      // console.log(this.blockMan.getPosition());
      // console.log(this.blockMan.getDirection());

      this.moveBlockManUp();

      // console.log("After moving up");
      // console.log(this.blockMan.getPosition());
      // console.log(this.blockMan.getDirection());

      break;
    case KeyConstants.DOWN:

      this.handleBlockLiftOrDrop();
      break;
    case KeyConstants.SPACE:
      console.log("SPACE PRESSED");
      break;
    case KeyConstants.RESET:
      this.resetLevel();
      break;
  }
}

Game.prototype.resetLevel = function () {
  console.log("ORIGINAL LEVEL");
  console.log(this.originalLevel);
  // this.currentLevel = this.currentLevelNumber;
};

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
  var oldBlockManPosition = this.blockMan.getPosition();
  var potentialPosition = this.getPotentialMove(oldBlockManPosition, direction, false);

  // Checks if the position BlockMan is moving toward is empty
  if (this.isValidMove(potentialPosition, false)) {
    this.performMove(oldBlockManPosition, potentialPosition, CellConstants.BLOCKMAN);
  }
};

Game.prototype.performMove = function (oldPosition, newPosition, cellType) {
  this.setCell(oldPosition, CellConstants.EMPTY);
  this.setCell(newPosition, cellType);
  if (this.blockMan.isHoldingBlock()){
    this.setCell(this.heldBlockPosition, CellConstants.EMPTY);
    this.heldBlockPosition = [];
    this.applyGravity();
    var newBlockManPos = this.getBlockManPos();
    var newBlockRow = newBlockManPos[0] - 1;
    var newBlockColumn = newBlockManPos[1];
    this.setCell([newBlockRow, newBlockColumn], CellConstants.BLOCK);
    this.heldBlockPosition = [newBlockRow, newBlockColumn];
  }
  this.applyGravity();
};

Game.prototype.getPotentialMove = function (startPosition, direction, upMove) {
  var row = startPosition[0];
  var oldColumnPos = startPosition[1];

  var addToColumn = this.addToColumn(direction);
  var newColumnPos = oldColumnPos + addToColumn;
  if (upMove) { row--; };

  return [row, newColumnPos];
};

Game.prototype.isValidMove = function (potentialPosition, upMove) {
  var potentialMoveCell = this.returnCell(potentialPosition[0], potentialPosition[1]);
  var isPotentialMoveEmpty = ((potentialMoveCell === 0) || (potentialMoveCell === 4)) ? true : false;
  if (upMove) {
    return ((this.isPlatformUnderneath(potentialPosition)) && isPotentialMoveEmpty);
  } else {
    return isPotentialMoveEmpty;
  }
};

Game.prototype.isPlatformUnderneath = function (potentialPosition) {
  var potentialPlatformCell = this.returnCell(potentialPosition[0] + 1, potentialPosition[1]);
  return ((potentialPlatformCell === 1) || (potentialPlatformCell === 2)) ? true : false;
};

Game.prototype.addToColumn = function (direction) {
  if (direction !== undefined ) {
    this.blockMan.setDirection(direction);
  }
  return (this.blockMan.getDirection() === DirectionConstants.RIGHT) ? 1 : -1;
};

Game.prototype.moveBlockManUp = function () {
  var oldBlockManPosition = this.blockMan.getPosition();
  var direction = this.blockMan.getDirection();
  var potentialPosition = this.getPotentialMove(oldBlockManPosition, direction, true);

  if (this.isValidMove(potentialPosition, true)) {
    this.performMove(oldBlockManPosition, potentialPosition, CellConstants.BLOCKMAN);
  }
};

Game.prototype.applyGravity = function () {
  var that = this;
  that.currentLevel.forEach(function(row, rowIdx){
    row.forEach(function(cell, cellIdx){
      if ((cell === 2) || (cell === 3)) {
        if (that.currentLevel[rowIdx + 1][cellIdx] === 0) {
          that.setCell([rowIdx, cellIdx], CellConstants.EMPTY);
          that.setCell([rowIdx + 1, cellIdx], cell);
        }
      }
    });
  });
  this.blockMan.setPosition(this.getBlockManPos());
};

Game.prototype.handleBlockLiftOrDrop = function () {
  // Handles dropping a block
  if (this.blockMan.isHoldingBlock()) {
    this.dropBlock();
  }
  // Handles lifting up a block
  else {
    var potentialBlockPosition = this.getPotentialBlockPosition();
    if (this.isThereABlock(potentialBlockPosition)) {
      if (this.canBlockBePickedUp(potentialBlockPosition)) {
        this.pickUpBlock(potentialBlockPosition);
      }
    }
  }
};

Game.prototype.dropBlock = function () {
  var potentialBlockPosition = this.getPositionofDroppedBlock();
  if (this.isPositionEmpty(potentialBlockPosition)){
    this.blockMan.putDownBlock();
    this.performMove(this.heldBlockPosition, potentialBlockPosition, CellConstants.BLOCK);
    this.heldBlockPosition = [];
  }
};

Game.prototype.isPositionEmpty = function (position) {
  var cell = this.returnCell(position[0], position[1]);
  return cell === 0;
};

Game.prototype.getPositionofDroppedBlock = function () {
  var row = this.heldBlockPosition[0];
  var addToColumn = this.addToColumn(this.blockMan.getDirection());
  var column = this.heldBlockPosition[1] + addToColumn;
  return [row, column];
};
Game.prototype.pickUpBlock = function (oldBlockPosition) {
  var newBlockColumn = this.blockMan.getPosition()[1];
  var newBlockPosition = [oldBlockPosition[0] - 1, newBlockColumn];
  this.setCell(oldBlockPosition, CellConstants.EMPTY);
  this.setCell(newBlockPosition, CellConstants.BLOCK);
  this.heldBlockPosition = newBlockPosition;
  this.blockMan.pickUpBlock();
  window.setTimeout(function () {
    this.applyGravity();
  }.bind(this), 0);
};

Game.prototype.setCell = function (position, cell) {
  var row = position[0];
  var column = position[1];
  this.currentLevel[row][column] = cell;
};

Game.prototype.canBlockBePickedUp = function (potentialBlockPosition) {
  var rowOnTopOfBlock = potentialBlockPosition[0] - 1;
  return this.isPositionEmpty([rowOnTopOfBlock, potentialBlockPosition[1]]);
};

Game.prototype.returnCell = function (row, column) {
  return this.currentLevel[row][column];
};

Game.prototype.isThereABlock = function (potentialBlockPosition) {
  var potentialBlockCell = this.returnCell(potentialBlockPosition[0], potentialBlockPosition[1]);
  return (potentialBlockCell === 2);
};

Game.prototype.getPotentialBlockPosition = function () {
  var blockManPosition = this.blockMan.getPosition();
  var addToColumn = this.addToColumn(this.blockMan.getDirection());
  var potentialBlockColumn = parseInt([blockManPosition[1]]) + addToColumn;
  return [blockManPosition[0], potentialBlockColumn];
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
