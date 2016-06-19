var Game = require("./game");
var GameView = require("./game_view");

document.addEventListener("DOMContentLoaded", function(){
  var canvasEl = document.getElementsByTagName("canvas")[0];
  var game = new Game();
  
  new GameView(game, canvasEl).start();
});
