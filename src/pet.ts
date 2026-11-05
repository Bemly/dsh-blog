/* ═══════════════════════════════════════════════════════════
   pet.ts — 像素宠物引擎（原版素材 / 原版交互）
   ───────────────────────────────────────────────────────────
   皮肤：
   - whalegirl   : 鲸娘「原生像素帧」——一个动画一张 AVIF 精灵图
                   assets/whalegirl-sheet/<key>.avif
                   （源 dsh-TUI assets/whaleGirl/img，逐帧 WebP 经
                    tools/encode-sheet.ts 打包编码）
                   缺图/未加载时回落 42×30 字符格帧包
   - maid-girl / claude-girl / codex-girl : 高清立绘（normal + happy）
   - deepy       : 42×30 字符动画 ×20
   - whale       : 开屏鲸鱼 40×25 ×22 帧
   - claude / whale-girl 30×30 静态精灵仍在（字符回退路径）

   启动页交互（与 dsh-TUI SplashMascot 同一条语义）：
   - 稳态 idle 循环；
   - 点击左/右半 → poke-left / poke-right（1.4s）；
   - 鲸娘 poke 之后接 smile-hearts（2.4s）；
   - 900ms 内连点 ≥3 次 → tickle；
   - 高清立绘点击 → happy 变体 3s。
   ═══════════════════════════════════════════════════════════ */
import type {
  AnimFrame, Pet, PetKitApi, PetPack, PixelLayerApi, PixelRows, PortraitArt,
  SheetFrame, SkinId, SpriteGrid, WhaleFrame,
} from './types.ts';
import { TUI } from './tui-core.ts';
import { DEEPY } from './data/deepy.ts';
import { WHALEGIRL } from './data/whalegirl.ts';
import { WHALE_FRAMES } from './data/whale.ts';
import { CLAUDE_GIRL_SPRITE, WHALE_GIRL_SPRITE } from './data/girls.ts';
import { WHALEGIRL_IMG } from './data/timings.ts';

const SHEET_DIR = 'assets/whalegirl-sheet/';
/** 精灵图单格尺寸（源帧 301×288，22 个动画一致）。 */
const CELL_W = 301;
const CELL_H = 288;
const PT_DIR = 'assets/portraits/';
const SPLASH_PALETTE: Record<string, string> = {
  D: '#142660', B: '#4E6FFF', L: '#BEE1FF', W: '#FFFFFF', H: '#CC3399', Z: '#808080',
};

/** 高清立绘（真图）：源 dsh-TUI/assets/{claude-girl,codex-girl,whale-girl} */
const PORTRAITS: Record<string, PortraitArt> = {
  'claude-girl': { dir: `${PT_DIR}claude-girl/`, normal: 'claude-girl.png', happy: 'claude-girl-happy.png' },
  'codex-girl': { dir: `${PT_DIR}codex-girl/`, normal: 'codex-girl.png', happy: 'codex-girl-happy.png' },
  'maid-girl': { dir: `${PT_DIR}whale-girl/`, normal: 'whale-girl.png', happy: 'whale-girl-happy.png' },
};

const MOOD_ANIM: Record<string, string> = {
  sleeping: 'sleeping', waking: 'waking', thinking: 'thinking', typing: 'typing',
  idle: 'idle', working: 'building', error: 'error', attention: 'notification',
  celebrate: 'happy', waiting: 'idle-look',
};
const INTERACT_ANIMS: readonly string[] = ['poke-left', 'poke-right', 'tickle', 'drag', 'happy', 'music', 'conducting', 'swim'];

// 原版启动页常量（dsh-TUI SplashMascot / mood.ts）
const SPLASH_POKE_MS = 1400;
const SPLASH_HEART_MS = 2400;
const TICKLE_WINDOW_MS = 900;
const TICKLE_MIN_CLICKS = 3;
/** 点立绘换 happy 变体的时长（原版 LogoV2 MAID_HAPPY_MS）。 */
const HAPPY_MS = 3000;

function flatToGrid(arr: ReadonlyArray<unknown>, w: number): unknown[][] {
  const g: unknown[][] = [];
  const h = Math.floor(arr.length / w);
  for (let r = 0; r < h; r++) g.push(arr.slice(r * w, (r + 1) * w));
  return g;
}

function isSpriteGrid(value: unknown): value is SpriteGrid {
  if (!Array.isArray(value) || value.length === 0) return false;
  const first: unknown = value[0];
  return Array.isArray(first) && first.length === 30;
}

