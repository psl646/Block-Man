var BlockManSprite = require ('./block_man_sprite');
var KeyConstants = require('../constants/keys');
var LevelConstants = require('../constants/levels');
var GameText = require('../constants/game_text');
var DirectionConstants = require('../constants/directions');
var CellConstants = require('../constants/cells');

var GameControls = function (game) {
  this.game = game;
};

GameControls.prototype.addKeyBindings = function () {
  document.addEventListener('keydown', this._keyDownHandler.bind(this));
};

GameControls.prototype._keyDownHandler = function(e) {
  e.preventDefault();
  var that = this.game;
  if (e.keyCode === KeyConstants.START){
    this._startKey();
  }
  else if (that.startGame === true){
    switch (e.keyCode) {
      case KeyConstants.SPACE:
        this.pauseGame();
        break;
      case KeyConstants.RESET:
        this.resetLevel();
        break;
      case KeyConstants.ESCAPE:
        this.quitGame();
        break;
      case KeyConstants.LEFT:
        that.moveBlockManLeftOrRight(DirectionConstants.LEFT);
        break;
      case KeyConstants.RIGHT:
        that.moveBlockManLeftOrRight(DirectionConstants.RIGHT);
        break;
      case KeyConstants.UP:
        that.moveBlockManUp();
        break;
      case KeyConstants.DOWN:
        this.handleBlockLiftOrDrop();
        break;
    }
  }
}

GameControls.prototype.trackTime = function () {
  var that = this.game;
  if (that.startGame === true) {
    that.time++;
  }
};

GameControls.prototype._startKey = function () {
  var that = this.game;
  if (that.startGame === false) {
    that.startGame = true;
    this.timerInterval = window.setInterval(function () {
      this.trackTime();
    }.bind(this), 1000);
  }
};

GameControls.prototype.resetTimer = function () {
  window.clearInterval(this.timerInterval);
};

GameControls.prototype.pauseGame = function () {
  alert(GameText.PAUSE);
};

GameControls.prototype.resetLevel = function () {
  alert(GameText.RESET);
  var that = this.game;

  that.currentLevel = JSON.parse(JSON.stringify(LevelConstants[that.currentLevelNumber]));
  that.blockMan.setPosition(that.getPositionOfCell(CellConstants.BLOCKMAN));
  that.blockMan.putDownBlock();
    that.blockMan.setDirection(DirectionConstants.RIGHT);
  that.heldBlockPosition = [];
};

GameControls.prototype.handleBlockLiftOrDrop = function () {
  var that = this.game;
  if (that.blockMan.isHoldingBlock()) {
    that.block.dropBlock();
  }
  else {
    var potentialBlockPosition = that.getPotentialBlockPosition();
    if (that.isThereABlock(potentialBlockPosition)) {
      if (that.canBlockBePickedUp(potentialBlockPosition)) {
        that.pickUpBlock(potentialBlockPosition);
      }
    }
  }
};

GameControls.prototype.quitGame = function () {
  var that = this.game;
  that.levelsArray = Object.keys(LevelConstants);
  that.currentLevelNumber = that.levelsArray.shift();
  that.currentLevel = JSON.parse(JSON.stringify(LevelConstants[that.currentLevelNumber]));
  that.blockMan = new BlockManSprite(that.getPositionOfCell(CellConstants.BLOCKMAN));
  that.exitPosition = that.getPositionOfCell(CellConstants.EXIT);
  that.startGame = false;
  that.time = 0;
  this.resetTimer();
};

module.exports = GameControls;
