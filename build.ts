/**
 * 生产构建：index.html → dist（含打包后的 JS），再拷贝运行时静态素材。
 */
import { existsSync } from 'node:fs';
import { cp, mkdir, readdir, rm } from 'node:fs/promises';

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
await cp(`${import.meta.dir}/404.html`, `${outdir}/404.html`);

// blog：只拷运行时需要的配图。正文已经打进 bundle，Markdown / 配置不进 dist。
const blogDir = `${import.meta.dir}/blog`;
await mkdir(`${outdir}/blog`, { recursive: true });
for (const entry of await readdir(blogDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const images = `${blogDir}/${entry.name}/images`;
  if (!existsSync(images)) continue;
  await cp(images, `${outdir}/blog/${entry.name}/images`, { recursive: true });
}

console.log('build ok →', outdir);
