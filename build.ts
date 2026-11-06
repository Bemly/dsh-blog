/**
 * 生产构建：index.html → dist（含打包后的 JS），再拷贝静态素材目录。
 */
import { cp, mkdir, rm } from 'node:fs/promises';

const outdir = `${import.meta.dir}/dist`;

await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });

const result = await Bun.build({
  entrypoints: [`${import.meta.dir}/index.html`],
  outdir,
  target: 'browser',
  minify: true,
  sourcemap: 'linked',
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

await cp(`${import.meta.dir}/assets`, `${outdir}/assets`, { recursive: true });
await cp(`${import.meta.dir}/blog`, `${outdir}/blog`, { recursive: true });
console.log('build ok →', outdir);
