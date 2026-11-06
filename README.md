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
bun run build      # blog:build + index.html → dist/（含 assets 与 blog 配图）
bun run preview    # 预览 dist/（http://127.0.0.1:8899/）
bun run check      # blog:build + typecheck + build
bun run blog:build # 扫描 blog/，生成 src/data/posts.ts
```

> `src/data/posts.ts` 是 `blog/` 的派生产物，**不进仓库**（`.gitignore`）。`dev` / `build` /
> `check` 都会先跑 `blog:build` 现场生成，避免同一份正文在仓库里存两遍。

> 因为入口是 ES module，`file://` 直接双击 `index.html` 不再可用（浏览器会拦
> module 的 CORS）。请用 `bun run dev` 或 `bun run preview`，或者把 `dist/` 丢给
> 任意静态服务器。

## 部署（GitHub Pages）

仓库里只放源码和内容（`blog/`），**不放构建产物**：`dist/` 与 `src/data/posts.ts`
都在 CI 里现生成，所以同一份文章/配图不会在仓库里多存一遍。

`.github/workflows/pages.yml` 在 push `main` 时执行：

```
bun install → bun run build（内含 blog:build）→ 上传 dist/ → deploy-pages
```

首次上线需要在仓库 **Settings → Pages → Build and deployment → Source** 选
**GitHub Actions**（不是 Deploy from a branch）。之后每次推送自动发布，站点形如
`https://<user>.github.io/dsh-blog/`。

产物里的路径都是相对的（`./chunk-*.js`、`assets/…`、`blog/…`），所以部署在
`/dsh-blog/` 这样的子路径下也能直接用，不需要改 base。

> CI 不装额外的图像工具：`blog:build` 直接读 AVIF 文件的 `ispe` 头拿宽高。
> 如果往 `blog/` 里放了 PNG/JPEG，先在本地跑一次 `bun run blog:build`（需要
> `avifenc`）把图转成 AVIF 再提交。

## 目录

```
index.html              入口：一块 canvas（字符网格）+ 一个 <script type="module">
404.html                深链兜底：把 /<文章标题> 转成 /?p=… 再跳回根页面
serve.ts                开发服务器：Bun.serve + Bun.Transpiler 现场转译 .ts
build.ts                生产构建：Bun.build(index.html) + 拷贝 assets/ 与 blog 配图
preview.ts              预览 dist/
tools/encode-sheet.ts   逐帧 WebP → AVIF 精灵图（ffmpeg + avifenc）
tools/build-blog.ts     扫描 blog/ → src/data/posts.ts（按 blog.config.json）
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
    whalegirl.ts        鲸娘 42×30 字符格帧包（精灵图未就绪时回落）
    timings.ts          各角色逐帧时长表（ms）
    posts.ts            文章数据（blog:build 生成，不入库）
assets/
  whalegirl-sheet/      鲸娘 AVIF 精灵图：<动画>.avif（22 张，运行时用这个）
  claude-girl-sheet/    Claude 娘 AVIF 精灵图（22 张 / 225 帧）
  codex-girl-sheet/     Codex 娘 AVIF 精灵图（22 张 / 225 帧）
  whale-maid-sheet/     鲸娘女仆 Q 版插画精灵图（22 张 / 384 帧，489×709）
  whale-maid-anime-sheet/ 鲸娘女仆动画精灵图（22 张 / 880 帧，540×540）
  whale-maid-plush-sheet/ 鲸娘女仆毛绒精灵图（22 张 / 348 帧，630×819）
  portraits/            高清立绘：whale-girl（女仆鲸娘，normal + happy）
blog/
  blog.config.json      标题 / 入口文件 / 图片目录 / 排除项 / 排序 / AVIF 编码参数
  校园网络/index.md      正文（目录名就是文章标题，图片引用写成 images/xxx.avif）
  校园网络/images/*.avif 配图
```

## 角色形象（原版搬运，可在设置里选）

`src/app.ts` 的 `SKINS` 名册 = 7 个形象（像素画 3 + 插画 3 + 立绘 1）：

| id | 名称 | 形态 | 素材 |
|---|---|---|---|
| `whalegirl` | 鲸娘 · 动画 | 原生像素帧 22 动画 / 267 帧（AVIF 精灵图） | `assets/whalegirl-sheet/` |
| `claude-girl` | Claude 娘 | 原生像素帧 22 动画 / 225 帧（AVIF 精灵图） | `assets/claude-girl-sheet/` |
| `codex-girl` | Codex 娘 | 原生像素帧 22 动画 / 225 帧（AVIF 精灵图） | `assets/codex-girl-sheet/` |
| `maid-girl` | 鲸娘 · 女仆 | 高清立绘 464×464（+ happy，没有动画帧） | `assets/portraits/whale-girl/` |
| `whale-maid` | 鲸娘 · 女仆 Q版 | 插画序列帧 22 动画 / 384 帧（489×709） | `assets/whale-maid-sheet/` |
| `whale-maid-anime` | 鲸娘 · 女仆 动画 | 插画序列帧 22 动画 / 880 帧（540×540，源 720 缩 0.75） | `assets/whale-maid-anime-sheet/` |
| `whale-maid-plush` | 鲸娘 · 女仆 毛绒 | 插画序列帧 22 动画 / 348 帧（630×819，源 964×1252 缩 0.654） | `assets/whale-maid-plush-sheet/` |

