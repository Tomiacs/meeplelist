export function rankGames(games, { players, count, duration = 0, complexity = 0 }) {
  if (!Number.isInteger(players) || players < 1 || players > 12) {
    throw new RangeError("A játékosszámnak 1 és 12 között kell lennie.");
  }
  if (!Number.isInteger(count) || count < 1 || count > 50) {
    throw new RangeError("A lista hossza 1 és 50 között lehet.");
  }

  return games
    .filter((game) => game.minPlayers <= players && game.maxPlayers >= players)
    .filter((game) => !duration || game.maxPlayTime <= duration)
    .filter((game) => !complexity || game.complexity <= complexity)
    .map((game) => {
      const poll = game.playerRecommendations?.[players];
      const votes = poll
        ? poll.bestVotes + poll.recommendedVotes + poll.notRecommendedVotes
        : 0;
      const recommendationRatio = votes
        ? (poll.bestVotes + poll.recommendedVotes) / votes
        : null;
      const fit = votes
        ? (poll.bestVotes + poll.recommendedVotes * 0.65) / votes
        : 0.5;
      return { game, votes, recommendationRatio, score: game.bayesAverage + fit };
    })
    .filter((item) => item.votes < 10 || item.recommendationRatio >= 0.5)
    .sort((a, b) => b.score - a.score || positiveRank(a.game.rank) - positiveRank(b.game.rank))
    .slice(0, count);
}

function positiveRank(rank) {
  return rank > 0 ? rank : Number.MAX_SAFE_INTEGER;
}
