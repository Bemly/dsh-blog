# AGENTS.md

给在本仓库里干活的 AI / 协作者看的约定。项目是什么、界面长什么样，看 [README.md](README.md)。

## 一句话

把 dsh-TUI 的终端界面 1:1 搬到浏览器：整屏一块 `<canvas>` 画字符网格，宠物立绘走另一张
`#pixel-layer`。**不要引入前端框架，也不要用 DOM 拼界面**——这是架构约束，不是风格偏好。

## 常用命令

```bash
bun install            # 只装 typescript + @types/bun
bun run dev            # http://127.0.0.1:8899/，现场转译 .ts，改代码刷新即生效
bun run check          # typecheck + build，提交前必跑
bun run build          # → dist/（含 assets 拷贝）
bun run preview        # 预览 dist/

bun run encode:sheet <skin> <源目录> [缩放|WxH=1] [alphaQ=60]
```

## 提交与推送（硬性）

**凡是让页面表现发生变化的改动，做完就直接 `git commit` + `git push origin main`，不要只留本地。**

- 提交信息用中文，前缀沿用 `feat:` / `perf:` / `fix:` / `chore:`，正文写清「改了什么 + 为什么 + 关键参数」；
- push 前必须 `bun run check` 通过；
- 推送后回报 commit hash 和 `git status -sb` 状态；
- 只改注释、typo 这类不影响行为的，可以并到下一次提交；
- 仓库没有 CI，验证靠自己（见下面「验证清单」）。

## 代码约定

- `src/types.ts` 是唯一类型出口，模块之间只通过接口耦合；新增跨模块类型先加在这里。
- 渲染分层：字符网格 → `tui-core.ts`；真像素 / 图片 → `pixel-layer.ts`；版式 → `tui-ui.ts`；
  状态与输入 → `app.ts`；宠物 → `pet.ts`。别把绘制逻辑塞进 `app.ts`。
- `tsconfig` 开了 `strict` + `noUnusedLocals/Parameters` + `noImplicitReturns`，`bun run typecheck` 必须零输出。
- 命中区每帧重建（`App._hits`），坐标一律用字符格；不要按像素写死位置。

## 素材管线：AVIF 精灵图

### 为什么不是逐帧图 / 动图

- 267 个请求 / 6.9 MB（无损 WebP 逐帧）→ 22 个请求 / 1.3 MB（精灵图），质量几乎不变；
- **AVIF 动图不能逐帧画进 canvas**：HTML 规范规定 `drawImage` 取动图的「默认帧/首帧」，
  Chromium 实测 gif / webp / avif 三者画进 canvas 都是静止的。所以动图方案不可用，
  必须用「一个动画一张精灵图 + 引擎按时间反推格号」。

### 目录与命名

```
assets/<skin>-sheet/<anim-key>.avif     # 运行时只读这里
src/data/timings.ts                     # anim-key → 每帧时长数组（ms）
```

- skin id 用 kebab-case（`whale-maid-plush`），和 `src/app.ts` 的 `SKINS` 名册、`src/pet.ts`
  的 `SHEETS` 表保持一致；
- **逐帧源图不入库**，只在素材包里；仓库只留生成好的精灵图。

### 布局规则

- 单格 = 源帧尺寸（或统一缩放后的尺寸），**同一形象所有动画必须同一个倍率**，保证纹理大小一致；
- `cols = ceil(sqrt(n))`、`rows = ceil(n/cols)`，行优先，空位透明；
- 帧顺序 = 文件名升序；`timings` 数组长度必须等于帧数，否则格子会错位；
- 每张精灵图的长宽都要 **< 4096**（保守纹理上限）。全局倍率由帧数最多的动画决定，
  例如毛绒版 28 帧 → 6×5，纵向先顶满 → 单帧 630×819（3780×4095）。

### 现有档位

| skin | 单格 | 帧数 | q | alphaQ | 体积 | 缩放路径 |
|---|---|---|---|---|---|---|
| `whalegirl` | 301×288 | 267 | 60 | 60 | 1.3 MB | 最近邻 |
| `claude-girl` | 301×288 | 225 | 60 | 60 | 2.3 MB | 最近邻 |
| `codex-girl` | 301×288 | 225 | 60 | 60 | 2.1 MB | 最近邻 |
| `whale-maid` | 489×709 | 384 | 60 | 85 | 8.6 MB | smooth |
| `whale-maid-anime` | 540×540 | 880 | 60 | 85 | 19 MB | smooth |
| `whale-maid-plush` | 630×819 | 348 | 60 | 85 | 10 MB | smooth |

