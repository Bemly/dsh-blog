# dsh-blog — dsh-TUI 的 Web 版「Canvas 真 TUI」

把 [`dsh-TUI`](../dsh-TUI) 的终端界面 1:1 搬到浏览器：**整屏只有一个 Canvas**，
所有 UI（顶栏 / 消息 / 面板 / 输入框 / 弹层 / 宠物）都按等宽字符网格逐帧绘制，
不使用 DOM 拼装界面。像素立绘与开屏大字另走一层 **真像素层**（设备像素对齐，
不受字体抗锯齿影响）。

技术栈：**TypeScript（strict）+ Bun**，不引入前端框架（React 对这种整屏 Canvas
渲染没有收益，只会多一层 reconciler）。开发时 Bun 现场转译 TS，构建时
`bun build` 打成单 chunk。

> 改代码 / 换素材前先看 [AGENTS.md](AGENTS.md)：提交推送规则、精灵图管线、验证清单都在那里。

## 运行

```bash
bun install        # 只装 typescript + @types/bun
bun run dev        # http://127.0.0.1:8899/
```

其它脚本：

```bash
bun run typecheck  # tsc --noEmit（strict，零告警）
bun run build      # index.html → dist/（含 assets 拷贝）
bun run preview    # 预览 dist/（http://127.0.0.1:8899/）
bun run check      # typecheck + build
```

> 因为入口是 ES module，`file://` 直接双击 `index.html` 不再可用（浏览器会拦
> module 的 CORS）。请用 `bun run dev` 或 `bun run preview`，或者把 `dist/` 丢给
> 任意静态服务器。

## 目录

```
index.html              入口：一块 canvas（字符网格）+ 一个 <script type="module">
serve.ts                开发服务器：Bun.serve + Bun.Transpiler 现场转译 .ts
build.ts                生产构建：Bun.build(index.html) + 拷贝 assets/
preview.ts              预览 dist/
tools/encode-sheet.ts   逐帧 WebP → AVIF 精灵图（ffmpeg + avifenc）
tsconfig.json           strict / noUnusedLocals / 等
src/
  main.ts               入口：找 #tui canvas → start()
  types.ts              全部共享类型（渲染单元 / 主题 / 状态 / 宠物 / Markdown）
  tui-core.ts           字符网格渲染内核：buffer / 绘制 / 输入 / 像素线条
  pixel-layer.ts        真像素层：设备像素对齐矩形 + 最近邻/高质量图片绘制
  tui-ui.ts             界面层：launchpad / chat / settings / 弹层 / 形象选择器
  app.ts                应用驱动：状态机 / 键鼠分发 / 帧循环 / IME / localStorage
  pet.ts                像素宠物引擎：原版素材 + 原版启动页交互
  markdown.ts           轻量 Markdown → 判别联合 Block[]（mermaid / LaTeX 简化）
  data/
    whalegirl.ts        鲸娘 42×30 字符格帧包
    deepy.ts            deepy 42×30 动画
    whale.ts            开屏鲸鱼 40×25 帧
    timings.ts          三个角色的逐帧时长表（ms）
assets/
  whalegirl-sheet/      鲸娘 AVIF 精灵图：<动画>.avif（22 张，运行时用这个）
  claude-girl-sheet/    Claude 娘 AVIF 精灵图（22 张 / 225 帧）
  codex-girl-sheet/     Codex 娘 AVIF 精灵图（22 张 / 225 帧）
  whale-maid-sheet/     鲸娘女仆 Q 版插画精灵图（22 张 / 384 帧，489×709）
  whale-maid-anime-sheet/ 鲸娘女仆动画精灵图（22 张 / 880 帧，540×540）
  whale-maid-plush-sheet/ 鲸娘女仆毛绒精灵图（22 张 / 348 帧，630×819）
  portraits/            高清立绘：whale-girl（女仆鲸娘，normal + happy）
```

## 角色形象（原版搬运，可在设置里选）

`src/app.ts` 的 `SKINS` 名册 = 9 个形象（像素画 3 + 插画 3 + 立绘 1 + 字符动画 2）：

| id | 名称 | 形态 | 素材 |
|---|---|---|---|
| `whalegirl` | 鲸娘 · 动画 | 原生像素帧 22 动画 / 267 帧（AVIF 精灵图） | `assets/whalegirl-sheet/` |
| `claude-girl` | Claude 娘 | 原生像素帧 22 动画 / 225 帧（AVIF 精灵图） | `assets/claude-girl-sheet/` |
| `codex-girl` | Codex 娘 | 原生像素帧 22 动画 / 225 帧（AVIF 精灵图） | `assets/codex-girl-sheet/` |
| `maid-girl` | 鲸娘 · 女仆 | 高清立绘 464×464（+ happy，没有动画帧） | `assets/portraits/whale-girl/` |
| `whale-maid` | 鲸娘 · 女仆 Q版 | 插画序列帧 22 动画 / 384 帧（489×709） | `assets/whale-maid-sheet/` |
| `whale-maid-anime` | 鲸娘 · 女仆 动画 | 插画序列帧 22 动画 / 880 帧（540×540，源 720 缩 0.75） | `assets/whale-maid-anime-sheet/` |
| `whale-maid-plush` | 鲸娘 · 女仆 毛绒 | 插画序列帧 22 动画 / 348 帧（630×819，源 964×1252 缩 0.654） | `assets/whale-maid-plush-sheet/` |
| `deepy` | deepy | 42×30 字符动画 ×20 | `src/data/deepy.ts` |
| `whale` | 小鲸鱼 | 40×25 字符帧 ×22 | `src/data/whale.ts` |

