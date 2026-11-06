/**
 * 共享类型：渲染内核、像素层、宠物、Markdown、应用状态。
 * 所有模块只从这里取类型，避免互相 import 造成的循环。
 */

// ── 像素素材 ───────────────────────────────────────────────
/** 字符格动画的一帧（`rows` 是字符点阵，字符 = 调色板键）。 */
export interface AnimFrame {
  readonly dur: number;
  readonly rows: string[];
}

/** 一个动画（idle / poke-left ...）。 */
export interface Anim {
  readonly key: string;
  /** 可读名 / 英文名 / 状态 / 触发条件（原素材自带，UI 不依赖） */
  readonly title?: string;
  readonly en?: string;
  readonly state?: string;
  readonly trigger?: string;
  readonly frames: AnimFrame[];
}

/** 字符格帧包（鲸娘精灵图未就绪时的回落素材）。 */
export interface SpritePack {
  readonly size: [number, number];
  readonly palette: Record<string, string>;
  readonly animations: Anim[];
}

/** 原生像素帧的时间表：动画 key → 每帧停留时长（ms）。 */
export type ImageTimings = Record<string, readonly number[]>;

/** 博客文章（src/data/posts.ts 由 tools/import-blog.ts 生成）。 */
export interface Post {
  readonly id: string;
  /** 目录名（中文标题）；图片路径为 blog/<slug>/images/… */
  readonly slug: string;
  readonly title: string;
  /** 收录日期（YYYY-MM-DD，没有则为空串）。 */
  readonly date: string;
  readonly excerpt: string;
  /** Markdown 正文，图片路径已改写为 blog/<slug>/images/… */
  readonly body: string;
}

// ── 主题 / 渲染单元 ────────────────────────────────────────
/** 字符网格单元。 */
export interface Cell {
  ch: string;
  fg: string;
  bg: string;
  /** 位标志：1=bold 2=dim 4=underline 8=inverse 16=italic */
  st: number;
}

/** 主题令牌。 */
export interface Theme {
  bg: string;
  panel: string;
  panel2: string;
  border: string;
  fg: string;
  dim: string;
  accent: string;
  accentDim: string;
  accentShimmer: string;
  pale: string;
  flash: string;
  suggestion: string;
  autoAccept: string;
  warning: string;
  green: string;
  yellow: string;
  red: string;
  purple: string;
  cyan: string;
  blue: string;
  white: string;
  statusBg: string;
  thinkBg: string;
  ctxBar: string[];
}

export type ThemeName = 'dark' | 'light';

/** 主题令牌可写映射（主题切换时逐键覆盖）。 */
export type MutableTheme = { -readonly [K in keyof Theme]: Theme[K] };

/** 一帧内可点击区域（字符坐标）。 */
export interface Hit {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  action: string | null;
  label: string;
}

// ── 输入 ───────────────────────────────────────────────────
/** 字符坐标。 */
export interface CellPos {
  col: number;
  row: number;
}

/** 鼠标状态快照。 */
export interface MouseState {
  x: number;
  y: number;
  col: number;
  row: number;
  btn: number;
}

/** 分发到应用的输入回调。 */
export interface InputHandlers {
  key: ((e: KeyboardEvent) => void) | null;
  keyUp: ((e: KeyboardEvent) => void) | null;
  down: ((col: number, row: number, btn: number, e: MouseEvent) => void) | null;
  move: ((px: number, py: number, e: MouseEvent) => void) | null;
  up: ((col: number, row: number, btn: number, e: MouseEvent) => void) | null;
  leave: (() => void) | null;
  wheel: ((deltaY: number) => void) | null;
  lastMouse: MouseState;
}

