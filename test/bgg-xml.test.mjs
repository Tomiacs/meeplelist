import test from "node:test";
import assert from "node:assert/strict";
import { parseGames } from "../scripts/bgg-xml.mjs";

test("a BGG XML-ből kiolvassa a rangot és a létszámszavazatokat", () => {
  const xml = `<items>
    <item type="boardgame" id="42">
      <name type="primary" value="Tesztjáték" />
      <minplayers value="1" /><maxplayers value="4" />
      <minplaytime value="30" /><maxplaytime value="60" />
      <poll name="suggested_numplayers"><results numplayers="2">
        <result value="Best" numvotes="60" />
        <result value="Recommended" numvotes="30" />
        <result value="Not Recommended" numvotes="10" />
      </results></poll>
      <statistics><ratings>
        <average value="8.2" /><bayesaverage value="7.9" />
        <averageweight value="2.75" /><usersrated value="1234" />
        <ranks><rank name="boardgame" value="17" /></ranks>
      </ratings></statistics>
    </item>
  </items>`;
  const game = parseGames(xml)[0];
  assert.equal(game.name, "Tesztjáték");
  assert.equal(game.rank, 17);
  assert.equal(game.playerRecommendations[2].bestVotes, 60);
  assert.equal(game.complexity, 2.75);
});
