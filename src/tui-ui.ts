/* ═══════════════════════════════════════════════════════════
   tui-ui.ts — Canvas 真 TUI 界面层（全部屏幕/组件逐帧绘制）
   依赖：TUI（tui-core）、MDKit（markdown）、PixelLayer（像素层）、
         PetKit（pet）、App（app.ts 状态）
   布局：
   - chat   = head / main / composer / status（+ 可选右侧面板）
   - 启动页 = 立绘 + 像素大字 + 圆角输入框 + 参数行 + 入口行 + Tips + 双角铭牌
   像素立绘与像素大字走独立 PixelLayer（真像素、不受字符网格影响）。
   命中：每帧把可点击区 push 到 App._hits，鼠标由 App 分发。
   ═══════════════════════════════════════════════════════════ */
import type {
  AppApi, Block, CommandDef, Hit, PetDragLimits, PetRect, PixelLayerApi, Post,
  RenderToken, SkinDef, Token,
} from './types.ts';
import { TUI } from './tui-core.ts';
import { PixelLayer } from './pixel-layer.ts';
import { MDKit } from './markdown.ts';
import { PetKit } from './pet.ts';
import { POSTS, POST_IMAGE_SIZE } from './data/posts.ts';

const T = (): typeof TUI.THEME => TUI.THEME;
const ST = TUI.ST;
const W = (s: string): number => TUI.strW(s);

let App: AppApi | null = null;
function setApp(a: AppApi): void { App = a; }

/** 字符坐标矩形。 */
interface Rect { x: number; y: number; w: number; h: number }

/** chat 屏布局。 */
interface Layout {
  head: Rect;
  main: Rect;
  composer: Rect;
  status: Rect;
  panel: Rect;
  margin: number;
}

/** 启动页布局。 */
interface LaunchGeom {
  topY: number;
  art: Rect;
  title: Rect;
  card: Rect;
  params: Rect;
  hints: Rect;
  tips: Rect;
  showTip: boolean;
  showHints: boolean;
  corners: { y: number };
}

// ── 布局 ───────────────────────────────────────────────────
const MIN_PANEL_COLS = 22;
const MAX_PANEL_COLS = 84;

/** 侧栏宽度：用户拖过就用 panelCols，否则按窗口宽度自适应。 */
function panelWidth(): number {
  const COLS = TUI.COLS;
  if (App === null || !App.state.panelOpen || COLS < 92) return 0;
  const auto = Math.min(44, Math.max(30, Math.floor(COLS * 0.26)));
  const want = App.state.panelCols > 0 ? App.state.panelCols : auto;
  return Math.max(MIN_PANEL_COLS, Math.min(MAX_PANEL_COLS, COLS - 50, want));
}

function layout(): Layout {
  const COLS = TUI.COLS;
  const ROWS = TUI.ROWS;
  const headH = 1;
  const statusH = 1;
  const composerH = 3;
  const panelW = panelWidth();
  const mainW = COLS - panelW;
  const bodyY = headH;
  const bodyH = Math.max(4, ROWS - headH - composerH - statusH);
  return {
    head: { x: 0, y: 0, w: COLS, h: headH },
    main: { x: 0, y: bodyY, w: mainW, h: bodyH },
    composer: { x: 0, y: bodyY + bodyH, w: mainW, h: composerH },
    status: { x: 0, y: ROWS - 1, w: COLS, h: statusH },
    panel: { x: mainW, y: bodyY, w: panelW, h: ROWS - headH - statusH },
    margin: 2,
  };
}

function hit(id: string, x: number, y: number, w: number, h: number, action: string | null, label: string): void {
  if (App === null) return;
  const entry: Hit = { id, x, y, w, h, action, label };
  App._hits.push(entry);
}

// ── 基础组件 ───────────────────────────────────────────────
interface ButtonOptions {
  id?: string;
  action?: string | null;
  active?: boolean;
  accent?: boolean;
  danger?: boolean;
  st?: number;
}

function button(x: number, y: number, w: number, label: string, o?: ButtonOptions): void {
  const opts = o ?? {};
  const active = opts.active === true;
  const accent = opts.accent === true;
  const danger = opts.danger === true;
  const hovered = App !== null && App.state.hoverId === (opts.id ?? label);
  const fg = danger ? '#0b0e16' : (accent ? '#0b0e16' : T().fg);
  const bgc = danger
    ? T().red
    : accent
      ? (hovered ? T().accentShimmer : T().accent)
      : (active ? T().accentDim : (hovered ? T().border : T().panel2));
  TUI.fill(x, y, w, 1, { bg: bgc });
  const lx = x + Math.max(1, Math.floor((w - W(label)) / 2));
  TUI.text(lx, y, label, fg, bgc, opts.st ?? (active ? ST.BOLD : 0));
  hit(opts.id ?? label, x, y, w, 1, opts.action ?? null, label);
}

function tab(x: number, y: number, w: number, label: string, active: boolean, id: string): void {
  TUI.fill(x, y, w, 1, { bg: active ? T().panel2 : T().panel });
  TUI.text(x + 1, y, clipLine(label, w - 2), active ? T().accent : T().dim, active ? T().panel2 : T().panel, active ? ST.BOLD : 0);
  hit(id, x, y, w, 1, id, label);
}

function toggle(x: number, y: number, on: boolean, id: string): void {
  const w = 5;
  TUI.fill(x, y, w, 1, { bg: on ? T().accentDim : T().panel2 });
  TUI.text(x + 1, y, on ? 'ON ' : 'OFF', on ? '#0b0e16' : T().dim, on ? T().accentDim : T().panel2, ST.BOLD);
  hit(id, x, y, w, 1, id, on ? 'OFF' : 'ON');
}

function slider(x: number, y: number, w: number, val01: number, id: string): void {
  const filled = Math.max(1, Math.round(w * Math.max(0, Math.min(1, val01))));
  TUI.fill(x, y, w, 1, { bg: T().panel2 });
  TUI.fill(x, y, filled, 1, { bg: T().accentDim });
  TUI.put(x + filled - 1, y, '▏', '#0b0e16');
  hit(id, x, y, w, 1, id, `${Math.round(val01 * 100)}%`);
}

function progressBar(x: number, y: number, w: number, frac: number, segs?: number): void {
  const n = segs ?? 5;
  const per = Math.max(1, Math.floor(w / n));
  for (let i = 0; i < n; i++) {
    const on = (i + 1) / n <= frac;
    TUI.fill(x + i * per, y, per, 1, { bg: on ? T().ctxBar[Math.min(i, T().ctxBar.length - 1)] : T().panel2 });
  }
}

function clipLine(s: string, max: number): string {
  if (max <= 0) return '';
  let w = 0;
  let out = '';
  for (const ch of String(s)) {
    const cw = TUI.isWide(ch) ? 2 : 1;
    if (w + cw > max) { out += '…'; break; }
    out += ch;
    w += cw;
  }
  return out;
}

function drawRoundBox(x: number, y: number, w: number, h: number, fg: string): void {
  TUI.roundRect(x, y, w, h, fg);
}

/** 弹层卡片：实底 + 边框（标题打断上边框）。 */
function modalBox(x: number, y: number, w: number, h: number, title: string): void {
  TUI.fill(x, y, w, h, { bg: T().panel });
  TUI.box(x, y, w, h, { fg: T().accentDim });
  if (title) {
    const tw = W(title);
    // 上边框在标题处断开：先擦掉标题占位，再写字
    TUI.fill(x + 2, y, tw, 1, { bg: T().panel });
    TUI.text(x + 2, y, title, T().accent, T().panel);
  }
}

// ── 像素大字（原版 splashFonts BOLD 点阵 + 字距 + 扫光）──
const BIG_GLYPHS: Record<string, readonly string[]> = {
  D: ['██▀▀▄▄', '██··██', '██··██', '██··██', '██▄▄▀▀'],
  E: ['██▀▀▀▀', '██····', '██▀▀▀·', '██····', '██▄▄▄▄'],
  P: ['██▀▀▄▄', '██··██', '██▄▄▀▀', '██····', '██····'],
  S: ['██▀▀▀▀', '██····', '·▀▀▀▀▄', '····██', '██▄▄▄▀'],
  K: ['██··██', '██·██·', '███···', '██·██·', '██··██'],
  H: ['██··██', '██··██', '██▀▀██', '██··██', '██··██'],
  A: ['·▄▀▀▄·', '██··██', '██▀▀██', '██··██', '██··██'],
  R: ['██▀▀▄▄', '██··██', '██▄▄▀▀', '██·██·', '██··██'],
  N: ['██··██', '███·██', '██·███', '██··██', '██··██'],
  I: ['▀▀██▀▀', '··██··', '··██··', '··██··', '▄▄██▄▄'],
  M: ['██··██', '██████', '██▀▀██', '██··██', '██··██'],
  Y: ['██··██', '██··██', '▀▀██▀▀', '··██··', '··██··'],
  W: ['██··██', '██··██', '██▄▄██', '██████', '██··██'],
  C: ['·▄▀▀▄▄', '██··▀▀', '██····', '██··▄▄', '·▀▄▄▀▀'],
  L: ['██····', '██····', '██····', '██····', '██▄▄▄▄'],
  U: ['██··██', '██··██', '██··██', '██··██', '·▀▄▄▀·'],
  O: ['·▄▀▀▄·', '██··██', '██··██', '██··██', '·▀▄▄▀·'],
  X: ['██··██', '·████·', '··██··', '·████·', '██··██'],
  B: ['██▀▀▄▄', '██··██', '██▄▄▀▀', '██··██', '██▄▄▀▀'],
  G: ['·▄▀▀▄▄', '██··▀▀', '██·▀▀▀', '██··██', '·▀▄▄▀▀'],
};
const BIG_FALLBACK: readonly string[] = ['▄▄▄▄▄▄', '██··██', '██··██', '██··██', '▀▀▀▀▀▀'];
const GLYPH_W = 6;
// 原版 BOLD 字距解（solveTagline：DEEPSEEK/HARNESS → 1 / 2，下排缩进 0）
const TITLE_TOP = { text: 'BEMLY', kerning: 1 };
const TITLE_BOTTOM = { text: 'BLOG', kerning: 2 };

