/**
 * import-blog.ts — 把 Obsidian 目录里的书签文章导入 dsh-blog
 *
 *   <src>/*.md + <src>/NNN-images/*            （相对路径引用图片）
 *        ↓ 图片：ffmpeg 解帧 / avifenc -q 60 -s 0
 *   assets/blog/<no>/iNN-<name>.avif
 *        ↓ 重写 markdown 里的图片路径
 *   src/data/posts.ts                           （POSTS + POST_IMAGE_SIZE）
 *
 * 用法：bun run tools/import-blog.ts <源目录> [限制篇数]
 * 已有输出会跳过（可断点续跑）。
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';

const ROOT = join(import.meta.dir, '..');
const srcDir = resolve(process.argv[2] ?? '');
const limit = Number(process.argv[3] ?? '0');
const CONC = Number(process.env.CONC ?? '3');
const TMP = join(ROOT, '.cache', 'blog-img');
const Q = '60';
const SPEED = '0';

if (!srcDir || !existsSync(srcDir)) {
  console.error('用法: bun run tools/import-blog.ts <源目录> [限制篇数]');
  process.exit(1);
}

interface RawPost { no: string; title: string; date: string; body: string; file: string }
interface Img { src: string; w: number; h: number }

const RASTER = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tif', '.tiff']);
const IMG_RX = /!\[([^\]]*)\]\(([^)\s]+)\)/g;

function safe(s: string): string {
  return s.replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'img';
}

function probe(file: string): [number, number] {
  const p = Bun.spawnSync(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file]);
  const [w, h] = p.stdout.toString().trim().split(',').map(Number);
  return [w ?? 0, h ?? 0];
}

async function run(cmd: string[]): Promise<void> {
  const p = Bun.spawn(cmd, { stdout: 'ignore', stderr: 'pipe' });
  const code = await p.exited;
  if (code !== 0) {
    const err = await new Response(p.stderr).text();
    throw new Error(cmd.join(' ') + '\n' + err.slice(0, 400));
  }
}

function readPosts(): RawPost[] {
  const files = readdirSync(srcDir)
    .filter(f => f.toLowerCase().endsWith('.md'))
    .sort((a, b) => a.localeCompare(b, 'en'));
  const picked = limit > 0 ? files.slice(0, limit) : files;
  return picked.map((file, index) => {
    const body = readFileSync(join(srcDir, file), 'utf8')
      .replace(/\r\n/g, '\n')
      // 去掉 YAML frontmatter（Obsidian 的 AIGC 标签块）
      .replace(/^---\n[\s\S]*?\n---\n/, '')
      // 去掉「内容由AI生成」的免责声明行
      .replace(/^.*内容由\s*AI\s*生成.*$\n?/gm, '');
    // 用整体序号做 id / 目录：源文件前缀会重复（002-01、002-02 都属于 002）
    const no = String(index + 1).padStart(3, '0');
    const h1 = body.match(/^#\s+(.+)$/m);
    const title = (h1?.[1] ?? basename(file, '.md')).trim();
    const date = (body.match(/收录时间[：:]\s*([0-9-]{8,10})/) ?? [, ''])[1] ?? '';
    return { no, title, date, body, file };
  });
}

/** 收集并按首次出现顺序编号要导入的图片（abs -> web 路径）。 */
function collect(posts: RawPost[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const post of posts) {
    let i = 0;
    for (const m of post.body.matchAll(IMG_RX)) {
      const raw = m[2] ?? '';
      if (/^(https?:|data:)/i.test(raw)) continue;
      const abs = resolve(srcDir, decodeURIComponent(raw));
      if (map.has(abs)) continue;
      if (!RASTER.has(extname(abs).toLowerCase())) continue;
      if (!existsSync(abs)) continue;
      i += 1;
      const name = 'i' + String(i).padStart(2, '0') + '-' + safe(basename(abs, extname(abs))) + '.avif';
      map.set(abs, 'assets/blog/' + safe(post.no) + '/' + name);
    }
  }
  return map;
}

