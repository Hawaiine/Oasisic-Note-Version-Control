# Oasisic Note Version Control 🌿

给 Obsidian Markdown 笔记准备的轻量版本控制插件。它像一个温和版 Git：帮你给笔记打快照、看历史、比较差异，也能把内容恢复到某个旧版本。

Built for Obsidian Markdown notes, with Git-style snapshots, timeline history, line-level diffs, and one-click restore. The interface supports Simplified Chinese and English.

## 为什么会需要它？✨

写作和整理知识库时，我们常常会遇到这些小场景：

- 改了一大段内容，后来发现旧版本更好。
- 写论文、文章、项目文档时，想保留每个关键节点。
- 不小心删掉一段内容，希望能从历史里找回来。
- 想知道这篇笔记最近到底改了什么。

Oasisic Note Version Control 就是为这些时刻准备的。它不会把你的笔记工作流变复杂，只是在你需要回头看时，安静地把版本历史放在那里。

## 功能亮点 🚀

- 📝 为任意 Markdown 文件创建手动快照
- 🔖 使用短 SHA-256 哈希作为版本 ID，例如 `a1b2c3d4`
- 🕒 记录时间、提交信息、文件名、内容和内容哈希
- 🧭 文件改名后历史不会丢，会额外记录“重命名”快照
- 📁 每个文件通过稳定索引关联历史，默认存储在 `.versions`
- 🧮 可配置每个文件最多保留多少个版本，默认 50
- 🔢 自动快照独立上限，手动/重命名/恢复快照不受自动清理影响
- 🟢🔴 GitHub 风格差异对比，支持左右、行内、上下文件三种布局
- ↩️ 可以恢复到任意历史版本
- 🛟 恢复操作本身也会创建新快照，方便再次回退
- ⚙️ 可选保存时自动创建快照，并根据标题、表格、列表、大幅修改等情况生成简短摘要
- 🔢 显示笔记字数、行数和版本增删统计
- 🪟 左侧 ribbon 按钮打开浮动历史窗口，命令面板仍可打开右侧栏
- 🌓 自动适配 Obsidian 亮色 / 深色主题
- 🌏 支持自动语言、English、简体中文

## 项目结构 📁

这个仓库按比较常见的 Obsidian 插件结构整理：

```text
.
├── .github/
│   └── workflows/
│       └── release.yml
├── src/
│   ├── main.ts
│   └── types.ts
├── .gitignore
├── LICENSE
├── README.md
├── esbuild.config.mjs
├── manifest.json
├── package.json
├── styles.css
├── tsconfig.json
└── versions.json
```

说明一下各自的角色：

- `src/main.ts`：插件主体，包括版本控制逻辑、视图、设置页和命令注册。
- `src/types.ts`：版本数据结构和 diff 类型。
- `styles.css`：插件 UI 样式，会随插件一起发布。
- `manifest.json`：Obsidian 读取插件身份、版本、最低兼容版本。
- `versions.json`：告诉 Obsidian 每个插件版本兼容的最低 Obsidian 版本。
- `.github/workflows/release.yml`：GitHub 自动构建并发布 Release 附件。
- `LICENSE`：开源许可证，目前使用 MIT License。

## 开发安装 🛠️

把项目放到你的 Obsidian vault 插件目录：

```text
<vault>/.obsidian/plugins/oasisic-note-version-control/
```

如果你本地有 npm，可以运行：

```bash
npm install
npm run build
```

然后在 Obsidian 里打开：

```text
Settings -> Community plugins -> Oasisic Note Version Control
```

如果你本地没有 npm，也没关系，后面可以让 GitHub Actions 自动构建 `main.js`。

## 使用方式 📌

1. 打开一篇 Markdown 笔记。
2. 点击左侧 ribbon 图标打开浮动历史窗口，或者从命令面板运行“打开版本控制面板”打开右侧栏。
3. 点击“创建快照”，输入这次修改的提交信息。
4. 在紧凑时间线中选择一个版本，查看颜色标签、文件名、短哈希、字数、增删统计和差异。
5. 在差异区域选择左右对比、行内对比或上下文件对比。
6. 如果需要回到旧版本，点击“恢复”并确认。

