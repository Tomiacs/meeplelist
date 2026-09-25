import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseGames } from "./bgg-xml.mjs";
import { publicCatalog } from "./catalog.mjs";

const token = process.env.BGG_API_TOKEN;
if (!token) throw new Error("Hiányzik a BGG_API_TOKEN környezeti változó.");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(root, "site", "data", "catalog.json");
const existing = JSON.parse(await readFile(catalogPath, "utf8"));
const ids = [...new Set(existing.games.map((game) => game.id))];
if (ids.length < 100) throw new Error("Túl rövid a meglévő jelöltlista.");

const batches = [];
for (let index = 0; index < ids.length; index += 20) batches.push(ids.slice(index, index + 20));

const games = [];
for (const [index, batch] of batches.entries()) {
  if (index) await delay(5000);
  const url = `https://boardgamegeek.com/xmlapi2/thing?id=${batch.join(",")}&stats=1`;
  const xml = await getXml(url);
  const parsed = parseGames(xml);
  if (!parsed.length) throw new Error(`A BGG nem adott játékokat a(z) ${index + 1}. csomagra.`);
  games.push(...parsed);
  console.log(`BGG csomag ${index + 1}/${batches.length}: ${parsed.length} játék.`);
}

if (games.length < Math.ceil(ids.length * 0.9)) {
  throw new Error("A BGG túl kevés játékot adott vissza; a korábbi adatfájl megmaradt.");
}
const catalog = publicCatalog(games, new Date());
await writeFile(catalogPath, JSON.stringify(catalog) + "\n", "utf8");
console.log(`Frissítve: ${catalog.games.length} játék.`);

async function getXml(url) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/xml",
        "User-Agent": "MeepleList/1.0 (+https://github.com/Tomiacs/meeplelist)"
      },
      signal: AbortSignal.timeout(120_000)
    });
    if (response.status === 200) return response.text();
    const retryable = [202, 429, 500, 503].includes(response.status);
    if (!retryable || attempt === 3) {
      throw new Error(`BGG API hiba: HTTP ${response.status}.`);
    }
    await delay(5000 * attempt);
  }
  throw new Error("A BGG-kérés nem fejeződött be.");
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
