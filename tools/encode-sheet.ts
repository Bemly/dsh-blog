/**
 * encode-sheet.ts — 把序列帧打包成 AVIF 精灵图
 *
 *   <src>/<key>/<NN>.png|webp            （同一目录内帧尺寸一致）
 *        ↓ ffmpeg 解码 + [降采样] + tile 拼接
 *   assets/<skin>-sheet/<key>.avif       （每动画一张）
 *
 * 布局：cols = ceil(sqrt(n))、rows = ceil(n/cols)，行优先；空位填透明。
 * 编码：avifenc -q 60 --qalpha <QA> -s 0（最高压缩档）。
 *
 * 逐帧源图不入库，只提交生成结果；重新生成时把素材包路径传进来。
 * 依赖：ffmpeg、avifenc（brew install ffmpeg libavif）
 * 用法：
 *   bun run encode:sheet <skin> <源目录> [缩放] [alphaQ]
 *   bun run encode:sheet whalegirl <kit>/whaleGirl/img
 *   bun run encode:sheet whale-maid-anime <kit>/whale-maid-anime-video/img 0.75 85
 */
import { mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = join(import.meta.dir, '..');

const Q = '60';       // 色彩质量 0..100
const SPEED = '0';    // 0 = 最慢、压得最小

function run(cmd: string[]): void {
  const p = Bun.spawnSync(cmd, { stdout: 'ignore', stderr: 'pipe' });
  if (p.exitCode !== 0) {
    console.error(`失败: ${cmd.join(' ')}\n${p.stderr.toString()}`);
    process.exit(1);
  }
}

/** 源目录里一帧的扩展名（png / webp）。 */
function frameExt(dir: string): string {
  const first = readdirSync(dir).filter(f => /\.(png|webp)$/i.test(f)).sort()[0];
  if (first === undefined) throw new Error(`没有帧: ${dir}`);
  return first.slice(first.lastIndexOf('.')).toLowerCase();
}

/** 帧尺寸（所有帧一致）。 */
function frameSize(dir: string, ext: string): [number, number] {
  const first = readdirSync(dir).filter(f => f.toLowerCase().endsWith(ext)).sort()[0]!;
  const p = Bun.spawnSync(['ffprobe', '-v', 'error', '-show_entries', 'stream=width,height',
    '-of', 'csv=p=0', join(dir, first)]);
  const [w, h] = p.stdout.toString().trim().split(',').map(Number);
  return [w!, h!];
}

function encode(skin: string, src: string, scale: number, qalpha: string): void {
  const out = join(ROOT, `assets/${skin}-sheet`);
  run(['mkdir', '-p', out]);
  const keys = readdirSync(src)
    .filter(name => statSync(join(src, name)).isDirectory())
    .sort();
  let total = 0;
  for (const key of keys) {
    const dir = join(src, key);
    const ext = frameExt(dir);
    const n = readdirSync(dir).filter(f => f.toLowerCase().endsWith(ext)).length;
    const [w, h] = frameSize(dir, ext);
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const sw = Math.round(w * scale), sh = Math.round(h * scale);
    const tile = `tile=${cols}x${rows}:padding=0:margin=0:color=#00000000`;
    const tmp = mkdtempSync(join(tmpdir(), `sheet-${skin}-${key}-`));
    try {
      run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', join(dir, `%02d${ext}`),
        '-start_number', '0', '-pix_fmt', 'rgba', join(tmp, '%03d.png')]);
      run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', join(tmp, '%03d.png'),
        '-vf', scale === 1 ? tile : `scale=${sw}:${sh}:flags=lanczos,${tile}`,
        '-frames:v', '1', join(tmp, 'sheet.png')]);
      const avif = join(out, `${key}.avif`);
      run(['avifenc', '-q', Q, '--qalpha', qalpha, '-s', SPEED, '-j', 'all', join(tmp, 'sheet.png'), avif]);
      const size = statSync(avif).size;
      total += size;
      console.log(`${skin.padEnd(16)} ${key.padEnd(14)} ${String(n).padStart(3)}f  ${cols}x${rows} @${sw}x${sh}  ${(size / 1024).toFixed(0).padStart(4)}K`);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }
  console.log(`\n${skin}: ${keys.length} 张，共 ${(total / 1024 / 1024).toFixed(2)}M → ${out}`);
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('用法: bun run encode:sheet <skin> <源目录> [缩放=1] [alphaQ=60]');
  process.exit(1);
}
encode(args[0]!, resolve(args[1]!), Number(args[2] ?? '1'), args[3] ?? '60');