function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
  const g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
  const bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
}

// 扫光：每 60ms 前进一列，10 列窗口，亮度正弦脉动（原版 sweep 同节奏）
function titleColor(col: number, width: number, from: string, to: string, time: number): string {
  const t = width <= 1 ? 0 : col / (width - 1);
  let c = mixHex(from, to, t);
  const cycle = width + 20;
  const start = (Math.floor(time / 60) % cycle) - 10;
  if (col >= start && col < start + 10) {
    const opacity = (Math.sin(time / 120) + 1) / 2;
    c = mixHex(c, T().flash, 0.55 * opacity);
  }
  return c;
}

function drawBigLine(
  layer: PixelLayerApi, x: number, y: number, cellW: number, cellH: number,
  line: { text: string; kerning: number }, from: string, to: string, time: number,
): void {
  const text = line.text;
  const k = line.kerning;
  const width = text.length * (GLYPH_W + k);
  for (let r = 0; r < 5; r++) {
    for (let i = 0; i < text.length; i++) {
      const g = BIG_GLYPHS[text[i] ?? ''] ?? BIG_FALLBACK;
      const rowStr = g[r] ?? '';
      for (let c = 0; c < GLYPH_W; c++) {
        const mark = rowStr[c];
        if (mark === undefined || mark === '·') continue;
        const col = i * (GLYPH_W + k) + c;
        const color = titleColor(col, width, from, to, time);
        const gx = x + col * cellW;
        const gy = y + r * cellH;
        if (mark === '█') layer.rect(gx, gy, gx + cellW, gy + cellH, color);
        else if (mark === '▀') layer.rect(gx, gy, gx + cellW, gy + cellH / 2, color);
        else if (mark === '▄') layer.rect(gx, gy + cellH / 2, gx + cellW, gy + cellH, color);
        else layer.rect(gx, gy, gx + cellW, gy + cellH, color);
      }
    }
  }
}

// ── 启动页几何（供 app.ts 的点击命中复用）──────────────
function launchGeom(): LaunchGeom {
  const COLS = TUI.COLS;
  const ROWS = TUI.ROWS;
  const cardW = Math.max(24, Math.min(COLS - 4, 72));
  const cardX = Math.floor((COLS - cardW) / 2);
  let artRows = 15;
  let bigRows = 11;
  let heroGap = 2;
  let tipGap = 2;
  let showTip = true;
  let showHints = true;
  const total = (): number => artRows + bigRows + heroGap + 3 + 1
    + (showHints ? 1 + 1 : 0)
    + (showTip ? tipGap + 1 : 0);
  const limit = ROWS - 4;
  if (total() > limit) { heroGap = 1; tipGap = 1; }
  if (total() > limit) showTip = false;
  if (total() > limit) showHints = false;
  if (total() > limit) artRows = 0;
  if (total() > limit) bigRows = 0;
  const blockRows = total();
  const topY = Math.max(1, Math.floor((ROWS - blockRows) / 2));
  const artX = Math.floor((COLS - 42) / 2);
  const titleW = TITLE_TOP.text.length * (GLYPH_W + TITLE_TOP.kerning);
  const titleX = Math.floor((COLS - titleW) / 2);
  const art: Rect = { x: artX, y: topY, w: 42, h: artRows };
  const title: Rect = { x: titleX, y: topY + artRows, w: titleW, h: bigRows };
  const card: Rect = { x: cardX, y: topY + artRows + bigRows + heroGap, w: cardW, h: 3 };
  const params: Rect = { x: cardX, y: card.y + 3, w: cardW, h: 1 };
  const hints: Rect = { x: cardX, y: params.y + 1 + (showHints ? 1 : 0), w: cardW, h: showHints ? 1 : 0 };
  const tips: Rect = { x: 0, y: hints.y + (showHints ? 1 : 0) + (showTip ? tipGap : 0), w: COLS, h: showTip ? 1 : 0 };
  return {
    topY, art, title, card, params, hints, tips, showTip, showHints,
    corners: { y: ROWS - 2 },
  };
}

// ── 聊天标题行 ─────────────────────────────────────────────
/** 顶栏按钮：悬停高亮，点击走 action。返回占用宽度。 */
function headBtn(x: number, label: string, id: string, action: string): number {
  if (App === null) return 0;
  const w = W(label) + 2;
  const hover = App.state.hoverId === id;
  const bg = hover ? T().accentDim : T().panel;
  TUI.fill(x, 0, w, 1, { bg });
  TUI.text(x + 1, 0, label, hover ? '#eef2fa' : T().dim, bg);
  hit(id, x, 0, w, 1, action, label);
  return w;
}

function drawHead(): void {
  if (App === null) return;
  const L = layout();
  TUI.fill(L.head.x, L.head.y, L.head.w, L.head.h, { bg: T().panel });
  hit('head', 0, 0, L.head.w, 1, null, '');
  TUI.text(1, 0, '✦', T().accent, T().panel, ST.BOLD);
  TUI.text(3, 0, 'dsh-TUI', T().dim, T().panel);

  const panelLabel = App.state.panelOpen ? '收起侧栏' : '侧栏';
  const menuW = W('菜单') + 2;
  let bx = L.head.w - 1 - menuW;
  headBtn(bx, '菜单', 'head-menu', 'cmdmenu');
  bx -= 1 + W(panelLabel) + 2;
  headBtn(bx, panelLabel, 'head-panel', 'panel-toggle');
  if (App.state.streaming) TUI.text(bx - 10, 0, '◐ 生成中', T().accent, T().panel);

  const title = App.state.session?.title ?? '新的对话';
  const titleMax = Math.max(8, bx - 10);
  const tx = 4 + Math.floor(Math.max(0, titleMax - Math.min(W(title), titleMax)) / 2);
  TUI.text(tx, 0, clipLine(title, titleMax), T().fg, T().panel, ST.BOLD);
}

// ── 右侧面板 ───────────────────────────────────────────────
function drawPanel(): void {
  if (App === null) return;
  const L = layout();
  if (!App.state.panelOpen || L.panel.w <= 0) return;
  const P = L.panel;
  TUI.fill(P.x, P.y, P.w, P.h, { bg: T().panel });
  const resizeHover = App.state.panelResizeHover;
  if (resizeHover) TUI.fill(P.x, P.y, 1, P.h, { bg: T().panel2 });
  TUI.vline(P.x, P.y, P.h, resizeHover ? T().accent : T().border, resizeHover ? T().panel2 : T().panel);
  hit('panelresize', P.x, P.y, 1, P.h, 'panelresize', '拖动调整侧栏');
  // 拖拽把手：边界中段画三格短竖线；悬停时整列转 accent 并加底色
  const gripY = P.y + Math.floor(P.h / 2) - 1;
  const gripFg = resizeHover ? T().accent : T().accentDim;
  const gripBg = resizeHover ? T().panel2 : T().panel;
  for (let i = 0; i < 3; i++) TUI.put(P.x, gripY + i, '┆', gripFg, gripBg, resizeHover ? ST.BOLD : 0);
  const tabs = App.state.panelTabs;
  let x = P.x + 1;
  const tabW = Math.floor((P.w - 2) / tabs.length);
  for (const tb of tabs) {
    tab(x, P.y, tabW, tb.label, App.state.panelTab === tb.id, `panel:${tb.id}`);
    x += tabW;
  }
  TUI.hline(P.x + 1, P.y + 1, P.w - 2, T().border, T().panel);
  if (App.state.panelTab === 'companion') { drawCompanion(P); return; }
  if (App.state.panelTab === 'posts') { drawPosts(P); return; }
  if (App.state.panelTab === 'outline') { drawOutline(P); return; }
}


// ── 侧栏伙伴（移植 dsh-TUI CompanionPanel 的版式与互动）─────
/** 状态区固定行数：心情 / 短语 / 当前动作 / 互动提示。 */
const COMPANION_STATUS_ROWS = 4;

const MOOD_LABEL: Record<string, string> = {
  sleeping: '睡觉中', idle: '发呆', thinking: '思考中', typing: '工作中',
  working: '工作中', waiting: '等待回复', attention: '需要你',
  celebrate: '完成啦', error: '出错了', drag: '被拎起来',
};

function moodColor(mood: string): string {
  if (mood === 'celebrate') return T().green;
  if (mood === 'error') return T().red;
  if (mood === 'attention') return T().yellow;
  if (mood === 'sleeping') return T().dim;
  return T().accent;
}

/** 心情的一句话（原版 bubble 的派生层，这里按心情给固定短语）。 */
function companionPhrase(mood: string): string {
  switch (mood) {
    case 'typing': return '正在回复…';
    case 'thinking': return '让我想想…';
    case 'waiting': return '等你说话';
    case 'celebrate': return '搞定啦！';
    case 'error': return '出了点问题';
    case 'attention': return '需要你看一眼';
    case 'sleeping': return '呼…呼…';
    case 'drag': return '放我下来～';
    default: return '';
  }
}

/** 宠物槽位：面板底部居中，占面板高约 6 成。 */
function companionSlot(panel: Rect): Rect {
  const avail = Math.max(4, panel.h - COMPANION_STATUS_ROWS - 2);
  const h = Math.max(4, Math.floor(avail * 0.62));
  return { x: panel.x + 1, y: panel.y + panel.h - 1 - h, w: Math.max(4, panel.w - 2), h };
}

