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

   交互（启动页 / 侧栏共用）：
   - 稳态 idle 循环；
   - 点击 → 从该形象全部动画（约 20 个）里随机挑一个完整播一轮；
   - 900ms 内连点 ≥3 次 → tickle；
   - 高清立绘点击 → happy 变体 3s。
   ═══════════════════════════════════════════════════════════ */
import type {
  AnimFrame, Pet, PetKitApi, PetPack, PixelLayerApi,
  PortraitArt, SheetArt, SheetFrame, SkinId,
} from './types.ts';
import { TUI } from './tui-core.ts';
import { WHALEGIRL } from './data/whalegirl.ts';
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

/** 动画 key → 中文动作名（侧栏「当前动作」用；缺项回落到形象名）。 */
const ANIM_LABEL: Record<string, string> = {
  idle: '发呆', 'idle-look': '张望', 'idle-spout': '喷水', thinking: '思考',
  typing: '打字', music: '听歌', conducting: '指挥', building: '搭建',
  error: '出错', happy: '开心', notification: '提醒', compacting: '压缩',
  carrying: '搬箱子', sleeping: '睡觉', waking: '醒来', 'poke-left': '戳左边',
  'poke-right': '戳右边', tickle: '挠痒痒', drag: '被拎起来', swim: '游泳',
  'smile-hearts': '爱心', 'thumbs-up': '点赞',
};

// 原版启动页常量（dsh-TUI SplashMascot / mood.ts）
const TICKLE_WINDOW_MS = 900;
const TICKLE_MIN_CLICKS = 3;
/** 点击反应池的排除项：静止态与拖拽姿态（拖拽由 hold 控制）。 */
const CLICK_EXCLUDE: ReadonlySet<string> = new Set(['idle', 'drag']);
/** 单次随机动作的展示时长上下限（ms）。 */
const REACTION_MIN_MS = 900;
const REACTION_MAX_MS = 5000;
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
/** 预缓存过的图片元素（按 URL），imageAnim 复用它，避免二次请求。 */
const prefetchImgs: Record<string, HTMLImageElement> = Object.create(null) as Record<string, HTMLImageElement>;

function imageAnim(art: SheetArt, key: string): ImageAnim | null {
  const durs = art.timings[key];
  if (durs === undefined) return null;
  const id = `${art.dir}${key}`;
  const cached = imgAnims[id];
  if (cached !== undefined) return cached;
  const url = `${id}.avif`;
  const pre = prefetchImgs[url];
  const img = pre ?? new Image();
  const a: ImageAnim = {
    key, img,
    cols: Math.ceil(Math.sqrt(durs.length)),
    durs,
    total: 0,
    ready: false,
    bad: false,
  };
  for (const d of durs) a.total += d;
  if (pre !== undefined) {
    if (pre.complete) {
      a.ready = pre.naturalWidth > 0;
      a.bad = !a.ready;
    } else {
      pre.addEventListener('load', () => { a.ready = true; });
      pre.addEventListener('error', () => { a.bad = true; });
    }
  } else {
    dequeuePrefetch(url);
    img.onload = () => { a.ready = true; };
    img.onerror = () => { a.bad = true; };
    img.src = url;
  }
  imgAnims[id] = a;
  return a;
}

