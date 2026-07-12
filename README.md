# Oasisic Note Version Control 🗂️📝

> Git-style snapshots, version history, diffs, and restore workflows for Obsidian Markdown notes.

[![Release](https://img.shields.io/github/v/release/Hawaiine/oasisic-note-version-control)](https://github.com/Hawaiine/oasisic-note-version-control/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🇬🇧 Overview

Oasisic Note Version Control brings **Git-inspired versioning** to Obsidian Markdown notes. Take manual snapshots, enable auto-snapshots on save, browse a visual timeline, compare diffs in three layouts, and restore any previous version with one click.

The plugin supports `Auto`, `English`, and `Simplified Chinese` interface languages.

### Features ✨

- 📸 **Manual & auto snapshots** — Save versions on demand or automatically on file change
- 🔖 **Short SHA-256 IDs** — Human-readable version identifiers like `a1b2c3d4`
- 🕒 **Timeline view** — Color-coded history with per-file version count
- 🟢🔴 **Three diff layouts** — Side-by-side, inline, and stacked (top/bottom)
- ↩️ **One-click restore** — Revert to any past version; the revert itself is recorded as a new snapshot
- 🧭 **Rename-safe** — History follows renamed notes, with a dedicated "rename" snapshot type
- 🔢 **Auto-snapshot quota isolation** — Manual, rename, and restore snapshots are never trimmed by the auto-snapshot cap
- 🛡️ **Debounced auto-snapshots** — Only commits after 2.5s of inactivity, avoiding floods of near-identical records
- 📏 **Large-file protection** — Files over 3,000 lines skip line-level diff, showing statistical summaries instead
- 🌓 **Dark/light theme** — Adapts to Obsidian's theme automatically
- 🌏 **Bilingual UI** — English and Simplified Chinese, with auto-detection

### Installation 🛠️

1. Copy the plugin folder into `<vault>/.obsidian/plugins/oasisic-note-version-control/`
2. Enable it in `Settings → Community plugins`
3. Open a Markdown note → click the ribbon icon 🗂️ or run `Open version control panel`

### How to Use 📌

1. Open a Markdown note.
2. Click the ribbon icon (left sidebar) for the **floating history window**, or run the command for the **right sidebar view**.
3. Click **Snapshot** and enter a commit message.
4. Select a version in the timeline to inspect metadata, diff, and content preview.
5. Click **Revert** after confirmation to restore an older version.
6. Switch between `Side by side`, `Inline`, or `Top/bottom` diff layouts.

### Settings ⚙️

| Setting | Description | Default |
|---------|-------------|---------|
| Language | Auto, English, 简体中文 | Auto |
| Version storage folder | Folder for history JSON files | `.versions` |
| Auto snapshot on save | Create a version automatically on file change | Off |
| Maximum versions per file | Total snapshot cap | 50 |
| Max auto snapshots per file | Separate cap for auto-snapshots only. Manual/rename/restore snapshots are protected | 20 |
| Diff layout | Default diff view mode (split / inline / stacked) | Split |

### Data Storage 💾

History is stored as JSON in your vault under `.versions/` (configurable):

```
.versions/
├── index.json              # file path → historyId mapping
└── <historyId>.history.json  # version array for each file
```

Each history entry stores the full file content, SHA-256 hash, timestamp, change type, and word/line statistics. When a note is renamed, the index is updated and a `rename` snapshot is added. When a note is deleted, its index entry is removed.

### Development 🧑‍💻

```bash
git clone https://github.com/Hawaiine/oasisic-note-version-control
cd oasisic-note-version-control
npm install
npm run build
```

### Release Process 🏷️

1. Update `manifest.json` with the new version.
2. Push a tag matching the version:

   ```bash
   git tag 0.3.0 && git push origin 0.3.0
   ```

3. GitHub Actions builds and creates a Release with `manifest.json`, `main.js`, and `styles.css`.

> **Note:** Tag must match `manifest.json` version exactly. No `v` prefix.

### Submit to Obsidian Plugin Directory 🌍

Since May 2026, submissions go through the new [community.obsidian.md](https://community.obsidian.md/) website:

1. Push a release (tag → GitHub Actions → Release assets).
2. Sign in to [community.obsidian.md](https://community.obsidian.md/) with your Obsidian account.
3. Link your GitHub account.
4. Go to **Plugins → New plugin** and enter your repo URL: `https://github.com/Hawaiine/oasisic-note-version-control`
5. Submit → automated review finishes within minutes.

After approval, new releases are automatically scanned — no re-submission needed.

---

## 🇨🇳 中文说明

**Oasisic Note Version Control** 是一款为 Obsidian Markdown 笔记设计的轻量版本控制插件，类似温和版 Git：帮你给笔记打快照、看历史、比较差异、恢复旧版本。

### 功能亮点 🚀

- 📝 手动创建快照 / 🔖 短 SHA 哈希 ID
- 🕒 时间线、颜色标签、版本计数
- ↩️ 一键恢复，恢复操作本身也生成新快照
- 🧭 文件改名后历史不丢，自动生成重命名快照
- 🟢🔴 三种差异对比布局（左右 / 行内 / 上下文件）
- 🔢 **自动快照配额隔离** — auto 类型不会挤占 manual/rename/restore
- 🛡️ **自动快照防抖** — 2.5 秒内多次编辑只产生一次提交
- 📏 **大文件 diff 保护** — 超过 3000 行自动切换为统计摘要视图
- ⚙️ 保存时自动快照、可配置版本上限
- 🌓 适配 Obsidian 亮色 / 深色主题
- 🌏 支持自动语言、English、简体中文

### 设置项 ⚙️

| 设置 | 说明 | 默认值 |
|------|------|--------|
| Language | 自动、English、简体中文 | 自动 |
| Version storage folder | 历史 JSON 文件存储位置 | `.versions` |
| Auto snapshot on save | 文件变化时自动创建快照 | 关闭 |
| Maximum versions per file | 每个文件总版本上限 | 50 |
| Max auto snapshots per file | 自动快照独立上限。手动/重命名/恢复快照不受影响 | 20 |
| Diff layout | 默认差异布局 | 左右对比 |

### 目录结构 📁

```
.
├── .github/workflows/release.yml   — CI/CD 自动构建
├── src/
│   ├── main.ts                     — 插件主逻辑
│   └── types.ts                    — 类型定义
├── manifest.json                   — 插件元数据
├── styles.css                      — 样式
├── README.md / LICENSE             — 文档与许可
├── versions.json                   — 版本兼容映射
├── package.json / tsconfig.json    — 构建配置
└── esbuild.config.mjs              — 构建脚本
```

### 提交到插件市场 🌍

自 2026 年 5 月起，通过 [community.obsidian.md](https://community.obsidian.md/) 提交，无需向 obsidian-releases 提 PR：

1. 推送 tag 触发 GitHub Actions 自动构建 Release
2. 登录 community.obsidian.md → 关联 GitHub
3. Plugins → New plugin → 填入仓库 URL → Submit
4. 自动审核，几分钟出结果

---

## License 📄

MIT License — Copyright (c) 2026 Hawaiine