小建议：如果你喜欢“重要节点手动保存”的工作流，建议关闭自动快照；如果你喜欢“每次保存都留痕”，可以打开自动快照。

## 设置项 ⚙️

| 设置 | 说明 |
| --- | --- |
| Language | 自动、English、简体中文 |
| Version storage folder | 版本 JSON 文件存储位置，默认 `.versions` |
| Auto snapshot on save | Markdown 文件变化时自动创建快照 |
| Maximum versions per file | 每个文件最多保留多少个版本，默认 50 |
| Max auto snapshots per file | 自动快照独立上限（默认 20）。手动/重命名/恢复快照不会被自动清理 |
| Diff layout | 默认差异布局：左右对比、行内对比、上下文件 |

## 数据存储格式 💾

历史会保存在 vault 内部的 JSON 文件中：

```json
{
  "filePath": "path/to/file.md",
  "versions": [
    {
      "id": "a1b2c3d4",
      "timestamp": 1683691200000,
      "message": "Update section on features",
      "content": "file content...",
      "hash": "sha256...",
      "filePath": "path/to/file.md",
      "fileName": "file.md",
      "changeType": "auto",
      "additions": 8,
      "deletions": 2,
      "wordCount": 120,
      "charCount": 420
    }
  ],
  "currentHash": "sha256..."
}
```

插件会维护 `.versions/index.json`，把笔记路径映射到稳定的历史文件。笔记改名时，旧路径会迁移到新路径，历史不会因为文件名变化而丢失；笔记删除时，也会从索引里移除对应路径，避免以后误关联。

重命名会产生一条独立快照，例如：

```text
重命名：Old name.md -> New name.md
```

内容修改会产生更短的自动摘要，例如：

```text
修改内容：新增 8 行，删除 2 行 · Project Plan
更新标题：Project Roadmap
更新表格内容 · Reading List
调整列表内容 · Draft Outline
```

## 差异视图 🎨

差异视图参考 GitHub commit diff 的结构：

- 文件头：显示 Markdown 文件、文件名、增删行统计。
- 时间线标签：用颜色区分手动快照、自动修改、重命名、恢复版本。
- 左右对比：左边是修改前，右边是修改后，适合看同一段内容的变化。
- 行内对比：新增和删除按行堆叠，适合快速扫一遍。
- 上下文件：上面是旧文件，下面是新文件，适合看大段重写。

颜色约定：

- 绿色：新增内容
- 红色：删除内容
- 黄色：重命名
- 蓝色：手动快照
- 紫色：恢复版本

## 发布到 GitHub Release 🏷️

Obsidian 社区插件市场安装插件时，会从你的 GitHub Release 下载这三个文件：

```text
manifest.json
main.js
styles.css
```

所以每次发布版本时，Release 附件里必须有它们。

### 方式 A：本地构建

如果你本地有 npm：

```bash
npm install
npm run build
```

然后创建 GitHub Release。Release tag 必须和 `manifest.json` 里的 `version` 完全一致，例如：

```text
0.1.0
```

不要写成：

```text
v0.1.0
```

### 方式 B：让 GitHub 自动构建

如果你本地没有 npm，可以用仓库里的 GitHub Actions。

推荐方式是推送一个 tag：

```bash
git tag 0.1.0
git push origin 0.1.0
```

GitHub 会自动运行 `.github/workflows/release.yml`，完成这些事：

```text
npm install
npm run build
生成 main.js
创建或更新 0.1.0 Release
上传 manifest.json、main.js、styles.css
```

如果你本地连 git 命令也不方便用，可以用 GitHub 网页：

1. 打开你的插件仓库。
2. 进入 `Actions` 页面。
3. 选择 `Release Obsidian Plugin`。
4. 点击 `Run workflow`。
5. 在 `version` 里填写和 `manifest.json` 完全一致的版本号，例如 `0.1.0`。

不过更推荐用 tag 触发，因为 tag、`manifest.json` 版本和 Release 会自然对应。

## 提交到 Obsidian 插件市场 🌍

