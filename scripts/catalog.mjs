export function toPublicGame(game) {
  const recommendations = {};
  for (let players = 1; players <= 12; players += 1) {
    const poll = game.playerRecommendations?.[players];
    if (poll) {
      recommendations[players] = {
        bestVotes: finiteNumber(poll.bestVotes),
        recommendedVotes: finiteNumber(poll.recommendedVotes),
        notRecommendedVotes: finiteNumber(poll.notRecommendedVotes)
      };
    }
  }

  const publicGame = {
    id: finiteNumber(game.id),
    name: decodeBggName(game.name),
    yearPublished: game.yearPublished == null ? null : finiteNumber(game.yearPublished),
    minPlayers: finiteNumber(game.minPlayers),
    maxPlayers: finiteNumber(game.maxPlayers),
    minPlayTime: finiteNumber(game.minPlayTime),
    maxPlayTime: finiteNumber(game.maxPlayTime),
    averageRating: finiteNumber(game.averageRating),
    bayesAverage: finiteNumber(game.bayesAverage),
    complexity: finiteNumber(game.complexity),
    usersRated: finiteNumber(game.usersRated),
    rank: finiteNumber(game.rank),
    playerRecommendations: recommendations
  };

  if (!Number.isInteger(publicGame.id) || publicGame.id <= 0 ||
      !publicGame.name || publicGame.minPlayers < 1 ||
      publicGame.maxPlayers < publicGame.minPlayers) {
    throw new Error("Érvénytelen játékadat a katalógusban.");
  }
  return publicGame;
}

export function publicCatalog(games, updatedAt) {
  if (!Array.isArray(games) || games.length === 0) {
    throw new Error("Üres játékkatalógus.");
  }
  return {
    updatedAt: new Date(updatedAt).toISOString(),
    games: games.map(toPublicGame).sort((a, b) => positiveRank(a.rank) - positiveRank(b.rank))
  };
}

function finiteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function positiveRank(rank) {
  return rank > 0 ? rank : Number.MAX_SAFE_INTEGER;
}

function decodeBggName(value) {
  const named = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" };
  return String(value ?? "").replace(
    /&#(?:x([0-9a-f]+)|([0-9]+));|&(amp|quot|apos|lt|gt);/gi,
    (original, hex, decimal, entity) => {
      if (entity) return named[entity.toLowerCase()];
      const codePoint = Number.parseInt(hex ?? decimal, hex ? 16 : 10);
      return codePoint > 0 && codePoint <= 0x10ffff &&
        !(codePoint >= 0xd800 && codePoint <= 0xdfff)
        ? String.fromCodePoint(codePoint)
        : original;
    }
  );
}
