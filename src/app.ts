/* ═══════════════════════════════════════════════════════════
   app.ts — Canvas 真 TUI 应用驱动（状态 / 交互 / 帧循环）
   ───────────────────────────────────────────────────────────
   职责：
   - 持有全部应用状态（屏幕、会话、面板、参数、宠物）
   - 把键盘 / 鼠标 / 滚轮事件映射到 UI 命中与字符坐标
   - 驱动帧循环（宠物动画 tick、流式输出、UI.drawAll）
   - 隐藏输入框（IME / 粘贴）与画布光标同步
   ═══════════════════════════════════════════════════════════ */
import type {
  ActionDef, AppApi, AppState, CommandDef, Hit, PanelTab,
  ParamSeg, Post, Session, SessionGroup, SkinDef, Theme, ThemeName,
} from './types.ts';
import { TUI } from './tui-core.ts';
import { UI } from './tui-ui.ts';
import { PetKit } from './pet.ts';
import { POSTS, BLOG_TITLE } from './data/posts.ts';

const now = (): number => Date.now();

// ── 主题 ───────────────────────────────────────────────────
const THEMES: Record<ThemeName, Theme> = {
  dark: {
    bg: '#2A2F34', panel: '#252A2F', panel2: '#1E2327', border: '#3B4249',
    fg: '#B0B0B0', dim: '#7C8389', accent: '#7EC8E3', accentDim: '#3E6E85',
    accentShimmer: '#A8DCEE', pale: '#D9EFFA', flash: '#E8F7FF',
    suggestion: '#ABC2EC', autoAccept: '#B3A0D4', warning: '#D8B270',
    green: '#8BC98F', yellow: '#D8B270', red: '#E06C75', purple: '#B3A0D4',
    cyan: '#7EC8E3', blue: '#7EC8E3', white: '#E8E6E0',
    statusBg: '#1C2125', thinkBg: 'rgba(90,124,255,0.10)',
    ctxBar: ['#2E4A5E', '#3B6178', '#487791', '#568EA9', '#7EC8E3'],
  },
  light: {
    bg: '#f4f6fb', panel: '#eceff7', panel2: '#dfe5f0', border: '#c3cbdb',
    fg: '#242b3d', dim: '#78839b', accent: '#3d6bd4', accentDim: '#a9bdee',
    accentShimmer: '#7fa0e6', pale: '#2f4a8a', flash: '#9fbcf5',
    suggestion: '#3d6bd4', autoAccept: '#7b5aa8', warning: '#a97a12',
    green: '#1e8e5a', yellow: '#a97a12', red: '#c2393a', purple: '#7b5aa8',
    cyan: '#1f8495', blue: '#3a5bd9', white: '#141a28',
    statusBg: '#e4e9f4', thinkBg: 'rgba(61,107,212,0.08)',
    ctxBar: ['#d9e2f8', '#c2d0f3', '#a6bcec', '#89a8e5', '#6c94df'],
  },
};

const MODELS: readonly string[] = ['deepseek-v4-flash', 'hy4-preview', 'deepseek-r1-flash', 'deepseek-v3.1'];
const MODEL_SHORT: Record<string, string> = {
  'deepseek-v4-flash': 'deepseek-flash',
  'hy4-preview': 'hy4-preview',
  'deepseek-r1-flash': 'r1-flash',
  'deepseek-v3.1': 'deepseek-v3',
};
const EFFORTS: readonly string[] = ['Max', 'High', 'Medium', 'Low', 'Off'];
const PRESETS: readonly string[] = ['standard', 'fast', 'deep'];
const PERMS: readonly string[] = ['工作区读写', '只读', '沙箱'];

// 形象名册（与 dsh-TUI 的角色资产一一对应）
const SKINS: SkinDef[] = [
  { id: 'whalegirl', label: '鲸娘 · 动画', kind: '原生像素帧', desc: '22 个动画 / 267 帧 · AVIF 精灵图' },
  { id: 'claude-girl', label: 'Claude 娘', kind: '原生像素帧', desc: '22 个动画 / 225 帧 · AVIF 精灵图' },
  { id: 'codex-girl', label: 'Codex 娘', kind: '原生像素帧', desc: '22 个动画 / 225 帧 · AVIF 精灵图' },
  { id: 'maid-girl', label: '鲸娘 · 女仆', kind: '高清立绘', desc: '464×464 · 点击换「开心」变体' },
  { id: 'whale-maid', label: '鲸娘 · 女仆 Q版', kind: '插画序列帧', desc: '22 个动画 / 384 帧 · 489×709' },
  { id: 'whale-maid-anime', label: '鲸娘 · 女仆 动画', kind: '插画序列帧', desc: '22 个动画 / 880 帧 · 540×540' },
  { id: 'whale-maid-plush', label: '鲸娘 · 女仆 毛绒', kind: '插画序列帧', desc: '22 个动画 / 348 帧 · 630×819' },
];

const TIPS: readonly string[] = [
  '第一次用 dsh-TUI？花一分钟跑一遍引导，把 API Key、语言、主题、模型一次配好。',
  'Tab 切换 NORMAL / INSERT，Esc 关闭弹层，⌘K 打开命令菜单。',
  '⌘B 切换右侧面板，⌘T / ⌘R 打开文章列表 / 当前大纲。',
  '点一下宠物随机换一个动作，连点三下会 tickle。',
  '输入 / 开头可以看命令提示；Shift+Enter 换行由浏览器保留。',
];

function skinMeta(id: string): SkinDef {
  return SKINS.find(s => s.id === id) ?? SKINS[0] as SkinDef;
}

function shortModel(): string {
  return MODEL_SHORT[state.model] ?? state.model;
}

// ── 状态 ───────────────────────────────────────────────────
let seq = 0;

const state: AppState = {
  screen: 'launchpad',
  overlay: null,
  theme: 'dark',
  skin: 'whalegirl',
  skinSel: 0,
  model: MODELS[0] ?? 'deepseek-v4-flash',
  temperature: 0.7, topP: 0.9, maxTokens: 8192, budget: 10, web: false,

  panelOpen: true,
  panelCols: 0,
  panelResizeHover: false,
  hoverId: null,
  skinHover: -1,
  panelTabs: [
    { id: 'companion', label: '宠物' }, { id: 'posts', label: '文章' }, { id: 'outline', label: '大纲' },
  ] satisfies PanelTab[],
  panelTab: 'companion',
  postsTop: 0,

  groups: [],
  sessions: {},
  session: null,
  lastSessionTitle: '上次会话',

  streaming: false,
  streamSessionId: null,
  streamAcc: '',
  streamReply: '',
  streamCursor: 0,
  streamingEnabled: true,
  autoScroll: true,
  cursorBlink: true,
  cursorOn: true,

  inputPrompt: '› ',
  inputText: '',
  caret: 0,
  focusInput: true,
  mode: 'insert',

  scroll: 0,
  userScrolled: false,

  contextFrac: 0.24,
  ctxChips: [
    { label: '12.8k/128k', fg: '#6fc2d0' },
    { label: 'web on', fg: '#7fd6a2' },
    { label: 'tools 4', fg: '#e8c46a' },
  ],

  commands: [],
  cmdFilter: '',
  cmdSel: 0,
  slashSel: 0,
  paramSel: 0,

  launchTitle: 'dsh-TUI',
  showPet: true,

  petMood: 'idle',
  petOffset: { x: 0, y: 0 },
  petDragging: false,
  petHover: false,
  petCelebrateUntil: 0,
  launchFocus: true,
  cwd: '~/Projects/dsh-blog',
  branch: 'main',
  paramRow: [
    { id: 'model', label: 'deepseek-flash' },
    { id: 'effort', label: 'Max' },
    { id: 'preset', label: 'standard' },
    { id: 'permission', label: '工作区读写' },
  ] satisfies ParamSeg[],
  actions: [
    { id: 'sessions', label: '会话与工作区' },
    { id: 'settings', label: '设置' },
    { id: 'kernel', label: '内核 · DSH' },
    { id: 'help', label: '帮助' },
  ] satisfies ActionDef[],
  paramHover: null,
  actionHover: null,
  sessionSel: 0,
  kernelName: 'dsh-core',
  tip: TIPS[0] ?? '',
};