function pack(skin: SkinId): PetPack {
  const portrait = PORTRAITS[skin];
  if (portrait !== undefined) return { type: 'portrait', art: portrait, size: [0, 0] };
  if (skin === 'deepy') return { type: 'anim', palette: DEEPY.palette, anims: DEEPY.animations, size: DEEPY.size };
  if (skin === 'whalegirl') return { type: 'whalegirl', palette: WHALEGIRL.palette, anims: WHALEGIRL.animations, size: WHALEGIRL.size };
  if (skin === 'whale') return { type: 'whale', palette: SPLASH_PALETTE, frames: WHALE_FRAMES, size: [40, 25] };
  // 静态精灵表在 data/girls.ts 里已经是 30×30 二维数组（每格 [r,g,b] 或 null）
  if (skin === 'claudegirl') {
    const g: unknown = CLAUDE_GIRL_SPRITE;
    const grid: SpriteGrid = isSpriteGrid(g) ? g : (flatToGrid(g as unknown[], 30) as SpriteGrid);
    return { type: 'rgb', grid, size: [30, 30] };
  }
  if (skin === 'whale-girl') {
    const g: unknown = WHALE_GIRL_SPRITE;
    const grid: SpriteGrid = isSpriteGrid(g) ? g : (flatToGrid(g as unknown[], 30) as SpriteGrid);
    return { type: 'rgb', grid, size: [30, 30] };
  }
  return { type: 'none', size: [0, 0] };
}

// ── 鲸娘原生像素帧（一张精灵图 / 动画，懒加载 + 缓存）──────
interface ImageAnim {
  key: string;
  img: HTMLImageElement;
  /** 图集列数（行数 = ceil(帧数 / 列数)） */
  cols: number;
  /** 帧时长（ms），与 timings.json 一致 */
  durs: number[];
  total: number;
  ready: boolean;
  bad: boolean;
}

const imgAnims: Record<string, ImageAnim> = Object.create(null) as Record<string, ImageAnim>;

function imageAnim(key: string): ImageAnim | null {
  const list = WHALEGIRL_IMG[key];
  if (list === undefined) return null;
  const cached = imgAnims[key];
  if (cached !== undefined) return cached;
  const img = new Image();
  const a: ImageAnim = {
    key, img,
    cols: Math.ceil(Math.sqrt(list.length)),
    durs: list.map(entry => entry.dur),
    total: 0,
    ready: false,
    bad: false,
  };
  for (const entry of list) a.total += entry.dur;
  img.onload = () => { a.ready = true; };
  img.onerror = () => { a.bad = true; };
  img.src = `${SHEET_DIR}${key}.avif`;
  imgAnims[key] = a;
  return a;
}

/** 时间 → 帧号（按累加时长定位，与逐帧版本完全一致）。 */
function frameIndexAt(a: ImageAnim, t: number): number {
  if (a.total <= 0) return 0;
  const tt = ((t % a.total) + a.total) % a.total;
  let acc = 0;
  for (let i = 0; i < a.durs.length; i++) {
    acc += a.durs[i] ?? 0;
    if (tt < acc) return i;
  }
  return a.durs.length - 1;
}

/** 当前帧在图集里的源矩形。 */
function sheetFrameAt(key: string, t: number): SheetFrame | null {
  const a = imageAnim(key);
  if (a === null || !a.ready || a.bad) return null;
  const i = frameIndexAt(a, t);
  return {
    img: a.img,
    sx: (i % a.cols) * CELL_W,
    sy: Math.floor(i / a.cols) * CELL_H,
    w: CELL_W,
    h: CELL_H,
  };
}

// ── 高清立绘（懒加载 + 缓存）──────────────────────────────
interface PortraitRec {
  img: HTMLImageElement;
  ok: boolean;
}

const portraitCache: Record<string, PortraitRec> = Object.create(null) as Record<string, PortraitRec>;

function portraitImage(key: string, which: 'normal' | 'happy'): PortraitRec | null {
  const art = PORTRAITS[key];
  if (art === undefined) return null;
  const id = `${key}:${which}`;
  const cached = portraitCache[id];
  if (cached !== undefined) return cached;
  const img = new Image();
  const rec: PortraitRec = { img, ok: false };
  img.onload = () => { rec.ok = true; };
  img.src = art.dir + (which === 'happy' ? art.happy : art.normal);
  portraitCache[id] = rec;
  return rec;
}

