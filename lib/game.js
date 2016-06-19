var BlockManSprite = require('./block_man_sprite');
var GameText = require('./game_text');
var LevelConstants = require('../constants/levels');
var KeyConstants = require('../constants/keys');
var DirectionConstants = require('../constants/directions');
var CellConstants = require('../constants/cells');

var Game = function () {
  this.levelsArray = Object.keys(LevelConstants);
  this.currentLevelNumber = this.levelsArray.shift();
  this.currentLevel = JSON.parse(JSON.stringify(LevelConstants[this.currentLevelNumber]));
  this.blockMan = new BlockManSprite(this.getPositionOfCell(CellConstants.BLOCKMAN));
  this.exitPosition = this.getPositionOfCell(CellConstants.EXIT);
  this.heldBlockPosition = [];
  this.addKeyListener();
};

Game.prototype.addKeyListener = function () {
  document.addEventListener('keydown', this._keyDownHandler.bind(this));
};

Game.prototype._keyDownHandler = function(e) {
  switch (e.keyCode) {
    case KeyConstants.LEFT:
      this.moveBlockManLeftOrRight(DirectionConstants.LEFT);
      break;
    case KeyConstants.RIGHT:
      this.moveBlockManLeftOrRight(DirectionConstants.RIGHT);
      break;
    case KeyConstants.UP:
      this.moveBlockManUp();
      break;
    case KeyConstants.DOWN:
      this.handleBlockLiftOrDrop();
      break;
    case KeyConstants.SPACE:
      // This key is to pause time for when I implement a timer
      console.log("SPACE PRESSED");
      break;
    case KeyConstants.RESET:
      this.resetLevel();
      break;
  }
}

Game.prototype.getPositionOfCell = function (locateCell) {
  var pos;
  this.currentLevel.forEach(function(row, rowIdx){
    row.forEach(function(cell, cellIdx){
      if (cell === locateCell) {
        pos = [rowIdx, cellIdx];
      }
    });
  });
  return pos;
};

Game.prototype.resetLevel = function () {
  alert(GameText.RESET);
  this.currentLevel = JSON.parse(JSON.stringify(LevelConstants[this.currentLevelNumber]));
  this.blockMan.setPosition(this.getPositionOfCell(CellConstants.BLOCKMAN));
  this.blockMan.putDownBlock();
  this.heldBlockPosition = [];
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
    var newBlockManPos = this.getPositionOfCell(CellConstants.BLOCKMAN);
    var newBlockRow = newBlockManPos[0] - 1;
    var newBlockColumn = newBlockManPos[1];
    this.setCell([newBlockRow, newBlockColumn], CellConstants.BLOCK);
    this.heldBlockPosition = [newBlockRow, newBlockColumn];
  }
  this.applyGravity();
  window.setTimeout(function(){
    this.checkLevelCleared();
  }.bind(this), 15);
};

Game.prototype.checkLevelCleared = function () {
  if (this.blockMan.getPosition().toString() === this.exitPosition.toString()) {
    this.nextLevel();
  }
};

Game.prototype.nextLevel = function () {
  if (this.levelsArray.length === 0) {
    alert(GameText.WON);
    this.levelsArray = Object.keys(LevelConstants);
  }
  this.currentLevelNumber = this.levelsArray.shift();
  this.currentLevel = JSON.parse(JSON.stringify(LevelConstants[this.currentLevelNumber]));
  this.blockMan = new BlockManSprite(this.getPositionOfCell(CellConstants.BLOCKMAN));
  this.exitPosition = this.getPositionOfCell(CellConstants.EXIT);
  this.heldBlockPosition = [];
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
        var cellUnderneath = that.currentLevel[rowIdx + 1][cellIdx];
        if ((cellUnderneath === 0) || (cellUnderneath === 4)) {
          that.setCell([rowIdx, cellIdx], CellConstants.EMPTY);
          that.setCell([rowIdx + 1, cellIdx], cell);
        }
      }
    });
  });
  this.blockMan.setPosition(this.getPositionOfCell(CellConstants.BLOCKMAN));
};

Game.prototype.handleBlockLiftOrDrop = function () {
  if (this.blockMan.isHoldingBlock()) {
    this.dropBlock();
  }
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

Game.prototype.draw = function (canvasEl, gameView) {
  canvasEl.width = (40 * this.currentLevel[0].length);
  canvasEl.height = (40 * this.currentLevel.length);

  var ctx = canvasEl.getContext("2d");
  gameView.draw(ctx);
};

module.exports = Game;
