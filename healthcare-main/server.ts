import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initializeSocket } from "./lib/socket";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Be sure req.url is defined
      if (!req.url) {
        throw new Error("Request URL is undefined");
      }
      
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      
      // Check if headers have already been sent
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    }
  });

  try {
    // Initialize Socket.IO
    initializeSocket(server);

    server.listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
    
    // Handle server errors
    server.on("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}).catch((err) => {
  console.error("Error preparing Next.js app:", err);
  process.exit(1);
}); 