/** 窄屏没有侧栏时：宠物浮在消息区右下角（输入框上方一行）。 */
function floatSlot(): Rect {
  const m = layout().main;
  // 像素上近似方形：列宽 8px、行高 21px，行数按 cw/ch 折算，避免槽位远高于图
  const cols = Math.max(10, Math.min(28, Math.max(10, m.w - 6), Math.round(m.w * 0.36)));
  const rows = Math.max(5, Math.min(Math.round(cols * TUI.cw / TUI.ch), m.h - 2));
  return { x: m.x + m.w - cols - 2, y: m.y + m.h - rows - 1, w: cols, h: rows };
}

/** 聊天页且窗口放不下侧栏（<92 列）→ 走浮动布局；手动收起侧栏不算。 */
function floating(): boolean {
  return App !== null && App.state.screen === 'chat' && TUI.COLS < 92 && App.state.overlay === null;
}

/** 当前宠物槽位：侧栏内 / 窄屏浮动 / 无。 */
function companionSlotFor(): Rect | null {
  if (App === null || App.state.overlay !== null) return null;
  if (App.state.panelOpen && App.state.panelTab === 'companion' && panelWidth() > 0) {
    return companionSlot(layout().panel);
  }
  if (floating()) return floatSlot();
  return null;
}

/** 画宠物本体 + 左右半区命中（跟着拖动位移走）。 */
function drawCompanionPet(slot: Rect, label: string): void {
  if (App === null || App.pet === null) return;
  const cw = TUI.cw;
  const ch = TUI.ch;
  const off = App.state.petOffset;
  App.pet.renderTo(PixelLayer, slot.x * cw + off.x, slot.y * ch + off.y, slot.w * cw, slot.h * ch);
  const dx = Math.round(off.x / cw);
  const dy = Math.round(off.y / ch);
  const half = Math.max(1, Math.floor(slot.w / 2));
  hit('petside:left', slot.x + dx, slot.y + dy, half, slot.h, 'petside:left', label);
  hit('petside:right', slot.x + dx + half, slot.y + dy, Math.max(1, slot.w - half), slot.h, 'petside:right', label);
}

function drawCompanion(panel: Rect): void {
  if (App === null || App.state.overlay !== null) return;
  const mood = App.state.petMood;
  const slot = companionSlot(panel);
  const meta = App.skinMeta(App.state.skin);
  const x = panel.x + 2;
  const w = panel.w - 4;
  TUI.fill(panel.x + 1, panel.y + 2, panel.w - 2, panel.h - 3, { bg: T().panel });

  TUI.text(x, panel.y + 2, '●', moodColor(mood), T().panel, ST.BOLD);
  TUI.text(x + 2, panel.y + 2, clipLine(MOOD_LABEL[mood] ?? '发呆', w - 2), T().fg, T().panel);
  const phrase = companionPhrase(mood);
  if (phrase !== '') TUI.text(x, panel.y + 3, clipLine(`⏵ ${phrase}`, w), T().dim, T().panel);
  const animKey = App.pet === null ? '' : App.pet.currentAnim();
  const animLabel = PetKit.ANIM_LABEL[animKey] ?? meta.label;
  TUI.text(x, panel.y + 4, clipLine(`当前动作：${animLabel}`, w), T().dim, T().panel);
  TUI.text(x, panel.y + 5, clipLine('点它戳一戳 · 连点挠痒痒 · 拖拽拎起来', w), T().dim, T().panel);

  drawCompanionPet(slot, meta.label);
}

/** 窄屏：没有侧栏时，宠物直接浮在消息区右下角。 */
function drawFloatingPet(): void {
  if (App === null) return;
  drawCompanionPet(floatSlot(), App.skinMeta(App.state.skin).label);
}

// ── 侧栏：文章列表 / 当前大纲 ───────────────────────────────
function postAt(i: number): Post | undefined {
  return POSTS[i] as Post | undefined;
}

function drawPosts(P: Rect): void {
  if (App === null) return;
  const area: Rect = { x: P.x + 2, y: P.y + 2, w: P.w - 4, h: P.h - 3 };
  const total = POSTS.length;
  const listRows = Math.max(1, area.h - 1);
  const top = Math.max(0, Math.min(App.state.postsTop, Math.max(0, total - listRows)));
  App.state.postsTop = top;
  TUI.text(area.x, area.y, clipLine(`共 ${total} 篇`, area.w), T().dim, T().panel);
  const cur = App.state.session?.id ?? '';
  for (let i = 0; i < listRows; i++) {
    const p = postAt(top + i);
    if (p === undefined) break;
    const y = area.y + 1 + i;
    const isCur = p.id === cur;
    const hover = App.state.hoverId === 'postrow:' + p.id;
    const bg = hover ? T().thinkBg : undefined;
    if (bg !== undefined) TUI.fill(area.x, y, area.w, 1, { bg });
    TUI.text(area.x, y, isCur ? '●' : ' ', isCur ? T().accent : T().dim, bg);
    TUI.text(area.x + 2, y, clipLine(p.title, area.w - 2), hover || isCur ? T().suggestion : T().fg, bg, isCur ? ST.BOLD : 0);
    hit('postrow:' + p.id, area.x, y, area.w, 1, 'switch:' + p.id, p.title);
  }
}

function drawOutline(P: Rect): void {
  if (App === null) return;
  const area: Rect = { x: P.x + 2, y: P.y + 2, w: P.w - 4, h: P.h - 3 };
  const s = App.state.session;
  TUI.text(area.x, area.y, clipLine(s?.title ?? '未打开会话', area.w), T().fg, T().panel, ST.BOLD);
  TUI.hline(area.x, area.y + 1, area.w, T().border, T().panel);
  if (chatOutline.length === 0) {
    TUI.text(area.x, area.y + 3, '当前会话没有标题', T().dim, T().panel);
    return;
  }
  let y = area.y + 2;
  for (let i = 0; i < chatOutline.length && y < area.y + area.h; i++) {
    const h = chatOutline[i];
    if (h === undefined) continue;
    const indent = Math.min(3, Math.max(0, h.level - 1)) * 2;
    const hover = App.state.hoverId === 'outline:' + i;
    const bg = hover ? T().thinkBg : undefined;
    if (bg !== undefined) TUI.fill(area.x, y, area.w, 1, { bg });
    const prefix = h.level <= 1 ? '▸ ' : '· ';
    TUI.text(area.x + indent, y, clipLine(prefix + h.title, area.w - indent),
      hover ? T().suggestion : (h.level <= 1 ? T().accent : T().fg), bg);
    hit('outline:' + i, area.x, y, area.w, 1, 'outline:' + h.row, h.title);
    y += 1;
  }
}

/** 宠物槽位的 CSS 像素矩形（未加拖动位移）；不可见时 null。 */
function companionPetRect(): PetRect | null {
  const s = companionSlotFor();
  if (s === null) return null;
  return { x: s.x * TUI.cw, y: s.y * TUI.ch, w: s.w * TUI.cw, h: s.h * TUI.ch };
}

/** 宠物在槽位里实际占据的矩形（等比 contain 之后的可见区域，CSS 像素）。 */
function petContentRect(slot: Rect): PetRect {
  const sw = slot.w * TUI.cw;
  const sh = slot.h * TUI.ch;
  const x0 = slot.x * TUI.cw;
  const y0 = slot.y * TUI.ch;
  const pack = App?.pet?.pack;
  let aw = 0;
  let ah = 0;
  if (pack !== undefined) {
    // 立绘是方图；精灵图/视频用单格尺寸
    if (pack.type === 'portrait') { aw = 1; ah = 1; }
    else { aw = pack.size[0]; ah = pack.size[1]; }
  }
  if (!(aw > 0) || !(ah > 0)) return { x: x0, y: y0, w: sw, h: sh };
  const sc = Math.min(sw / aw, sh / ah);
  const w = aw * sc;
  const h = ah * sc;
  return { x: x0 + (sw - w) / 2, y: y0 + (sh - h) / 2, w, h };
}

/** 拖动偏移上限：侧栏内不出面板；窄屏浮动时放开到整页。 */
function companionLimits(): PetDragLimits | null {
  const s = companionSlotFor();
  if (s === null) return null;
  const inPanel = App !== null && App.state.panelOpen && App.state.panelTab === 'companion' && panelWidth() > 0;
  if (inPanel) {
    const P = layout().panel;
    // 按「看得见的宠物」算边界：槽位和侧栏一样宽时，按槽位算等于拖不动
    const r = petContentRect(s);
    // 左右留出边界列（左列是宽度把手），上边不压页签与分隔线
    const minX = (P.x + 1) * TUI.cw - r.x;
    const maxX = (P.x + P.w) * TUI.cw - (r.x + r.w);
    const minY = (P.y + 2) * TUI.ch - r.y;
    const maxY = (P.y + P.h) * TUI.ch - (r.y + r.h);
    return {
      minX: Math.min(0, minX),
      maxX: Math.max(0, maxX),
      minY: Math.min(0, minY),
      maxY: Math.max(0, maxY),
    };
  }
  // 浮动：整页可拖，只要宠物不出视口
  return {
    minX: -s.x * TUI.cw,
    maxX: (TUI.COLS - (s.x + s.w)) * TUI.cw,
    minY: -s.y * TUI.ch,
    maxY: (TUI.ROWS - (s.y + s.h)) * TUI.ch,
  };
}

// ── 消息区 ─────────────────────────────────────────────────
type Line =
  | { kind: 'label'; text: string; fg?: string; st?: number }
  | { kind: 'user'; tokens: RenderToken[] }
  | { kind: 'text'; tokens: RenderToken[] }
  | { kind: 'code'; text: string; lang: string; fg?: string; bg?: string }
  | { kind: 'tool'; dot: string; text: string; fg?: string; bg?: string }
  | { kind: 'quote'; tokens: RenderToken[] }
  | { kind: 'hr' }
  | { kind: 'tableHead'; tokens: RenderToken[] }
  | { kind: 'tableRow'; tokens: RenderToken[] }
  | { kind: 'tableSep' }
  | { kind: 'mermaid'; mk: 'edge' | 'node' | 'raw'; a?: string; b?: string; label?: string; text?: string }
  | { kind: 'tex'; text: string }
  | { kind: 'think'; open: boolean; lines: number; mid: string }
  | { kind: 'usage'; text: string }
  | { kind: 'image'; src: string; alt: string; cols: number; rows: number }
  | { kind: 'gap' };