async function convert(abs: string, web: string): Promise<Img | null> {
  const out = join(ROOT, web);
  mkdirSync(join(out, '..'), { recursive: true });
  const [w, h] = probe(abs);
  if (w <= 0 || h <= 0) return null;
  if (existsSync(out) && statSync(out).size > 0) return { src: web, w, h };

  mkdirSync(TMP, { recursive: true });
  const ext = extname(abs).toLowerCase();
  const direct = ext === '.png' || ext === '.jpg' || ext === '.jpeg';
  const encode = (input: string): Promise<void> =>
    run(['avifenc', '-q', Q, '--qalpha', Q, '-s', SPEED, '-j', '2', input, out]);
  const viaPng = async (): Promise<void> => {
    const png = join(TMP, safe(basename(abs, ext)) + '.png');
    await run(['ffmpeg', '-v', 'error', '-y', '-i', abs, '-frames:v', '1', png]);
    try {
      await encode(png);
    } finally {
      rmSync(png, { force: true });
    }
  };
  // 扩展名不可靠：.png 可能是 ico、.jpg 可能是 webp，失败就统一走 ffmpeg 转 PNG
  if (direct) {
    try {
      await encode(abs);
    } catch {
      await viaPng();
    }
  } else {
    await viaPng();
  }
  return { src: web, w, h };
}

function excerptOf(body: string): string {
  const lines = body.split('\n').map(l => l.trim());
  const skip = /^(#|>|\||!\[|\x60\x60\x60|\*\*|-\s|\*|[0-9]+\.\s)/;
  for (const line of lines) {
    if (line === '' || skip.test(line)) continue;
    const plain = line.replace(/[*_\x60>#~]/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
    if (plain.length >= 12) return plain.slice(0, 80);
  }
  return '';
}

const posts = readPosts();
const refs = posts.reduce((n, p) => n + [...p.body.matchAll(IMG_RX)].length, 0);
console.log('文章', posts.length, '篇；图片引用', refs, '处');
const map = collect(posts);
console.log('待导入图片', map.size, '张');

const entries = [...map.entries()];
const imported = new Map<string, Img>();
let done = 0;
let failed = 0;
const started = Date.now();

async function worker(): Promise<void> {
  for (;;) {
    const next = entries.shift();
    if (next === undefined) return;
    const [abs, web] = next;
    try {
      const img = await convert(abs, web);
      if (img !== null) imported.set(abs, img);
    } catch (e) {
      failed += 1;
      console.error('失败', abs, String(e).slice(0, 200));
    }
    done += 1;
    if (done % 20 === 0) console.log('  ', done, '/', map.size, '·', ((Date.now() - started) / 1000).toFixed(0) + 's');
  }
}
await Promise.all(Array.from({ length: CONC }, () => worker()));

function rewrite(body: string): string {
  return body.replace(IMG_RX, (whole, alt: string, raw: string) => {
    if (/^(https?:|data:)/i.test(raw)) return whole;
    const abs = resolve(srcDir, decodeURIComponent(raw));
    const img = imported.get(abs);
    if (img === undefined) return '';
    return '![' + alt + '](' + img.src + ')';
  }).replace(/\n{3,}/g, '\n\n');
}

const sizeMap: Record<string, [number, number]> = {};
const out: string[] = [];
for (const post of posts) {
  const body = rewrite(post.body);
  for (const img of imported.values()) if (body.includes('](' + img.src + ')')) sizeMap[img.src] = [img.w, img.h];
  out.push(JSON.stringify({
    id: 'p' + post.no,
    no: post.no,
    title: post.title,
    date: post.date,
    excerpt: excerptOf(body),
    body,
  }));
}

const header = '/* 自动生成：tools/import-blog.ts <源目录>；图片已转 AVIF q60（-s 0） */\n' +
  "import type { Post } from '../types.ts';\n\n";
const ts = header +
  'export const POSTS: readonly Post[] = [\n' + out.join(',\n') + ',\n];\n\n' +
  'export const POST_IMAGE_SIZE: Record<string, readonly [number, number]> = ' +
  JSON.stringify(sizeMap) + ';\n';
writeFileSync(join(ROOT, 'src/data/posts.ts'), ts);

console.log('完成：', posts.length, '篇 /', imported.size, '图 / ' + failed + ' 失败 /',
  ((Date.now() - started) / 1000).toFixed(0) + 's');