// ── 渲染内核 / 像素层 ──────────────────────────────────────
/** 字符网格渲染内核的公开 API。 */
export interface TuiApi {
  readonly THEME: MutableTheme;
  readonly ST: { BOLD: number; DIM: number; UNDER: number; INVERSE: number; ITALIC: number };
  readonly COLS: number;
  readonly ROWS: number;
  readonly cw: number;
  readonly ch: number;
  readonly Input: InputHandlers;
  init(canvas: HTMLCanvasElement): void;
  beginFrame(): void;
  endFrame(): void;
  requestPaint(): void;
  put(x: number, y: number, ch: string, fg?: string, bg?: string, st?: number): void;
  text(x: number, y: number, s: string, fg?: string, bg?: string, st?: number): void;
  rich(x: number, y: number, tokens: readonly RenderToken[], defaultFg?: string, defaultBg?: string): void;
  hline(x: number, y: number, w: number, fg?: string, bg?: string): void;
  vline(x: number, y: number, h: number, fg?: string, bg?: string): void;
  box(x: number, y: number, w: number, h: number, o?: BoxOptions): void;
  fill(x: number, y: number, w: number, h: number, o?: FillOptions): void;
  roundRect(x: number, y: number, w: number, h: number, fg?: string): void;
  setCursor(x: number, y: number, on: boolean): void;
  isWide(ch: string): boolean;
  strW(s: string): number;
  pxToCell(px: number, py: number): CellPos;
  truncate(s: string, max: number): string;
  pad(s: string, n: number, fill?: string): string;
  padEnd(s: string, n: number): string;
}

/** 盒子边框选项。 */
export interface BoxOptions {
  fg?: string;
  title?: string;
  titleFg?: string;
}

/** 区域填充选项。 */
export interface FillOptions {
  ch?: string;
  bg?: string;
  fg?: string;
  st?: number;
}

/** 富文本 token。 */
export interface RenderToken {
  text: string;
  fg?: string;
  bg?: string;
  st?: number;
  href?: string;
}

/** 待绘制的像素画行：字符串行，或「每格颜色或 null」的数组行。 */
export type PixelRows = ReadonlyArray<string | ReadonlyArray<string | null>>;

/** 精灵图里的一格（图 + 源矩形）。 */
export interface SheetFrame {
  readonly img: HTMLImageElement;
  readonly sx: number;
  readonly sy: number;
  readonly w: number;
  readonly h: number;
}

/** 独立像素层 API。 */
export interface PixelLayerApi {
  readonly dpr: number;
  begin(): void;
  end(): void;
  imageAt(img: HTMLImageElement, x: number, y: number, w: number, h: number): void;
  imageSub(img: HTMLImageElement, sx: number, sy: number, sw: number, sh: number, x: number, y: number, w: number, h: number): void;
  imageSubSmooth(img: HTMLImageElement, sx: number, sy: number, sw: number, sh: number, x: number, y: number, w: number, h: number): void;
  imageSmooth(img: HTMLImageElement, x: number, y: number, w: number, h: number): void;
  cells(x: number, y: number, cw: number, ch: number, rows: PixelRows, palette: Record<string, string> | null): void;
  rect(x0: number, y0: number, x1: number, y1: number, color: string): void;
}

// ── 宠物 ───────────────────────────────────────────────────
/** 宠物皮肤 id（见 app 的 SKINS 名册）。 */
export type SkinId = string;

/** 宠物包类型。 */
export type PetPackKind = 'sheet' | 'portrait' | 'none';

/** 精灵图素材：目录 + 单格尺寸 + 逐帧时长表。 */
export interface SheetArt {
  /** 形如 `assets/claude-girl-sheet/`，运行时拼 `${dir}${key}.avif` */
  readonly dir: string;
  readonly cell: readonly [number, number];
  readonly timings: ImageTimings;
  /** 插画类素材：缩小时走高质量插值（像素画不能开，否则糊边） */
  readonly smooth?: boolean;
}

/** 宠物当前加载的素材包。 */
export interface PetPack {
  readonly type: PetPackKind;
  readonly size: [number, number];
  readonly palette?: Record<string, string>;
  readonly anims?: Anim[];
  readonly art?: PortraitArt;
  readonly sheet?: SheetArt;
}

/** 高清立绘资产。 */
export interface PortraitArt {
  readonly dir: string;
  readonly normal: string;
  readonly happy: string;
}

