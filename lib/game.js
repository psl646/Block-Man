var BlockManSprite = require('./block_man_sprite');
var Block = require('./block');
var GameControls = require('./game_controls');
var LevelConstants = require('../constants/levels');
var GameText = require('../constants/game_text');
var DirectionConstants = require('../constants/directions');
var CellConstants = require('../constants/cells');

var Game = function () {
  this.levelsArray = Object.keys(LevelConstants);
  this.currentLevelNumber = this.levelsArray.shift();
  this.currentLevel = JSON.parse(JSON.stringify(LevelConstants[this.currentLevelNumber]));
  this.blockMan = new BlockManSprite(this.getPositionOfCell(CellConstants.BLOCKMAN));
  this.exitPosition = this.getPositionOfCell(CellConstants.EXIT);
  this.startGame = false;
  this.time = 0;
  this.addKeyListener();
};

Game.prototype.addKeyListener = function () {
  this.gameControls = new GameControls(this);
  this.gameControls.addKeyBindings();
};

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

Game.prototype.moveBlockManLeftOrRight = function (direction) {
  var oldBlockManPosition = this.blockMan.getPosition();
  var potentialPosition = this.getPotentialMove(oldBlockManPosition, direction, false);

  if (this.isValidMove(potentialPosition, false)) {
    this.performMove(oldBlockManPosition, potentialPosition, CellConstants.BLOCKMAN);
  }
};

Game.prototype.performMove = function (oldPosition, newPosition, cellType) {
  this.setCell(oldPosition, CellConstants.EMPTY);
  this.setCell(newPosition, cellType);
  if (this.blockMan.isHoldingBlock()){
    this.block.moveBlock();
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
    this.gameWon();
  }
  this.currentLevelNumber = this.levelsArray.shift();
  this.currentLevel = JSON.parse(JSON.stringify(LevelConstants[this.currentLevelNumber]));
  this.blockMan = new BlockManSprite(this.getPositionOfCell(CellConstants.BLOCKMAN));
  this.exitPosition = this.getPositionOfCell(CellConstants.EXIT);
};

Game.prototype.gameWon = function () {
  alert(GameText.WON + " Total time: " + this.time + " seconds. " + GameText.PLAY_AGAIN);
  this.levelsArray = Object.keys(LevelConstants);
  this.time = 0;
  this.startGame = false;
  this.gameControls.resetTimer();
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
        var cellUnderneath = that.returnCell(rowIdx + 1, cellIdx);
        if ((cellUnderneath === 0) || (cellUnderneath === 4)) {
          that.setCell([rowIdx, cellIdx], CellConstants.EMPTY);
          that.setCell([rowIdx + 1, cellIdx], cell);
        }
      }
    });
  });
  this.blockMan.setPosition(this.getPositionOfCell(CellConstants.BLOCKMAN));
};

Game.prototype.isPositionEmpty = function (position) {
  var cell = this.returnCell(position[0], position[1]);
  return cell === 0;
};

Game.prototype.getPositionofDroppedBlock = function () {
  var row = this.block.getPosition()[0];
  var addToColumn = this.addToColumn(this.blockMan.getDirection());
  var column = this.block.getPosition()[1] + addToColumn;
  return [row, column];
};

Game.prototype.pickUpBlock = function (oldBlockPosition) {
  var newBlockColumn = this.blockMan.getPosition()[1];
  var newBlockPosition = [oldBlockPosition[0] - 1, newBlockColumn];
  this.setCell(oldBlockPosition, CellConstants.EMPTY);
  this.setCell(newBlockPosition, CellConstants.BLOCK);
  this.blockMan.pickUpBlock();
  this.block = new Block(this, newBlockPosition);
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