let pet = PetKit.create(state.skin);
let hits: Hit[] = [];
let lastActivity = now();
let tipIdx = 0;
let tipAt = now();
let caretCell: { col: number; row: number } | null = null;
let blinkAt = now();

// ── 命令表 ─────────────────────────────────────────────────
const COMMANDS: CommandDef[] = [
  { id: 'newchat', label: '＋ 新对话', key: '⌘N', desc: '从空白会话开始', action: 'newchat' },
  { id: 'continue', label: '▷ 继续最近', key: '⌘J', desc: '恢复上次会话', action: 'continue' },
  { id: 'sessions-workspace', label: '◫ 会话与工作区', key: '', desc: '会话名册 / 工作区', action: 'sessions' },
  { id: 'cmdmenu', label: '⌘ 命令菜单', key: '⌘K', desc: '所有快捷指令', action: 'cmdmenu' },
  { id: 'help', label: '? 快捷键帮助', key: '?', desc: '查看按键说明', action: 'help' },
  { id: 'settings', label: '⚙ 打开设置', key: '⌘,', desc: '主题 / 宠物 / 偏好', action: 'settings' },
  { id: 'panel-companion', label: '♥ 侧栏 · 宠物', key: '⌘B', desc: '侧栏宠物 / 戳一戳', action: 'panel:companion' },
  { id: 'panel-posts', label: '☰ 侧栏 · 文章列表', key: '⌘T', desc: '全部文章', action: 'panel:posts' },
  { id: 'panel-outline', label: '≡ 侧栏 · 当前大纲', key: '⌘R', desc: '当前文章标题树', action: 'panel:outline' },
  { id: 'param', label: '⚙ 参数行', key: '⌘P', desc: '调整模型参数', action: 'param' },
  { id: 'theme', label: '◐ 切换主题', key: '', desc: '深色 / 浅色', action: 'theme' },
  { id: 'skin', label: '✿ 切换宠物形象', key: '', desc: '鲸娘 / Claude 娘 / Codex 娘 / 女仆鲸娘', action: 'skin-picker' },
  { id: 'model', label: '◎ 切换模型', key: '', desc: '循环默认模型', action: 'model' },
  { id: 'streaming', label: '⇶ 流式输出', key: '', desc: '开 / 关', action: 'tog-streaming' },
  { id: 'autoscroll', label: '⇣ 自动滚动', key: '', desc: '开 / 关', action: 'tog-autoscroll' },
  { id: 'pet', label: '✋ 宠物互动', key: '', desc: 'poke / tickle', action: 'pet' },
  { id: 'clear-sessions', label: '✕ 清除全部会话', key: '', desc: '删除演示会话', action: 'clear-sessions' },
  { id: 'fullscreen', label: '⛶ 全屏', key: 'F11', desc: '切换浏览器全屏', action: 'fullscreen' },
];