- 选择入口：`⌘K` →「切换宠物形象」，或设置页「宠物形象 skin」→ 弹层选择器
  （左侧名册 + 右侧实时预览，`↑↓` 选、`Enter` 应用、`Esc` 关闭）；
- 选择结果存 `localStorage['dsh-tui.skin']`，刷新后保持；
- 高清立绘点击会切成 `-happy` 变体 3 秒（原版 `MAID_HAPPY_MS`），再自动回常态；
- 原生像素帧与字符动画走「真像素」路径，立绘走高质量缩放的 `imageSmooth`
  （真图不是整数倍像素网格，强制最近邻会锯齿）。

## 像素帧素材（精灵图）

三个形象共用同一套 301×288 原生像素帧（288px 高、保留真实 alpha），
分别来自 dsh-TUI / 表情包素材包：

| 形象 | 帧数 | 单格 | 精灵图体积 |
|---|---|---|---|
| 鲸娘 | 267 | 301×288 | 1.3 MB |
| Claude 娘 | 225 | 301×288 | 2.3 MB |
| Codex 娘 | 225 | 301×288 | 2.1 MB |
| 鲸娘女仆 Q版 | 384 | 489×709 | 8.6 MB |
| 鲸娘女仆 动画 | 880 | 540×540 | 19 MB |
| 鲸娘女仆 毛绒 | 348 | 630×819 | 10 MB |

前三个是像素画，缩放走最近邻 + 整数物理像素；后两个是插画，`SheetArt.smooth`
让它们走 `imageSubSmooth`（高质量插值），否则非整数倍缩放会锯齿。

- 运行时用的是 `assets/<skin>-sheet/<key>.avif`：**一个动画一张 AVIF 精灵图**，
  由 `tools/encode-sheet.ts` 生成（`ffmpeg` 拼 `tile` + `avifenc -q 60 --qalpha 60 -s 0`）；
- 逐帧散图 → **22 个请求**，鲸娘从 267 个请求 / 6.9MB 降到 22 个 / 1.3MB，
  实测 PSNR 40.05 dB、SSIM 0.994（合成到 `#2A2F34` 背景后与无损源比对）；
- 布局：单格 301×288，`cols = ceil(sqrt(n))`、`rows = ceil(n/cols)`，行优先，
  空位透明；取帧仍是「时间 → 帧号 → 格号」，逐帧时长表在 `src/data/timings.ts`
  （源各角色 `timings.json` 的 `dur`），所以打断/重播语义与逐帧版完全一致；
- 首屏只预载 `idle`，其余动画按需懒加载；鲸娘加载完成前回落到 42×30 字符格帧包
  （`src/data/whalegirl.ts`），与原版「无图像协议 → 字母格」的回退路径一致；
- 女仆鲸娘没有动画帧，仍走 `imageSmooth` 的高清立绘路径。

改素材后重新生成精灵图（需要 `ffmpeg` 和 `avifenc`，`brew install ffmpeg libavif`）：

```bash
bun run encode:sheet <skin> <源目录> [缩放] [alphaQ]
# 例：bun run encode:sheet whalegirl <素材包>/whaleGirl/img
#     bun run encode:sheet whale-maid-anime <素材包>/whale-maid-anime-video/img 0.75 85
```

> **逐帧源图一律不入库**，只提交生成好的精灵图。重新生成时需要素材包里的原始帧
> （鲸娘 `<kit>/whaleGirl/img`、Claude 娘 `<kit>/claude-girl/img`、
> Codex 娘 `<kit>/codex-girl/img`、女仆 `<kit>/whale-maid-*/img`）。

启动页交互也与原版 `SplashMascot` 同一条语义：

- 稳态 `idle` 循环；
- 点击左/右半 → `poke-left` / `poke-right`（1.4s）；
- 鲸娘 poke 之后接 `smile-hearts`（2.4s）；
- 900ms 内连点 ≥3 次 → `tickle`。

## 侧栏伙伴（⌘B）

右侧面板第一页「♥」把宠物搬进侧栏（移植自 dsh-TUI 的 `CompanionPanel`）：宠物常驻面板
底部，上方四行是 **心情 / 一句话 / 当前动作 / 互动提示**，中间留白让立绘不贴字。

