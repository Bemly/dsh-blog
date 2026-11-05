/* ═══════════════════════════════════════════════════════════
   pet.ts — 像素宠物引擎（原版素材 / 原版交互）
   ───────────────────────────────────────────────────────────
   皮肤：
   - whalegirl   : 鲸娘「原生像素帧」——一个动画一张 AVIF 精灵图
                   assets/whalegirl-sheet/<key>.avif
                   （源 dsh-TUI assets/whaleGirl/img，逐帧 WebP 经
                    tools/encode-sheet.ts 打包编码）
                   缺图/未加载时回落 42×30 字符格帧包
   - claude-girl / codex-girl / whale-maid* : 插画 / 像素精灵图（同一套 SheetArt 轨道）
   - maid-girl   : 高清立绘（normal + happy）
   - deepy       : 42×30 字符动画 ×20
   - whale       : 开屏鲸鱼 40×25 ×22 帧

   启动页交互（与 dsh-TUI SplashMascot 同一条语义）：
   - 稳态 idle 循环；
   - 点击左/右半 → poke-left / poke-right（1.4s）；
   - 鲸娘 poke 之后接 smile-hearts（2.4s）；
   - 900ms 内连点 ≥3 次 → tickle；
   - 高清立绘点击 → happy 变体 3s。
   ═══════════════════════════════════════════════════════════ */
import type {
  AnimFrame, Pet, PetKitApi, PetPack, PixelLayerApi,
  PortraitArt, SheetArt, SheetFrame, SkinId, WhaleFrame,
} from './types.ts';
import { TUI } from './tui-core.ts';
import { DEEPY } from './data/deepy.ts';
import { WHALEGIRL } from './data/whalegirl.ts';
import { WHALE_FRAMES } from './data/whale.ts';
import { CLAUDE_GIRL_IMG, CODEX_GIRL_IMG, MAID_ANIME_IMG, MAID_IMG, PLUSH_IMG, WHALEGIRL_IMG } from './data/timings.ts';

/** 精灵图单格尺寸（像素画统一 301×288）。 */
const CELL: readonly [number, number] = [301, 288];
/** 走 AVIF 精灵图轨的形象（一个动画一张图）。 */
const SHEETS: Record<string, SheetArt> = {
  whalegirl: { dir: 'assets/whalegirl-sheet/', cell: CELL, timings: WHALEGIRL_IMG },
  'claude-girl': { dir: 'assets/claude-girl-sheet/', cell: CELL, timings: CLAUDE_GIRL_IMG },
  'codex-girl': { dir: 'assets/codex-girl-sheet/', cell: CELL, timings: CODEX_GIRL_IMG },
  // 插画素材：非像素画，缩放走高质量插值
  'whale-maid': { dir: 'assets/whale-maid-sheet/', cell: [489, 709], timings: MAID_IMG, smooth: true },
  'whale-maid-anime': { dir: 'assets/whale-maid-anime-sheet/', cell: [540, 540], timings: MAID_ANIME_IMG, smooth: true },
  // 毛绒版：单帧 630×819，保证每张精灵图都 < 4096
  'whale-maid-plush': { dir: 'assets/whale-maid-plush-sheet/', cell: [630, 819], timings: PLUSH_IMG, smooth: true },
};
const PT_DIR = 'assets/portraits/';
const SPLASH_PALETTE: Record<string, string> = {
  D: '#142660', B: '#4E6FFF', L: '#BEE1FF', W: '#FFFFFF', H: '#CC3399', Z: '#808080',
};

/** 高清立绘（真图）：只剩女仆鲸娘——她没有动画帧，保持静态 */
const PORTRAITS: Record<string, PortraitArt> = {
  'maid-girl': { dir: `${PT_DIR}whale-girl/`, normal: 'whale-girl.png', happy: 'whale-girl-happy.png' },
};

