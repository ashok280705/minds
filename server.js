const { createServer } = require("http");
const next = require("next");
const { initIO } = require("./lib/socket");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // ✅ Initialize Socket.IO and store globally
  const io = initIO(httpServer);
  global._io = io; // ✅ So you can use it in API routes

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});