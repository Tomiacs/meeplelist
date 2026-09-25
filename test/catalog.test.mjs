import test from "node:test";
import assert from "node:assert/strict";
import { toPublicGame } from "../scripts/catalog.mjs";

test("a BGG-ből érkező karakterkódokat olvasható játéknévvé alakítja", () => {
  const game = toPublicGame({
    id: 1, name: "Aeon&#039;s End &amp; More",
    minPlayers: 1, maxPlayers: 4,
    playerRecommendations: {}
  });
  assert.equal(game.name, "Aeon's End & More");
});