// ── 精灵适配区域（静态精灵用）：水平下采样、垂直成对采样 ──
function fitGridArray(grid: SpriteGrid, maxW: number, maxH: number): SpriteGrid {
  const first = grid[0];
  if (first === undefined) return [];
  const W = first.length;
  const H = grid.length;
  const stepW = W > maxW ? Math.ceil(W / maxW) : 1;
  const halfH = Math.ceil(H / 2);
  const stepV = halfH > maxH ? Math.ceil(halfH / maxH) : 1;
  if (stepW === 1 && stepV === 1) return grid;
  const out: (readonly (readonly [number, number, number] | null)[])[] = [];
  if (stepV === 1) {
    for (let r = 0; r < H; r++) {
      const line: (readonly [number, number, number] | null)[] = [];
      for (let c = 0; c < W; c += stepW) line.push(grid[r]?.[c] ?? null);
      out.push(line);
    }
  } else {
    for (let r = 0; r < H; r += stepV * 2) {
      const line: (readonly [number, number, number] | null)[] = [];
      for (let c = 0; c < W; c += stepW) line.push(grid[r]?.[c] ?? null);
      out.push(line);
      if (r + 1 < H) {
        const line2: (readonly [number, number, number] | null)[] = [];
        for (let c = 0; c < W; c += stepW) line2.push(grid[r + 1]?.[c] ?? null);
        out.push(line2);
      }
    }
  }
  return out;
}

function frameByName(frames: readonly WhaleFrame[], name: string): WhaleFrame | undefined {
  return frames.find(f => f.name === name) ?? frames[0];
}

function rgbToString(c: readonly [number, number, number] | null): string | null {
  return c === null ? null : `rgb(${c[0]},${c[1]},${c[2]})`;
}

// ── 播放器 ─────────────────────────────────────────────────
interface AnimBankEntry {
  frames: AnimFrame[];
  total: number;
}

interface Override {
  key: string;
  start: number;
  until: number;
}

export class Player implements Pet {
  readonly skin: SkinId;
  readonly pack: PetPack;
  time = 0;
  mood = 'idle';
  animKey = 'idle';
  animStart = 0;
  private anims: Record<string, AnimBankEntry> = {};
  private override: Override | null = null;
  private heartAfter = false;
  private happyUntil = 0;
  private clicks: number[] = [];
  private portraitKey = '';
  private whaleSeq: { name: string; dur: number }[] = [];
  private whaleSeqStart = 0;
  private whalePhase = 0;
  private whaleLastBlink = 0;
  private heartStart = 0;

  constructor(skin: SkinId) {
    this.skin = skin;
    this.pack = pack(skin);
    if (this.pack.type === 'anim' || this.pack.type === 'whalegirl') {
      for (const a of this.pack.anims ?? []) {
        this.anims[a.key] = { frames: a.frames, total: a.frames.reduce((s, f) => s + f.dur, 0) };
      }
    }
    if (this.pack.type === 'whalegirl') imageAnim('idle'); // 首屏预载
    if (this.pack.type === 'portrait') {
      for (const key of Object.keys(PORTRAITS)) {
        if (PORTRAITS[key] === this.pack.art) { this.portraitKey = key; break; }
      }
      portraitImage(this.portraitKey, 'normal');
    }
    if (this.pack.type === 'whale') {
      const seq = ['spout3', 'spout5', 'spout1', 'spout6', 'standard', 'tail2', 'tail4', 'standard'];
      this.whaleSeq = seq.map(n => ({ name: n, dur: 240 }));
      this.whaleSeq[this.whaleSeq.length - 1] = { name: 'standard', dur: 5000 };
    }
  }

  setMood(mood: string): void {
    if (this.mood === mood) return;
    this.mood = mood;
    if (this.pack.type === 'anim' || this.pack.type === 'whalegirl') {
      const key = MOOD_ANIM[mood] ?? 'idle';
      if (this.anims[key] !== undefined && this.animKey !== key) {
        this.animKey = key;
        this.animStart = this.time;
      }
      if (this.pack.type === 'whalegirl') imageAnim(key);
    }
  }

