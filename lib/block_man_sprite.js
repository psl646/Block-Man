var DirectionConstants = require('../constants/directions');

var BlockManSprite = function (startPosition) {
  this.currentPosition = startPosition;
  this.currentDirection = DirectionConstants.RIGHT;
  this.holdingBlock = false;
};

BlockManSprite.prototype.getPosition = function () {
  return this.currentPosition;
};

BlockManSprite.prototype.setPosition = function (newPosition) {
  this.currentPosition = newPosition;
};

BlockManSprite.prototype.getDirection = function () {
  return this.currentDirection;
};

BlockManSprite.prototype.setDirection = function (newDirection) {
  this.currentDirection = newDirection;
};

BlockManSprite.prototype.isHoldingBlock = function () {
  return this.holdingBlock;
};

BlockManSprite.prototype.pickUpBlock = function () {
  this.holdingBlock = true;
};

BlockManSprite.prototype.putDownBlock = function () {
  this.holdingBlock = false;
};

module.exports = BlockManSprite;