- **像素画**：`SheetArt.smooth` 不设 → `imageSub` 最近邻 + 整数物理像素，放大不糊；
- **插画**（有真实渐变/软边）：`smooth: true` → `imageSubSmooth` 高质量插值，
  否则非整数倍缩放会锯齿；
- alpha 档位：像素画 60 够用，软边插画要 85 起步，60 会有明显脏边。

## 书签文章（灌成会话）

文章来自仓库外的 Obsidian 目录（书签 · NAS 与自建服务），启动时由 `app.ts` 的
`seedPosts()` 灌成普通会话（分组「书签 · NAS与自建服务」）——**不要再为它单独写屏幕**，
正文就走 `assistant` 消息的 Markdown 渲染。只提交生成物：

```bash
bun run import:blog <源目录> [限制篇数]     # 断点续传：已有 .avif 会跳过
```

- 产出：`src/data/posts.ts`（标题 / 摘要 / 正文 Markdown）+ `assets/blog/<序号>/iNN-*.avif`；
- 图片统一 `avifenc -q 60 --qalpha 60 -s 0`；GIF / WebP / 伪扩展名先经 ffmpeg 转 PNG，
  PNG/JPEG 直接编码，失败再回退转码；
- `posts.ts` 与 `assets/blog/` 都是生成物，**不要手改**，要改就改导入脚本再重跑；
- 导入时剔除 YAML frontmatter（`AIGC:` 标签块）和「内容由 AI 生成」免责声明行，
  别让它们出现在正文里；
- 消息里只画 `assets/` 下的图：跨域图会污染 canvas，导致整个像素层 `getImageData` 抛异常；
- Markdown 解析结果按内容缓存（最近 6 条），正文解析不能每次绘制都重跑。

## 验证清单

改完按顺序过一遍：

1. `bun run check`（typecheck + build）；
2. **帧数一致**：`timings` 每个 key 的数组长度 == 源目录该动画的帧数；
3. **尺寸合规**：`avifdec --info assets/<skin>-sheet/*.avif | grep Resolution`，全部 < 4096；
4. **浏览器实测**：⌘K →「形象」→ 选中并应用 → 截图看立绘 → 点击触发 poke，
   确认无 404、无 `pageerror`（用 Playwright + `/Applications/Chromium.app`）；
5. 提交并推送。

## 经验与坑

1. **动图 AVIF 不能进 canvas**（见上）。别在这个方向上浪费时间，也别相信「Chrome 能动图」的旧说法。
2. **PSNR/SSIM 要在合成背景后算**。直接比 RGBA 会被「透明区 RGB 值」污染，
   出现过同一档编码 53 dB 和 40 dB 的假差异。
3. **ffmpeg 解 AVIF 有色偏**（色彩范围处理不同，PSNR 会掉到 16 dB 的假象）。
   要逐像素比对，先用 `avifdec` 转 PNG，再交给 ffmpeg。
4. **`avifenc -s` 影响同 q 的实际画质**：s0 比 s6 明显更好，图越大差距越大。
   定稿一律用 `-s 0`；只做粗估时可以先用 s6 提速。
5. **`-q 100` 不划算**：毛绒版 idle 在 630×819 下 q60 是 934 K，q100 直接 6.4 MB，肉眼收益接近零。
6. **`tile` 滤镜的输入从 01 开始编号**，ffmpeg 要把 `-start_number 0` 传给它，否则帧序整体错一位。
7. **缩放别用 `round(宽×倍率)`**：964×0.654 会得到 631。要精确到某一像素网格，直接传 `630x819`。
8. **4096 是保守值**：现代 Chromium/Safari 纹理上限 16384，真正该盯的是解码内存
   （630×819×348 帧的单张 ≈ 15.5 MP ≈ 62 MB RGBA，只加载当前动画才扛得住）。
9. **Playwright 截图 `#tui` 看不到宠物**，宠物画在 `#pixel-layer`；另外无头/后台窗口会冻结 `rAF`
   和图片动画，测试要 `bringToFront()` 并加 `--disable-background-timer-throttling`。
10. **我起的后台 dev server 在回复结束后会被回收**。要用户自己看，就把 `bun run dev` 交给他的终端；
    否则在同一轮里截完图再回复。
11. **大二进制进 git 后删不掉**：删文件只是删工作区，历史里的 blob 还在，必须 `git filter-repo` 重写
    + `gc --prune=now`。所以「源帧不入库」是纪律，不是建议。
12. 新增静态资源后缀记得在 `serve.ts` / `preview.ts` 的 MIME 表里登记（`.avif` 就是这么补的）。
13. 换肤/换素材后要同步三处：`assets/<skin>-sheet/`、`src/data/timings.ts`、`src/app.ts` 的 `SKINS`
    （以及 `src/pet.ts` 的 `SHEETS`），少一处就会出现「选得到但画不出」。
