import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initWebSocket } from './services/websocket';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Initialize WebSocket server
  const io = initWebSocket(server);

  // Store io instance globally for API routes
  (global as any).io = io;

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
}); 