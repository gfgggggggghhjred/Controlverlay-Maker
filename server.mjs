import http from 'node:http';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import {hardware,hardwareURL} from './public/hardware.js';

const root = path.resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const dataDir = fileURLToPath(new URL('./data/', import.meta.url));
const {version}=JSON.parse(await readFile(new URL('./package.json',import.meta.url),'utf8'));
const bundle = (await readFile(new URL('./BUILD.txt',import.meta.url),'utf8')).trim();
const installation = createHash('sha256').update(path.resolve(fileURLToPath(new URL('./',import.meta.url))).toLowerCase()).digest('hex');
const catalogCount=Object.keys(hardware).length;
const artworkCount=Object.values(hardware).filter(m=>!m.requiresArtwork).length;
if(catalogCount!==116||artworkCount!==116)throw new Error('Incomplete controller library. Extract the entire new ZIP into a fresh folder.');
await Promise.all(Object.keys(hardware).map(id=>access(path.join(root,hardwareURL(id).slice(1)))));
const port = Number(process.argv.find(arg=>arg.startsWith('--port='))?.slice(7) || process.env.CONTROLVERLAY_PORT || 3210);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid Controlverlay port');
const origin = `http://127.0.0.1:${port}`;
const clients = new Set();
let config = null, state = { buttons: [], axes: [0, 0, 0, 0], connected: false };
let lastInput = 0;
await mkdir(dataDir, { recursive: true });
try { config = JSON.parse(await readFile(path.join(dataDir, 'design.json'), 'utf8')); } catch {}
const send = (type, value) => {
  const message = `event: ${type}\ndata: ${JSON.stringify(value)}\n\n`;
  for (const client of clients) client.write(message);
};
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.gif': 'image/gif', '.png': 'image/png', '.webp': 'image/webp', '.svg':'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  try {
    // Local only; reject other origins and DNS rebinding. No permissive CORS.
    if (req.headers.host !== `127.0.0.1:${port}` && req.headers.host !== `localhost:${port}`) {
      res.writeHead(403).end(); return;
    }
    if (req.headers.origin && ![origin, `http://localhost:${port}`].includes(req.headers.origin)) {
      res.writeHead(403).end(); return;
    }
    const url = new URL(req.url, origin);
    if(req.method==='GET'&&url.pathname==='/health'){
      res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify({app:'controlverlay-maker',version,bundle,installation,catalogCount,artworkCount,pid:process.pid}));return;
    }
    if (req.method === 'GET' && url.pathname === '/events') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
      clients.add(res);
      res.write(`event: config\ndata: ${JSON.stringify(config)}\n\nevent: input\ndata: ${JSON.stringify(state)}\n\n`);
      req.on('close', () => clients.delete(res)); return;
    }
    if (req.method === 'POST' && ['/config', '/input', '/upload'].includes(url.pathname)) {
      let chunks = [], size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 16 * 1024 * 1024) { res.writeHead(413).end('File too large (16 MB maximum).'); return; }
        chunks.push(chunk);
      }
      const body = Buffer.concat(chunks);
      if (url.pathname === '/upload') {
        const kind = body.subarray(0, 6).toString().startsWith('GIF8') ? 'gif'
          : body.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'png'
          : body.subarray(0, 4).toString() === 'RIFF' && body.subarray(8,12).toString() === 'WEBP' ? 'webp' : null;
        if (!kind) { res.writeHead(415).end('Use a PNG, GIF, or WebP image.'); return; }
        const name = `${randomUUID()}.${kind}`;
        await writeFile(path.join(dataDir, name), body);
        res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ url: `/assets/${name}` })); return;
      }
      const value = JSON.parse(body.toString());
      if (!value || typeof value !== 'object') { res.writeHead(400).end(); return; }
      if (url.pathname === '/config') {
        config = value;
        await writeFile(path.join(dataDir, 'design.json'), JSON.stringify(value));
        send('config', config);
      } else {
        state = { connected: value.connected === true, buttons: Array.isArray(value.buttons) ? value.buttons.slice(0, 64).map(n => Math.max(0, Math.min(1, Number(n) || 0))) : [], axes: Array.isArray(value.axes) ? value.axes.slice(0, 4).map(n => Math.max(-1, Math.min(1, Number(n) || 0))) : [0,0,0,0] };
        lastInput = Date.now(); send('input', state);
      }
      res.writeHead(200).end('ok'); return;
    }
    if (req.method !== 'GET') { res.writeHead(405).end(); return; }
    if (url.pathname === '/config') {
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(config)); return;
    }
    let file;
    if (/^\/assets\/[a-f0-9-]+\.(png|gif|webp)$/.test(url.pathname)) file = path.join(dataDir, path.basename(url.pathname));
    else {
      const name = url.pathname === '/' ? 'index.html' : url.pathname === '/overlay' ? 'renderer.html' : url.pathname.slice(1);
      file = path.resolve(root, name);
      if (!file.startsWith(root + path.sep) && file !== path.join(root, 'index.html')) { res.writeHead(403).end(); return; }
    }
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': `${mime[path.extname(file)] || 'application/octet-stream'}`, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' }).end(content);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' ? 404 : 400).end(error.code === 'ENOENT' ? 'Not found' : 'Invalid request');
  }
});
setInterval(() => {
  for (const client of clients) client.write(': heartbeat\n\n');
  if (state.connected && Date.now() - lastInput > 2500) {
    state = { connected: false, buttons: [], axes: [0,0,0,0] }; send('input', state);
  }
}, 1000).unref();
server.listen(port, '127.0.0.1', () => console.log(`Controlverlay Maker ready: ${origin}\nKeep this window and your editor browser open while streaming.`));
