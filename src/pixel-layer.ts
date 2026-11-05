/* ═══════════════════════════════════════════════════════════
   pixel-layer.ts — 独立真像素层（不受字符网格影响）
   ───────────────────────────────────────────────────────────
   为什么需要它：
   - TUI 主画布是「等宽字符网格」，所有内容都以字体字形绘制；
   - 像素立绘 / 像素大字如果也走字形（▀ / █ 字符），字形本身的
     抗锯齿与行高留白会把像素压扁、糊掉；
   - 本层是一张覆盖全屏、点击穿透的 canvas，按 **设备像素** 整数
     对齐绘制矩形，天然锐利：一个源像素 = 整数个物理像素。

   绘制约定：
   - 坐标一律用 CSS 像素（与 TUI 的 col*cw / row*ch 同一坐标系）；
   - 内部换算到设备像素后做 round，保证边缘落在物理像素上；
   - imageSmoothingEnabled = false（最近邻）；真图立绘走 imageSmooth。
   ═══════════════════════════════════════════════════════════ */
import type { PixelLayerApi, PixelRows } from './types.ts';

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let dpr = 1;
let cssW = 0;
let cssH = 0;

function ensure(): void {
  if (canvas !== null) return;
  canvas = document.createElement('canvas');
  canvas.id = 'pixel-layer';
  const st = canvas.style;
  st.position = 'fixed';
  st.left = '0';
  st.top = '0';
  st.pointerEvents = 'none';
  st.zIndex = '10';
  st.imageRendering = 'pixelated';
  document.body.appendChild(canvas);
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('pixel layer 2d context unavailable');
  ctx = context;
}

function resize(): void {
  if (canvas === null) return;
  const w = Math.max(1, window.innerWidth);
  const h = Math.max(1, window.innerHeight);
  dpr = window.devicePixelRatio || 1;
  if (cssW !== w || cssH !== h) {
    cssW = w; cssH = h;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }
}

function begin(): void {
  ensure();
  resize();
  if (ctx === null) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function end(): void {
  /* 预留：目前逐项即时绘制 */
}

/** CSS 长度 → 设备像素。 */
const D = (v: number): number => Math.round(v * dpr);

function rect(x0: number, y0: number, x1: number, y1: number, color: string): void {
  if (ctx === null) return;
  const dx = D(x0);
  const dy = D(y0);
  const w = D(x1) - dx;
  const h = D(y1) - dy;
  if (w <= 0 || h <= 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(dx, dy, w, h);
}

/** 图片：最近邻 + 设备像素对齐。 */
function imageAt(img: HTMLImageElement, x: number, y: number, w: number, h: number): void {
  if (ctx === null || !img) return;
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  if (!sw || !sh) return;
  const dx = D(x);
  const dy = D(y);
  const dw = Math.max(1, D(x + w) - dx);
  const dh = Math.max(1, D(y + h) - dy);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, sw, sh, dx, dy, dw, dh);
}

/** 精灵图里的一格：源矩形 → 目标矩形，最近邻 + 设备像素对齐。 */
function imageSub(img: HTMLImageElement, sx: number, sy: number, sw: number, sh: number, x: number, y: number, w: number, h: number): void {
  if (ctx === null) return;
  if (!sw || !sh) return;
  const dx = D(x);
  const dy = D(y);
  const dw = Math.max(1, D(x + w) - dx);
  const dh = Math.max(1, D(y + h) - dy);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

/** 精灵图里的一格：插画素材用，高质量插值（缩放比例非整数时不会锯齿）。 */
function imageSubSmooth(img: HTMLImageElement, sx: number, sy: number, sw: number, sh: number, x: number, y: number, w: number, h: number): void {
  if (ctx === null) return;
  if (!sw || !sh) return;
  const dx = D(x);
  const dy = D(y);
  const dw = Math.max(1, D(x + w) - dx);
  const dh = Math.max(1, D(y + h) - dy);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.imageSmoothingEnabled = false;
}

/** 图片：高质量缩放（高清立绘不是整数倍像素网格）。 */
function imageSmooth(img: HTMLImageElement, x: number, y: number, w: number, h: number): void {
  if (ctx === null || !img) return;
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  if (!sw || !sh) return;
  const dx = D(x);
  const dy = D(y);
  const dw = Math.max(1, D(x + w) - dx);
  const dh = Math.max(1, D(y + h) - dy);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, sw, sh, dx, dy, dw, dh);
  ctx.imageSmoothingEnabled = false;
}

/**
 * 字符网格像素画（半块原味：1 源像素 = cw × ch/2）。
 * rows 既可以是字符串行（字符 = palette 键），也可以是「每格颜色/null」的数组行。
 */
function cells(x: number, y: number, cw: number, ch: number, rows: PixelRows, palette: Record<string, string> | null): void {
  if (rows.length === 0) return;
  const first = rows[0];
  if (first === undefined) return;
  const H = rows.length;
  const W = first.length;
  if (!W) return;
  for (let py = 0; py < H; py++) {
    const row = rows[py];
    if (row === undefined) continue;
    for (let px = 0; px < W; px++) {
      const key = row[px];
      if (key === undefined || key === null || key === '.' || key === ' ') continue;
      const color = palette === null ? key : palette[key];
      if (!color) continue;
      rect(x + px * cw, y + py * ch, x + (px + 1) * cw, y + (py + 1) * ch, color);
    }
  }
}

/** 独立像素层单例。 */
export const PixelLayer: PixelLayerApi = {
  get dpr(): number { return dpr; },
  begin,
  end,
  imageAt,
  imageSub,
  imageSubSmooth,
  imageSmooth,
  cells,
  rect,
};