/** 当前会话的大纲（标题 + 视觉行号）。 */
let chatOutline: { title: string; level: number; row: number }[] = [];
/** 正文滚动条几何（CSS 像素），供拖拽映射。 */
let scrollGeo: { top: number; height: number; max: number } | null = null;

function drawMessages(): void {
  if (App === null) return;
  const L = layout();
  const m = L.main;
  TUI.fill(m.x, m.y, m.w, m.h, { bg: T().bg });
  const area: Rect = { x: m.x + L.margin, y: m.y, w: m.w - L.margin * 2 - 1, h: m.h };
  const s = App.state.session;
  if (s === null) {
    TUI.text(area.x, area.y + 1, '没有活动会话', T().dim);
    return;
  }
  const lines: Line[] = [];
  const heads: HeadingMark[] = [];
  lines.push({ kind: 'label', text: `── ${App.dateLabel(s.time)} ──`, fg: T().dim });
  for (const msg of s.messages) {
    const isLast = msg === s.messages[s.messages.length - 1];
    const streamAcc = isLast && App.state.streaming && s.id === App.state.streamSessionId ? App.state.streamAcc : null;
    layoutMessage(msg, area.w, lines, streamAcc, heads);
  }
  if (lines.length <= 1) lines.push({ kind: 'label', text: '  输入消息开始新的对话', fg: T().dim });
  // 逻辑行 → 视觉行：图片占 rows 行，其余各占 1 行（否则后续文字会压进图里）
  const heights = lines.map(ln => ln.kind === 'image' ? Math.max(1, ln.rows) : 1);
  const totalRows = heights.reduce((a, b) => a + b, 0);
  // 标题在视觉行里的位置，供侧栏「大纲」跳转
  const tops: number[] = new Array(lines.length);
  {
    let acc = 0;
    for (let i = 0; i < lines.length; i++) { tops[i] = acc; acc += heights[i] ?? 1; }
  }
  chatOutline = heads.map(h => ({ title: h.title, level: h.level, row: tops[h.line] ?? 0 }));
  const visible = area.h;
  const maxScroll = Math.max(0, totalRows - visible);
  if (App.state.autoScroll && !App.state.userScrolled) App.state.scroll = maxScroll;
  const scroll = Math.max(0, Math.min(App.state.scroll, maxScroll));
  App.state.scroll = scroll;
  // 手动滚到底部后恢复自动滚动
  if (App.state.userScrolled && scroll >= maxScroll) App.state.userScrolled = false;
  let cursor = 0;
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    const h = heights[i] ?? 1;
    const top = cursor;
    cursor += h;
    if (ln === undefined) continue;
    if (top + h <= scroll || top >= scroll + visible) continue;
    if (ln.kind === 'gap') continue;
    const rel = top - scroll;
    if (ln.kind === 'image') {
      // 上下两端都按源图裁剪，目标高度只减不缩
      const clipTop = Math.max(0, -rel);
      const rows = Math.max(1, Math.min(h - clipTop, visible - rel - clipTop));
      drawLine(area.x, area.y + rel + clipTop, area.w, ln, rows, clipTop);
      continue;
    }
    drawLine(area.x, area.y + rel, area.w, ln);
  }
  // 滚动条（原版 ScrollbarGutter）
  scrollGeo = maxScroll > 0 ? { top: area.y * TUI.ch, height: visible * TUI.ch, max: maxScroll } : null;
  if (maxScroll > 0) {
    const trackX = m.x + m.w - 1;
    const trackH = visible;
    const thumbH = Math.max(1, Math.round(trackH * visible / totalRows));
    const thumbY = area.y + Math.round((trackH - thumbH) * (scroll / maxScroll));
    const hover = App.state.hoverId === 'scrollbar';
    TUI.fill(trackX, area.y, 1, trackH, { bg: hover ? T().border : T().panel2 });
    TUI.fill(trackX, thumbY, 1, thumbH, { bg: hover ? T().accent : T().dim });
    hit('scrollbar', trackX, area.y, 1, trackH, 'scroll-drag', 'scroll');
  }
}

function drawLine(x: number, y: number, w: number, ln: Line, clipRows?: number, clipTop = 0): void {
  switch (ln.kind) {
    case 'text':
    case 'user':
      TUI.rich(x, y, ln.tokens, T().fg);
      break;
    case 'label':
      TUI.text(x, y, clipLine(ln.text, w), ln.fg ?? T().dim, undefined, ln.st ?? 0);
      break;
    case 'code': {
      const bg = ln.bg ?? T().panel2;
      TUI.fill(x, y, w, 1, { bg });
      TUI.text(x + 2, y, clipLine(ln.text, w - 4), ln.fg ?? T().fg, bg);
      if (ln.lang) TUI.text(x + w - 2 - W(ln.lang), y, ln.lang, T().accentDim, bg, ST.DIM);
      break;
    }
    case 'tool': {
      const bg = ln.bg ?? T().panel2;
      TUI.fill(x, y, w, 1, { bg });
      TUI.text(x + 1, y, clipLine(`${ln.dot} ${ln.text}`, w - 2), ln.fg ?? T().fg, bg);
      break;
    }
    case 'quote':
      TUI.fill(x, y, 1, 1, { bg: T().accentDim });
      TUI.rich(x + 2, y, ln.tokens, T().dim);
      break;
    case 'hr':
      TUI.hline(x, y, w, T().border);
      break;
    case 'tableHead':
      TUI.fill(x, y, w, 1, { bg: T().panel2 });
      TUI.rich(x + 1, y, ln.tokens, T().accent, T().panel2);
      break;
    case 'tableRow':
      TUI.rich(x + 1, y, ln.tokens, T().fg);
      break;
    case 'tableSep':
      TUI.hline(x, y, w, T().border);
      break;
    case 'mermaid':
      drawMermaidLine(x, y, w, ln);
      break;
    case 'tex':
      TUI.text(x, y, clipLine(`$$ ${ln.text}`, w - 2), T().purple, undefined, ST.ITALIC);
      break;
    case 'think': {
      const bg = T().thinkBg;
      TUI.fill(x, y, w, 1, { bg });
      TUI.text(x + 1, y, ln.open ? '▾ 思考过程' : '▸ 思考过程', T().accent, bg, ST.BOLD);
      if (ln.open) TUI.text(x + w - 5, y, `${ln.lines}行`, T().dim, bg);
      hit(`think:${ln.mid}`, x, y, w, 1, `think:${ln.mid}`, 'think');
      break;
    }
    case 'usage':
      TUI.text(x, y, clipLine(ln.text, w), T().dim);
      break;
    case 'image': {
      const rows = clipRows === undefined ? ln.rows : Math.max(1, Math.min(ln.rows, clipRows));
      const img = postImage(ln.src);
      if (img !== null) {
        const nh = img.naturalHeight || 1;
        const y0 = Math.round(nh * clipTop / Math.max(1, ln.rows));
        const y1 = Math.round(nh * (clipTop + rows) / Math.max(1, ln.rows));
        // 裁源图、目标框等比缩短，保持宽高比
        PixelLayer.imageSubSmooth(img, 0, y0, img.naturalWidth, Math.max(1, y1 - y0),
          (x + 1) * TUI.cw, y * TUI.ch, ln.cols * TUI.cw, rows * TUI.ch);
      } else {
        TUI.fill(x + 1, y, ln.cols, rows, { bg: T().panel2 });
        TUI.text(x + 3, y + 1, clipLine(`🖼 ${ln.alt || ln.src}`, ln.cols - 4), T().dim, T().panel2);
      }
      break;
    }
    default:
      break;
  }
}

/** Markdown 解析缓存：长文章消息不每帧重 parse（保留最近 6 条）。 */
const blockCache = new Map<string, Block[]>();

function blocksOf(content: string): Block[] {
  const hit = blockCache.get(content);
  if (hit !== undefined) return hit;
  const blocks = MDKit.parse(content);
  blockCache.set(content, blocks);
  if (blockCache.size > 6) {
    const first = blockCache.keys().next().value;
    if (first !== undefined) blockCache.delete(first);
  }
  return blocks;
}

/** 文章图片懒加载（加载完请求重绘）。 */
const postImages: Record<string, HTMLImageElement> = Object.create(null) as Record<string, HTMLImageElement>;

function postImage(src: string): HTMLImageElement | null {
  const cached = postImages[src];
  if (cached !== undefined) return cached.complete && cached.naturalWidth > 0 ? cached : null;
  const img = new Image();
  img.onload = () => TUI.requestPaint();
  img.src = src;
  postImages[src] = img;
  return null;
}

function drawMermaidLine(x: number, y: number, w: number, ln: Extract<Line, { kind: 'mermaid' }>): void {
  if (ln.mk === 'edge') {
    const a = clipLine(ln.a ?? '', 22);
    const b = clipLine(ln.b ?? '', 22);
    const label = ln.label ? clipLine(ln.label, 10) : '';
    TUI.text(x, y, a, T().accent, undefined, ST.BOLD);
    const arrow = ` ─${label ? `[${label}]` : ''}▶ `;
    TUI.text(x + W(a), y, arrow, T().cyan);
    TUI.text(x + W(a) + W(arrow), y, b, T().accent, undefined, ST.BOLD);
  } else if (ln.mk === 'node') {
    TUI.text(x, y, `[${clipLine(ln.a ?? '', 12)}]`, T().accent);
    TUI.text(x + 15, y, ln.label ? clipLine(ln.label, w - 18) : '', T().fg);
  } else {
    TUI.text(x, y, clipLine(ln.text ?? '', w), T().dim);
  }
}

