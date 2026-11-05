/**
 * 预览生产构建：把 dist/ 当静态站点伺服（默认 8899，可用 PORT 改）。
 */
import { join, normalize, sep } from 'node:path';

const root = `${import.meta.dir}/dist`;
const port = Number(process.env.PORT ?? 8899);
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = Bun.serve({
  port,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    let rel = decodeURIComponent(url.pathname);
    if (rel === '/' || rel === '') rel = '/index.html';
    const full = normalize(join(root, rel));
    if (!full.startsWith(root + sep)) return new Response('Forbidden', { status: 403 });
    const file = Bun.file(full);
    if (!(await file.exists())) return new Response('Not found', { status: 404 });
    const ext = full.slice(full.lastIndexOf('.'));
    return new Response(file, { headers: { 'content-type': MIME[ext] ?? 'application/octet-stream' } });
  },
});

console.log(`dsh-blog preview → http://127.0.0.1:${server.port}/`);
