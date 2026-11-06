/**
 * build-blog.ts — 扫描 blog/ 目录，生成 src/data/posts.ts
 *
 *   blog/blog.config.json        站点名 / 入口文件 / 图片目录 / 排除项 / 编码参数
 *   blog/<序号>/index.md         文章 Markdown（图片用相对路径 images/xxx.avif）
 *   blog/<序号>/images/*.avif    正文配图
 *        ↓
 *   src/data/posts.ts            POSTS（标题 / 日期 / 摘要 / 正文）+ POST_IMAGE_SIZE
 *
 * 目录下的文章会被自动识别（按目录名排序）；非 AVIF 图会按配置用 avifenc 就地转码。
 * 用法：bun run blog:build
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const ROOT = join(import.meta.dir, '..');
const BLOG = join(ROOT, 'blog');
const CONFIG_PATH = join(BLOG, 'blog.config.json');

interface BlogConfig {
  title: string;
  description?: string;
  entry: string;
  images: string;
  exclude?: string[];
  /** 排序：date-desc（默认，新→旧）/ date-asc / name（按目录名中文排序）。 */
  sort?: 'date-desc' | 'date-asc' | 'name';
  image?: { format?: string; quality?: number; alphaQuality?: number; speed?: number };
}

const IMG_RX = /!\[([^\]]*)\]\(([^)\s]+)\)/g;

function readConfig(): BlogConfig {
  if (!existsSync(CONFIG_PATH)) throw new Error('缺少 blog/blog.config.json');
  const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) as Partial<BlogConfig>;
  return {
    title: raw.title ?? '文章',
    description: raw.description ?? '',
    entry: raw.entry ?? 'index.md',
    images: raw.images ?? 'images',
    exclude: raw.exclude ?? [],
    sort: raw.sort ?? 'date-desc',
    image: raw.image,
  };
}

function probe(file: string): [number, number] {
  const p = Bun.spawnSync(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file]);
  const [w, h] = p.stdout.toString().trim().split(',').map(Number);
  return [w ?? 0, h ?? 0];
}

function encode(src: string, cfg: BlogConfig): string {
  const quality = String(cfg.image?.quality ?? 60);
  const alpha = String(cfg.image?.alphaQuality ?? 60);
  const speed = String(cfg.image?.speed ?? 0);
  const out = src.replace(/\.[^.]+$/, '.avif');
  if (extname(src).toLowerCase() === '.avif') return src;
  const args = ['avifenc', '-q', quality, '--qalpha', alpha, '-s', speed, '-j', 'all', src, out];
  const p = Bun.spawnSync(args, { stdout: 'ignore', stderr: 'pipe' });
  if (p.exitCode !== 0) throw new Error('avifenc 失败: ' + src + '\n' + p.stderr.toString().slice(0, 300));
  return out;
}

function excerptOf(body: string): string {
  const skip = /^(#|>|\||!\[|\x60\x60\x60|\*\*|-\s|\*|[0-9]+\.\s)/;
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (line === '' || skip.test(line)) continue;
    const plain = line.replace(/[*_\x60>#~]/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
    if (plain.length >= 12) return plain.slice(0, 80);
  }
  return '';
}

const cfg = readConfig();
interface Entry { dir: string; title: string; date: string; body: string }

const dirs = readdirSync(BLOG).filter(name => {
  const full = join(BLOG, name);
  return statSync(full).isDirectory() && !name.startsWith('.') && !(cfg.exclude ?? []).includes(name);
});

const entries: Entry[] = [];
for (const dir of dirs) {
  const entryPath = join(BLOG, dir, cfg.entry);
  if (!existsSync(entryPath)) continue;
  const body = readFileSync(entryPath, 'utf8').replace(/\r\n/g, '\n').replace(/^\n+/, '');
  const h1 = body.match(/^#\s+(.+)$/m);
  entries.push({
    dir,
    title: (h1?.[1] ?? dir).trim(),
    date: (body.match(/收录时间[：:]\s*([0-9-]{8,10})/) ?? [, ''])[1] ?? '',
    body,
  });
}

const sort = cfg.sort ?? 'date-desc';
entries.sort((a, b) => {
  if (sort === 'name') return a.dir.localeCompare(b.dir, 'zh');
  const da = a.date || '0000-00-00';
  const db = b.date || '0000-00-00';
  if (da !== db) return sort === 'date-asc' ? da.localeCompare(db) : db.localeCompare(da);
  return a.title.localeCompare(b.title, 'zh');
});

const sizes: Record<string, readonly [number, number]> = {};
const posts: string[] = [];
let imageCount = 0;

for (const entry of entries) {
  const dir = entry.dir;
  const postDir = join(BLOG, dir);

  const body = entry.body.replace(IMG_RX, (whole, alt: string, src: string) => {
    if (/^(https?:|data:)/i.test(src)) return whole;
    const abs = resolve(postDir, decodeURIComponent(src));
    if (!existsSync(abs)) return '';
    const encoded = encode(abs, cfg);
    const rel = encoded.slice(postDir.length + 1).split('\\').join('/');
    const web = 'blog/' + dir + '/' + rel;
    const [w, h] = probe(encoded);
    if (w > 0 && h > 0) sizes[web] = [w, h];
    imageCount += 1;
    return '![' + alt + '](' + web + ')';
  }).replace(/\n{3,}/g, '\n\n');

  posts.push(JSON.stringify({
    id: 'post-' + dir,
    slug: dir,
    title: entry.title,
    date: entry.date,
    excerpt: excerptOf(body),
    body,
  }));
}

const header = '/* 自动生成：tools/build-blog.ts（读 blog/blog.config.json）；不要手改 */\n' +
  "import type { Post } from '../types.ts';\n\n" +
  'export const BLOG_TITLE = ' + JSON.stringify(cfg.title) + ';\n\n';
const out = header +
  'export const POSTS: readonly Post[] = [\n' + posts.join(',\n') + ',\n];\n\n' +
  'export const POST_IMAGE_SIZE: Record<string, readonly [number, number]> = ' +
  JSON.stringify(sizes) + ';\n';

writeFileSync(join(ROOT, 'src/data/posts.ts'), out);
console.log('blog:', posts.length, '篇 /', imageCount, '图 ·', cfg.title);
