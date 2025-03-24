const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3001;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });
  
  // Try to use the port, if failed try the next available port
  server.listen(port, (err) => {
    if (err) {
      console.log(`Port ${port} is already in use, trying next available port...`);
      server.listen(0, (err) => {
        if (err) throw err;
        const address = server.address();
        console.log(`> Ready on http://localhost:${address.port}`);
      });
    } else {
      console.log(`> Ready on http://localhost:${port}`);
    }
  });
});