function layoutMessage(m: import('./types.ts').Message, width: number, lines: Line[], streamAcc: string | null, heads?: HeadingMark[]): void {
  switch (m.type) {
    case 'system':
      lines.push({ kind: 'label', text: ` ⚡ ${m.content}`, fg: T().yellow });
      return;
    case 'user': {
      const rows = wrapTokens(MDKit.inline(m.content), width - 2);
      rows.forEach((row, i) => {
        lines.push({
          kind: 'user',
          tokens: [{ text: i === 0 ? '› ' : '  ', fg: T().accent }, ...row],
        });
      });
      lines.push({ kind: 'gap' });
      return;
    }
    case 'think': {
      lines.push({ kind: 'think', open: m.open, lines: m.content.split('\n').length, mid: m.id });
      if (m.open) {
        for (const tl of wrapText(m.content, width - 2)) {
          lines.push({ kind: 'text', tokens: [{ text: `  ${tl}`, fg: T().dim, st: ST.ITALIC }] });
        }
      }
      return;
    }
    case 'tool': {
      const st = m.tool.status;
      const dot = st === 'done' ? '✓' : st === 'running' ? '◐' : st === 'error' ? '✗' : '●';
      const fg = st === 'done' ? T().green : st === 'running' ? T().yellow : st === 'error' ? T().red : T().accent;
      lines.push({ kind: 'tool', dot, text: m.tool.name + (m.tool.statusText ? ` ${m.tool.statusText}` : ''), fg });
      if (m.tool.body && m.open !== false) {
        for (const bl of m.tool.body.split('\n')) lines.push({ kind: 'code', text: bl, lang: '', fg: T().dim });
      }
      lines.push({ kind: 'gap' });
      return;
    }
    case 'usage':
      lines.push({ kind: 'usage', text: ` ⚙ ${m.content}` });
      return;
    case 'assistant': {
      const content = streamAcc ?? m.content;
      for (const b of blocksOf(content)) layoutBlock(b, width, lines, heads);
      return;
    }
  }
}

/** 大纲条目：标题在字符行数组里的下标（绘制时再折算成视觉行）。 */
interface HeadingMark { title: string; level: number; line: number }

function layoutBlock(b: Block, width: number, lines: Line[], heads?: HeadingMark[]): void {
  switch (b.type) {
    case 'h': {
      heads?.push({ title: inlineText(b.tokens), level: b.level, line: lines.length });
      const prefix = b.level === 1 ? '◤ ' : b.level === 2 ? '◆ ' : b.level === 3 ? '▸ ' : '· ';
      lines.push({ kind: 'label', text: prefix + inlineText(b.tokens), fg: T().accent, st: ST.BOLD });
      break;
    }
    case 'p': {
      for (const row of wrapTokens(b.tokens, width)) lines.push({ kind: 'text', tokens: row });
      lines.push({ kind: 'gap' });
      break;
    }
    case 'code': {
      lines.push({ kind: 'label', text: `┌ ${b.lang || 'code'}`, fg: T().accentDim, st: ST.BOLD });
      for (const cl of b.lines) lines.push({ kind: 'code', text: cl, lang: '' });
      lines.push({ kind: 'label', text: '└', fg: T().accentDim });
      lines.push({ kind: 'gap' });
      break;
    }
    case 'diff': {
      for (const dl of b.lines) {
        let fg = T().fg;
        let bg: string | undefined;
        let prefix = ' ';
        if (dl.startsWith('+')) { fg = T().green; bg = 'rgba(127,214,162,0.10)'; prefix = '+'; }
        else if (dl.startsWith('-')) { fg = T().red; bg = 'rgba(224,108,117,0.10)'; prefix = '-'; }
        else if (dl.startsWith('@@')) { fg = T().cyan; prefix = '@'; }
        lines.push({ kind: 'code', text: prefix + dl, lang: '', fg, bg });
      }
      lines.push({ kind: 'gap' });
      break;
    }
    case 'quote': {
      for (const row of wrapTokens(b.tokens, width - 2)) lines.push({ kind: 'quote', tokens: row });
      lines.push({ kind: 'gap' });
      break;
    }
    case 'ul':
    case 'ol': {
      for (const item of b.items) {
        const prefix = b.type === 'ol' ? `${item.index}. ` : '• ';
        const rows = wrapTokens(item.tokens, width - W(prefix));
        rows.forEach((row, i) => {
          lines.push({
            kind: 'text',
            tokens: [{ text: i === 0 ? prefix : ' '.repeat(W(prefix)), fg: T().accent }, ...row],
          });
        });
      }
      lines.push({ kind: 'gap' });
      break;
    }
    case 'hr':
      lines.push({ kind: 'hr' });
      lines.push({ kind: 'gap' });
      break;
    case 'table': {
      const cols = Math.max(1, b.head.length);
      const colW = Math.max(6, Math.floor((width - cols - 1) / cols));
      lines.push({ kind: 'tableHead', tokens: b.head.map(t => ({ text: padCell(inlineText(t), colW), fg: T().accent })) });
      lines.push({ kind: 'tableSep' });
      for (const row of b.rows) {
        lines.push({ kind: 'tableRow', tokens: row.map(t => ({ text: padCell(inlineText(t), colW), fg: T().fg })) });
      }
      lines.push({ kind: 'gap' });
      break;
    }
    case 'mermaid': {
      lines.push({ kind: 'label', text: ' ⚙ mermaid · 简化渲染', fg: T().cyan, st: ST.BOLD });
      for (const ml of b.lines) {
        if (ml.kind === 'edge') lines.push({ kind: 'mermaid', mk: 'edge', a: ml.a, b: ml.b, label: ml.label });
        else if (ml.kind === 'node') lines.push({ kind: 'mermaid', mk: 'node', a: ml.a, label: ml.label });
        else lines.push({ kind: 'mermaid', mk: 'raw', text: ml.text });
      }
      lines.push({ kind: 'gap' });
      break;
    }
    case 'tex': {
      for (const tl of b.lines) lines.push({ kind: 'tex', text: tl });
      lines.push({ kind: 'gap' });
      break;
    }
    case 'image': {
      // 只画站内图片（assets/ 与 blog/）：外链图会污染 canvas（跨域读回），降级成一行文字
      if (!b.src.startsWith('assets/') && !b.src.startsWith('blog/')) {
        lines.push({ kind: 'label', text: `🖼 ${b.alt || b.src}`, fg: T().dim });
        break;
      }
      const box = imageBox(width, b.src);
      lines.push({ kind: 'image', src: b.src, alt: b.alt, cols: box.cols, rows: box.rows });
      lines.push({ kind: 'gap' });
      break;
    }
  }
}

/** 图片块尺寸：按可用宽度铺满，最高 40 行（超了按高度反推列数）。 */
function imageBox(width: number, src: string): { cols: number; rows: number } {
  const full = Math.max(8, Math.min(width - 4, 92));
  const size = POST_IMAGE_SIZE[src];
  if (size === undefined) return { cols: full, rows: 8 };
  const [iw, ih] = size;
  if (iw <= 0 || ih <= 0) return { cols: full, rows: 8 };
  let cols = full;
  let rows = Math.round((cols * TUI.cw) * ih / iw / TUI.ch);
  if (rows > 40) {
    rows = 40;
    cols = Math.max(8, Math.round(rows * TUI.ch * iw / ih / TUI.cw));
  }
  return { cols, rows: Math.max(3, rows) };
}

function padCell(s: string, n: number): string {
  let out = s;
  let w = W(out);
  if (w > n) return `${clipLine(out, n - 1)} `;
  while (w < n) { out += ' '; w += 1; }
  return out;
}

function inlineText(tokens: readonly Token[]): string {
  return tokens.map(t => t.text || '').join('');
}

function wrapTokens(tokens: readonly Token[], width: number): RenderToken[][] {
  const rows: RenderToken[][] = [];
  let cur: RenderToken[] = [];
  let curW = 0;
  const maxW = Math.max(1, width);
  const flush = (): void => {
    if (cur.length > 0) { rows.push(cur); cur = []; curW = 0; }
  };
  for (const tok of tokens) {
    const str = String(tok.text ?? '');
    let i = 0;
    while (i < str.length) {
      let j = i;
      let segW = 0;
      while (j < str.length) {
        const chW = TUI.isWide(str[j] ?? '') ? 2 : 1;
        if (curW + segW + chW > maxW) break;
        segW += chW;
        j++;
      }
      if (j === i) {
        const chW = TUI.isWide(str[i] ?? '') ? 2 : 1;
        flush();
        cur.push({ text: str[i] ?? '', st: tok.st, fg: tok.fg, href: tok.href });
        curW = chW;
        i++;
        continue;
      }
      const seg = str.slice(i, j);
      cur.push({ text: seg, st: tok.st, fg: tok.fg, href: tok.href });
      curW += segW;
      i = j;
      if (curW >= maxW) flush();
    }
  }
  flush();
  if (rows.length === 0) rows.push([]);
  return rows;
}

function wrapText(s: string, width: number): string[] {
  return wrapTokens([{ text: s }], width).map(r => inlineText(r));
}

// ── 斜杠命令建议（输入 / 时浮在输入框上方）──────────────
function slashMatches(): CommandDef[] {
  if (App === null) return [];
  const raw = App.state.inputText;
  if (raw.charAt(0) !== '/') return [];
  const q = raw.slice(1).trim().toLowerCase();
  return App.state.commands.filter(c => !q || c.id.toLowerCase().indexOf(q) >= 0 || c.label.toLowerCase().indexOf(q) >= 0);
}

