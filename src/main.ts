/**
 * 入口：找到唯一的 <canvas id="tui">，启动应用。
 * 整个界面都画在这张画布上（另有 pixel-layer 承载真像素立绘/大字）。
 */
import { start } from './app.ts';

function boot(): void {
  const canvas = document.getElementById('tui');
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('missing <canvas id="tui">');
  }
  start(canvas);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
