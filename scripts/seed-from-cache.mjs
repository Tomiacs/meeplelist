import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publicCatalog } from "./catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = process.argv[2] || (process.env.LOCALAPPDATA
  ? path.join(process.env.LOCALAPPDATA, "BoardGameList", "cache", "catalog.json")
  : null);
if (!source) throw new Error("Add meg a korábbi katalógus gyorsítótárának útvonalát.");

const cached = JSON.parse(await readFile(source, "utf8"));
const catalog = publicCatalog(cached.games, cached.createdAtUtc);
const target = path.join(root, "site", "data", "catalog.json");
await mkdir(path.dirname(target), { recursive: true });
await writeFile(target, JSON.stringify(catalog) + "\n", "utf8");
console.log(`${catalog.games.length} játék átvéve a korábbi BGG API-gyorsítótárból.`);