function drawSlash(): void {
  if (App === null) return;
  const items = slashMatches();
  if (items.length === 0) return;
  const L = layout();
  const c = L.composer;
  const n = Math.min(6, items.length);
  const w = Math.min(56, c.w - L.margin * 2 - 1);
  const x = c.x + L.margin;
  const y = Math.max(1, c.y - n - 2);
  TUI.fill(x, y, w, n + 2, { bg: T().panel });
  TUI.box(x, y, w, n + 2, { fg: T().border });
  const sel = Math.max(0, Math.min(App.state.slashSel, items.length - 1));
  for (let i = 0; i < n; i++) {
    const it = items[i];
    if (it === undefined) break;
    const row = y + 1 + i;
    const isSel = i === sel;
    if (isSel) TUI.fill(x + 1, row, w - 2, 1, { bg: T().accentDim });
    TUI.text(x + 2, row, clipLine(it.label, w - 16), isSel ? '#eef2fa' : T().fg, isSel ? T().accentDim : T().panel, isSel ? ST.BOLD : 0);
    TUI.text(x + w - 3 - W(it.key), row, it.key, T().dim, isSel ? T().accentDim : T().panel);
    hit(`slash:${it.id}`, x + 1, row, w - 2, 1, `cmd:${it.id}`, it.label);
  }
}

// ── 输入框（圆角卡片）────────────────────────────────────
function drawComposer(): void {
  if (App === null) return;
  const L = layout();
  const c = L.composer;
  TUI.fill(c.x, c.y, c.w, c.h, { bg: T().bg });
  const x = c.x + L.margin;
  const w = c.w - L.margin * 2 - 1;
  const y = c.y;
  const focused = App.state.focusInput;
  drawRoundBox(x, y, w, 3, focused ? T().suggestion : T().border);
  const prompt = App.state.inputText.startsWith('/') ? '⌘ ' : '› ';
  const px = x + 2;
  TUI.text(px, y + 1, prompt, T().accent, T().bg, ST.BOLD);
  const tx = px + 2;
  const maxIn = w - 6;
  const txt = App.state.inputText;
  const vis = clipLine(txt, maxIn);
  if (vis) TUI.text(tx, y + 1, vis, T().fg, T().bg);
  else TUI.text(tx, y + 1, '说点什么，或输入 / 看命令…', T().dim, T().bg);
  const caretCol = tx + Math.min(W(txt.slice(0, App.state.caret)), maxIn);
  TUI.setCursor(caretCol, y + 1, focused && App.state.cursorOn && App.state.overlay === null);
  App.reportCaret(caretCol, y + 1);
  hit('composer', x, y, w, 3, 'composer', 'composer');
}

// ── 状态行 ─────────────────────────────────────────────────
function clock(): string {
  const d = new Date();
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

function drawStatus(): void {
  if (App === null) return;
  const L = layout();
  const y = L.status.y;
  const bg = T().statusBg;
  TUI.fill(0, y, TUI.COLS, 1, { bg });
  const row = App.state.paramRow;
  let cx = 1;
  for (let i = 0; i < row.length; i++) {
    const s = row[i];
    if (s === undefined) continue;
    const fg = s.id === 'model' ? T().autoAccept : T().dim;
    const st = s.id === 'model' ? ST.BOLD : 0;
    TUI.text(cx, y, s.label, fg, bg, st);
    hit(`status-${s.id}`, cx, y, W(s.label), 1, `param-${s.id}`, s.label);
    cx += W(s.label);
    if (i < row.length - 1) { TUI.text(cx, y, '  ·  ', T().dim, bg); cx += 5; }
  }
  // 上下文条
  const barX = Math.max(cx + 4, Math.floor(TUI.COLS * 0.5));
  if (barX + 16 < TUI.COLS) {
    progressBar(barX, y, 10, App.state.contextFrac, 5);
    const chip = App.state.ctxChips[0];
    TUI.text(barX + 12, y, chip?.label ?? '', T().dim, bg);
  }
  const right = `${App.state.cwd}:${App.state.branch}  ${clock()}`;
  TUI.text(TUI.COLS - 1 - W(right), y, right, T().dim, bg);
}

// ── 屏幕：Onboarding ───────────────────────────────────────
function drawOnboarding(): void {
  TUI.fill(0, 0, TUI.COLS, TUI.ROWS, { bg: T().bg });
  const cx = Math.floor(TUI.COLS / 2);
  const cy = Math.floor(TUI.ROWS / 2);
  const bw = 62;
  const bh = 16;
  const x = cx - Math.floor(bw / 2);
  const y = cy - Math.floor(bh / 2);
  modalBox(x, y, bw, bh, ' dsh-TUI · 首次运行向导 ');
  TUI.text(x + 3, y + 3, '欢迎使用 dsh-TUI 网页版（Canvas 真 TUI）', T().accent, undefined, ST.BOLD);
  TUI.text(x + 3, y + 5, '这是一个以 Canvas 为唯一渲染载体的终端风格界面：', T().fg);
  TUI.text(x + 3, y + 6, '所有元素（顶栏/面板/消息/宠物）均由像素逐帧绘制。', T().fg);
  TUI.text(x + 3, y + 8, '需要做什么：', T().dim);
  TUI.text(x + 3, y + 9, '  1. 选择界面主题', T().dim);
  TUI.text(x + 3, y + 10, '  2. 挑选你的宠物伙伴', T().dim);
  button(x + 4, y + 12, 22, '使用深色主题', { id: 'ob-dark', action: 'ob-dark', accent: true });
  button(x + 28, y + 12, 22, '使用浅色主题', { id: 'ob-light', action: 'ob-light' });
  TUI.text(x + 4, y + 14, 'Enter 继续  ·  Esc 跳过', T().dim);
}

// ── 屏幕：Launchpad ────────────────────────────────────────
function drawParamRow(x: number, y: number): void {
  if (App === null) return;
  const segs = App.state.paramRow;
  let cx = x;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (s === undefined) continue;
    const isModel = s.id === 'model';
    const active = App.state.paramHover === s.id;
    const fg = isModel ? T().autoAccept : (active ? T().suggestion : T().dim);
    const st = isModel || active ? ST.BOLD : 0;
    TUI.text(cx, y, s.label, fg, undefined, st);
    hit(`param:${s.id}`, cx, y, W(s.label), 1, `param-${s.id}`, s.label);
    cx += W(s.label);
    if (i < segs.length - 1) { TUI.text(cx, y, '  ·  ', T().dim); cx += 5; }
  }
}

function drawActionRow(x: number, y: number, w: number): void {
  if (App === null) return;
  const acts = App.state.actions;
  let rx = x + w;
  for (let i = acts.length - 1; i >= 0; i--) {
    const a = acts[i];
    if (a === undefined) continue;
    const active = App.state.actionHover === a.id;
    const fg = active ? T().suggestion : T().dim;
    const st = active ? ST.BOLD : 0;
    const aw = W(a.label);
    TUI.text(rx - aw, y, a.label, fg, undefined, st);
    hit(`action:${a.id}`, rx - aw, y, aw, 1, `action-${a.id}`, a.label);
    rx -= aw + 2;
  }
}

function drawLaunchpad(): void {
  if (App === null) return;
  const g = launchGeom();
  TUI.fill(0, 0, TUI.COLS, TUI.ROWS, { bg: T().bg });

  // 立绘区域留空（像素层绘制），命中区保留
  if (g.art.h > 0) hit('splashpet', g.art.x, g.art.y, g.art.w, g.art.h, 'splashpet', 'pet');

  // 输入框
  const card = g.card;
  drawRoundBox(card.x, card.y, card.w, card.h, App.state.launchFocus ? T().suggestion : T().border);
  const px = card.x + 2;
  const prompt = App.state.inputText.startsWith('/') ? '⌘ ' : '› ';
  TUI.text(px, card.y + 1, prompt, T().accent, T().bg, ST.BOLD);
  const maxIn = card.w - 6;
  const txt = App.state.inputText;
  if (txt) TUI.text(px + 2, card.y + 1, clipLine(txt, maxIn), T().fg, T().bg);
  else TUI.text(px + 2, card.y + 1, '说点什么，或输入 / 看命令…', T().dim, T().bg);
  const caretCol = px + 2 + Math.min(W(txt.slice(0, App.state.caret)), maxIn);
  TUI.setCursor(caretCol, card.y + 1, App.state.launchFocus && App.state.cursorOn && App.state.overlay === null);
  App.reportCaret(caretCol, card.y + 1);
  hit('launch-input', card.x, card.y, card.w, card.h, 'launch-input', 'input');

  // 参数行（框外、紧贴框下、左对齐框缘 + 2）
  drawParamRow(card.x + 2, g.params.y);

  // 入口行（右对齐框缘）
  if (g.showHints) drawActionRow(card.x, g.hints.y, card.w);

  // Tips（居中）
  const tip = g.showTip ? App.state.tip : '';
  if (tip) {
    const tipX = Math.floor((TUI.COLS - W(tip) - 2) / 2);
    TUI.text(tipX, g.tips.y, '● ', T().warning, undefined, ST.BOLD);
    TUI.text(tipX + 2, g.tips.y, tip, T().dim);
    hit('tips', tipX, g.tips.y, W(tip) + 2, 1, 'tips', 'tips');
  }

  // 双角铭牌
  const cy = g.corners.y;
  const left = `${App.state.cwd}:${App.state.branch}`;
  TUI.text(1, cy, clipLine(left, Math.floor(TUI.COLS / 2)), T().dim);
  hit('corner-cwd', 1, cy, W(left), 1, 'launch-cwd', left);
  const right = 'dsh-tui v0.18.0 · canvas';
  TUI.text(TUI.COLS - 1 - W(right), cy, right, T().dim);
  hit('corner-kernel', TUI.COLS - 1 - W(right), cy, W(right), 1, 'launch-kernel', right);
  TUI.text(1, cy + 1, `▸ ${App.state.kernelName}`, T().accent, undefined, ST.BOLD);
  hit('corner-kernel2', 1, cy + 1, W(App.state.kernelName) + 2, 1, 'launch-kernel', App.state.kernelName);
}

