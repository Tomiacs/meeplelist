import test from "node:test";
import assert from "node:assert/strict";
import { rankGames } from "../site/ranking.js";

function game(id, bayesAverage, minPlayers, maxPlayers, poll, extras = {}) {
  return {
    id, name: `Játék ${id}`, rank: id, bayesAverage, minPlayers, maxPlayers,
    minPlayTime: 30, maxPlayTime: 60, complexity: 2.5,
    playerRecommendations: { 2: poll }, ...extras
  };
}

test("a megfelelő játékosszámot és a közösségi ajánlást veszi figyelembe", () => {
  const games = [
    game(1, 8.0, 1, 4, { bestVotes: 10, recommendedVotes: 20, notRecommendedVotes: 70 }),
    game(2, 7.7, 2, 2, { bestVotes: 80, recommendedVotes: 15, notRecommendedVotes: 5 }),
    game(3, 9.0, 3, 6, { bestVotes: 0, recommendedVotes: 0, notRecommendedVotes: 100 })
  ];
  const ranked = rankGames(games, { players: 2, count: 10 });
  assert.deepEqual(ranked.map((item) => item.game.id), [2]);
  assert.equal(ranked[0].recommendationRatio, 0.95);
});

test("az idő- és összetettségszűrő a listázás előtt működik", () => {
  const poll = { bestVotes: 10, recommendedVotes: 10, notRecommendedVotes: 0 };
  const games = [
    game(1, 8, 2, 4, poll, { maxPlayTime: 90 }),
    game(2, 8, 2, 4, poll, { complexity: 4 }),
    game(3, 8, 2, 4, poll)
  ];
  const ranked = rankGames(games, { players: 2, count: 10, duration: 60, complexity: 3 });
  assert.deepEqual(ranked.map((item) => item.game.id), [3]);
});
