var KeyConstants = require('../constants/keys');
var LevelConstants = require('../constants/levels');
var GameText = require('../constants/game_text');
var DirectionConstants = require('../constants/directions');
var CellConstants = require('../constants/cells');

var Block = function (game, blockPosition) {
  this.game = game;
  this.position = blockPosition;
};

Block.prototype.getPosition = function () {
  return this.position;
};

Block.prototype.setPosition = function (newPosition) {
  this.position = newPosition;
};

Block.prototype.moveBlock = function () {
  var that = this.game;
  that.setCell(this.position, CellConstants.EMPTY);
  this.position = [];
  that.applyGravity();
  var newBlockManPos = that.getPositionOfCell(CellConstants.BLOCKMAN);
  var newBlockRow = newBlockManPos[0] - 1;
  var newBlockColumn = newBlockManPos[1];
  that.setCell([newBlockRow, newBlockColumn], CellConstants.BLOCK);
  this.position = [newBlockRow, newBlockColumn];
};

Block.prototype.dropBlock = function () {
  var that = this.game;
  var potentialBlockPosition = that.getPositionofDroppedBlock();
  if (that.isPositionEmpty(potentialBlockPosition)){
    that.blockMan.putDownBlock();
    that.performMove(this.position, potentialBlockPosition, CellConstants.BLOCK);
  }
};

module.exports = Block;
