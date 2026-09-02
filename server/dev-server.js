const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { handleParticipateRequest } = require("./participate/request-handler");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.SSKR_DEV_PORT || 8080);
const types = { ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml" };

const routes = {
  "/": "web/home/index.html",
  "/participate": "web/participate/index.html",
  "/participate/": "web/participate/index.html",
  "/app": "web/app/index.html",
  "/app/": "web/app/index.html",
  "/journey": "web/journey-presentation/index.html",
  "/journey/": "web/journey-presentation/index.html"
};

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) request.destroy();
    });
    request.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (error) { reject(error); }
    });
    request.on("error", reject);
  });
}

function sendJson(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(value));
}

function staticFileFor(pathname) {
  if (routes[pathname]) return path.join(root, routes[pathname]);
  if (pathname.startsWith("/app/")) return path.join(root, "web/app/index.html");
  if (pathname.startsWith("/participate/")) return path.join(root, "web/participate", pathname.slice("/participate/".length));
  if (pathname.startsWith("/journey/")) return path.join(root, "web/journey-presentation", pathname.slice("/journey/".length));
  if (pathname.startsWith("/web/")) return path.join(root, pathname.slice(1));
  if (pathname.startsWith("/assets/") || pathname === "/styles.css" || pathname === "/app.js") return path.join(root, "web/home", pathname.slice(1));
  return null;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "127.0.0.1"}`);
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    return response.end("Invalid URL");
  }
  const apiMatch = pathname.match(/^\/api\/participate\/(context|application|checkout|payment|mock)$/);
  if (apiMatch) {
    if (request.method !== "POST") return sendJson(response, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED", userMessage: "POST 요청만 지원합니다." } });
    try {
      const result = await handleParticipateRequest(apiMatch[1], await readBody(request));
      return sendJson(response, result.ok ? 200 : 400, result);
    } catch {
      return sendJson(response, 400, { ok: false, error: { code: "INVALID_JSON", userMessage: "요청 형식을 확인해 주세요." } });
    }
  }

  const file = staticFileFor(pathname);
  if (!file || !path.resolve(file).startsWith(root) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return response.end("Not found");
  }
  response.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(file).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`SSKR dev server: http://127.0.0.1:${port}`);
});
