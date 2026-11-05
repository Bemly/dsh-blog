/* ═══════════════════════════════════════════════════════════
   tui-core.ts — Canvas 真 TUI 渲染内核
   ───────────────────────────────────────────────────────────
   唯一渲染载体：整屏一个 <canvas>。
   模型：等宽字符网格（COLS x ROWS），每单元 = {ch, fg, bg, st}
   st 位标志：1=bold 2=dim 4=underline 8=inverse 16=italic
   逐帧绘制：beginFrame() 清 buffer → UI 写单元 → endFrame() 上屏
   输入：键盘/鼠标统一分发，坐标自动映射到字符网格。
   ═══════════════════════════════════════════════════════════ */
import type { BoxOptions, Cell, CellPos, FillOptions, InputHandlers, MutableTheme, RenderToken, TuiApi } from './types.ts';

const ST = { BOLD: 1, DIM: 2, UNDER: 4, INVERSE: 8, ITALIC: 16 } as const;
/** 像素线条哨兵字符：在字符网格里占格，渲染时画成实线。 */
const LINE_H = '\u0002';
const LINE_V = '\u0003';
const LINE_X = '\u0004';

const FONT_STACK = '"SF Mono", "Menlo", "Consolas", "DejaVu Sans Mono", monospace';
const FONT_SIZE = 13;

type FrameOp =
  | { t: 'h'; x: number; y: number; w: number; c: string }
  | { t: 'v'; x: number; y: number; h: number; c: string }
  | { t: 'r'; x: number; y: number; w: number; h: number; c: string };

let canvas!: HTMLCanvasElement;
let ctx!: CanvasRenderingContext2D;
let COLS = 120;
let ROWS = 34;
let cw = 10;
let ch = 19;
let dpr = 1;
let buffer: Cell[][] = [];
let frameOps: FrameOp[] = [];

// ── 主题色（theme.ts dark 雾蓝）────────────────────────────
const THEME: MutableTheme = {
  bg: '#0d1017', panel: '#11141d', panel2: '#161a26', border: '#262c3d',
  fg: '#c8d0e0', dim: '#5d6b85', accent: '#7da1de', accentDim: '#4a679e',
  accentShimmer: '#abc2ec', pale: '#d7e4ff', flash: '#c6d8f8',
  suggestion: '#abc2ec', autoAccept: '#b3a0d4', warning: '#d8b270',
  green: '#7fd6a2', yellow: '#e8c46a', red: '#e06c75', purple: '#b48ead',
  cyan: '#6fc2d0', blue: '#5a7cff', white: '#eef2fa',
  statusBg: '#1c2125', thinkBg: 'rgba(90,124,255,0.10)',
  ctxBar: ['#22305f', '#2f4180', '#3d52a8', '#4c65d3', '#5a7cff'],
};

function init(c: HTMLCanvasElement): void {
  canvas = c;
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('canvas 2d context unavailable');
  ctx = context;
  measure();
  resizeTo(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', () => resizeTo(window.innerWidth, window.innerHeight));
  // 键盘挂在 window：隐藏输入框（IME / 粘贴）持有焦点时按键仍能到达这里。
  window.addEventListener('keydown', onKey);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', onMouseLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('click', (e) => e.preventDefault());
  // 焦点由隐藏输入框持有（见 app.ts），canvas 不再抢焦点
  canvas.setAttribute('tabindex', '-1');
  canvas.style.outline = 'none';
}

function measure(): void {
  ctx.font = `${FONT_SIZE}px ${FONT_STACK}`;
  cw = Math.ceil(ctx.measureText('M').width);
  ch = Math.ceil(FONT_SIZE * 1.55);
}

function resizeTo(wpx: number, hpx: number): void {
  dpr = window.devicePixelRatio || 1;
  const W = Math.max(200, wpx);
  const H = Math.max(200, hpx);
  COLS = Math.floor(W / cw);
  ROWS = Math.floor(H / ch);
  canvas.width = Math.floor(W * dpr);
  canvas.height = Math.floor(H * dpr);
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.font = `${FONT_SIZE}px ${FONT_STACK}`;
  buffer = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ ch: ' ', fg: THEME.fg, bg: '', st: 0 })));
  requestPaint();
}

// ── 帧循环 ─────────────────────────────────────────────────
let rafPending = false;

function requestPaint(): void {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(paint);
  }
}

function paint(): void {
  rafPending = false;
  drawToScreen();
}

