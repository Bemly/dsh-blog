/**
 * encode-sheet.ts — 把原生像素帧打包成 AVIF 精灵图
 *
 *   <src>/<key>/<NN>.png|webp            （每帧 301×288）
 *        ↓ ffmpeg 解码 + tile 拼接
 *   assets/<skin>-sheet/<key>.avif       （每动画一张）
 *
 * 布局：cols = ceil(sqrt(n))、rows = ceil(n/cols)，行优先；空位填透明。
 * 编码：avifenc -q 60 --qalpha 60 -s 0（最高压缩档），PSNR ≈ 40 dB。
 *
 * 依赖：ffmpeg、avifenc（brew install ffmpeg libavif）
 * 用法：
 *   bun run encode:sheet                       # 默认：whalegirl ← assets/whalegirl
 *   bun run encode:sheet claude-girl <源目录>  # 指定角色与源目录（PNG/WebP 均可）
 */
import { mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = join(import.meta.dir, '..');

const Q = '60';       // 色彩质量 0..100
const QA = '60';      // alpha 质量 0..100
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

function encode(skin: string, src: string): void {
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
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const tmp = mkdtempSync(join(tmpdir(), `sheet-${skin}-${key}-`));
    try {
      run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', join(dir, `%02d${ext}`),
        '-start_number', '0', '-pix_fmt', 'rgba', join(tmp, '%03d.png')]);
      run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', join(tmp, '%03d.png'),
        '-vf', `tile=${cols}x${rows}:padding=0:margin=0:color=#00000000`,
        '-frames:v', '1', join(tmp, 'sheet.png')]);
      const avif = join(out, `${key}.avif`);
      run(['avifenc', '-q', Q, '--qalpha', QA, '-s', SPEED, '-j', 'all', join(tmp, 'sheet.png'), avif]);
      const size = statSync(avif).size;
      total += size;
      console.log(`${skin.padEnd(12)} ${key.padEnd(14)} ${String(n).padStart(3)}f  ${cols}x${rows}  ${(size / 1024).toFixed(0).padStart(4)}K`);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }
  console.log(`\n${skin}: ${keys.length} 张，共 ${(total / 1024).toFixed(0)}K → ${out}`);
}

const args = process.argv.slice(2);
if (args.length >= 2) {
  encode(args[0]!, resolve(args[1]!));
} else {
  encode('whalegirl', join(ROOT, 'assets/whalegirl'));
}