- 选择入口：顶栏「菜单」→「切换宠物形象」，或设置页「宠物形象 skin」→ 弹层选择器
  （左侧名册 + 右侧实时预览，`↑↓` 选、`Enter` 应用、`Esc` 关闭）；
- 名册悬停会即时切到那只宠物并高亮该行；右侧预览是**动态的**（默认 `idle` 循环），
  点一下预览会随机换一个动作，和主宠物同一套点击逻辑；
- 选择结果存 `localStorage['dsh-tui.skin']`，刷新后保持；
- 高清立绘点击会切成 `-happy` 变体 3 秒（原版 `MAID_HAPPY_MS`），再自动回常态；
- 原生像素帧走「真像素」路径，立绘走高质量缩放的 `imageSmooth`
  （真图不是整数倍像素网格，强制最近邻会锯齿）；
- 首帧之后 `PetKit.prefetch()` 会**静默预缓存**：先当前形象的全部动画，再依次其它
  形象（并发 2、只建 `<img>` 不解码、空闲时才发下一张）；`saveData` / 2G /
  `prefers-reduced-data` 下自动跳过。换肤时会把新形象插到队首；
- 预缓存期间点到还没缓存的动画：请求**立刻发**（不排队、不等预取），预取自己的
  2 个并发继续跑，所以瞬时最多是 `2 + 前台正在加载数`；该 URL 会从预取队列里
  摘掉，不会重复下载。

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
- 点击 → 从该形象全部动画（22 个里除 `idle` / `drag` 的 20 个）随机挑一个完整播一轮，
  时长取该动画一轮的总时长（夹在 0.9–5s）；
- 900ms 内连点 ≥3 次 → `tickle`。

## 侧栏

进入工作区（聊天页）时右侧面板默认打开，只有三个页签：**宠物 / 文章 / 大纲**。

- **宠物**：宠物常驻面板底部，上方四行是 **心情 / 一句话 / 当前动作 / 互动提示**，
  中间留白让立绘不贴字；点击随机换动作、连点 tickle、按住可拖拽（移植自 dsh-TUI
  的 `CompanionPanel`）；
- **文章**：全部 133 篇的标题列表，当前篇以 `●` 标出，点击即切换会话，悬停高亮，
  滚轮可翻（指针在侧栏里时滚的是列表，不是正文）；
- **大纲**：当前会话的标题树（h1–h4 缩进显示），点击某一条直接跳到正文对应位置；
- 页签点击切换；收起 / 展开走顶栏「侧栏」按钮。

窗口放不下侧栏（< 92 列）时不再画面板，宠物改为**浮在消息区右下角、输入框正上方**，
此时拖动范围放开到整个页面（仍受视口四边夹取）；宽屏收起侧栏则不显示宠物。

心情由 `app.ts` 的 `updatePet()` 写入 `state.petMood`（睡觉 / 发呆 / 思考中 / 工作中 /
完成啦 / 需要你 / 出错了），面板据此换色与文案；悬停 → `idle-look`；流式回合结束 →
`happy`（2.5s）。几何全部走字符坐标：槽位与拖动边界由 `tui-ui.ts` 的
`companionPetRect()` / `companionLimits()` 提供，`app.ts` 只记像素偏移，帧循环里的
`tickPetOffset()` 负责回弹。

正文右侧的滚动条支持**悬停高亮**（轨道变亮、滑块转 accent）和**按住拖动**：按指针在
轨道上的位置直接映射滚动行，拖到哪停到哪。

## 书签文章（会话）

文章内容现在独立放在仓库根的 `blog/` 目录：每篇一个文件夹，Markdown 与配图同处一室。

```
blog/
  blog.config.json      标题 / 入口文件 / 图片目录 / 排除项 / 排序 / AVIF 编码参数
  校园网络/index.md      正文（目录名 = 中文标题，图片写成 images/xxx.avif）
  校园网络/images/*.avif 配图
  ...
```

- 目录名直接取文章标题（中文），不用序号；重名会自动加 `-2` 后缀；
- 排序由配置的 `sort` 决定：`date-desc`（默认，新→旧）/ `date-asc` / `name`；
- 133 篇在启动时由 `seedPosts()` 灌成普通会话，分组名取配置里的 `title`——没有单独的
  阅读界面，选中就是现有的 TUI 对话框：顶栏标题、system 行「收录于 …」、正文走
  assistant 消息的 Markdown 渲染，配图就地铺在消息流；