function drawFrameOps(): void {
  if (frameOps.length === 0) return;
  const px = 1 / dpr;
  for (const op of frameOps) {
    ctx.fillStyle = op.c;
    if (op.t === 'h') {
      const y = Math.round((op.y + 0.5) * ch * dpr) / dpr;
      const x0 = Math.round(op.x * cw * dpr) / dpr;
      const x1 = Math.round((op.x + op.w) * cw * dpr) / dpr;
      ctx.fillRect(x0, y, Math.max(px, x1 - x0), px);
    } else if (op.t === 'v') {
      const x = Math.round((op.x + 0.5) * cw * dpr) / dpr;
      const y0 = Math.round(op.y * ch * dpr) / dpr;
      const y1 = Math.round((op.y + op.h) * ch * dpr) / dpr;
      ctx.fillRect(x, y0, px, Math.max(px, y1 - y0));
    } else {
      // 与字符网格的 box 边框同高：画在首/末行的行中心
      const x0 = Math.round((op.x + 0.5) * cw * dpr) / dpr;
      const y0 = Math.round((op.y + 0.5) * ch * dpr) / dpr;
      const x1 = Math.round((op.x + op.w - 0.5) * cw * dpr) / dpr;
      const y1 = Math.round((op.y + op.h - 0.5) * ch * dpr) / dpr;
      const r = Math.min(8, (x1 - x0) / 2, (y1 - y0) / 2);
      const w = x1 - x0 - px;
      const h = y1 - y0 - px;
      ctx.strokeStyle = op.c;
      ctx.lineWidth = Math.max(1, px);
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') ctx.roundRect(x0 + px / 2, y0 + px / 2, w, h, r);
      else ctx.rect(x0 + px / 2, y0 + px / 2, w, h);
      ctx.stroke();
    }
  }
}

function drawLineCell(c: number, r: number, kind: string, color: string): void {
  const px = Math.max(1, Math.round(dpr)) / dpr;
  const thick = Math.max(px, 1 / dpr);
  ctx.fillStyle = color;
  if (kind === LINE_H || kind === LINE_X) {
    const y = Math.round((r + 0.5) * ch * dpr) / dpr - thick / 2;
    const x0 = Math.round(c * cw * dpr) / dpr;
    const x1 = Math.round((c + 1) * cw * dpr) / dpr;
    ctx.fillRect(x0, y, Math.max(thick, x1 - x0), thick);
  }
  if (kind === LINE_V || kind === LINE_X) {
    const x = Math.round((c + 0.5) * cw * dpr) / dpr - thick / 2;
    const y0 = Math.round(r * ch * dpr) / dpr;
    const y1 = Math.round((r + 1) * ch * dpr) / dpr;
    ctx.fillRect(x, y0, thick, Math.max(thick, y1 - y0));
  }
}

function drawToScreen(): void {
  if (buffer.length === 0) return;
  ctx.fillStyle = THEME.bg;
  ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  ctx.font = `${FONT_SIZE}px ${FONT_STACK}`;
  ctx.textBaseline = 'top';
  for (let r = 0; r < ROWS; r++) {
    const row = buffer[r];
    if (row === undefined) continue;
    // 背景段合并
    let x = 0;
    while (x < COLS) {
      const cellX = row[x];
      if (cellX === undefined) { x += 1; continue; }
      const bgc = cellX.bg;
      if (!bgc) { x += 1; continue; }
      let x2 = x;
      while (x2 < COLS) {
        const cellX2 = row[x2];
        if (cellX2 === undefined || cellX2.bg !== bgc) break;
        x2 += 1;
      }
      ctx.fillStyle = bgc;
      ctx.fillRect(x * cw, r * ch, (x2 - x) * cw, ch);
      x = x2;
    }
    // 字符
    for (let c = 0; c < COLS; c++) {
      const cell = row[c];
      if (cell === undefined) continue;
      const chStr = cell.ch;
      if (chStr === LINE_H || chStr === LINE_V || chStr === LINE_X) {
        let col = cell.fg;
        let bgc2 = cell.bg || THEME.bg;
        if ((cell.st & ST.INVERSE) !== 0) { const t2 = col; col = bgc2; bgc2 = t2; }
        void bgc2;
        drawLineCell(c, r, chStr, col);
        continue;
      }
      if (chStr === ' ' || chStr === '' || chStr === '\u0001') continue;
      let fg = cell.fg;
      let bgc = cell.bg || THEME.bg;
      if ((cell.st & ST.INVERSE) !== 0) { const t = fg; fg = bgc; bgc = t; }
      void bgc;
      ctx.fillStyle = fg;
      let font = `${FONT_SIZE}px ${FONT_STACK}`;
      if ((cell.st & ST.BOLD) !== 0 && (cell.st & ST.ITALIC) !== 0) font = `bold italic ${FONT_SIZE}px ${FONT_STACK}`;
      else if ((cell.st & ST.BOLD) !== 0) font = `bold ${FONT_SIZE}px ${FONT_STACK}`;
      else if ((cell.st & ST.ITALIC) !== 0) font = `italic ${FONT_SIZE}px ${FONT_STACK}`;
      ctx.font = font;
      if ((cell.st & ST.DIM) !== 0) ctx.globalAlpha = 0.55;
      ctx.fillText(chStr, c * cw, r * ch);
      if ((cell.st & ST.UNDER) !== 0) ctx.fillRect(c * cw, r * ch + ch - 2, cw, 1);
      ctx.globalAlpha = 1;
      ctx.font = `${FONT_SIZE}px ${FONT_STACK}`;
    }
  }
  // 像素线条（字符网格画不齐的边框/分隔线）：按设备像素对齐
  drawFrameOps();
  // 光标
  if (cursorOn && cursorX >= 0 && cursorY >= 0 && cursorY < ROWS && cursorX < COLS) {
    ctx.fillStyle = '#9fb6e8';
    ctx.fillRect(cursorX * cw, cursorY * ch, 2, ch);
  }
}