// 启动页像素层：立绘 + 大字
function drawLaunchpadPixels(): void {
  if (App === null) return;
  const g = launchGeom();
  const cw = TUI.cw;
  const ch = TUI.ch;
  if (App.pet !== null && g.art.h > 0) {
    // 高清立绘是方形真图，占满槽位会和下方大字贴死：上下各让半行
    const portrait = App.pet.pack.type === 'portrait';
    const inset = portrait ? ch * 0.5 : 0;
    App.pet.renderTo(PixelLayer, g.art.x * cw, g.art.y * ch + inset, g.art.w * cw, g.art.h * ch - inset * 2);
  }
  if (g.title.h > 0) {
    const time = performance.now();
    const t = T();
    drawBigLine(PixelLayer, g.title.x * cw, g.title.y * ch, cw, ch, TITLE_TOP, t.accent, t.accentShimmer, time);
    drawBigLine(PixelLayer, g.title.x * cw, (g.title.y + 6) * ch, cw, ch, TITLE_BOTTOM, t.accentShimmer, t.pale, time);
  }
}

// ── 弹层：会话与工作区 ─────────────────────────────────────
function drawSessions(): void {
  if (App === null) return;
  const app = App;
  TUI.fill(0, 0, TUI.COLS, TUI.ROWS, { bg: 'rgba(0,0,0,0.55)' });
  const cx = Math.floor(TUI.COLS / 2);
  const cy = Math.floor(TUI.ROWS / 2);
  const ids = app.allSessionIds();
  const bw = 66;
  const bh = 10 + Math.min(10, Math.max(1, ids.length));
  const x = cx - Math.floor(bw / 2);
  const y = Math.max(1, cy - Math.floor(bh / 2));
  modalBox(x, y, bw, bh, ' 会话与工作区 ');
  TUI.text(x + 2, y + 2, `工作区  ${app.state.cwd}:${app.state.branch}`, T().dim);
  TUI.hline(x + 2, y + 3, bw - 4, T().border);
  const per = Math.max(1, bh - 6);
  const sel = Math.max(0, Math.min(app.state.sessionSel, ids.length - 1));
  const start = Math.max(0, Math.min(sel - per + 1, Math.max(0, ids.length - per)));
  let row = y + 4;
  for (let k = 0; k < per && start + k < ids.length; k++) {
    const i = start + k;
    const id = ids[i];
    if (id === undefined) break;
    const s = app.state.sessions[id];
    const name = s?.title ?? id;
    const isSel = i === sel;
    const active = app.state.groups.some(g => g.sessions.some(x => x.id === id && x.active));
    const fg = isSel ? T().suggestion : T().fg;
    const st = isSel ? ST.BOLD : 0;
    if (isSel) TUI.fill(x + 2, row, bw - 4, 1, { bg: T().accentDim });
    TUI.text(x + 3, row, `${active ? '● ' : '  '}${clipLine(name, bw - 12)}`, fg, isSel ? T().accentDim : '', st);
    hit('switch', x + 2, row, bw - 4, 1, `switch:${id}`, name);
    row++;
  }
  const pos = `${sel + 1}/${ids.length}`;
  TUI.text(x + 2, y + bh - 2, '↑↓ 选择 · Enter 打开 · Esc 关闭', T().dim);
  TUI.text(x + bw - 3 - W(pos), y + bh - 2, pos, T().dim);
}

// ── 弹层：内核 ─────────────────────────────────────────────
function drawKernel(): void {
  if (App === null) return;
  TUI.fill(0, 0, TUI.COLS, TUI.ROWS, { bg: 'rgba(0,0,0,0.55)' });
  const cx = Math.floor(TUI.COLS / 2);
  const cy = Math.floor(TUI.ROWS / 2);
  const bw = 62;
  const bh = 10;
  const x = cx - Math.floor(bw / 2);
  const y = cy - Math.floor(bh / 2);
  modalBox(x, y, bw, bh, ' 内核 · DSH ');
  TUI.text(x + 2, y + 2, `内核    ${App.state.kernelName}`, T().fg);
  TUI.text(x + 2, y + 3, '面板    DSH', T().fg);
  TUI.text(x + 2, y + 4, '版本    dsh-tui v0.18.0 · canvas', T().fg);
  TUI.text(x + 2, y + 5, `工作区  ${App.state.cwd}`, T().fg);
  TUI.text(x + 2, y + 7, 'Esc / Enter 关闭', T().dim);
}

// ── 弹层：工作区 ───────────────────────────────────────────
function drawCwd(): void {
  if (App === null) return;
  TUI.fill(0, 0, TUI.COLS, TUI.ROWS, { bg: 'rgba(0,0,0,0.55)' });
  const cx = Math.floor(TUI.COLS / 2);
  const cy = Math.floor(TUI.ROWS / 2);
  const bw = 62;
  const bh = 8;
  const x = cx - Math.floor(bw / 2);
  const y = cy - Math.floor(bh / 2);
  modalBox(x, y, bw, bh, ' 工作区 ');
  TUI.text(x + 2, y + 2, `路径    ${App.state.cwd}`, T().fg);
  TUI.text(x + 2, y + 3, `分支    ${App.state.branch}`, T().fg);
  TUI.text(x + 2, y + 4, `权限    ${App.state.paramRow[3]?.label ?? ''}`, T().fg);
  TUI.text(x + 2, y + 5, 'Esc / Enter 关闭', T().dim);
}

// ── 屏幕：设置 ─────────────────────────────────────────────
function drawSettings(): void {
  if (App === null) return;
  const app = App;
  TUI.fill(0, 0, TUI.COLS, TUI.ROWS, { bg: T().bg });
  const cx = Math.floor(TUI.COLS / 2);
  const cy = Math.floor(TUI.ROWS / 2);
  const bw = Math.min(78, TUI.COLS - 8);
  const bh = 24;
  const x = cx - Math.floor(bw / 2);
  const y = Math.max(1, cy - Math.floor(bh / 2));
  modalBox(x, y, bw, bh, ' 设置 ');
  const ctrlX = x + bw - 30;
  let row = y + 2;
  const section = (label: string): void => {
    TUI.text(x + 2, row, label, T().accentDim, undefined, ST.BOLD);
    row += 1;
  };
  const hoverId = app.state.hoverId;
  const setting = (label: string, ids: readonly string[], render: (xx: number, yy: number) => void): void => {
    const hovered = hoverId !== null && ids.includes(hoverId);
    const rowBg = hovered ? T().thinkBg : undefined;
    if (rowBg !== undefined) TUI.fill(x + 1, row, bw - 2, 1, { bg: rowBg });
    TUI.text(x + 2, row, label, T().fg, rowBg);
    render(ctrlX, row);
    row += 1;
  };
  section('界面');
  setting('主题 theme', ['theme-dark', 'theme-light'], (xx, yy) => {
    TUI.text(xx, yy, 'dark', app.state.theme === 'dark' ? T().accent : T().dim, undefined, app.state.theme === 'dark' ? ST.BOLD : 0);
    TUI.text(xx + 6, yy, 'light', app.state.theme === 'light' ? T().accent : T().dim, undefined, app.state.theme === 'light' ? ST.BOLD : 0);
    hit('theme-dark', xx, yy, 5, 1, 'theme-dark', 'dark');
    hit('theme-light', xx + 6, yy, 6, 1, 'theme-light', 'light');
  });
  setting('宠物形象 skin', ['skin'], (xx, yy) => {
    const m = app.skinMeta(app.state.skin);
    TUI.text(xx, yy, m.label, T().accent);
    TUI.text(xx + W(m.label) + 2, yy, '选择 ▸', T().dim);
    hit('skin', xx, yy, 22, 1, 'skin-picker', 'skin');
  });
  setting('流式输出 streaming', ['tog-streaming'], (xx, yy) => toggle(xx, yy, app.state.streamingEnabled, 'tog-streaming'));
  setting('自动滚动 auto-scroll', ['tog-autoscroll'], (xx, yy) => toggle(xx, yy, app.state.autoScroll, 'tog-autoscroll'));
  setting('光标闪烁 cursor blink', ['tog-cursor'], (xx, yy) => toggle(xx, yy, app.state.cursorBlink, 'tog-cursor'));
  row += 1;
  section('模型');
  setting('默认模型 model', ['model'], (xx, yy) => {
    TUI.text(xx, yy, app.state.model, T().cyan);
    hit('model', xx, yy, 16, 1, 'model', 'model');
  });
  setting('温度 temperature', ['slider-temp'], (xx, yy) => slider(xx, yy, 20, app.state.temperature, 'slider-temp'));
  row += 1;
  section('数据');
  setting('清除全部会话 clear', ['clear-sessions'], (xx, yy) => {
    TUI.text(xx, yy, '[ 执行 ]', T().red);
    hit('clear-sessions', xx, yy, 8, 1, 'clear-sessions', 'clear');
  });
  button(x + bw - 18, y + bh - 3, 14, '返回 Chat', { id: 'back-chat', action: 'back-chat', accent: true });
  TUI.text(x + 2, y + bh - 3, 'Esc 返回', T().dim);
}

// ── 弹层：帮助 ─────────────────────────────────────────────
function drawHelp(): void {
  const cx = Math.floor(TUI.COLS / 2);
  const cy = Math.floor(TUI.ROWS / 2);
  const bw = 68;
  const bh = 20;
  const x = cx - Math.floor(bw / 2);
  const y = cy - Math.floor(bh / 2);
  TUI.fill(0, 0, TUI.COLS, TUI.ROWS, { bg: 'rgba(0,0,0,0.55)' });
  modalBox(x, y, bw, bh, ' 按键与操作 ');
  const keys: [string, string][] = [
    ['Enter', '发送消息 / 确认'], ['Tab / Shift+Tab', '切换 NORMAL / INSERT'],
    ['↑ / ↓', '命令历史'], ['Esc', '关闭弹层'],
    ['顶栏「菜单」', '命令 / 新建 / 设置'], ['顶栏「侧栏」', '收起 / 展开面板'],
    ['页签', '宠物 / 文章 / 大纲'], ['文章标题', '点击切换文章'],
    ['大纲条目', '跳到正文位置'], ['点击宠物', 'poke / tickle 互动'],
    ['滚轮', '正文滚动（滚动条可拖）'], ['?', '本帮助'],
  ];
  let row = y + 2;
  for (const [k, d] of keys) {
    TUI.text(x + 4, row, k, T().accent, undefined, ST.BOLD);
    TUI.text(x + 18, row, d, T().fg);
    row++;
  }
  button(x + bw - 20, y + bh - 3, 16, '关闭', { id: 'help-close', action: 'help-close' });
}

