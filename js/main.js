const gameElement = document.querySelector(".game-wrapper");
const restartBtn = document.querySelector(".game__restart-btn");
const scoreDiv = document.querySelector(".game__currentscore");
const highscoreDiv = document.querySelector(".game__highscore");

const game = new Game(gameElement);
game.init(fruits);
game.renderScoreTo(scoreDiv);
game.renderHighscoreTo(highscoreDiv);

restartBtn.onclick = game.restart;