// ── Buffer 写入原语 ────────────────────────────────────────
function beginFrame(): void {
  frameOps = [];
  for (let r = 0; r < ROWS; r++) {
    const row = buffer[r];
    if (row === undefined) continue;
    for (let c = 0; c < COLS; c++) {
      const cell = row[c];
      if (cell === undefined) continue;
      cell.ch = ' '; cell.fg = THEME.fg; cell.bg = ''; cell.st = 0;
    }
  }
}

function endFrame(): void {
  requestPaint();
}

function put(x: number, y: number, chIn: string, fg?: string, bg?: string, st?: number): void {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
  const chStr = chIn;
  if (chStr === '') return;
  const row = buffer[y];
  const cell = row?.[x];
  if (cell === undefined) return;
  cell.ch = chStr;
  cell.fg = fg || THEME.fg;
  // 未显式给背景时继承已有底色（否则在已填充区域上写字会把底色打穿）
  cell.bg = bg === undefined || bg === null ? cell.bg : bg;
  cell.st = st || 0;
}

function isWide(chIn: string): boolean {
  const c = chIn.codePointAt(0) ?? 0;
  // 全角：CJK、全角标点、假名、谚文、Emoji(取2列近似)
  return c >= 0x1100 && (c <= 0x115f || c === 0x2329 || c === 0x232a ||
    (c >= 0x2e80 && c <= 0xa4cf && c !== 0x303f) ||
    (c >= 0xac00 && c <= 0xd7a3) || (c >= 0xf900 && c <= 0xfaff) ||
    (c >= 0xfe10 && c <= 0xfe19) || (c >= 0xfe30 && c <= 0xfe6f) ||
    (c >= 0xff00 && c <= 0xff60) || (c >= 0xffe0 && c <= 0xffe6) ||
    (c >= 0x1f300 && c <= 0x1faff));
}

function strW(s: string): number {
  let w = 0;
  for (const c of String(s)) w += isWide(c) ? 2 : 1;
  return w;
}

function putWideMarker(x: number, y: number): void {
  const cell = buffer[y]?.[x];
  if (cell !== undefined) cell.ch = '\u0001';
}

function text(x: number, y: number, s: string, fg?: string, bg?: string, st?: number): void {
  let cx = x;
  for (const c of String(s)) {
    put(cx, y, c, fg, bg, st);
    if (isWide(c)) { putWideMarker(cx + 1, y); cx += 2; } else cx += 1;
  }
}

/** 富文本行：按单元顺序输出（自动处理全角）。 */
function rich(x: number, y: number, tokens: readonly RenderToken[], defaultFg?: string, defaultBg?: string): number {
  let cx = x;
  for (const tok of tokens) {
    const fg = tok.fg || defaultFg || THEME.fg;
    const bg = tok.bg ?? defaultBg;
    for (const c of String(tok.text)) {
      put(cx, y, c, fg, bg, tok.st || 0);
      if (isWide(c)) { putWideMarker(cx + 1, y); cx += 2; } else cx += 1;
    }
  }
  return cx;
}

function hline(x: number, y: number, w: number, fg?: string, bg?: string): void {
  if (w <= 0) return;
  for (let i = 0; i < w; i++) put(x + i, y, LINE_H, fg || THEME.border, bg);
}

function vline(x: number, y: number, h: number, fg?: string, bg?: string): void {
  if (h <= 0) return;
  for (let i = 0; i < h; i++) put(x, y + i, LINE_V, fg || THEME.border, bg);
}

/** 圆角矩形边框（启动页输入框）：1px 描边，圆角由 canvas roundRect 画。 */
function roundRect(x: number, y: number, w: number, h: number, fg?: string): void {
  if (w > 1 && h > 1) frameOps.push({ t: 'r', x, y, w, h, c: fg || THEME.border });
}

