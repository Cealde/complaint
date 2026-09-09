const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleLogin } = require('./app/api/login/route');
const { handleComplaint } = require('./app/api/complaint/route');
const { handleRequest } = require('./app/api/get/route');

let port = 3000;

const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function resolveFilePath(reqUrl) {
  if (reqUrl === '/' || reqUrl === '') reqUrl = '/html/index.html';

  const cleanUrl = reqUrl.startsWith('/') ? reqUrl.slice(1) : reqUrl;

  const directPath = path.join(__dirname, cleanUrl);
  if (directPath.startsWith(__dirname) && fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    return directPath;
  }
  if (cleanUrl.endsWith('.html') || !path.extname(cleanUrl)) {
    const filename = cleanUrl.endsWith('.html') ? cleanUrl.replace(/^html\//, '') : `${cleanUrl}.html`;
    const htmlPath = path.join(__dirname, 'html', filename);
    if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) return htmlPath;
  }

  if (cleanUrl.endsWith('.css')) {
    const cssPath = path.join(__dirname, 'css', cleanUrl.replace(/^css\//, ''));
    if (fs.existsSync(cssPath) && fs.statSync(cssPath).isFile()) return cssPath;
  }

  if (cleanUrl.endsWith('.js')) {
    const jsPath = path.join(__dirname, 'js', cleanUrl.replace(/^js\//, ''));
    if (fs.existsSync(jsPath) && fs.statSync(jsPath).isFile()) return jsPath;
  }

  return null;
}

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];

  if (req.method === 'POST' && reqUrl === '/api/login') {
    handleLogin(req, res);
    return;
  } else if (req.method === 'POST' && reqUrl === '/api/complaint') {
    handleComplaint(req, res);
    return;
  } else if (req.method === 'POST' && reqUrl === '/api/get') {
    handleRequest(req, res);
    return;
  }

  const resolvedFile = resolveFilePath(reqUrl);

  if (!resolvedFile) {
    const notFoundPath = path.join(__dirname, 'html', '404.html');
    if (fs.existsSync(notFoundPath)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return fs.createReadStream(notFoundPath).pipe(res);
    }
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('<h1>404 - Not Found</h1>');
  }

  const ext = path.extname(resolvedFile).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(resolvedFile).pipe(res);
});

function startServer(p) {
  server.listen(p, () => {
    console.log(`Server is running at http://localhost:${p}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${p} in use, trying ${p + 1}...`);
      startServer(p + 1);
    } else {
      console.error(err);
    }
  });
}

startServer(port);