自 2026 年 5 月起，Obsidian 使用了全新的 [community.obsidian.md](https://community.obsidian.md/) 社区网站来管理插件提交，旧版的 `obsidian-releases` PR 流程已正式废弃。新流程更快、更简单，且每个版本都会自动审核。

### 首次提交

1. **确认仓库结构** — 确保根目录有 `manifest.json`、`README.md`、`LICENSE`、`styles.css`、`.github/workflows/release.yml`
2. **创建 GitHub Release** — 推送 tag（如 `0.3.0`），触发 Actions 自动构建。Release 附件必须有 `manifest.json`、`main.js`、`styles.css`
3. **登录社区网站** — 打开 [community.obsidian.md](https://community.obsidian.md/)，用 Obsidian 账号登录
4. **关联 GitHub** — 在个人设置中关联你的 GitHub 账号
5. **提交插件** — 左侧栏 → **Plugins** → **New plugin**，填入仓库 URL（`https://github.com/Hawaiine/oasisic-note-version-control`）
6. **同意政策** — 阅读并同意 [Developer Policies](https://docs.obsidian.md/Developer+policies)
7. **等待审核** — 自动审核通常在几分钟内完成；通过后 24 小时内可在插件市场中搜索到

### 后续更新

之后只需要在你的 GitHub 仓库推送新 tag 即可，每次 Release 都会自动触发审核，无需再次提交。

### 审核失败怎么办

登录 [community.obsidian.md](https://community.obsidian.md/) 查看详细的自动检查结果。根据报错修复代码后，推送新版本重新提交。你也可以在开发时使用官方 [eslint 插件](https://github.com/obsidianmd/eslint-plugin) 在本地提前检查。

### 发布后

- 在 [官方论坛 Share & showcase](https://forum.obsidian.md/c/share-showcase/9) 版块发帖
- 在 [Obsidian Discord](https://discord.gg/veuWUTm) 的 `#updates` 频道发公告（需要 `developer` 角色）

### Release 附件缺失

如果自动审核提示 Release 缺少 `main.js` 或 `manifest.json`，请确认：

1. `.github/workflows/release.yml` 存在且正确
2. 推送的 tag 与 `manifest.json` 中的 `version` 完全一致（如 `0.3.0`，不加 `v` 前缀）
3. 等待 GitHub Actions 构建完成后，检查 Release Assets 是否包含 `manifest.json`、`main.js`、`styles.css`

也可以直接在 GitHub Actions 页面手动运行 `Release Obsidian Plugin` workflow，输入版本号触发构建。

### 仓库缺少 LICENSE

确保仓库根目录有 `LICENSE` 文件。本项目已使用 MIT License。

## 后续发新版本 🎉

审核通过后，之后发新版本只需要维护自己的插件仓库：

1. 修改代码和 README
2. 更新 `manifest.json` 里的 `version`（如 `0.3.0` → `0.3.1`）
3. 如果 `minAppVersion` 没变，`versions.json` 不用动；变了就补上新映射
4. 推送改动并创建同版本号 tag：

   ```bash
   git add -A && git commit -m "你的提交说明"
   git tag 0.3.1 && git push origin main --tags
   ```

5. 等待 GitHub Actions 自动构建 Release
6. 确认 Release Assets 包含 `manifest.json`、`main.js`、`styles.css`

简单原则：`manifest.json` 的 `version`、Git tag、Release 名称三者完全一致，不加 `v` 前缀。

## English Quick Start 🌐

Oasisic Note Version Control creates Git-style snapshots for Obsidian Markdown files. It keeps history after note renames, tracks content changes separately from file-name changes, and offers GitHub-style diff layouts.

- Open a Markdown note.
- Click the ribbon icon for a floating history window, or run `Open version control panel` for the right sidebar.
- Click `Snapshot` to save a version.
- Select a timeline item to inspect metadata, diff, and preview.
- Switch between side-by-side, inline, and top/bottom diff layouts.
- Click `Revert` to restore an older version after confirmation.

The plugin supports `Auto`, `English`, and `Simplified Chinese` as interface language options.
