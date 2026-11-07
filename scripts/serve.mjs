import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const root = resolve("out");
const port = Number(process.env.PORT ?? 4173);
const mime = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2",
};

createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }

  let file = resolve(root, "." + pathname);
  if (!file.startsWith(root + sep) && file !== root) {
    res.writeHead(403).end();
    return;
  }

  const original = await stat(file).catch(() => undefined);
  if (original?.isDirectory()) {
    if (!pathname.endsWith("/")) {
      res.writeHead(308, { Location: encodeURI(pathname) + "/" }).end();
      return;
    }
    file = resolve(file, "index.html");
  }

  const found = original?.isFile() || (original?.isDirectory() && (await stat(file).catch(() => undefined))?.isFile());
  if (!found) file = resolve(root, "404.html");
  res.writeHead(found ? 200 : 404, { "Content-Type": mime[extname(file)] ?? "application/octet-stream" });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  const stream = createReadStream(file);
  stream.on("error", () => res.end("Run pnpm build before starting the preview."));
  stream.pipe(res);
}).listen(port, "127.0.0.1", () => console.log(`Tuprel preview: http://127.0.0.1:${port}/`));
