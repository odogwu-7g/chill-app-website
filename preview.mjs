import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';

const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const root = fileURLToPath(new URL('./dist/', import.meta.url));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml' };
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://preview').pathname);
    // Local-only responsive review; never included in the static build.
    if (pathname === '/__review/mobile') {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end('<!doctype html><html><head><title>Chill mobile review</title></head><body style="margin:0;background:#222;display:flex;justify-content:center"><iframe title="Chill mobile viewport" src="/#how-it-works" style="width:390px;height:844px;border:0"></iframe></body></html>');
      return;
    }
    const file = resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) {
      response.writeHead(403).end(); return;
    }
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(Number(option('--port', '4173')), option('--host', '0.0.0.0'));