/** 宠物实例（pet.ts 实现）。 */
export interface Pet {
  readonly skin: SkinId;
  readonly pack: PetPack;
  tick(dt: number): void;
  setMood(mood: string): void;
  click(fracX: number): void;
  /** 当前正在播的动作 key（侧栏「当前动作」显示用）。 */
  currentAnim(): string;
  /** 侧栏拖拽：按住时切 `drag` 姿态，松手恢复。 */
  hold(on: boolean): void;
  interact(): void;
  frameRows(): string[] | null;
  frameCell(): SheetFrame | null;
  renderTo(layer: PixelLayerApi, x: number, y: number, w: number, h: number): void;
}

/** 宠物工具包。 */
export interface PetKitApi {
  create(skin: SkinId): Pet;
  preview(skin: SkinId, layer: PixelLayerApi, x: number, y: number, w: number, h: number): void;
  /** 预览里点一下：随机换一个动作（与主宠物同一套点击逻辑）。 */
  previewClick(skin: SkinId, fracX: number): void;
  warm(skin: SkinId): void;
  readonly PORTRAITS: Record<string, PortraitArt>;
  readonly MOOD_ANIM: Record<string, string>;
  readonly INTERACT_ANIMS: readonly string[];
  /** 动画 key → 中文动作名。 */
  readonly ANIM_LABEL: Record<string, string>;
}

// ── Markdown ───────────────────────────────────────────────
/** 行内 token（`inline()` 输出）。 */
export interface Token {
  text: string;
  st?: number;
  fg?: string;
  href?: string;
}

/** Mermaid 简化行。 */
export type MermaidLine =
  | { kind: 'edge'; a: string; label: string; b: string }
  | { kind: 'node'; a: string; label: string }
  | { kind: 'raw'; text: string };

/** 列表项。 */
export interface ListItem {
  index: number;
  tokens: Token[];
}

/** Markdown 块（判别联合）。 */
export type Block =
  | { type: 'h'; level: number; tokens: Token[] }
  | { type: 'p'; tokens: Token[] }
  | { type: 'code'; lang: string; lines: string[] }
  | { type: 'diff'; lines: string[] }
  | { type: 'quote'; tokens: Token[] }
  | { type: 'ul'; items: ListItem[] }
  | { type: 'ol'; items: ListItem[] }
  | { type: 'hr' }
  | { type: 'table'; head: Token[][]; rows: Token[][][] }
  | { type: 'mermaid'; lines: MermaidLine[] }
  | { type: 'tex'; lines: string[] }
  | { type: 'image'; alt: string; src: string };

/** Markdown 解析器 API。 */
export interface MarkdownApi {
  parse(text: string): Block[];
  inline(text: string): Token[];
  esc(s: string): string;
}

// ── 应用状态 ───────────────────────────────────────────────
export type Screen = 'onboarding' | 'launchpad' | 'settings' | 'chat';
export type Overlay = 'help' | 'cmdmenu' | 'param' | 'sessions' | 'kernel' | 'cwd' | 'skin' | null;
export type Mode = 'insert' | 'normal';
export type ItemStatus = 'done' | 'running' | 'todo' | 'error';

/** 面板 tab。 */
export interface PanelTab {
  id: string;
  label: string;
}

/** 参数行的一段。 */
export interface ParamSeg {
  id: string;
  label: string;
}

/** 启动页入口。 */
export interface ActionDef {
  id: string;
  label: string;
}

/** 形象名册条目。 */
export interface SkinDef {
  id: SkinId;
  label: string;
  kind: string;
  desc: string;
}

/** 命令菜单条目。 */
export interface CommandDef {
  id: string;
  label: string;
  key: string;
  desc: string;
  action: string;
}

/** 工具卡片。 */
export interface ToolInfo {
  name: string;
  status: ItemStatus;
  statusText?: string;
  body?: string;
}