/** 时间 → 帧号（按累加时长定位，与逐帧版本完全一致）。 */function frameIndexAt(a: ImageAnim, t: number): number {
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
  private happyUntil = 0;
  private clicks: number[] = [];
  private portraitKey = '';
  private sheet: SheetArt | null;

  constructor(skin: SkinId) {
    this.skin = skin;
    this.pack = pack(skin);
    this.sheet = this.pack.sheet ?? null;
    if (this.pack.type === 'sheet') {
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
  }

  /**
   * 点击反应：从当前素材的全部动画里随机挑一个完整播一轮（20 个左右），
   * 900ms 内连点 ≥3 次仍保留 tickle；立绘走 happy 变体。
   */
  click(_fracX: number): void {
    if (this.pack.type === 'portrait') {
      this.happyUntil = this.time + HAPPY_MS;
      portraitImage(this.portraitKey, 'happy');
      return;
    }
    if (this.pack.type !== 'sheet') return;
    const t = this.time;
    this.clicks = this.clicks.filter(x => x > t - TICKLE_WINDOW_MS);
    this.clicks.push(t);
    const rapid = this.clicks.length >= TICKLE_MIN_CLICKS;
    if (rapid) this.clicks = [];
    if (rapid) {
      this.override = { key: 'tickle', start: t, until: t + TICKLE_WINDOW_MS };
    } else {
      const pool = this.reactionPool();
      const key = pool[Math.floor(Math.random() * pool.length)] ?? 'idle';
      const dur = Math.max(REACTION_MIN_MS, Math.min(REACTION_MAX_MS, this.keyDuration(key)));
      this.override = { key, start: t, until: t + dur };
    }
    if (this.sheet !== null && this.override !== null) imageAnim(this.sheet, this.override.key);
  }

  /** 可随机触发的动作：去掉静止 idle 与拖拽 drag。 */
  private reactionPool(): string[] {
    return Object.keys(this.sheet?.timings ?? {}).filter(k => !CLICK_EXCLUDE.has(k));
  }

  /** 一个动作完整播一轮的时长（ms）。 */
  private keyDuration(key: string): number {
    if (this.sheet !== null) {
      const durs = this.sheet.timings[key];
      if (durs !== undefined) return durs.reduce((s, d) => s + d, 0);
    }
    const a = this.anims[key];
    return a === undefined ? 0 : a.total;
  }

  /** 侧栏拖拽：按住期间覆盖 `drag` 姿态，松手清掉覆盖。 */
  hold(on: boolean): void {
    if (on) {
      this.override = { key: 'drag', start: this.time, until: Number.POSITIVE_INFINITY };
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
    if (this.override !== null && this.time >= this.override.until) this.override = null;
  }

  /** 当前正在播的动作 key（覆盖层优先）。 */
  currentAnim(): string {
    return this.currentKey();
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
    if (pk.type === 'sheet') {
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
    if (pk.type === 'sheet') {
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

// 预览：选择器里的动态预览（按 id 缓存播放器，只用墙钟推进，不参与主循环）
const previewPlayers: Record<string, Player> = Object.create(null) as Record<string, Player>;
const previewClocks: Record<string, number> = Object.create(null) as Record<string, number>;

function previewPlayer(skin: SkinId): Player {
  const cached = previewPlayers[skin];
  if (cached !== undefined) return cached;
  const p = new Player(skin);
  previewPlayers[skin] = p;
  return p;
}

/** 预览推进：两次渲染间隔作为 dt（上限 64ms，防止切标签后跳帧）。 */
function previewStep(p: Player, skin: SkinId): void {
  const now = performance.now();
  const last = previewClocks[skin];
  const dt = last === undefined ? 16 : Math.min(64, Math.max(0, now - last));
  previewClocks[skin] = now;
  p.tick(dt);
}

// ── 后台静默预缓存 ─────────────────────────────────────────
// 首帧显示完后再拉精灵图：先当前形象，其余形象排队；并发 2、只在空闲时开新请求，
// 不跟首屏抢带宽。只建 <img> 不解码，真正 decode 仍发生在第一次绘制。
const prefetchQueue: string[] = [];
const prefetchQueued = new Set<string>();
const prefetchDone = new Set<string>();
let prefetchActive = 0;
const PREFETCH_CONCURRENCY = 2;

function idleRun(fn: () => void): void {
  const ric = (globalThis as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
    .requestIdleCallback;
  if (ric !== undefined) ric(fn, { timeout: 1500 });
  else setTimeout(fn, 160);
}

function prefetchUrls(skin: string): string[] {
  const urls: string[] = [];
  const art = SHEETS[skin];
  if (art !== undefined) for (const key of Object.keys(art.timings)) urls.push(`${art.dir}${key}.avif`);
  const pt = PORTRAITS[skin];
  if (pt !== undefined) urls.push(pt.dir + pt.normal, pt.dir + pt.happy);
  return urls;
}

function pumpPrefetch(): void {
  while (prefetchActive < PREFETCH_CONCURRENCY) {
    const url = prefetchQueue.shift();
    if (url === undefined) return;
    prefetchQueued.delete(url);
    // 前台已经先发过这张（用户点了这个动作），跳过，避免重复下载
    if (imgAnims[url.slice(0, -5)] !== undefined) { prefetchDone.add(url); continue; }
    prefetchActive += 1;
    const img = new Image();
    prefetchImgs[url] = img;
    const finish = (): void => {
      img.onload = null;
      img.onerror = null;
      prefetchDone.add(url);
      prefetchActive -= 1;
      idleRun(pumpPrefetch);
    };
    img.onload = finish;
    img.onerror = finish;
    img.src = url;
  }
}

/** 前台要用这个动画：如果还在预取队列里，先摘出来，避免后台重复下载。 */
function dequeuePrefetch(url: string): void {
  if (!prefetchQueued.has(url)) return;
  const i = prefetchQueue.indexOf(url);
  if (i >= 0) prefetchQueue.splice(i, 1);
  prefetchQueued.delete(url);
}

function enqueuePrefetch(url: string, front: boolean): void {
  if (prefetchDone.has(url) || prefetchQueued.has(url)) return;
  // 正文已经加载/在加载的动画不再排一次
  if (imgAnims[url.slice(0, -5)] !== undefined) { prefetchDone.add(url); return; }
  prefetchQueued.add(url);
  if (front) prefetchQueue.unshift(url);
  else prefetchQueue.push(url);
}

function prefetch(skin: SkinId): void {
  const conn = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData === true) return;
  if (conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g') return;
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-data: reduce)').matches) return;

  // 当前形象插到队首（从队列里摘掉重排，保证换肤后优先级立即生效）
  const priority = prefetchUrls(skin);
  for (const url of priority) {
    if (!prefetchQueued.has(url)) continue;
    const i = prefetchQueue.indexOf(url);
    if (i >= 0) prefetchQueue.splice(i, 1);
    prefetchQueued.delete(url);
  }
  for (const url of [...priority].reverse()) enqueuePrefetch(url, true);

  for (const other of Object.keys(SHEETS)) {
    if (other === skin) continue;
    for (const url of prefetchUrls(other)) enqueuePrefetch(url, false);
  }
  for (const other of Object.keys(PORTRAITS)) {
    if (other === skin) continue;
    for (const url of prefetchUrls(other)) enqueuePrefetch(url, false);
  }
  idleRun(pumpPrefetch);
}

export const PetKit: PetKitApi = {
  create(skin: SkinId): Pet {
    return new Player(skin);
  },
  preview(skin: SkinId, layer: PixelLayerApi, x: number, y: number, w: number, h: number): void {
    const p = previewPlayer(skin);
    previewStep(p, skin);
    p.renderTo(layer, x, y, w, h);
  },
  previewClick(skin: SkinId, fracX: number): void {
    const p = previewPlayer(skin);
    p.click(fracX);
    previewClocks[skin] = performance.now();
  },
  warm(skin: SkinId): void {
    if (PORTRAITS[skin] !== undefined) {
      portraitImage(skin, 'normal');
      portraitImage(skin, 'happy');
    }
    const art = SHEETS[skin];
    if (art !== undefined) imageAnim(art, 'idle');
  },
  prefetch,
  PORTRAITS,
  MOOD_ANIM,
  INTERACT_ANIMS,
  ANIM_LABEL,
};

/** 供测试/调试：当前缓存的原生帧动画 key。 */
export const _debugPacks: { pack: (skin: SkinId) => PetPack } = { pack };
