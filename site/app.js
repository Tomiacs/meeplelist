import { rankGames } from "./ranking.js";

const form = document.querySelector("#filters");
const playersSelect = document.querySelector("#players");
const countSelect = document.querySelector("#count");
const durationSelect = document.querySelector("#duration");
const complexitySelect = document.querySelector("#complexity");
const list = document.querySelector("#games");
const status = document.querySelector("#status");
const title = document.querySelector("#results-title");
const stamp = document.querySelector("#data-stamp");

const ratingFormat = new Intl.NumberFormat("hu-HU", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const integerFormat = new Intl.NumberFormat("hu-HU");
const dateFormat = new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long", day: "numeric" });

for (let players = 1; players <= 12; players += 1) {
  playersSelect.add(new Option(`${players} fő`, String(players)));
}

const url = new URL(window.location.href);
setSelect(playersSelect, url.searchParams.get("players") ?? "2");
setSelect(countSelect, url.searchParams.get("count") ?? "10");
setSelect(durationSelect, url.searchParams.get("duration") ?? "0");
setSelect(complexitySelect, url.searchParams.get("complexity") ?? "0");

let catalog = null;
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (catalog) render();
});

loadCatalog();

async function loadCatalog() {
  try {
    const response = await fetch("./data/catalog.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.games) || !data.games.length || !data.updatedAt) {
      throw new Error("Hiányos katalógus");
    }
    catalog = data;
    render();
  } catch {
    status.textContent = "A játéklista most nem tölthető be. Kérlek, próbáld meg később.";
    status.classList.add("status-error");
    title.textContent = "A lista nem érhető el";
  }
}

function render() {
  const filters = {
    players: Number(playersSelect.value),
    count: Number(countSelect.value),
    duration: Number(durationSelect.value),
    complexity: Number(complexitySelect.value)
  };
  const results = rankGames(catalog.games, filters);
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (key === "players" || key === "count" || value) search.set(key, String(value));
  }
  history.replaceState(null, "", `${location.pathname}?${search}`);

  title.textContent = results.length
    ? `Top ${results.length} játék ${filters.players} főre`
    : `Nincs találat ${filters.players} főre`;
  stamp.textContent = `BGG-adatok: ${dateFormat.format(new Date(catalog.updatedAt))}`;
  list.replaceChildren(...results.map((result, index) => createCard(result, index)));
  status.textContent = results.length
    ? `${results.length} játék a ${catalog.games.length} vizsgált jelöltből.`
    : "Ezekkel a feltételekkel nincs találat. Próbálj hosszabb játékidőt vagy más létszámot.";
  status.classList.toggle("status-empty", !results.length);
}

function createCard({ game, votes, recommendationRatio }, index) {
  const article = element("article", "game-card");
  const number = element("div", "position", String(index + 1).padStart(2, "0"));
  const main = element("div", "game-main");
  const heading = element("div", "game-heading");
  const name = element("h3");
  const link = element("a", "", game.name);
  link.href = `https://boardgamegeek.com/boardgame/${encodeURIComponent(game.id)}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  name.append(link);
  heading.append(name);
  if (game.yearPublished) heading.append(element("span", "year", String(game.yearPublished)));
  main.append(heading);

  const meta = element("div", "game-meta");
  meta.append(
    metric("JÁTÉKOS", playerRange(game)),
    metric("JÁTÉKIDŐ", timeRange(game)),
    metric("NEHÉZSÉG", game.complexity > 0 ? `${ratingFormat.format(game.complexity)} / 5` : "–")
  );
  main.append(meta);

  const right = element("div", "game-side");
  const scores = element("div", "scores");
  scores.append(
    score("BGG ÉRTÉKELÉS", ratingFormat.format(game.averageRating), "rating"),
    score("AJÁNLOTT EZZEL A LÉTSZÁMMAL", recommendationRatio === null ? "–" : `${Math.round(recommendationRatio * 100)}%`, "recommendation")
  );
  right.append(scores);
  right.append(element("p", "vote-note", `BGG-rang: #${game.rank > 0 ? integerFormat.format(game.rank) : "–"} · ${integerFormat.format(game.usersRated)} értékelés · ${integerFormat.format(votes)} létszámszavazat`));

  article.append(number, main, right);
  return article;
}

function element(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function metric(label, value) {
  const wrap = element("div", "metric");
  wrap.append(element("span", "metric-label", label), element("strong", "", value));
  return wrap;
}

function score(label, value, className) {
  const wrap = element("div", `score ${className}`);
  wrap.append(element("span", "score-label", label), element("strong", "", value));
  return wrap;
}

function playerRange(game) {
  return game.minPlayers === game.maxPlayers
    ? `${game.minPlayers} fő`
    : `${game.minPlayers}–${game.maxPlayers} fő`;
}

function timeRange(game) {
  if (game.minPlayTime <= 0 && game.maxPlayTime <= 0) return "–";
  return game.minPlayTime === game.maxPlayTime
    ? `${game.maxPlayTime} perc`
    : `${game.minPlayTime}–${game.maxPlayTime} perc`;
}

function setSelect(select, value) {
  if ([...select.options].some((option) => option.value === value)) select.value = value;
}
