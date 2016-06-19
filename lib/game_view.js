// Stores a Game instance.
// Stores a canvas context to draw the game into.
// Installs key listeners to move the ship and fire bullets.
// Installs a timer to call Game.prototype.step.

var GameView = function (game, canvasEl) {
  this.canvasEl = canvasEl;
  this.game = game;
};

GameView.prototype.start = function () {
  window.setInterval(function() {
    this.game.draw(this.canvasEl);
  }.bind(this), 10);
};

module.exports = GameView;
