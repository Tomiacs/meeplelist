import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@" });

export function parseGames(xml) {
  const parsed = parser.parse(xml);
  return asArray(parsed?.items?.item)
    .filter((item) => item?.["@type"] === "boardgame")
    .map(parseGame);
}

function parseGame(item) {
  const ratings = item.statistics?.ratings;
  const rank = asArray(ratings?.ranks?.rank)
    .find((entry) => entry?.["@name"] === "boardgame");
  const poll = asArray(item.poll).find((entry) => entry?.["@name"] === "suggested_numplayers");
  const recommendations = {};

  for (const results of asArray(poll?.results)) {
    const players = Number(results?.["@numplayers"]);
    if (!Number.isInteger(players) || players < 1 || players > 12) continue;
    const votes = Object.fromEntries(asArray(results.result).map((entry) => [
      entry?.["@value"],
      number(entry?.["@numvotes"])
    ]));
    recommendations[players] = {
      bestVotes: votes.Best ?? 0,
      recommendedVotes: votes.Recommended ?? 0,
      notRecommendedVotes: votes["Not Recommended"] ?? 0
    };
  }

  const primaryName = asArray(item.name).find((entry) => entry?.["@type"] === "primary");
  return {
    id: number(item["@id"]),
    name: String(primaryName?.["@value"] ?? ""),
    yearPublished: nullableNumber(item.yearpublished?.["@value"]),
    minPlayers: number(item.minplayers?.["@value"]),
    maxPlayers: number(item.maxplayers?.["@value"]),
    minPlayTime: number(item.minplaytime?.["@value"]),
    maxPlayTime: number(item.maxplaytime?.["@value"]),
    averageRating: number(ratings?.average?.["@value"]),
    bayesAverage: number(ratings?.bayesaverage?.["@value"]),
    complexity: number(ratings?.averageweight?.["@value"]),
    usersRated: number(ratings?.usersrated?.["@value"]),
    rank: number(rank?.["@value"]),
    playerRecommendations: recommendations
  };
}

function asArray(value) {
  return value == null ? [] : Array.isArray(value) ? value : [value];
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function nullableNumber(value) {
  const parsed = Number(value);
  return value == null || !Number.isFinite(parsed) ? null : parsed;
}
