/**
 * 开发服务器：Bun.serve + 按需转译 TS。
 *
 * 不预打包：浏览器直接以原生 ES module 方式请求 `./src/*.ts`，服务器用
 * Bun.Transpiler 现场转成 JS 返回（改代码刷新即生效，无需构建）。
 * 静态资源（assets/）直接从磁盘读。
 */
import { join, normalize, sep } from 'node:path';

const port = Number(process.env.PORT ?? 8899);
const root = import.meta.dir;
const transpiler = new Bun.Transpiler({ loader: 'ts' });

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function extOf(path: string): string {
  const name = path.slice(path.lastIndexOf('/') + 1);
  const i = name.lastIndexOf('.');
  return i < 0 ? '' : name.slice(i);
}

const server = Bun.serve({
  port,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    let rel = decodeURIComponent(url.pathname);
    if (rel === '/' || rel === '') rel = '/index.html';
    // 防目录穿越：规范化后必须仍在项目根内
    const full = normalize(join(root, rel));
    if (!full.startsWith(root + sep)) return new Response('Forbidden', { status: 403 });

    const file = Bun.file(full);
    if (!(await file.exists())) {
      // 深链 /<中文标题>：与 GitHub Pages 一致，回 404.html 把路径带回根页面。
      // 只有「看起来像静态文件」的请求才回纯 404（标题里可能带 . 如 DSM7.x）。
      const want = extOf(rel);
      const isAsset = MIME[want] !== undefined || want === '.ts';
      if (!isAsset) {
        const nf = Bun.file(join(root, '404.html'));
        if (await nf.exists()) {
          return new Response(nf, {
            status: 404,
            headers: { 'content-type': MIME['.html'] ?? 'text/html', 'cache-control': 'no-cache' },
          });
        }
      }
      return new Response('Not found', { status: 404 });
    }

    const ext = extOf(full);
    if (ext === '.ts') {
      const src = await file.text();
      const js = transpiler.transformSync(src);
      return new Response(js, {
        headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'no-cache' },
      });
    }
    if (ext === '.html') {
      return new Response(file, {
        headers: { 'content-type': MIME['.html'] ?? 'text/html', 'cache-control': 'no-cache' },
      });
    }
    return new Response(file, {
      headers: { 'content-type': MIME[ext] ?? 'application/octet-stream', 'cache-control': 'no-cache' },
    });
  },
});

console.log(`dsh-blog dev server → http://127.0.0.1:${server.port}/`);