/** 会话消息（判别联合）。 */
export type Message =
  | { type: 'system'; content: string }
  | { type: 'user'; content: string }
  | { type: 'assistant'; content: string }
  | { type: 'think'; content: string; open: boolean; id: string }
  | { type: 'tool'; tool: ToolInfo; open?: boolean }
  | { type: 'usage'; content: string };

/** 会话。 */
export interface Session {
  id: string;
  title: string;
  time: Date;
  messages: Message[];
}

/** 会话列表项。 */
export interface SessionRef {
  id: string;
  title: string;
  active: boolean;
}

/** 会话分组。 */
export interface SessionGroup {
  name: string;
  sessions: SessionRef[];
}

/** 上下文 chips。 */
export interface CtxChip {
  label: string;
  fg: string;
}

/** 应用状态。 */
export interface AppState {
  screen: Screen;
  overlay: Overlay;
  theme: ThemeName;
  skin: SkinId;
  skinSel: number;
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  budget: number;
  web: boolean;
  panelOpen: boolean;
  /** 侧栏宽度（字符列）；0 = 按窗口宽度自适应。 */
  panelCols: number;
  /** 指针停在侧栏边界把手上（高亮）。 */
  panelResizeHover: boolean;
  /** 当前悬停的命中区 id（设置页 / 形象选择器做行高亮）。 */
  hoverId: string | null;
  /** 形象选择器里悬停的条目下标（-1 = 没有悬停，预览回落到选中项）。 */
  skinHover: number;
  panelTabs: PanelTab[];
  panelTab: string;
  /** 文章列表面板的滚动起点（行）。 */
  postsTop: number;
  groups: SessionGroup[];
  sessions: Record<string, Session>;
  session: Session | null;
  lastSessionTitle: string;
  streaming: boolean;
  streamSessionId: string | null;
  streamAcc: string;
  streamReply: string;
  streamCursor: number;
  streamingEnabled: boolean;
  autoScroll: boolean;
  cursorBlink: boolean;
  cursorOn: boolean;
  inputPrompt: string;
  inputText: string;
  caret: number;
  focusInput: boolean;
  mode: Mode;
  scroll: number;
  userScrolled: boolean;
  contextFrac: number;
  ctxChips: CtxChip[];
  commands: CommandDef[];
  cmdFilter: string;
  cmdSel: number;
  slashSel: number;
  paramSel: number;
  launchTitle: string;
  showPet: boolean;
  launchFocus: boolean;
  /** 侧栏伙伴：当前心情键（updatePet 写入，面板据此显示文案）。 */
  petMood: string;
  /** 侧栏伙伴拖动位移（CSS 像素）；非 0 时宠物离开 home 位。 */
  petOffset: { x: number; y: number };
  /** 正在拖拽（松手后由帧循环弹回）。 */
  petDragging: boolean;
  /** 指针停在侧栏宠物上（切 idle-look）。 */
  petHover: boolean;
  /** 回合完成后的庆祝截止时间戳（ms）。 */
  petCelebrateUntil: number;
  cwd: string;
  branch: string;
  paramRow: ParamSeg[];
  actions: ActionDef[];
  paramHover: string | null;
  actionHover: string | null;
  sessionSel: number;
  kernelName: string;
  tip: string;
}

/** 侧栏宠物可拖动范围（相对 home 位的 CSS 像素偏移上下限）。 */
export interface PetDragLimits {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** 宠物槽位（CSS 像素）。 */
export interface PetRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** UI 层读取的应用 API。 */
export interface AppApi {
  state: AppState;
  readonly pet: Pet | null;
  readonly _hits: Hit[];
  /** 侧栏伙伴宠物槽位（未加拖动位移）；面板不可见时 null。 */
  companionPetRect(): PetRect | null;
  /** 侧栏伙伴拖动偏移上限；面板不可见时 null。 */
  companionLimits(): PetDragLimits | null;
  dateLabel(t: number | Date): string;
  allSessionIds(): string[];
  reportCaret(col: number, row: number): void;
  readonly skins: SkinDef[];
  skinMeta(id: SkinId): SkinDef;
}
