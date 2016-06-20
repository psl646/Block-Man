/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Game = __webpack_require__(1);
	var GameView = __webpack_require__(10);
	
	document.addEventListener("DOMContentLoaded", function(){
	  var canvasEl = document.getElementsByTagName("canvas")[0];
	  var game = new Game();
	  
	  new GameView(game, canvasEl).start();
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var BlockManSprite = __webpack_require__(2);
	var Block = __webpack_require__(4);
	var GameControls = __webpack_require__(9);
	var LevelConstants = __webpack_require__(6);
	var GameText = __webpack_require__(7);
	var DirectionConstants = __webpack_require__(3);
	var CellConstants = __webpack_require__(8);
	
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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var DirectionConstants = __webpack_require__(3);
	
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


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = {
	  LEFT: "LEFT",
	  RIGHT: "RIGHT"
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var KeyConstants = __webpack_require__(5);
	var LevelConstants = __webpack_require__(6);
	var GameText = __webpack_require__(7);
	var DirectionConstants = __webpack_require__(3);
	var CellConstants = __webpack_require__(8);
	
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


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = {
	  START: 13,
	  LEFT: 37,
	  UP: 38,
	  RIGHT: 39,
	  DOWN: 40,
	  RESET: 82,
	  SPACE: 32,
	  ESCAPE: 27
	};


/***/ },
/* 6 */
/***/ function(module, exports) {

	// Level number => level
	
	// 0 = Empty space
	// 1 = Wall
	// 2 = Block
	// 3 = Block Man
	// 4 = Exit
	
	module.exports = {
	  1: [
	    [1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 4, 0, 0, 0, 1, 0, 0, 1],
	    [1, 1, 0, 0, 0, 0, 0, 0, 1],
	    [1, 1, 0, 0, 0, 3, 0, 2, 1],
	    [1, 1, 1, 1, 1, 1, 1, 1, 1]
	  ],
	  2: [
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 4, 0, 0, 0, 1, 1, 0, 0, 1],
	    [1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
	    [1, 1, 1, 0, 0, 0, 0, 0, 2, 1],
	    [1, 1, 1, 0, 0, 3, 0, 2, 2, 1],
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	  ],
	  3: [
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1],
	    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
	    [1, 4, 0, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 2, 3, 0, 1],
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	  ],
	  4: [
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 4, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
	    [1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
	    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 1],
	    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 2, 2, 3, 0, 1],
	    [1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 1, 1, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	  ],
	  5: [
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
	    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
	    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
	    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1],
	    [1, 0, 1, 1, 1, 0, 0, 0, 0, 3, 0, 0, 0, 1, 2, 0, 1, 1, 1],
	    [1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
	    [1, 0, 1, 1, 1, 2, 2, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
	    [1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	  ],
	  6: [
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1],
	    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
	    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1],
	    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1, 1, 1],
	    [1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1],
	    [1, 4, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 1, 1, 0, 1, 0, 2, 0, 0, 0, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 1, 1, 0, 1, 0, 2, 0, 1, 0, 1, 2, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	  ],
	  7: [
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
	    [1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1],
	    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	    [1, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	    [1, 4, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	    [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 2, 1],
	    [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 2, 2, 1],
	    [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 2, 2, 2, 1],
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	  ],
	  8: [
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
	    [1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	    [1, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1],
	    [1, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 1, 1],
	    [1, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1, 3, 2, 2, 2, 0, 1, 1, 1],
	    [1, 1, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
	    [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 1, 1, 1, 0, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	  ],
	  9: [
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1],
	    [1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
	    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 1],
	    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
	    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1],
	    [1, 4, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
	    [1, 1, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1],
	    [1, 1, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 1, 1, 0, 2, 0, 3, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 0, 0, 1, 0, 2, 2, 2, 0, 0, 1, 1, 0, 2, 2, 2, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	  ]
	};


/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = {
	  PAUSE: "Game Paused. Press OK to continue!",
	  RESET: "Restarting level. Press OK to start over!",
	  WON: "Congratulations! You got out of the cave!",
	  PLAY_AGAIN: "Play again and see if you can beat your best time!"
	};


/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = {
	  EMPTY: 0,
	  WALL: 1,
	  BLOCK: 2,
	  BLOCKMAN: 3,
	  EXIT: 4
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var BlockManSprite = __webpack_require__ (2);
	var KeyConstants = __webpack_require__(5);
	var LevelConstants = __webpack_require__(6);
	var GameText = __webpack_require__(7);
	var DirectionConstants = __webpack_require__(3);
	var CellConstants = __webpack_require__(8);
	
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


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var ImageConstants = __webpack_require__(11);
	var CellConstants = __webpack_require__(8);
	
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


/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = {
	  0: "../Block-Man/images/empty_space.png",
	  CAVE_FLOOR: "../Block-Man/images/cave_floor.png",
	  CAVE_CEILING: "../Block-Man/images/cave_ceiling.png",
	  CAVE_WEST_WALL: "../Block-Man/images/west_wall.png",
	  CAVE_EAST_WALL: "../Block-Man/images/east_wall.png",
	  NORTHEAST_CORNER: "../Block-Man/images/north_east_corner.png",
	  SOUTHEAST_CORNER: "../Block-Man/images/south_east_corner.png",
	  SOUTHWEST_CORNER: "../Block-Man/images/south_west_corner.png",
	  NORTHWEST_CORNER: "../Block-Man/images/north_west_corner.png",
	  2: "../Block-Man/images/block.png",
	  RIGHT: "../Block-Man/images/right_sprite.png",
	  LEFT: "../Block-Man/images/left_sprite.png",
	  4: "../Block-Man/images/exit.png",
	  EXIT_BLOCKMAN: "../Block-Man/images/exit_block_man.png"
	};


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map