const MOOD_ANIM: Record<string, string> = {
  sleeping: 'sleeping', waking: 'waking', thinking: 'thinking', typing: 'typing',
  idle: 'idle', working: 'building', error: 'error', attention: 'notification',
  celebrate: 'happy', waiting: 'idle-look', drag: 'drag',
};
const INTERACT_ANIMS: readonly string[] = ['poke-left', 'poke-right', 'tickle', 'drag', 'happy', 'music', 'conducting', 'swim'];

// 原版启动页常量（dsh-TUI SplashMascot / mood.ts）
const SPLASH_POKE_MS = 1400;
const SPLASH_HEART_MS = 2400;
const TICKLE_WINDOW_MS = 900;
const TICKLE_MIN_CLICKS = 3;
/** 点立绘换 happy 变体的时长（原版 LogoV2 MAID_HAPPY_MS）。 */
const HAPPY_MS = 3000;

function pack(skin: SkinId): PetPack {
  const portrait = PORTRAITS[skin];
  if (portrait !== undefined) return { type: 'portrait', art: portrait, size: [0, 0] };
  const sheet = SHEETS[skin];
  if (sheet !== undefined) {
    // 鲸娘额外带一份 42×30 字符格帧包，作图像未就绪时的回落
    const fallback = skin === 'whalegirl'
      ? { palette: WHALEGIRL.palette, anims: WHALEGIRL.animations, size: WHALEGIRL.size }
      : { size: [sheet.cell[0], sheet.cell[1]] as [number, number] };
    return { type: 'sheet', sheet, ...fallback };
  }
  if (skin === 'deepy') return { type: 'anim', palette: DEEPY.palette, anims: DEEPY.animations, size: DEEPY.size };
  if (skin === 'whale') return { type: 'whale', palette: SPLASH_PALETTE, frames: WHALE_FRAMES, size: [40, 25] };
  return { type: 'none', size: [0, 0] };
}

// ── 原生像素帧：一个动画一张 AVIF 精灵图（懒加载 + 缓存）──
interface ImageAnim {
  key: string;
  img: HTMLImageElement;
  /** 图集列数（行数 = ceil(帧数 / 列数)） */
  cols: number;
  /** 帧时长（ms），与 timings.json 一致 */
  durs: readonly number[];
  total: number;
  ready: boolean;
  bad: boolean;
}

const imgAnims: Record<string, ImageAnim> = Object.create(null) as Record<string, ImageAnim>;

