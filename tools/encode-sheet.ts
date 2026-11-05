/**
 * encode-sheet.ts — 把鲸娘逐帧 WebP 打包成 AVIF 精灵图
 *
 *   assets/whalegirl/<key>/<NN>.webp   （267 帧，301×288）
 *        ↓ ffmpeg 解码 + tile 拼接
 *   assets/whalegirl-sheet/<key>.avif  （22 张，每动画一张）
 *
 * 布局：cols = ceil(sqrt(n))、rows = ceil(n/cols)，行优先；空位填透明。
 * 编码：avifenc -q 60 --qalpha 60 -s 0（最高压缩档），质量 PSNR ≈ 40 dB。
 *
 * 依赖：ffmpeg、avifenc（brew install libavif ffmpeg）
 * 用法：bun run tools/encode-sheet.ts
 */
import { mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '..');
const SRC = join(ROOT, 'assets/whalegirl');
const OUT = join(ROOT, 'assets/whalegirl-sheet');

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

/** 从目录里数帧（<NN>.webp），并校验尺寸一致。 */
function framesOf(dir: string): number {
  const files = readdirSync(dir).filter(f => f.endsWith('.webp')).sort();
  if (files.length === 0) throw new Error(`没有帧: ${dir}`);
  return files.length;
}

const keys = readdirSync(SRC)
  .filter(name => statSync(join(SRC, name)).isDirectory())
  .sort();

run(['mkdir', '-p', OUT]);
let total = 0;
for (const key of keys) {
  const dir = join(SRC, key);
  const n = framesOf(dir);
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const tmp = mkdtempSync(join(tmpdir(), `sheet-${key}-`));
  try {
    run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', join(dir, '%02d.webp'),
      '-start_number', '0', '-pix_fmt', 'rgba', join(tmp, '%03d.png')]);
    run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', join(tmp, '%03d.png'),
      '-vf', `tile=${cols}x${rows}:padding=0:margin=0:color=#00000000`,
      '-frames:v', '1', join(tmp, 'sheet.png')]);
    const out = join(OUT, `${key}.avif`);
    run(['avifenc', '-q', Q, '--qalpha', QA, '-s', SPEED, '-j', 'all', join(tmp, 'sheet.png'), out]);
    const size = statSync(out).size;
    total += size;
    console.log(`${key.padEnd(14)} ${String(n).padStart(3)}f  ${cols}x${rows}  ${(size / 1024).toFixed(0).padStart(4)}K`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
console.log(`\n${keys.length} 张精灵图，共 ${(total / 1024).toFixed(0)}K → ${OUT}`);
