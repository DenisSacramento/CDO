const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT || 8098);
const root = path.join(__dirname, "site");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4"
};

http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const file = path.normalize(path.join(root, pathname));

  if (!file.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.setHeader("Content-Type", types[path.extname(file).toLowerCase()] || "application/octet-stream");
    response.end(data);
  });
}).listen(port, "0.0.0.0", () => {
  console.log(`Serving ${root} at http://localhost:${port}`);
});