function imageAnim(art: SheetArt, key: string): ImageAnim | null {
  const durs = art.timings[key];
  if (durs === undefined) return null;
  const id = `${art.dir}${key}`;
  const cached = imgAnims[id];
  if (cached !== undefined) return cached;
  const img = new Image();
  const a: ImageAnim = {
    key, img,
    cols: Math.ceil(Math.sqrt(durs.length)),
    durs,
    total: 0,
    ready: false,
    bad: false,
  };
  for (const d of durs) a.total += d;
  img.onload = () => { a.ready = true; };
  img.onerror = () => { a.bad = true; };
  img.src = `${id}.avif`;
  imgAnims[id] = a;
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
function sheetFrameAt(art: SheetArt, key: string, t: number): SheetFrame | null {
  const a = imageAnim(art, key);
  if (a === null || !a.ready || a.bad) return null;
  const i = frameIndexAt(a, t);
  const [cw, ch] = art.cell;
  return {
    img: a.img,
    sx: (i % a.cols) * cw,
    sy: Math.floor(i / a.cols) * ch,
    w: cw,
    h: ch,
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

function frameByName(frames: readonly WhaleFrame[], name: string): WhaleFrame | undefined {
  return frames.find(f => f.name === name) ?? frames[0];
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
  private sheet: SheetArt | null;

  constructor(skin: SkinId) {
    this.skin = skin;
    this.pack = pack(skin);
    this.sheet = this.pack.sheet ?? null;
    if (this.pack.type === 'anim' || this.pack.type === 'sheet') {
      for (const a of this.pack.anims ?? []) {
        this.anims[a.key] = { frames: a.frames, total: a.frames.reduce((s, f) => s + f.dur, 0) };
      }
    }
    if (this.sheet !== null) imageAnim(this.sheet, 'idle'); // 首屏预载
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
    const key = MOOD_ANIM[mood] ?? 'idle';
    if (this.sheet !== null) {
      if (this.sheet.timings[key] !== undefined && this.animKey !== key) {
        this.animKey = key;
        this.animStart = this.time;
        imageAnim(this.sheet, key);
      }
      return;
    }
    if (this.pack.type === 'anim' && this.anims[key] !== undefined && this.animKey !== key) {
      this.animKey = key;
      this.animStart = this.time;
    }
  }

  /** 原版启动页点击：左/右半 poke、连点 tickle、鲸娘 poke 后接爱心；立绘换 happy。 */
  click(fracX: number): void {
    if (this.pack.type === 'portrait') {
      this.happyUntil = this.time + HAPPY_MS;
      portraitImage(this.portraitKey, 'happy');
      return;
    }
    if (this.pack.type !== 'anim' && this.pack.type !== 'sheet' && this.pack.type !== 'whale') return;
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
      this.heartAfter = this.skin === 'whalegirl';
    }
    if (this.sheet !== null && this.override !== null) {
      imageAnim(this.sheet, this.override.key);
      if (this.heartAfter) imageAnim(this.sheet, 'smile-hearts');
    }
  }

  /** 侧栏拖拽：按住期间覆盖 `drag` 姿态，松手清掉覆盖。 */
  hold(on: boolean): void {
    if (on) {
      this.override = { key: 'drag', start: this.time, until: Number.POSITIVE_INFINITY };
      this.heartAfter = false;
      if (this.sheet !== null) imageAnim(this.sheet, 'drag');
      return;
    }
    if (this.override !== null && this.override.key === 'drag') this.override = null;
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

  /** 当前帧的字符格 rows（仅鲸娘有字符回退包；其余精灵图形象未就绪时返回 null）。 */
  frameRows(): string[] | null {
    const pk = this.pack;
    if (pk.type === 'anim' || pk.type === 'sheet') {
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

  /** 当前帧在图集中占的格子（仅精灵图轨形象）。 */
  frameCell(): SheetFrame | null {
    if (this.sheet === null) return null;
    return sheetFrameAt(this.sheet, this.currentKey(), this.time - this.currentStart());
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
    if (pk.type === 'sheet') {
      const cell = this.frameCell();
      if (cell !== null) {
        const art = pk.sheet!;
        let dw: number;
        let dh: number;
        if (art.smooth === true) {
          // 插画：等比缩放到槽位内，走高质量插值
          const sc = Math.min(w / cell.w, h / cell.h);
          dw = cell.w * sc;
          dh = cell.h * sc;
          layer.imageSubSmooth(cell.img, cell.sx, cell.sy, cell.w, cell.h,
            x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
        } else {
          // 像素画：1 源像素 = 整数个物理像素（最近邻放大才不会糊）
          const dpr = window.devicePixelRatio || 1;
          const k = Math.max(1, Math.round(dpr));
          dw = (cell.w * k) / dpr;
          dh = (cell.h * k) / dpr;
          if (dw > w || dh > h) {
            const s = Math.min(w / dw, h / dh);
            dw *= s;
            dh *= s;
          }
          layer.imageSub(cell.img, cell.sx, cell.sy, cell.w, cell.h,
            x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
        }
        return;
      }
    }
    if (pk.type === 'anim' || pk.type === 'sheet' || pk.type === 'whale') {
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
    const art = SHEETS[skin];
    if (art !== undefined) imageAnim(art, 'idle');
  },
  PORTRAITS,
  MOOD_ANIM,
  INTERACT_ANIMS,
};

/** 供测试/调试：当前缓存的原生帧动画 key。 */
export const _debugPacks: { pack: (skin: SkinId) => PetPack } = { pack };
