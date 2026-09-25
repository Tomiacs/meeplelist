import { cp, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "site");
const target = path.join(root, "dist");
const catalog = JSON.parse(await readFile(path.join(source, "data", "catalog.json"), "utf8"));
if (!Array.isArray(catalog.games) || catalog.games.length < 100 || !catalog.updatedAt) {
  throw new Error("A publikálható játékkatalógus hiányzik vagy túl rövid.");
}
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
console.log(`GitHub Pages csomag kész: ${catalog.games.length} játék.`);