  /** 原版启动页点击：左/右半 poke、连点 tickle、鲸娘 poke 后接爱心；立绘换 happy。 */
  click(fracX: number): void {
    if (this.pack.type === 'portrait') {
      this.happyUntil = this.time + HAPPY_MS;
      portraitImage(this.portraitKey, 'happy');
      return;
    }
    if (this.pack.type !== 'anim' && this.pack.type !== 'whalegirl' && this.pack.type !== 'whale') return;
    const t = this.time;
    this.clicks = this.clicks.filter(x => x > t - TICKLE_WINDOW_MS);
    this.clicks.push(t);
    const rapid = this.clicks.length >= TICKLE_MIN_CLICKS;
    if (rapid) this.clicks = [];
    if (rapid) {
      this.override = { key: 'tickle', start: t, until: t + TICKLE_WINDOW_MS };
      this.heartAfter = false;
    } else {
      this.override = { key: fracX < 0.5 ? 'poke-left' : 'poke-right', start: t, until: t + SPLASH_POKE_MS };
      this.heartAfter = this.pack.type === 'whalegirl';
    }
    if (this.pack.type === 'whalegirl' && this.override !== null) {
      imageAnim(this.override.key);
      if (this.heartAfter) imageAnim('smile-hearts');
    }
  }

  interact(): void {
    this.click(0.5);
  }

  tick(dt: number): void {
    this.time += dt;
    if (this.override !== null && this.time >= this.override.until) {
      const heart = this.heartAfter;
      this.override = null;
      this.heartAfter = false;
      if (heart) this.override = { key: 'smile-hearts', start: this.time, until: this.time + SPLASH_HEART_MS };
    }
  }

  private currentKey(): string {
    return this.override !== null ? this.override.key : this.animKey;
  }

  private currentStart(): number {
    return this.override !== null ? this.override.start : this.animStart;
  }

  /** 当前帧的字符格 rows（鲸娘加载中 / 无图像时的回退）。 */
  frameRows(): string[] | null {
    const pk = this.pack;
    if (pk.type === 'anim' || pk.type === 'whalegirl') {
      const key = this.currentKey();
      const a = this.anims[key] ?? this.anims.idle ?? this.anims[Object.keys(this.anims)[0] ?? ''];
      if (a === undefined) return null;
      const t = ((this.time - this.currentStart()) % a.total + a.total) % a.total;
      let acc = 0;
      for (const f of a.frames) {
        acc += f.dur;
        if (t < acc) return f.rows;
      }
      const last = a.frames[a.frames.length - 1];
      return last !== undefined ? last.rows : null;
    }
    if (pk.type === 'whale') {
      const frames = pk.frames ?? [];
      const standard = frameByName(frames, 'standard');
      if (this.whalePhase === -1) {
        const dt = this.time - this.heartStart;
        const seq = ['heart1', 'heart2', 'heart3', 'heart2', 'heart1'];
        const idx = Math.min(seq.length - 1, Math.floor(dt / 200));
        if (dt > 1100) {
          this.whalePhase = 0;
          this.whaleSeqStart = this.time;
          this.whaleLastBlink = this.time;
          return standard?.rows ?? null;
        }
        return frameByName(frames, seq[idx] ?? 'standard')?.rows ?? null;
      }
      if (this.whalePhase === 0) {
        const dt = this.time - this.whaleSeqStart;
        let acc = 0;
        for (let i = 0; i < this.whaleSeq.length; i++) {
          const step = this.whaleSeq[i];
          if (step === undefined) continue;
          acc += step.dur;
          if (dt < acc) {
            if (i === this.whaleSeq.length - 1) {
              this.whalePhase = 1;
              this.whaleLastBlink = this.time;
            }
            return frameByName(frames, step.name)?.rows ?? null;
          }
        }
        this.whalePhase = 1;
        this.whaleLastBlink = this.time;
        return standard?.rows ?? null;
      }
      if (this.time - this.whaleLastBlink > 3800) {
        const bdt = this.time - this.whaleLastBlink;
        if (bdt < 340) return frameByName(frames, 'blink')?.rows ?? null;
        this.whaleLastBlink = this.time;
      }
      return standard?.rows ?? null;
    }
    return null;
  }

  /** 当前帧在图集中占的格子（仅鲸娘精灵图轨）。 */
  frameCell(): SheetFrame | null {
    if (this.pack.type !== 'whalegirl') return null;
    return sheetFrameAt(this.currentKey(), this.time - this.currentStart());
  }