function box(x: number, y: number, w: number, h: number, o?: BoxOptions): void {
  if (w < 2 || h < 2) return;
  const fg = o?.fg || THEME.border;
  const title = o?.title || '';
  if (title) {
    const tw = Math.min(w - 4, strW(title));
    hline(x, y, 2, fg);
    hline(x + 2 + tw, y, Math.max(0, w - 2 - tw), fg);
  } else {
    hline(x, y, w, fg);
  }
  hline(x, y + h - 1, w, fg);
  vline(x, y, h, fg);
  vline(x + w - 1, y, h, fg);
  // 四角画十字，保证横竖线接上
  put(x, y, LINE_X, fg); put(x + w - 1, y, LINE_X, fg);
  put(x, y + h - 1, LINE_X, fg); put(x + w - 1, y + h - 1, LINE_X, fg);
  if (title) text(x + 2, y, title, o?.titleFg || THEME.accent);
}

/** 区域填充（字符 + 背景）。 */
function fill(x: number, y: number, w: number, h: number, o?: FillOptions): void {
  if (x <= 0 && y <= 0 && w >= COLS && h >= ROWS) frameOps = [];
  const chIn = o?.ch || ' ';
  const bgc = o?.bg || '';
  const fg = o?.fg || THEME.fg;
  const st = o?.st || 0;
  for (let r = y; r < y + h; r++) {
    const row = buffer[r];
    if (row === undefined) continue;
    for (let c = x; c < x + w; c++) {
      const cell = row[c];
      if (cell === undefined) continue;
      cell.ch = chIn; cell.fg = fg; cell.bg = bgc; cell.st = st;
    }
  }
}

// ── 光标 ───────────────────────────────────────────────────
let cursorX = -1;
let cursorY = -1;
let cursorOn = false;

function setCursor(x: number, y: number, on: boolean): void {
  cursorX = x; cursorY = y; cursorOn = on;
}

// ── 输入事件 ───────────────────────────────────────────────
const Input: InputHandlers = {
  key: null, keyUp: null,
  down: null, move: null, up: null, leave: null, wheel: null,
  lastMouse: { x: -1, y: -1, col: -1, row: -1, btn: 0 },
};

function pxToCell(px: number, py: number): CellPos {
  const rect = canvas.getBoundingClientRect();
  return { col: Math.floor((px - rect.left) / cw), row: Math.floor((py - rect.top) / ch) };
}

function onKey(e: KeyboardEvent): void {
  Input.key?.(e);
}

function onKeyUp(e: KeyboardEvent): void {
  Input.keyUp?.(e);
}

function onMouseDown(e: MouseEvent): void {
  const c = pxToCell(e.clientX, e.clientY);
  Input.lastMouse = { x: e.clientX, y: e.clientY, col: c.col, row: c.row, btn: e.button };
  Input.down?.(c.col, c.row, e.button, e);
}

function onMouseMove(e: MouseEvent): void {
  const c = pxToCell(e.clientX, e.clientY);
  Input.lastMouse = { x: e.clientX, y: e.clientY, col: c.col, row: c.row, btn: Input.lastMouse.btn };
  // 回调按接口约定传 CSS 像素（app 侧再自己换算字符坐标）。
  Input.move?.(e.clientX, e.clientY, e);
}

function onMouseUp(e: MouseEvent): void {
  const c = pxToCell(e.clientX, e.clientY);
  Input.up?.(c.col, c.row, e.button, e);
}

function onMouseLeave(): void {
  Input.leave?.();
}

function onWheel(e: WheelEvent): void {
  if (Input.wheel) {
    e.preventDefault();
    Input.wheel(e.deltaY);
  }
}

/** 字符网格渲染内核单例。 */
export const TUI: TuiApi = {
  THEME,
  ST,
  get COLS(): number { return COLS; },
  get ROWS(): number { return ROWS; },
  get cw(): number { return cw; },
  get ch(): number { return ch; },
  Input,
  init,
  beginFrame,
  endFrame,
  requestPaint,
  put,
  text,
  rich,
  hline,
  vline,
  box,
  fill,
  roundRect,
  setCursor,
  isWide,
  strW,
  pxToCell,
  truncate(s: string, max: number): string {
    if (s.length <= max) return s;
    return `${s.slice(0, Math.max(0, max - 1))}…`;
  },
  pad(s: string, n: number, fillCh?: string): string {
    let out = s;
    while (out.length < n) out = (fillCh || ' ') + out;
    return out;
  },
  padEnd(s: string, n: number): string {
    let out = s;
    while (out.length < n) out += ' ';
    return out;
  },
};
