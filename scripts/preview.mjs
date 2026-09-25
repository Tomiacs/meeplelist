import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const prefix = "/meeplelist";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  if (pathname !== prefix && !pathname.startsWith(prefix + "/")) {
    response.writeHead(404).end();
    return;
  }
  const relative = pathname.slice(prefix.length).replace(/^\/+/, "") || "index.html";
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep) && file !== root) {
    response.writeHead(403).end();
    return;
  }
  try {
    const contents = await readFile(file);
    response.setHeader("Content-Type", mime[path.extname(file)] ?? "application/octet-stream");
    response.writeHead(200).end(contents);
  } catch {
    response.writeHead(404).end();
  }
}).listen(4173, "127.0.0.1", () => {
  console.log("MeepleList előnézet: http://127.0.0.1:4173/meeplelist/");
});
