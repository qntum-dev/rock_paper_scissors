function result(move1, move2) {
  switch (move1) {
    case move2:
      return "draw";
    case "rock":
      if (move2 == "scissors") {
        return "1";
      } else {
        return "2";
      }
    case "paper":
      if (move2 == "rock") {
        return "1";
      } else {
        return "2";
      }
    case "scissors":
      if (move2 == "paper") {
        return "1";
      } else {
        return "2";
      }
  }
}
module.exports = result;