// ── 弹层：命令菜单 ─────────────────────────────────────────
function drawCommandMenu(): void {
  if (App === null) return;
  TUI.fill(0, 0, TUI.COLS, TUI.ROWS, { bg: 'rgba(0,0,0,0.55)' });
  const cx = Math.floor(TUI.COLS / 2);
  const cy = Math.floor(TUI.ROWS / 2);
  const bw = 56;
  const bh = 20;
  const x = cx - Math.floor(bw / 2);
  const y = cy - Math.floor(bh / 2);
  modalBox(x, y, bw, bh, ' 命令菜单 ');
  const filter = App.state.cmdFilter;
  TUI.text(x + 2, y + 2, `› ${filter || '输入命令…'}`, filter ? T().fg : T().dim);
  TUI.hline(x + 2, y + 3, bw - 4, T().border);
  const q = filter.toLowerCase();
  const items = App.state.commands.filter(c => !q || c.label.toLowerCase().includes(q) || c.id.includes(q));
  const maxRows = bh - 7;
  const sel = Math.max(0, Math.min(App.state.cmdSel, items.length - 1));
  const offset = Math.max(0, Math.min(sel - (maxRows - 1), items.length - maxRows));
  items.slice(offset, offset + maxRows).forEach((c, i) => {
    const row = y + 4 + i;
    const isSel = offset + i === sel;
    if (isSel) TUI.fill(x + 2, row, bw - 4, 1, { bg: T().accentDim });
    TUI.text(x + 3, row, clipLine(c.label, bw - 14), isSel ? '#eef2fa' : T().fg, isSel ? T().accentDim : '', isSel ? ST.BOLD : 0);
    TUI.text(x + bw - 3 - W(c.key), row, c.key, T().dim, isSel ? T().accentDim : '');
    hit(`cmd:${c.id}`, x + 2, row, bw - 4, 1, c.action, c.label);
  });
  TUI.text(x + 2, y + bh - 2, '↑↓ 选择   Enter 执行   Esc 关闭', T().dim);
}

// ── 弹层：参数行 ───────────────────────────────────────────
function drawParamPop(): void {
  if (App === null) return;
  TUI.fill(0, 0, TUI.COLS, TUI.ROWS, { bg: 'rgba(0,0,0,0.55)' });
  const cx = Math.floor(TUI.COLS / 2);
  const cy = Math.floor(TUI.ROWS / 2);
  const bw = 50;
  const bh = 14;
  const x = cx - Math.floor(bw / 2);
  const y = cy - Math.floor(bh / 2);
  modalBox(x, y, bw, bh, ' 参数行 ');
  const params: [string, string][] = [
    ['model', App.state.model], ['temperature', String(App.state.temperature)],
    ['top_p', String(App.state.topP)], ['max_tokens', String(App.state.maxTokens)],
    ['budget', String(App.state.budget)], ['web', App.state.web ? 'on' : 'off'],
  ];
  let row = y + 2;
  for (const p of params) {
    const isSel = row - (y + 2) === App.state.paramSel;
    const bgc = isSel ? T().panel2 : '';
    if (isSel) TUI.fill(x + 2, row, bw - 4, 1, { bg: T().panel2 });
    TUI.text(x + 3, row, p[0], T().accent, bgc);
    TUI.text(x + 17, row, p[1], T().fg, bgc);
    TUI.text(x + bw - 7, row, '◀ ▶', T().dim, bgc);
    hit(`param:${p[0]}`, x + 2, row, bw - 4, 1, `poptune:${p[0]}`, p[0]);
    row++;
  }
  TUI.text(x + 3, y + bh - 2, '← → 调整   Enter 应用   Esc 关闭', T().dim);
}

// ── 弹层：宠物形象选择器 ───────────────────────────────────
function skinList(): SkinDef[] {
  return App?.skins ?? [];
}

interface SkinPickerGeom {
  x: number;
  y: number;
  w: number;
  h: number;
  listW: number;
  preview: Rect;
}

function skinPickerGeom(): SkinPickerGeom {
  const bw = Math.min(78, TUI.COLS - 8);
  const bh = 20;
  const x = Math.floor((TUI.COLS - bw) / 2);
  const y = Math.max(1, Math.floor((TUI.ROWS - bh) / 2));
  const listW = 36;
  const preview: Rect = { x: x + 2 + listW + 2, y: y + 2, w: bw - 2 - (2 + listW + 2), h: bh - 7 };
  return { x, y, w: bw, h: bh, listW, preview };
}

function drawSkinPicker(): void {
  if (App === null) return;
  TUI.fill(0, 0, TUI.COLS, TUI.ROWS, { bg: 'rgba(0,0,0,0.55)' });
  const g = skinPickerGeom();
  modalBox(g.x, g.y, g.w, g.h, ' 宠物形象 ');
  const skins = skinList();
  if (skins.length === 0) return;
  const sel = Math.max(0, Math.min(App.state.skinSel, skins.length - 1));
  const shown = App.state.skinHover >= 0 ? Math.min(App.state.skinHover, skins.length - 1) : sel;
  let row = g.y + 2;
  for (let i = 0; i < skins.length; i++) {
    const sk = skins[i];
    if (sk === undefined) continue;
    const isSel = i === sel;
    const isHover = i === shown && !isSel;
    const cur = sk.id === App.state.skin;
    const bgc = isSel ? T().panel2 : (isHover ? T().thinkBg : '');
    if (isSel || isHover) TUI.fill(g.x + 2, row, g.listW, 2, { bg: bgc });
    TUI.text(g.x + 3, row, clipLine(`${cur ? '● ' : '○ '}${sk.label}`, g.listW - 2), cur ? T().accent : (isSel || isHover ? T().suggestion : T().fg), bgc, cur || isSel ? ST.BOLD : 0);
    TUI.text(g.x + 3, row + 1, clipLine(`   ${sk.kind} · ${sk.desc}`, g.listW - 2), T().dim, bgc);
    hit(`skinsel:${sk.id}`, g.x + 2, row, g.listW, 2, `skinsel:${sk.id}`, sk.label);
    row += 2;
  }
  TUI.box(g.preview.x, g.preview.y, g.preview.w, g.preview.h, { fg: T().border });
  const label = skins[shown]?.label ?? '';
  TUI.text(g.preview.x + 2, g.preview.y, ` ${label} `, T().dim, T().panel);
  TUI.text(g.x + 3, g.y + g.h - 2, '↑↓ 选择 · Enter 应用 · Esc 关闭', T().dim);
}

function drawSkinPreview(): void {
  if (App === null) return;
  const g = skinPickerGeom();
  const skins = skinList();
  if (skins.length === 0) return;
  const sel = Math.max(0, Math.min(App.state.skinSel, skins.length - 1));
  const shown = App.state.skinHover >= 0 ? Math.min(App.state.skinHover, skins.length - 1) : sel;
  const pv = g.preview;
  // 动态预览：默认 idle，点一下随机换动作
  hit('skinpreview', pv.x, pv.y, pv.w, pv.h, 'skinpreview', '预览');
  PetKit.preview(
    skins[shown]?.id ?? '',
    PixelLayer,
    (pv.x + 1) * TUI.cw, (pv.y + 1) * TUI.ch,
    (pv.w - 2) * TUI.cw, (pv.h - 2) * TUI.ch,
  );
}

// ── 主帧 ───────────────────────────────────────────────────
function drawAll(): void {
  PixelLayer.begin();
  TUI.beginFrame();
  TUI.setCursor(-1, -1, false);
  if (App === null) {
    TUI.endFrame();
    return;
  }
  const sc = App.state.screen;
  if (sc === 'onboarding') drawOnboarding();
  else if (sc === 'launchpad') drawLaunchpad();
  else if (sc === 'settings') drawSettings();
  else if (sc === 'chat') {
    drawHead();
    drawMessages();
    drawSlash();
    drawComposer();
    drawStatus();
    drawPanel();
    if (floating()) drawFloatingPet();
  }
  if (App.state.overlay === 'help') drawHelp();
  if (App.state.overlay === 'cmdmenu') drawCommandMenu();
  if (App.state.overlay === 'param') drawParamPop();
  if (App.state.overlay === 'sessions') drawSessions();
  if (App.state.overlay === 'kernel') drawKernel();
  if (App.state.overlay === 'cwd') drawCwd();
  if (App.state.overlay === 'skin') drawSkinPicker();
  if (sc === 'launchpad' && App.state.overlay === null) drawLaunchpadPixels();
  if (App.state.overlay === 'skin') drawSkinPreview();
  PixelLayer.end();
  TUI.endFrame();
}

/** 界面层 API。 */
export const UI = {
  setApp,
  layout,
  launchGeom,
  companionPetRect,
  companionLimits,
  scrollInfo: (): { top: number; height: number; max: number } | null => scrollGeo,
  panelRect: (): { x: number; y: number; w: number; h: number } | null => {
    if (App === null) return null;
    const P = layout().panel;
    if (!App.state.panelOpen || P.w <= 0) return null;
    return { x: P.x * TUI.cw, y: P.y * TUI.ch, w: P.w * TUI.cw, h: P.h * TUI.ch };
  },
  drawAll,
  drawMessages,
  drawPanel,
  layoutMessage,
  layoutBlock,
  wrapTokens,
  wrapText,
  clipLine,
  hit,
  progressBar,
  toggle,
  slider,
  button,
  tab,
};