  private currentPortrait(): HTMLImageElement | null {
    if (this.pack.type !== 'portrait') return null;
    if (this.time < this.happyUntil) {
      const happy = portraitImage(this.portraitKey, 'happy');
      if (happy !== null && happy.ok) return happy.img;
    }
    const normal = portraitImage(this.portraitKey, 'normal');
    return normal !== null && normal.ok ? normal.img : null;
  }

  /** 画到独立像素层：优先原生像素图 / 立绘，缺图回落字符格。 */
  renderTo(layer: PixelLayerApi, x: number, y: number, w: number, h: number): void {
    const pk = this.pack;
    if (pk.type === 'portrait') {
      const img = this.currentPortrait();
      if (img === null) return;
      const sw = img.naturalWidth || img.width;
      const sh = img.naturalHeight || img.height;
      if (!sw || !sh) return;
      const sc = Math.min(w / sw, h / sh);
      const dw = sw * sc;
      const dh = sh * sc;
      layer.imageSmooth(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
      return;
    }
    if (pk.type === 'whalegirl') {
      const cell = this.frameCell();
      if (cell !== null) {
        // 1 源像素 = 整数个物理像素（最近邻放大才不会糊）
        const dpr = window.devicePixelRatio || 1;
        const k = Math.max(1, Math.round(dpr));
        let dw = (cell.w * k) / dpr;
        let dh = (cell.h * k) / dpr;
        if (dw > w || dh > h) {
          const s = Math.min(w / dw, h / dh);
          dw *= s;
          dh *= s;
        }
        layer.imageSub(cell.img, cell.sx, cell.sy, cell.w, cell.h,
          x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
        return;
      }
    }
    if (pk.type === 'anim' || pk.type === 'whalegirl' || pk.type === 'whale') {
      const rows = this.frameRows();
      if (rows === null || rows.length === 0) return;
      const cw0 = TUI.cw;
      const ch0 = TUI.ch;
      const cols = rows[0]?.length ?? 0;
      const rowsN = rows.length;
      if (cols === 0) return;
      const natW = cols * cw0;
      const natH = rowsN * (ch0 / 2);
      const sc = Math.min(1, w / natW, h / natH);
      const dw = natW * sc;
      const dh = natH * sc;
      layer.cells(x + (w - dw) / 2, y + (h - dh) / 2, dw / cols, dh / rowsN, rows, pk.palette ?? null);
      return;
    }
    if (pk.type === 'rgb') {
      const grid = pk.grid ?? [];
      const fitted = fitGridArray(grid, Math.max(4, Math.round(w)), Math.max(3, Math.round(h)));
      const first = fitted[0];
      if (first === undefined) return;
      const cols = first.length;
      const rowsN = fitted.length;
      const natW = cols * TUI.cw;
      const natH = rowsN * (TUI.ch / 2);
      const sc = Math.min(1, w / natW, h / natH);
      const dw = natW * sc;
      const dh = natH * sc;
      const rows: PixelRows = fitted.map(line => line.map(c => rgbToString(c)));
      layer.cells(x + (w - dw) / 2, y + (h - dh) / 2, dw / cols, dh / rowsN, rows, null);
    }
  }
}

// 预览：给选择器画静态首帧/立绘（按 id 缓存播放器，不参与主循环）
const previewPlayers: Record<string, Player> = Object.create(null) as Record<string, Player>;

function previewPlayer(skin: SkinId): Player {
  const cached = previewPlayers[skin];
  if (cached !== undefined) return cached;
  const p = new Player(skin);
  previewPlayers[skin] = p;
  return p;
}

export const PetKit: PetKitApi = {
  create(skin: SkinId): Pet {
    return new Player(skin);
  },
  preview(skin: SkinId, layer: PixelLayerApi, x: number, y: number, w: number, h: number): void {
    const p = previewPlayer(skin);
    p.time = 0;
    p.renderTo(layer, x, y, w, h);
  },
  warm(skin: SkinId): void {
    if (PORTRAITS[skin] !== undefined) {
      portraitImage(skin, 'normal');
      portraitImage(skin, 'happy');
    }
    if (skin === 'whalegirl') imageAnim('idle');
  },
  PORTRAITS,
  MOOD_ANIM,
  INTERACT_ANIMS,
};

/** 供测试/调试：当前缓存的原生帧动画 key。 */
export const _debugPacks: { pack: (skin: SkinId) => PetPack } = { pack };