// ── 工具函数 ───────────────────────────────────────────────
function dateLabel(t: number | Date): string {
  const d = t instanceof Date ? t : new Date(t);
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function applyTheme(name: ThemeName): void {
  state.theme = name;
  const t = THEMES[name];
  Object.assign(TUI.THEME, t);
  TUI.THEME.ctxBar = [...t.ctxBar];
  TUI.requestPaint();
}

function setScreen(s: AppState['screen']): void {
  state.screen = s;
  state.overlay = null;
  if (s === 'chat') { state.focusInput = true; setMode('insert'); }
  if (s === 'launchpad') state.launchFocus = true;
  lastActivity = now();
}

function setMode(m: AppState['mode']): void { state.mode = m; }
function toggleMode(): void { state.mode = state.mode === 'insert' ? 'normal' : 'insert'; }

function deactivateAll(): void {
  for (const g of state.groups) for (const s of g.sessions) s.active = false;
}

// ── 文章深链：/<中文标题> → 直接打开对应会话 ───────────────
/** popstate 应用期间暂停写 URL，避免历史记录抖动。 */
let routing = false;

function slugFromLocation(): string | null {
  const p = new URLSearchParams(location.search).get('p');
  if (p !== null && p !== '') return p;
  const path = location.pathname.replace(/^\/+|\/+$/g, '');
  if (path === '' || path === 'index.html') return null;
  try { return decodeURIComponent(path); } catch { return path; }
}

function postBySlug(slug: string): Post | undefined {
  return POSTS.find(p => p.slug === slug);
}

/** 会话对应的地址：文章 → /<slug>，其它 → /。 */
function urlForSession(id: string): string {
  const post = POSTS.find(p => p.id === id);
  return post === undefined ? '/' : '/' + encodeURIComponent(post.slug);
}

function syncUrl(id: string, push: boolean): void {
  if (routing) return;
  const url = urlForSession(id);
  if (location.pathname === url && location.search === '') return;
  if (push) window.history.pushState(null, '', url);
  else window.history.replaceState(null, '', url);
}

function switchSession(id: string): void {
  const s = state.sessions[id];
  if (s === undefined) return;
  deactivateAll();
  for (const g of state.groups) {
    const found = g.sessions.find(x => x.id === id);
    if (found !== undefined) { found.active = true; break; }
  }
  state.session = s;
  state.lastSessionTitle = s.title;
  state.scroll = 0;
  // 文章会话从正文顶部开始读，不跟着聊天自动滚到底
  state.userScrolled = id.startsWith('post-');
  state.streaming = false;
  syncUrl(id, true);
}

function allSessionIds(): string[] {
  const ids: string[] = [];
  for (const g of state.groups) for (const s of g.sessions) ids.push(s.id);
  return ids;
}

// ── 种子会话（演示数据）────────────────────────────────────
function buildSeed(): void {
  const D = new Date();
  const today = new Date(D.getTime() - 1000 * 60 * 18);
  const today2 = new Date(D.getTime() - 1000 * 60 * 60 * 5);
  const yest = new Date(D.getTime() - 1000 * 60 * 60 * 26);

  const s1: Session = {
    id: 's1', title: 'Canvas 真 TUI 重构', time: today, messages: [
      { type: 'system', content: `会话已恢复 · ${dateLabel(today)}` },
      { type: 'user', content: '把 dsh-blog 重写成 Canvas 真 TUI，保留全部 UI 与交互，并把所有像素宠物都搬进来。' },
      { type: 'think', content: '目标拆解：\n1) 渲染架构：字符网格 buffer + 半块像素精灵，Canvas 逐帧绘制\n2) 宠物盘点：whaleGirl 精灵图 + 女仆系列插画，全部打包为 script 数据\n3) 交互映射：键盘 / 鼠标命中分发到 UI action', open: true, id: 't1' },
      { type: 'tool', tool: { name: 'read_file', status: 'done', statusText: 'tui-core.ts 441 行', body: '像素层 / 字符网格双轨确认\nCOLS / ROWS 自适应，全角字符占宽' } },
      { type: 'assistant', content: '## 渲染架构设计\n\nCanvas 唯一渲染载体，所有界面元素逐帧绘制：\n\n- **字符网格 buffer**：每个单元存 `{ch, fg, bg, st}`\n- **布局系统**：head / main / composer / status\n- **命中系统**：每帧把可点击区 push 到 `_hits`，鼠标按字符坐标分发\n\n```ts\nTUI.rich(x, y, tokens, fg);          // 富文本排版\nPixelLayer.cells(x, y, cw, ch, rows, palette); // 真像素精灵\n```\n\n> 关键：全部像素宠物共用 `PetKit` 引擎，按 `MOOD_ANIM` 状态机播放。\n\n| 区域 | 职责 |\n|---|---|\n| 顶栏 | 标题 / 模型 / 按钮 |\n| 主区 | 流式 Markdown |\n| 面板 | 宠物 / 文章 / 大纲 |' },
      { type: 'usage', content: 'context: 12.8k/128k tokens' },
    ],
  };
  const s2: Session = {
    id: 's2', title: 'Mermaid 流程图方案', time: today2, messages: [
      { type: 'system', content: `会话已恢复 · ${dateLabel(today2)}` },
      { type: 'user', content: '给渲染架构画个流程图，并解释公式含义。' },
      { type: 'assistant', content: '## 架构流程图\n\n```mermaid\ngraph TD\n  A[输入事件] --> B[状态更新]\n  B --> C[Canvas 逐帧绘制]\n  C --> D[上屏]\n  D --> A\n```\n\n公式：$E = mc^2$，逐帧开销 $O(COLS \\times ROWS)$。' },
      { type: 'tool', tool: { name: 'markdown', status: 'done', statusText: 'mermaid 分支', body: '简化渲染：节点/边按行绘制' } },
      { type: 'assistant', content: '## 边界情况\n\n- 代码块嵌套反引号：` `` ` 需转义\n- Mermaid 分支必须先于通用代码块匹配\n- 全角字符按 2 列宽计算\n\n```diff\n+ 新增 diff 渲染支持\n- 移除 DOM 拼装逻辑\n```' },
    ],
  };
  const s3: Session = {
    id: 's3', title: 'TUI 主题配色讨论', time: yest, messages: [
      { type: 'system', content: `会话已恢复 · ${dateLabel(yest)}` },
      { type: 'user', content: '主题配色怎么定？' },
      { type: 'assistant', content: '## 配色方案\n\n沿用 dsh-TUI `theme.ts`：\n\n> dark 雾蓝 accent `#7DA1DE`，上下文条 5 段蓝阶 `#22305F → #5A7CFF`\n\n列表：\n1. 背景 `#0d1017`\n2. 面板 `#11141d`\n3. 边框 `#262c3d`\n\n---\n\n| 令牌 | 深色 | 浅色 |\n|---|---|---|\n| accent | #7DA1DE | #3D6BD4 |\n| bg | #0D1017 | #F4F6FB |' },
      { type: 'usage', content: 'context: 8.1k/128k tokens' },
    ],
  };

  state.sessions = { s1, s2, s3 };
  state.groups = [
    { name: '今天', sessions: [{ id: 's1', title: s1.title, active: true }, { id: 's2', title: s2.title, active: false }] },
    { name: '昨天', sessions: [{ id: 's3', title: s3.title, active: false }] },
  ];
  seedPosts();
  state.session = s1;
  state.lastSessionTitle = s1.title;
  state.commands = COMMANDS.slice();
  seq = 3;
}

/** 把书签文章灌成会话：点击就是普通的 TUI 对话（正文走 assistant 消息渲染）。 */
function seedPosts(): void {
  if (POSTS.length === 0) return;
  const group: SessionGroup = { name: BLOG_TITLE, sessions: [] };
  for (const p of POSTS) {
    const id = p.id;
    state.sessions[id] = {
      id,
      title: p.title,
      time: p.date !== '' ? new Date(p.date + 'T00:00:00') : new Date(),
      messages: [
        { type: 'system', content: '收录于 ' + (p.date || '未记录') + ' · ' + BLOG_TITLE },
        // 正文首行是重复的「# 标题」，顶栏已经显示，去掉
        { type: 'assistant', content: p.body.replace(/^#\s+.*\n+/, '') },
      ],
    };
    group.sessions.push({ id, title: p.title, active: false });
  }
  state.groups.push(group);
}

// ── 流式模拟 ───────────────────────────────────────────────
const REPLY_POOL: readonly string[] = [
  '## 完成情况\n\nCanvas 真 TUI 架构已落地：\n\n- 帧循环 + 输入映射 + 布局系统全部就绪\n- 6 个像素形象完整移植\n\n```ts\n// 宠物统一驱动\npet.renderTo(PixelLayer, x, y, w, h);\n```\n\n> 浏览器直接打开 index.html 即可运行。',
  '## 宠物清单\n\n盘点 dsh-TUI 全部像素角色：\n\n1. **鲸娘 · 动画** — 22 个动画（原生像素帧）\n2. **Claude 娘 / Codex 娘** — 原生像素帧精灵图\n3. **鲸娘 · 女仆** — 高清立绘 / 插画序列帧\n\n| 皮肤 | 数据源 |\n|---|---|\n| whalegirl | assets/whalegirl |\n| portraits | assets/portraits |',
  '## 交互提示\n\n- 点击启动页立绘可互动（poke / happy）\n- ⌘K 打开命令菜单，⌘B / ⌘P 切换面板与参数\n- 设置页可切换 6 个形象\n\n```\nNORMAL / INSERT 模式\nTab 切换 · Enter 发送\n```',
  '## 后续建议\n\n已满足核心要求，可继续扩展：\n\n- [x] 全部形象移植\n- [x] Canvas 逐帧渲染\n- [ ] 真实模型接入\n- [ ] 会话持久化',
];

function pickReply(): string {
  return REPLY_POOL[Math.floor(Math.random() * REPLY_POOL.length)] ?? '';
}

function startStream(s: Session): void {
  state.streamReply = pickReply();
  state.streamCursor = 0;
  state.streamAcc = '';
  state.streaming = true;
  state.streamSessionId = s.id;
  s.messages.push({ type: 'assistant', content: '' });
  lastActivity = now();
}

function streamTick(dt: number): void {
  if (!state.streaming) return;
  const n = Math.max(1, Math.floor(dt / 16));
  let take = 0;
  while (take < n && state.streamCursor < state.streamReply.length) {
    state.streamAcc += state.streamReply[state.streamCursor] ?? '';
    state.streamCursor++;
    take++;
  }
  if (state.streamCursor >= state.streamReply.length) {
    const s = state.streamSessionId === null ? null : (state.sessions[state.streamSessionId] ?? null);
    if (s !== null) {
      const last = s.messages[s.messages.length - 1];
      if (last !== undefined && last.type === 'assistant') last.content = state.streamAcc;
      s.messages.push({ type: 'usage', content: `context: ${Math.round((8 + Math.random() * 6) * 10) / 10}k/128k tokens` });
    }
    state.streaming = false;
    state.streamSessionId = null;
    state.streamAcc = '';
    state.petCelebrateUntil = now() + 2500;
    lastActivity = now();
  } else if (state.autoScroll && !state.userScrolled) {
    state.scroll = 999999;
  }
}

// ── 会话操作 ───────────────────────────────────────────────
function newChat(): void {
  if (state.streaming) return;
  seq++;
  const id = `s${seq}`;
  const s: Session = {
    id,
    title: '新的对话',
    time: new Date(),
    messages: [{ type: 'system', content: `新会话已创建 · ${dateLabel(new Date())}` }],
  };
  state.sessions[id] = s;
  deactivateAll();
  if (state.groups.length === 0) state.groups.push({ name: '今天', sessions: [] });
  state.groups[0]?.sessions.unshift({ id, title: s.title, active: true });
  state.session = s;
  state.lastSessionTitle = s.title;
  setScreen('chat');
  state.scroll = 0;
  state.userScrolled = false;
  state.inputText = '';
  state.caret = 0;
  lastActivity = now();
}

function continueLast(): void {
  const ids = allSessionIds();
  const last = ids[ids.length - 1];
  if (last === undefined) { newChat(); return; }
  switchSession(last);
  setScreen('chat');
}

function clearSessions(): void {
  state.sessions = {};
  state.groups = [];
  state.session = null;
  newChat();
}

function resetCompanion(): void {
  state.petOffset.x = 0;
  state.petOffset.y = 0;
  state.petDragging = false;
  state.petHover = false;
  state.panelResizeHover = false;
  dragBase = null;
  pet.hold(false);
}

function togglePanel(tab?: string): void {
  if (tab === undefined) { state.panelOpen = !state.panelOpen; if (!state.panelOpen) resetCompanion(); return; }
  // 点当前 tab 不收起侧栏（只切页；收起走 ⌘B）
  if (state.panelOpen && state.panelTab === tab) return;
  state.panelOpen = true;
  state.panelTab = tab;
  if (tab !== 'companion') resetCompanion();
  if (tab === 'posts') {
    const idx = state.session === null ? -1 : POSTS.findIndex(p => p.id === state.session?.id);
    state.postsTop = idx >= 0 ? Math.max(0, idx - 2) : 0;
  }
}

function toggleOverlay(ov: AppState['overlay']): void {
  state.overlay = state.overlay === ov ? null : ov;
}

function cycleTheme(): void {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
}

function applySkin(id: string): void {
  if (!SKINS.some(s => s.id === id)) return;
  state.skin = id;
  try { localStorage.setItem('dsh-tui.skin', id); } catch { /* 忽略 */ }
  pet = PetKit.create(id);
  PetKit.warm(id);
  PetKit.prefetch(id);
  lastActivity = now();
}

function cycleSkin(): void {
  const i = SKINS.findIndex(s => s.id === state.skin);
  const next = SKINS[(i + 1) % SKINS.length];
  if (next !== undefined) applySkin(next.id);
}

function openSkinPicker(): void {
  state.overlay = 'skin';
  state.skinHover = -1;
  state.skinSel = Math.max(0, SKINS.findIndex(s => s.id === state.skin));
  const cur = SKINS[state.skinSel];
  if (cur !== undefined) PetKit.warm(cur.id);
}

function cycleModel(): void {
  const i = MODELS.indexOf(state.model);
  state.model = MODELS[(i + 1) % MODELS.length] ?? state.model;
  syncParamRow();
}

function syncParamRow(): void {
  const seg = state.paramRow[0];
  if (seg !== undefined) seg.label = shortModel();
}

function cycleCycle(list: readonly string[], index: number): string {
  const cur = state.paramRow[index]?.label ?? '';
  const i = list.indexOf(cur);
  return list[(i + 1) % list.length] ?? cur;
}

function cycleEffort(): void {
  const seg = state.paramRow[1];
  if (seg !== undefined) seg.label = cycleCycle(EFFORTS, 1);
}
function cyclePreset(): void {
  const seg = state.paramRow[2];
  if (seg !== undefined) seg.label = cycleCycle(PRESETS, 2);
}
function cyclePermission(): void {
  const seg = state.paramRow[3];
  if (seg !== undefined) seg.label = cycleCycle(PERMS, 3);
}

function petInteract(): void {
  const g = UI.launchGeom();
  const col = TUI.Input.lastMouse.col >= 0 ? TUI.Input.lastMouse.col : 0;
  const frac = g.art.w > 0 ? (col - g.art.x) / g.art.w : 0.5;
  pet.click(Math.max(0, Math.min(1, frac)));
  lastActivity = now();
}

function rotateTip(): void {
  tipIdx = (tipIdx + 1) % TIPS.length;
  state.tip = TIPS[tipIdx] ?? '';
  tipAt = now();
}

function toggleThink(id: string): void {
  const s = state.session;
  if (s === null) return;
  for (const m of s.messages) {
    if (m.type === 'think' && m.id === id) { m.open = !m.open; break; }
  }
}

function paramAdjust(name: string): void {
  if (name === 'model') cycleModel();
  else if (name === 'temperature') state.temperature = state.temperature >= 1 ? 0.1 : Math.min(1, Math.round((state.temperature + 0.1) * 10) / 10);
  else if (name === 'top_p') state.topP = state.topP >= 0.9 ? 0.1 : Math.round((state.topP + 0.1) * 10) / 10;
  else if (name === 'max_tokens') state.maxTokens = state.maxTokens >= 32768 ? 1024 : state.maxTokens * 2;
  else if (name === 'budget') state.budget = state.budget >= 200 ? 5 : state.budget + 5;
  else if (name === 'web') state.web = !state.web;
}

function runCommand(id: string): void {
  const c = COMMANDS.find(x => x.id === id);
  if (c !== undefined) dispatch(c.action);
}

// ── Action 分发（鼠标命中 / 命令共用）────────────────────
function dispatch(action: string | null): void {
  if (action === null || action === '') return;
  const head = action.split(':')[0] ?? '';
  const rest = action.includes(':') ? action.slice(action.indexOf(':') + 1) : '';
  switch (head) {
    case 'switch': switchSession(rest); state.overlay = null; setScreen('chat'); return;
    case 'panel': togglePanel(rest); return;
    case 'think': toggleThink(rest); return;
    case 'poptune': paramAdjust(rest); return;
    case 'outline': {
      const row = Number(rest);
      if (Number.isFinite(row)) { state.scroll = Math.max(0, row); state.userScrolled = true; }
      return;
    }
    case 'cmd': runCommand(rest); return;
    case 'skinsel': applySkin(rest); state.overlay = null; return;
    default: break;
  }
  switch (action) {
    case 'newchat': newChat(); break;
    case 'continue': continueLast(); break;
    case 'settings': setScreen('settings'); break;
    case 'back-chat': setScreen('chat'); break;
    case 'cmdmenu': toggleOverlay('cmdmenu'); state.cmdFilter = ''; state.cmdSel = 0; break;
    case 'menu': toggleOverlay('cmdmenu'); state.cmdFilter = ''; state.cmdSel = 0; break;
    case 'help': toggleOverlay('help'); break;
    case 'help-close': state.overlay = null; break;
    case 'fullscreen': toggleFullscreen(); break;
    case 'pet': petInteract(); break;
    case 'splashpet': petInteract(); break;
    case 'composer': state.focusInput = true; setMode('insert'); break;
    case 'launch-input': state.launchFocus = true; state.focusInput = true; setMode('insert'); break;
    case 'launch-cwd': toggleOverlay('cwd'); break;
    case 'launch-kernel': toggleOverlay('kernel'); break;
    case 'param-model': cycleModel(); break;
    case 'param-effort': cycleEffort(); break;
    case 'param-preset': cyclePreset(); break;
    case 'param-permission': cyclePermission(); break;
    case 'action-sessions': toggleOverlay('sessions'); state.sessionSel = 0; break;
    case 'action-settings': setScreen('settings'); break;
    case 'action-kernel': toggleOverlay('kernel'); break;
    case 'action-help': toggleOverlay('help'); break;
    case 'sessions': toggleOverlay('sessions'); state.sessionSel = 0; break;
    case 'theme': cycleTheme(); break;
    case 'skin': cycleSkin(); break;
    case 'skin-picker': openSkinPicker(); break;
    case 'skinpreview': {
      const idx = state.skinHover >= 0 ? state.skinHover : state.skinSel;
      const s = SKINS[idx];
      if (s !== undefined) PetKit.previewClick(s.id, 0.5);
      break;
    }
    case 'model': cycleModel(); break;
    case 'tips': rotateTip(); break;
    case 'panel-close': state.panelOpen = false; break;
    case 'tog-streaming': state.streamingEnabled = !state.streamingEnabled; break;
    case 'tog-autoscroll': state.autoScroll = !state.autoScroll; break;
    case 'tog-cursor': state.cursorBlink = !state.cursorBlink; state.cursorOn = true; break;
    case 'slider-temp': paramAdjust('temperature'); break;
    case 'clear-sessions': clearSessions(); break;
    case 'param': toggleOverlay('param'); state.paramSel = 0; break;
    case 'ob-dark': applyTheme('dark'); markOnboarded(); setScreen('launchpad'); break;
    case 'ob-light': applyTheme('light'); markOnboarded(); setScreen('launchpad'); break;
    case 'theme-dark': applyTheme('dark'); break;
    case 'theme-light': applyTheme('light'); break;
    default: break;
  }
}

function toggleFullscreen(): void {
  if (document.fullscreenElement !== null) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen();
}

// ── 隐藏输入框（IME / 粘贴）────────────────────────────────
let ime: HTMLTextAreaElement | null = null;
let composing = false;

function setupIme(): void {
  const el = document.createElement('textarea');
  el.id = 'tui-ime';
  el.setAttribute('autocomplete', 'off');
  el.setAttribute('autocorrect', 'off');
  el.setAttribute('autocapitalize', 'off');
  el.setAttribute('spellcheck', 'false');
  el.setAttribute('aria-label', 'input');
  const st = el.style;
  st.position = 'fixed'; st.left = '0'; st.top = '0';
  st.width = '1px'; st.height = '1px';
  st.opacity = '0'; st.border = '0'; st.padding = '0'; st.margin = '0';
  st.resize = 'none'; st.overflow = 'hidden'; st.zIndex = '30';
  st.background = 'transparent'; st.color = 'transparent';
  st.caretColor = 'transparent'; st.fontSize = '16px'; st.lineHeight = '1';
  st.whiteSpace = 'pre'; st.overflowWrap = 'normal';
  document.body.appendChild(el);
  ime = el;
  el.addEventListener('compositionstart', () => { composing = true; });
  el.addEventListener('compositionend', (e: CompositionEvent) => {
    composing = false;
    if (e.data) insertText(e.data);
    el.value = '';
  });
  el.addEventListener('input', () => {
    if (composing) return;
    const v = el.value;
    el.value = '';
    if (v) insertText(v);
  });
  focusIme();
}

function focusIme(): void {
  if (ime === null) return;
  try { ime.focus({ preventScroll: true }); } catch { ime.focus(); }
}

function positionIme(): void {
  if (ime === null || caretCell === null) return;
  const x = Math.round(caretCell.col * TUI.cw);
  const y = Math.round(caretCell.row * TUI.ch);
  if (ime.style.left !== `${x}px`) ime.style.left = `${x}px`;
  if (ime.style.top !== `${y}px`) ime.style.top = `${y}px`;
  if (ime.style.height !== `${TUI.ch}px`) ime.style.height = `${TUI.ch}px`;
}

function insertText(str: string): void {
  if (!str) return;
  if (state.overlay === 'cmdmenu') {
    state.cmdFilter += str;
    state.cmdSel = 0;
    return;
  }
  if (state.screen === 'launchpad' || state.screen === 'chat') {
    state.inputText = state.inputText.slice(0, state.caret) + str + state.inputText.slice(state.caret);
    state.caret += str.length;
    lastActivity = now();
    pet.setMood('thinking');
  }
}

// ── 输入：键盘 ─────────────────────────────────────────────
function slashMatches(): CommandDef[] {
  const raw = state.inputText;
  if (raw.charAt(0) !== '/') return [];
  const q = raw.slice(1).trim().toLowerCase();
  return state.commands.filter(c => !q || c.id.toLowerCase().includes(q) || c.label.toLowerCase().includes(q));
}

function filteredCommands(): CommandDef[] {
  const q = state.cmdFilter.toLowerCase();
  return state.commands.filter(c => !q || c.label.toLowerCase().includes(q) || c.id.includes(q));
}

function onKey(e: KeyboardEvent): void {
  const meta = e.metaKey || e.ctrlKey;
  const k = e.key;
  if (e.isComposing || k === 'Process') return;

  if (meta && k.toLowerCase() === 'k') { toggleOverlay('cmdmenu'); state.cmdFilter = ''; state.cmdSel = 0; e.preventDefault(); return; }
  if (meta && k === ',') { setScreen('settings'); e.preventDefault(); return; }
  if (meta && k.toLowerCase() === 'n') { newChat(); e.preventDefault(); return; }
  if (meta && k.toLowerCase() === 'j') { continueLast(); e.preventDefault(); return; }
  if (meta && k.toLowerCase() === 'b') { togglePanel(); e.preventDefault(); return; }
  if (meta && k.toLowerCase() === 'p') { toggleOverlay('param'); state.paramSel = 0; e.preventDefault(); return; }
  if (meta && k.toLowerCase() === 't') { togglePanel('posts'); e.preventDefault(); return; }
  if (meta && k.toLowerCase() === 'r') { togglePanel('outline'); e.preventDefault(); return; }
  if (meta && k.toLowerCase() === 'o') { setScreen('settings'); e.preventDefault(); return; }
  if (k === 'F11') { toggleFullscreen(); e.preventDefault(); return; }

  if (state.overlay === 'help') {
    if (k === 'Escape' || k === 'Enter') { state.overlay = null; e.preventDefault(); }
    return;
  }
  if (state.overlay === 'param') {
    if (k === 'Escape') { state.overlay = null; e.preventDefault(); return; }
    if (k === 'ArrowUp') { state.paramSel = Math.max(0, state.paramSel - 1); e.preventDefault(); return; }
    if (k === 'ArrowDown') { state.paramSel = Math.min(5, state.paramSel + 1); e.preventDefault(); return; }
    if (k === 'ArrowLeft' || k === 'ArrowRight') {
      const names = ['model', 'temperature', 'top_p', 'max_tokens', 'budget', 'web'];
      paramAdjust(names[state.paramSel] ?? 'model');
      e.preventDefault(); return;
    }
    if (k === 'Enter') { state.overlay = null; e.preventDefault(); return; }
    return;
  }
  if (state.overlay === 'cmdmenu') {
    if (k === 'Escape') { state.overlay = null; e.preventDefault(); return; }
    if (k === 'ArrowUp') { state.cmdSel = Math.max(0, state.cmdSel - 1); e.preventDefault(); return; }
    if (k === 'ArrowDown') { state.cmdSel++; e.preventDefault(); return; }
    if (k === 'Enter') {
      const list = filteredCommands();
      const c = list[Math.max(0, Math.min(state.cmdSel, list.length - 1))];
      if (c !== undefined) { state.overlay = null; dispatch(c.action); }
      e.preventDefault(); return;
    }
    if (k === 'Backspace') { state.cmdFilter = state.cmdFilter.slice(0, -1); state.cmdSel = 0; e.preventDefault(); return; }
    if (k.length === 1 && !meta) { state.cmdFilter += k; state.cmdSel = 0; e.preventDefault(); return; }
    return;
  }
  if (state.overlay === 'skin') {
    if (k === 'Escape') { state.overlay = null; e.preventDefault(); return; }
    if (k === 'ArrowUp') {
      state.skinHover = -1;
      state.skinSel = Math.max(0, state.skinSel - 1);
      const s = SKINS[state.skinSel];
      if (s !== undefined) PetKit.warm(s.id);
      e.preventDefault(); return;
    }
    if (k === 'ArrowDown') {
      state.skinHover = -1;
      state.skinSel = Math.min(SKINS.length - 1, state.skinSel + 1);
      const s = SKINS[state.skinSel];
      if (s !== undefined) PetKit.warm(s.id);
      e.preventDefault(); return;
    }
    if (k === 'Enter') {
      const s = SKINS[state.skinSel];
      if (s !== undefined) { applySkin(s.id); state.overlay = null; }
      e.preventDefault(); return;
    }
    return;
  }
  if (state.overlay === 'sessions') {
    if (k === 'Escape') { state.overlay = null; e.preventDefault(); return; }
    const last = Math.max(0, allSessionIds().length - 1);
    if (k === 'ArrowUp') { state.sessionSel = Math.max(0, state.sessionSel - 1); e.preventDefault(); return; }
    if (k === 'ArrowDown' || k === 'j') { state.sessionSel = Math.min(last, state.sessionSel + 1); e.preventDefault(); return; }
    if (k === 'k') { state.sessionSel = Math.max(0, state.sessionSel - 1); e.preventDefault(); return; }
    if (k === 'Home' || k === 'g') { state.sessionSel = 0; e.preventDefault(); return; }
    if (k === 'End' || k === 'G') { state.sessionSel = last; e.preventDefault(); return; }
    if (k === 'PageUp') { state.sessionSel = Math.max(0, state.sessionSel - 10); e.preventDefault(); return; }
    if (k === 'PageDown') { state.sessionSel = Math.min(last, state.sessionSel + 10); e.preventDefault(); return; }
    if (k === 'Enter') {
      const id = allSessionIds()[state.sessionSel];
      if (id !== undefined) { switchSession(id); state.overlay = null; setScreen('chat'); }
      e.preventDefault(); return;
    }
    return;
  }
  if (state.overlay === 'kernel' || state.overlay === 'cwd') {
    if (k === 'Escape' || k === 'Enter') { state.overlay = null; e.preventDefault(); }
    return;
  }

  if (state.screen === 'onboarding') {
    if (k === 'Enter') { applyTheme('dark'); markOnboarded(); setScreen('launchpad'); e.preventDefault(); }
    if (k === 'Escape') { applyTheme('light'); markOnboarded(); setScreen('launchpad'); e.preventDefault(); }
    return;
  }
  if (state.screen === 'launchpad') {
    if (k === 'Enter') {
      if (state.inputText.trim()) launchSend();
      else setScreen('chat');
      e.preventDefault();
      return;
    }
    if (k === 'Escape') { state.inputText = ''; state.caret = 0; e.preventDefault(); return; }
    if (k === 'Backspace') { backspace(); e.preventDefault(); return; }
    if (k === 'Delete') { deleteForward(); e.preventDefault(); return; }
    if (k === 'ArrowLeft') { moveCaret(-1); e.preventDefault(); return; }
    if (k === 'ArrowRight') { moveCaret(1); e.preventDefault(); return; }
    if (k === 'Home') { state.caret = 0; e.preventDefault(); return; }
    if (k === 'End') { state.caret = state.inputText.length; e.preventDefault(); return; }
    if (k.length === 1 && !meta) { insertChar(k); e.preventDefault(); return; }
    return;
  }
  if (state.screen === 'settings') {
    if (k === 'Escape' || k === 'Enter') { setScreen('chat'); e.preventDefault(); }
    return;
  }
  // chat 屏
  if (k === 'Escape') {
    if (slashMatches().length > 0) { state.inputText = ''; state.caret = 0; state.slashSel = 0; }
    e.preventDefault(); return;
  }
  if (k === 'Tab') { e.preventDefault(); toggleMode(); return; }

  if (state.mode === 'insert') {
    if (k === 'Enter') {
      const slash = slashMatches();
      if (slash.length > 0 && state.inputText.charAt(0) === '/') {
        const c = slash[Math.max(0, Math.min(state.slashSel, slash.length - 1))];
        state.inputText = ''; state.caret = 0; state.slashSel = 0;
        if (c !== undefined) dispatch(c.action);
      } else {
        sendInput();
      }
      e.preventDefault(); return;
    }
    if (k === 'Backspace') { backspace(); e.preventDefault(); return; }
    if (k === 'Delete') { deleteForward(); e.preventDefault(); return; }
    if (k === 'ArrowLeft') { moveCaret(-1); e.preventDefault(); return; }
    if (k === 'ArrowRight') { moveCaret(1); e.preventDefault(); return; }
    if (k === 'ArrowUp') {
      if (slashMatches().length > 0) state.slashSel = Math.max(0, state.slashSel - 1);
      else historyBack();
      e.preventDefault(); return;
    }
    if (k === 'ArrowDown') {
      if (slashMatches().length > 0) state.slashSel = Math.min(slashMatches().length - 1, state.slashSel + 1);
      else historyForward();
      e.preventDefault(); return;
    }
    if (k === 'Home') { state.caret = 0; e.preventDefault(); return; }
    if (k === 'End') { state.caret = state.inputText.length; e.preventDefault(); return; }
    if (k.length === 1 && !meta) { insertChar(k); e.preventDefault(); return; }
  } else {
    if (k === 'Enter') { toggleMode(); e.preventDefault(); return; }
    if (k === 'i' || k === 'a') { setMode('insert'); e.preventDefault(); return; }
    if (k === '?') { toggleOverlay('help'); e.preventDefault(); return; }
    if (k === 'j') { scrollBy(1); e.preventDefault(); return; }
    if (k === 'k') { scrollBy(-1); e.preventDefault(); return; }
    if (k === 'g') { state.scroll = 0; state.userScrolled = true; e.preventDefault(); return; }
    if (k === 'G') { state.scroll = 999999; state.userScrolled = false; e.preventDefault(); return; }
  }
}

let history: string[] = [];
let histIdx = -1;

function insertChar(ch: string): void {
  state.inputText = state.inputText.slice(0, state.caret) + ch + state.inputText.slice(state.caret);
  state.caret++;
  lastActivity = now();
  pet.setMood('thinking');
}
function backspace(): void {
  if (state.caret <= 0) return;
  state.inputText = state.inputText.slice(0, state.caret - 1) + state.inputText.slice(state.caret);
  state.caret--;
  lastActivity = now();
}
function deleteForward(): void {
  if (state.caret >= state.inputText.length) return;
  state.inputText = state.inputText.slice(0, state.caret) + state.inputText.slice(state.caret + 1);
}
function moveCaret(d: number): void {
  state.caret = Math.max(0, Math.min(state.inputText.length, state.caret + d));
}
function historyBack(): void {
  if (history.length === 0) return;
  if (histIdx === -1) histIdx = 0;
  else histIdx = Math.min(history.length - 1, histIdx + 1);
  state.inputText = history[histIdx] ?? '';
  state.caret = state.inputText.length;
}
function historyForward(): void {
  if (histIdx === -1) return;
  histIdx--;
  state.inputText = histIdx < 0 ? '' : (history[histIdx] ?? '');
  state.caret = state.inputText.length;
}
function scrollBy(d: number): void {
  state.userScrolled = true;
  state.scroll = Math.max(0, state.scroll + d);
}

function launchSend(): void {
  const text = state.inputText.trim();
  if (!text) return;
  newChat();
  state.inputText = text;
  state.caret = text.length;
  sendInput();
  state.inputText = '';
  state.caret = 0;
  state.launchFocus = false;
}

function sendInput(): void {
  if (state.streaming || state.session === null) return;
  const text = state.inputText.trim();
  if (!text) return;
  const s = state.session;
  s.messages.push({ type: 'user', content: text });
  if (s.title === '新的对话') s.title = text.slice(0, 24);
  history.unshift(text);
  histIdx = -1;
  state.inputText = '';
  state.caret = 0;
  state.userScrolled = false;
  lastActivity = now();
  pet.setMood('thinking');
  startStream(s);
}

// ── 输入：鼠标 / 滚轮 ──────────────────────────────────────
interface DragBase { px: number; py: number; x: number; y: number }
let dragBase: DragBase | null = null;
/** 侧栏边界拖拽中。 */
let resizing = false;
/** 正在拖动正文滚动条。 */
let scrollDrag = false;

/** 滚动条拖拽：按指针在轨道里的位置映射到滚动行。 */
function applyScrollDrag(py: number): void {
  const info = UI.scrollInfo();
  if (info === null) return;
  const frac = Math.max(0, Math.min(1, (py - info.top) / Math.max(1, info.height)));
  state.scroll = Math.round(frac * info.max);
  state.userScrolled = true;
}

/** 侧栏调宽：边界跟手（col = 指针所在字符列，面板贴右）。 */
function applyPanelResize(col: number): void {
  const min = 22;
  const max = Math.max(min, Math.min(84, TUI.COLS - 50));
  state.panelCols = Math.max(min, Math.min(max, TUI.COLS - col));
}

function savePanelCols(): void {
  try { localStorage.setItem('dsh-tui.panelCols', String(state.panelCols)); } catch { /* 忽略 */ }
}

/** 侧栏宠物：按住 → 拖拽跟手（clamp 在面板内）；松手 → 交给帧循环弹回。 */
function startPetDrag(e: MouseEvent): void {
  dragBase = { px: e.clientX, py: e.clientY, x: state.petOffset.x, y: state.petOffset.y };
  state.petDragging = true;
  pet.hold(true);
  lastActivity = now();
}

function endPetDrag(e: MouseEvent, allowClick: boolean): void {
  const base = dragBase;
  if (base === null) return;
  dragBase = null;
  state.petDragging = false;
  pet.hold(false);
  lastActivity = now();
  if (!allowClick) return;
  const moved = Math.hypot(e.clientX - base.px, e.clientY - base.py);
  if (moved >= 8) return;
  const rect = UI.companionPetRect();
  const frac = rect !== null && rect.w > 0
    ? (e.clientX - (rect.x + base.x)) / rect.w
    : 0.5;
  pet.click(Math.max(0, Math.min(1, frac)));
}

function petHoverAt(px: number, py: number): boolean {
  const rect = UI.companionPetRect();
  if (rect === null) return false;
  const x = rect.x + state.petOffset.x;
  const y = rect.y + state.petOffset.y;
  return px >= x && px < x + rect.w && py >= y && py < y + rect.h;
}

function onDown(col: number, row: number, _btn: number, e: MouseEvent): void {
  focusIme();
  if (state.screen === 'chat' && state.overlay === null) state.focusInput = true;
  if (state.screen === 'launchpad' && state.overlay === null) state.launchFocus = true;
  for (let i = hits.length - 1; i >= 0; i--) {
    const h = hits[i];
    if (h === undefined) continue;
    if (col >= h.x && col < h.x + h.w && row >= h.y && row < h.y + h.h) {
      if (h.action !== null && h.action.startsWith('petside:')) { startPetDrag(e); return; }
      if (h.action === 'panelresize' && state.overlay === null) { resizing = true; applyPanelResize(col); return; }
      if (h.action === 'scroll-drag') { scrollDrag = true; applyScrollDrag(e.clientY); return; }
      dispatch(h.action);
      return;
    }
  }
  if (state.overlay !== null) { state.overlay = null; return; }
  if (state.screen === 'chat') setMode('insert');
}

function onMove(px: number, py: number): void {
  const cell = TUI.pxToCell(px, py);
  let ph: string | null = null;
  let ah: string | null = null;
  let overClickable = false;
  let overResize = false;
  let hoverId: string | null = null;
  for (const h of hits) {
    if (cell.col >= h.x && cell.col < h.x + h.w && cell.row >= h.y && cell.row < h.y + h.h) {
      if (h.id.startsWith('param:')) ph = h.id.slice(6);
      if (h.id.startsWith('action:')) ah = h.id.slice(7);
      if (h.id === 'panelresize') overResize = true;
      else if (h.action !== null) { overClickable = true; hoverId = h.id; }
    }
  }
  state.panelResizeHover = overResize && state.overlay === null;
  state.hoverId = state.panelResizeHover ? null : hoverId;
  if (hoverId !== null && hoverId.startsWith('skinsel:')) {
    const idx = SKINS.findIndex(s => `skinsel:${s.id}` === hoverId);
    if (idx >= 0 && idx !== state.skinHover) {
      state.skinHover = idx;
      const s = SKINS[idx];
      if (s !== undefined) PetKit.warm(s.id);
    }
  }
  if (resizing) applyPanelResize(cell.col);
  state.paramHover = ph;
  state.actionHover = ah;
  state.petHover = petHoverAt(px, py);
  if (dragBase !== null) {
    const lim = UI.companionLimits();
    const nx = dragBase.x + (px - dragBase.px);
    const ny = dragBase.y + (py - dragBase.py);
    state.petOffset.x = lim === null ? nx : Math.max(lim.minX, Math.min(lim.maxX, nx));
    state.petOffset.y = lim === null ? ny : Math.max(lim.minY, Math.min(lim.maxY, ny));
    lastActivity = now();
  }
  const grab = dragBase !== null;
  if (scrollDrag) applyScrollDrag(py);
  const resizeCursor = resizing || state.panelResizeHover;
  const scrollCursor = scrollDrag || state.hoverId === 'scrollbar';
  document.body.style.cursor = resizeCursor
    ? 'col-resize'
    : (scrollDrag ? 'grabbing' : (scrollCursor ? 'grab' : (grab ? 'grabbing' : (state.petHover ? 'grab' : (overClickable ? 'pointer' : 'text')))));
}

function onUp(_col: number, _row: number, _btn: number, e: MouseEvent): void {
  if (resizing) { resizing = false; savePanelCols(); return; }
  if (scrollDrag) { scrollDrag = false; return; }
  endPetDrag(e, true);
}

function onLeave(): void {
  state.petHover = false;
  state.panelResizeHover = false;
  state.hoverId = null;
  resizing = false;
  scrollDrag = false;
  if (dragBase !== null) {
    dragBase = null;
    state.petDragging = false;
    pet.hold(false);
  }
}

function onWheel(dy: number): void {
  if (state.overlay === 'sessions') {
    const n = allSessionIds().length;
    state.sessionSel = Math.max(0, Math.min(n - 1, state.sessionSel + (dy > 0 ? 1 : -1)));
    return;
  }
  if (state.overlay !== null) return;
  if (state.screen !== 'chat') return;
  // 指针在侧栏「文章」列表上时滚列表，不滚正文
  if (state.panelOpen && state.panelTab === 'posts') {
    const pr = UI.panelRect();
    const m = TUI.Input.lastMouse;
    if (pr !== null && m.x >= pr.x && m.x < pr.x + pr.w && m.y >= pr.y && m.y < pr.y + pr.h) {
      state.postsTop = Math.max(0, state.postsTop + (dy > 0 ? 1 : -1));
      return;
    }
  }
  const delta = dy > 0 ? 3 : -3;
  state.scroll = Math.max(0, state.scroll + delta);
  state.userScrolled = true;
}

// ── 宠物情绪驱动 ───────────────────────────────────────────
function updatePet(): void {
  const idleFor = now() - lastActivity;
  let mood: string;
  if (now() < state.petCelebrateUntil) mood = 'celebrate';
  else if (state.streaming) mood = 'typing';
  else if (state.petHover) mood = 'idle-look';
  else if (state.screen === 'launchpad') mood = 'idle';
  else if (state.screen === 'settings') mood = 'idle-look';
  else if (idleFor > 45000) mood = 'sleeping';
  else if (idleFor < 3000 && state.inputText.length === 0) mood = 'thinking';
  else mood = 'idle';
  state.petMood = mood;
  pet.setMood(mood);
}

function tickTips(): void {
  if (state.screen !== 'launchpad') return;
  if (now() - tipAt > 10000) rotateTip();
}

function tickCursor(dt: number): void {
  if (!state.cursorBlink) { state.cursorOn = true; return; }
  blinkAt += dt;
  if (blinkAt >= 550) { blinkAt = 0; state.cursorOn = !state.cursorOn; }
}

// ── 帧循环 ─────────────────────────────────────────────────
/** 松手后的回弹：指数收敛回 home（τ≈100ms，约 360ms 视觉归位）。 */
function tickPetOffset(dt: number): void {
  if (state.petDragging) return;
  const o = state.petOffset;
  if (o.x === 0 && o.y === 0) return;
  // 窗口尺寸变化后把位移夹回允许范围（侧栏内 / 整页浮动）
  const lim = UI.companionLimits();
  if (lim !== null) {
    o.x = Math.max(lim.minX, Math.min(lim.maxX, o.x));
    o.y = Math.max(lim.minY, Math.min(lim.maxY, o.y));
  }
  const k = 1 - Math.exp(-dt / 100);
  o.x += -o.x * k;
  o.y += -o.y * k;
  if (Math.abs(o.x) < 0.5) o.x = 0;
  if (Math.abs(o.y) < 0.5) o.y = 0;
}

let lastTs = 0;
function loop(ts: number): void {
  if (lastTs === 0) lastTs = ts;
  const dt = Math.min(64, ts - lastTs);
  lastTs = ts;
  hits = [];
  pet.tick(dt);
  tickPetOffset(dt);
  streamTick(dt);
  updatePet();
  tickTips();
  tickCursor(dt);
  UI.drawAll();
  positionIme();
  requestAnimationFrame(loop);
  // 前进/后退：按路径切换文章或回首页
  window.addEventListener('popstate', () => {
    routing = true;
    const slug = slugFromLocation();
    const post = slug === null ? undefined : postBySlug(slug);
    if (post !== undefined) {
      switchSession(post.id);
      state.screen = 'chat';
      state.overlay = null;
    } else {
      state.screen = 'launchpad';
      state.overlay = null;
    }
    routing = false;
  });
  // 首帧之后再静默预缓存宠物动画，避免跟首屏抢带宽
  setTimeout(() => PetKit.prefetch(state.skin), 800);
}

// ── 首启标记 ───────────────────────────────────────────────
function readOnboarded(): boolean {
  try { return localStorage.getItem('dsh-tui.onboarded') === '1'; } catch { return true; }
}
function markOnboarded(): void {
  try { localStorage.setItem('dsh-tui.onboarded', '1'); } catch { /* 忽略 */ }
}

// ── API（供 UI 读取）───────────────────────────────────────
const api: AppApi = {
  state,
  get pet(): typeof pet { return pet; },
  get _hits(): Hit[] { return hits; },
  dateLabel,
  allSessionIds,
  companionPetRect: () => UI.companionPetRect(),
  companionLimits: () => UI.companionLimits(),
  reportCaret(col: number, row: number): void { caretCell = { col, row }; },
  skins: SKINS,
  skinMeta,
};

// ── 启动 ───────────────────────────────────────────────────
export function start(canvas: HTMLCanvasElement): void {
  TUI.init(canvas);
  UI.setApp(api);
  applyTheme('dark');
  buildSeed();
  // 深链：/校园网络 或 /?p=校园网络（404.html 转发）直接进文章工作区
  const deepSlug = slugFromLocation();
  const deepPost = deepSlug === null ? undefined : postBySlug(deepSlug);
  if (deepPost !== undefined) {
    routing = true;
    switchSession(deepPost.id);
    routing = false;
    state.screen = 'chat';
    state.overlay = null;
    window.history.replaceState(null, '', '/' + encodeURIComponent(deepPost.slug));
  } else if (!readOnboarded()) {
    state.screen = 'onboarding';
  }
  try {
    const saved = localStorage.getItem('dsh-tui.skin');
    if (saved !== null && SKINS.some(s => s.id === saved)) state.skin = saved;
    const cols = Number(localStorage.getItem('dsh-tui.panelCols'));
    if (Number.isFinite(cols) && cols >= 22 && cols <= 200) state.panelCols = Math.round(cols);
  } catch { /* 忽略 */ }
  pet = PetKit.create(state.skin);
  PetKit.warm(state.skin);
  setupIme();
  TUI.Input.key = onKey;
  TUI.Input.keyUp = null;
  TUI.Input.down = onDown;
  TUI.Input.move = onMove;
  TUI.Input.up = onUp;
  TUI.Input.leave = onLeave;
  TUI.Input.wheel = onWheel;
  window.addEventListener('focus', focusIme);
  document.addEventListener('mousedown', (e: MouseEvent) => {
    const target = e.target;
    if (target instanceof HTMLElement && target.id === 'tui-ime') return;
    setTimeout(focusIme, 0);
  });
  requestAnimationFrame(loop);
}