- 入口：顶栏「菜单」→「继续最近」或「会话与工作区」，也可从启动页的「会话与工作区」进入；
- 会话列表支持 `↑↓ / j k`、`PageUp/PageDown`、`Home/End`、鼠标滚轮，选中 `Enter` 打开；
- 正文首行重复的 `# 标题` 在灌入时去掉；带 emoji 的标题（`## 📎 链接` 之类）在整理
  内容时整行删除；
- 图片按消息区宽度铺满、最高 40 行；滚到视口边缘时按行**裁源图**（不会压扁），后续
  文字从图片之后开始；外链图（http/https）降级成 `🖼 alt` 文字——跨域图会污染 canvas；
- Markdown 解析结果按内容缓存（最近 6 条），图片懒加载后请求重绘。

添加/修改文章：往 `blog/` 里丢一个文件夹（`index.md` + `images/`），或在配置里用
`exclude` 排除，然后重建数据：

```bash
bun run blog:build      # 扫描 blog/ → src/data/posts.ts
```

非 AVIF 图片会按 `blog.config.json` 的 `image` 参数（`q 60 / qalpha 60 / -s 0`）就地
转码，正文引用自动改写。`posts.ts` 是生成物，不要手改。

## 文章链接（深链）

每篇文章有自己的地址，直接打开就是该文章的工作区（不经过首页）：

```
https://bemly.moe/校园网络
https://bemly.moe/OpenWrt-GXNAS软路由安装OpenClaw小龙虾教程
```

- 应用内切换文章时用 `history.pushState` 把地址改成 `/<slug>`；点浏览器后退会回到
  上一篇（非文章会话的地址是 `/`）；
- GitHub Pages 是纯静态托管，没有服务端路由：未知路径会落到 `404.html`，它把原路径
  转成 `/?p=<slug>` 再跳回根页面，由 `app.ts` 的 `slugFromLocation()` 打开对应会话，
  随后 `replaceState` 把地址还原成 `/<slug>`；
- `404.html` 里的跳转写死了根路径 `/`，所以要求站点部署在域名根目录（自定义域名）；
  如果以后放到 `https://user.github.io/repo/` 子路径，需要把那里改成 `/repo/`。

## 交互

> 不再绑定 `⌘K` / `⌘B` / `⌘T` 这类组合键——它们在浏览器里都有主（地址栏搜索、
> 新标签、刷新…），全部改成界面按钮。

| 操作 | 作用 |
|---|---|
| `Enter` | 发送 / 确认 |
| `Tab` (或 `Shift+Tab`) | 切换 NORMAL / INSERT |
| `Esc` | 关闭弹层 / 退出当前层 |
| `↑` / `↓` | 命令历史（会话列表里是移动选择） |
| `/` | 斜杠命令建议（↑↓ 选择，Enter 执行） |
| `?` | 按键与操作帮助（NORMAL 模式） |
| 顶栏「菜单」 | 命令菜单（新建 / 会话 / 设置 / 形象 / 参数 / 全屏…） |
| 顶栏「侧栏」 | 收起 / 展开右侧面板 |
| 侧栏页签 | 宠物 / 文章 / 大纲（点击当前页不会收起） |
| 点击文章标题 | 切换会话，地址同步为 `/<文章标题>` |
| 点击大纲条目 | 跳到正文对应位置 |
| 滚轮 / 拖动滚动条 | 正文滚动（滚动条悬停高亮） |
| 点击宠物 | 随机动作 / tickle / happy（形象选择器预览里也可以点） |
| 拖动侧栏左边界 | 调整侧栏宽度（22–84 列，记入 localStorage；悬停整列高亮） |
| 悬停控件 | 设置页每一行、按钮、形象名册都有悬停高亮 + pointer 光标 |

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
- 右侧面板是死代码（`layout()` 里没有 `side`/`panel`），面板按钮无反应；
- 会话弹层拿不到 `allSessionIds` → 永远空列表；
- 中文/粘贴无法输入（没有 IME 承载），现由隐藏 textarea 接管；
- 启动页立绘被字符网格压扁（42×30 素材按正方形像素渲染，横向拉宽 31%），
  且加载的是低分辨率字符格；现改为原版原生像素帧 + 正确像素比；
- 补齐 dsh-TUI 的 Claude 娘 / Codex 娘 / 鲸娘女仆高清立绘，并做成可选形象
  （7 个形象 + 实时预览选择器 + localStorage 记忆）；
- 开屏大字用字体字形画 `█/▀/▄`，字形行高留白导致横条状断层；现改为像素层矩形；
- 弹层边框/分隔线改用 1px 实线（字符网格画不齐）；
- 设置页控件命中被整行命中吞掉、开关错位；
- 手动滚到底后不再恢复自动滚动；
- 斜杠命令、设置页主题切换、首启引导、光标闪烁等补全。

## License

[BSD-3-Clause](https://spdx.org/licenses/BSD-3-Clause.html)（SPDX: `BSD-3-Clause`），全文见 [LICENSE](LICENSE)。
