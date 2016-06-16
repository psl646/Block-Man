var Game = require("./game");
var GameView = require("./game_view");

document.addEventListener("DOMContentLoaded", function(){
  var canvasEl = document.getElementsByTagName("canvas")[0];
  var game = new Game();
  canvasEl.width = game.currentWidth();
  canvasEl.height = game.currentHeight();

  var ctx = canvasEl.getContext("2d");
  new GameView(game, ctx).start();
});