- 心情由 `app.ts` 的 `updatePet()` 写入 `state.petMood`（睡觉 / 发呆 / 思考中 / 工作中 /
  完成啦 / 需要你 / 出错了），面板据此换色与文案；
- 点左半 / 右半 → `poke-left` / `poke-right`；900ms 内连点 ≥3 次 → `tickle`；
- 悬停 → `idle-look`；流式回合结束 → `happy`（2.5s 庆祝）；
- 按住拖动可把宠物拎起来（`drag` 姿态，跟手且不出面板），松手按指数插值回 home（τ≈100ms）。

几何全部走字符坐标：槽位与拖动边界由 `tui-ui.ts` 的 `companionPetRect()` /
`companionLimits()` 提供，`app.ts` 只记像素偏移 `state.petOffset`，帧循环里的
`tickPetOffset()` 负责回弹。

## 交互

| 按键 | 作用 |
|---|---|
| `Enter` | 发送 / 确认 |
| `Tab` | 切换 NORMAL / INSERT |
| `⌘K` | 命令菜单（可输入过滤） |
| `⌘B` | 切换右侧面板（默认「♥ 伙伴」页，侧栏宠物） |
| `⌘T` / `⌘R` / `⌘E` | Todos / Jobs / 上下文 |
| `⌘P` | 参数行 |
| `⌘,` | 设置 |
| `⌘N` / `⌘J` | 新对话 / 继续最近 |
| `/` | 斜杠命令建议（↑↓ 选择，Enter 执行） |
| `⌘K` → 形象 | 宠物形象选择器（实时预览） |
| `?` | 快捷键帮助（NORMAL 模式） |
| `F11` | 全屏 |
| 点击宠物 | poke / tickle / happy |

中文输入走隐藏 `<textarea>`（IME 组合事件 + 粘贴），画布光标位置同步给输入法。

## 与 dsh-TUI 的关系

- **UI 结构**：落地页（立绘 + 开屏大字 + 圆角输入框 + 参数行 + 入口行 + Tips +
  双角铭牌）、对话页（顶栏 / 消息流 / 输入框 / 状态行 / 右侧面板）、设置页、
  命令菜单 / 帮助 / 参数 / 会话 / 内核 / 工作区弹层，均按原版版式复刻；
- **像素层**：原版用半块字符（`▀`）渲染像素画；网页版改成在同一坐标系里
  画真实矩形，一个源像素 = 整数个物理像素，因此不会被字体行高/抗锯齿压糊；
- **开屏大字**：沿用原版 `splashFonts` 的 BOLD 点阵、字距（DEEPSEEK 1 列、
  HARNESS 2 列）与 60ms/列的扫光节奏，改为像素层绘制；
- **未搬运**：真实模型接入、会话持久化、插件系统、审批面板等「功能」——
  按需求只搬 UI 与交互，消息/流式输出为本地模拟。

## 类型化说明

- `src/types.ts` 是唯一的类型出口：`TuiApi` / `PixelLayerApi` / `Pet` /
  `MarkdownApi` / `AppApi` / `AppState` 等，模块之间只通过接口耦合；
- Markdown 用**判别联合**（`Block`），UI 侧 `switch (b.type)` 穷尽检查；
- 会话消息是 `Message` 判别联合（system / user / assistant / think / tool / usage），
  不再是 `role` 字符串；
- `strict` + `noUnusedLocals` + `noUnusedParameters` + `noImplicitReturns` +
  `noFallthroughCasesInSwitch`，`bun run typecheck` 零输出零告警。

## 修复记录（相对最初的 JS 版本）

- `box()` 边框绘制错误（横线从 x+i 起画、越界铺满屏幕）；
- 用户消息 / 列表项把 `wrapTokens` 的行数组当 token 展开 → 显示 `undefined`；
- 右侧面板是死代码（`layout()` 里没有 `side`/`panel`），⌘B 无反应；
- 会话弹层拿不到 `allSessionIds` → 永远空列表；
- 中文/粘贴无法输入（没有 IME 承载），现由隐藏 textarea 接管；
- 启动页立绘被字符网格压扁（42×30 素材按正方形像素渲染，横向拉宽 31%），
  且加载的是低分辨率字符格；现改为原版原生像素帧 + 正确像素比；
- 补齐 dsh-TUI 的 Claude 娘 / Codex 娘 / 鲸娘女仆高清立绘，并做成可选形象
  （9 个形象 + 实时预览选择器 + localStorage 记忆）；
- 开屏大字用字体字形画 `█/▀/▄`，字形行高留白导致横条状断层；现改为像素层矩形；
- 弹层边框/分隔线改用 1px 实线（字符网格画不齐）；
- 设置页控件命中被整行命中吞掉、开关错位；
- 手动滚到底后不再恢复自动滚动；
- 斜杠命令、设置页主题切换、首启引导、光标闪烁等补全。

## License

[BSD-3-Clause](https://spdx.org/licenses/BSD-3-Clause.html)（SPDX: `BSD-3-Clause`），全文见 [LICENSE](LICENSE)。
