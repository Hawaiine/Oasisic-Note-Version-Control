import {
  App,
  ItemView,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TAbstractFile,
  TFile,
  WorkspaceLeaf,
  moment,
  normalizePath
} from "obsidian";
import type { DiffLine, DiffViewMode, FileHistory, FileHistoryIndex, LanguageSetting, LargeFileSummary, Version, VersionControlSettings, WordStats } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const PLUGIN_NAME = "Oasisic Note Version Control";
const VIEW_TYPE_VERSION_CONTROL = "oasisic-note-version-control-view";

const TRANSLATIONS = {
  en: {
    onlyMarkdown: "Only Markdown files can be versioned.",
    noChanges: "No changes to commit.",
    manualSnapshot: "Manual snapshot",
    autoSnapshot: "Auto snapshot: {{name}}",
    renameSnapshot: "Rename: {{oldName}} -> {{newName}}",
    contentSummary: "Edit: {{additions}} additions, {{deletions}} deletions",
    contentSummaryHeading: "Updated heading: {{heading}}",
    contentSummaryTable: "Updated table content",
    contentSummaryList: "Updated list items",
    contentSummaryLarge: "Large edit: {{additions}} additions, {{deletions}} deletions",
    loadHistoryFailed: "Could not load version history for {{name}}.",
    versionNotFound: "Version not found.",
    beforeRevert: "Before reverting to {{id}}",
    revertMessage: "Revert to {{id}}: {{message}}",
    confirmRevertTitle: "Revert this note?",
    confirmRevertBody: "This will restore version {{id}} and create a new snapshot for the revert.",
    cancel: "Cancel",
    revert: "Revert",
    reverting: "Reverting...",
    viewTitle: "Version Control",
    noMarkdownTitle: "No Markdown file selected",
    noMarkdownBody: "Open a note to view or create version snapshots.",
    currentNote: "Current note",
    snapshot: "Snapshot",
    commitMessage: "Commit message",
    createdSnapshot: "Created snapshot {{id}}.",
    timeline: "Timeline",
    newestFirst: "Newest first",
    noSnapshots: "No snapshots yet",
    noSnapshotsBody: "Create the first snapshot to start tracking this note.",
    view: "View",
    details: "Details",
    selectSnapshot: "Select a snapshot to inspect its metadata and diff.",
    message: "Message",
    created: "Created",
    unknown: "Unknown",
    hash: "Hash",
    fileName: "File name",
    previousName: "Previous name",
    wordStats: "Words",
    lineStats: "Lines",
    changeKind: "Change",
    changedName: "Renamed note",
    changedContent: "Edited content",
    changedRestore: "Restored version",
    changedManual: "Manual snapshot",
    diffFileHeader: "Markdown file",
    linesChanged: "{{additions}} additions and {{deletions}} deletions",
    diffMode: "Diff layout",
    diffModeSplit: "Side by side",
    diffModeInline: "Inline",
    diffModeStacked: "Top / bottom",
    before: "Before",
    after: "After",
    diffTitle: "Diff against current file",
    showingLines: "Showing first {{shown}} of {{total}} lines",
    noDifferences: "No differences.",
    preview: "Content preview",
    snapshotBody: "Snapshot body",
    emptyFile: "(empty file)",
    restored: "Restored {{id}}.",
    ribbon: "Open version control",
    commandOpen: "Open version control panel",
    commandSnapshot: "Create version snapshot for current note",
    autoSnapshotFailed: "Auto snapshot failed. Check the developer console for details.",
    openFailed: "Could not open version control view.",
    snapshotFailed: "Snapshot failed. Check the developer console for details.",
    settingsTitle: PLUGIN_NAME,
    storageFolder: "Version storage folder",
    storageFolderDesc: "Folder inside the vault where history JSON files are stored.",
    autoOnSave: "Auto snapshot on save",
    autoOnSaveDesc: "Create a version automatically when a Markdown file changes.",
    maxVersions: "Maximum versions per file",
    maxVersionsDesc: "Old snapshots are trimmed after this limit.",
    maxAutoVersions: "Max auto snapshots per file",
    maxAutoVersionsDesc: "Auto snapshots have a separate cap. Manual/rename/restore snapshots are never auto-trimmed.",
    largeFileDiffSummary: "Large file: {{additions}} additions, {{deletions}} deletions, {{words}} words",
    largeFileDiffNotice: "This file is too large for line-level diff. Showing statistical summary only.",
    compactTimeline: "Compact timeline",
    modalHint: "Ribbon button opens a floating history window.",
    language: "Language",
    languageDesc: "Choose the plugin interface language.",
    languageAuto: "Auto",
    languageEnglish: "English",
    languageChinese: "简体中文"
  },
  "zh-CN": {
    onlyMarkdown: "只能为 Markdown 文件创建版本。",
    noChanges: "没有可提交的变更。",
    manualSnapshot: "手动快照",
    autoSnapshot: "自动快照：{{name}}",
    renameSnapshot: "重命名：{{oldName}} -> {{newName}}",
    contentSummary: "修改内容：新增 {{additions}} 行，删除 {{deletions}} 行",
    contentSummaryHeading: "更新标题：{{heading}}",
    contentSummaryTable: "更新表格内容",
    contentSummaryList: "调整列表内容",
    contentSummaryLarge: "大幅修改：新增 {{additions}} 行，删除 {{deletions}} 行",
    loadHistoryFailed: "无法加载 {{name}} 的版本历史。",
    versionNotFound: "未找到该版本。",
    beforeRevert: "恢复到 {{id}} 前的快照",
    revertMessage: "恢复到 {{id}}：{{message}}",
    confirmRevertTitle: "要恢复这篇笔记吗？",
    confirmRevertBody: "这会恢复版本 {{id}}，并为本次恢复操作创建一个新的快照。",
    cancel: "取消",
    revert: "恢复",
    reverting: "正在恢复...",
    viewTitle: "版本控制",
    noMarkdownTitle: "未选择 Markdown 文件",
    noMarkdownBody: "打开一篇笔记后即可查看或创建版本快照。",
    currentNote: "当前笔记",
    snapshot: "创建快照",
    commitMessage: "提交信息",
    createdSnapshot: "已创建快照 {{id}}。",
    timeline: "时间线",
    newestFirst: "最新优先",
    noSnapshots: "还没有快照",
    noSnapshotsBody: "创建第一个快照，开始追踪这篇笔记。",
    view: "查看",
    details: "详情",
    selectSnapshot: "选择一个快照以查看元数据和差异。",
    message: "提交信息",
    created: "创建时间",
    unknown: "未知",
    hash: "哈希",
    fileName: "文件名",
    previousName: "原文件名",
    wordStats: "字数",
    lineStats: "行数",
    changeKind: "类型",
    changedName: "重命名笔记",
    changedContent: "修改内容",
    changedRestore: "恢复版本",
    changedManual: "手动快照",
    diffFileHeader: "Markdown 文件",
    linesChanged: "新增 {{additions}} 行，删除 {{deletions}} 行",
    diffMode: "差异布局",
    diffModeSplit: "左右对比",
    diffModeInline: "上下行内",
    diffModeStacked: "上下文件",
    before: "修改前",
    after: "修改后",
    diffTitle: "与当前文件对比",
    showingLines: "显示前 {{shown}} 行，共 {{total}} 行",
    noDifferences: "没有差异。",
    preview: "内容预览",
    snapshotBody: "快照正文",
    emptyFile: "（空文件）",
    restored: "已恢复 {{id}}。",
    ribbon: "打开版本控制",
    commandOpen: "打开版本控制面板",
    commandSnapshot: "为当前笔记创建版本快照",
    autoSnapshotFailed: "自动快照失败。请查看开发者控制台了解详情。",
    openFailed: "无法打开版本控制视图。",
    snapshotFailed: "快照创建失败。请查看开发者控制台了解详情。",
    settingsTitle: PLUGIN_NAME,
    storageFolder: "版本存储文件夹",
    storageFolderDesc: "保险库内用于保存历史 JSON 文件的文件夹。",
    autoOnSave: "保存时自动快照",
    autoOnSaveDesc: "Markdown 文件发生变化时自动创建版本。",
    maxVersions: "每个文件的最大版本数",
    maxVersionsDesc: "超过此数量后会清理较旧的快照。",
    maxAutoVersions: "自动快照上限",
    maxAutoVersionsDesc: "自动快照独立上限。手动/重命名/恢复类型的快照不会被自动清理。",
    largeFileDiffSummary: "大文件：新增 {{additions}} 行，删除 {{deletions}} 行，{{words}} 字",
    largeFileDiffNotice: "文件过大，已跳过逐行差异对比，仅显示统计数据。",
    compactTimeline: "紧凑时间线",
    modalHint: "侧边栏按钮会打开浮动历史窗口。",
    language: "语言",
    languageDesc: "选择插件界面语言。",
    languageAuto: "自动",
    languageEnglish: "English",
    languageChinese: "简体中文"
  }
} as const;

type TranslationKey = keyof typeof TRANSLATIONS.en;

function resolveLanguage(settings: VersionControlSettings): "en" | "zh-CN" {
  if (settings.language === "en" || settings.language === "zh-CN") {
    return settings.language;
  }

  const locale = `${moment.locale?.() ?? ""} ${navigator.language ?? ""}`.toLowerCase();
  return locale.includes("zh") ? "zh-CN" : "en";
}

function translate(settings: VersionControlSettings, key: TranslationKey, replacements: Record<string, string | number> = {}): string {
  let value: string = TRANSLATIONS[resolveLanguage(settings)][key] ?? TRANSLATIONS.en[key];
  for (const [name, replacement] of Object.entries(replacements)) {
    value = value.split(`{{${name}}}`).join(String(replacement));
  }
  return value;
}

export class VersionController {
  private cache = new Map<string, FileHistory>();
  private debounceTimers = new Map<string, number>();
  private restoredFileHashes = new Map<string, string>();
  private readonly DEBOUNCE_MS = 2500;
  private readonly LARGE_FILE_LINE_THRESHOLD = 3000;

  constructor(
    private app: App,
    private settings: VersionControlSettings
  ) {}

  updateSettings(settings: VersionControlSettings): void {
    this.settings = settings;
    this.cache.clear();
    // Clear debounce timers on settings change
    for (const timer of this.debounceTimers.values()) {
      window.clearTimeout(timer);
    }
    this.debounceTimers.clear();
    this.restoredFileHashes.clear();
  }

  async commit(file: TFile, message: string): Promise<Version | null> {
    if (!this.isVersionableMarkdown(file)) {
      new Notice(translate(this.settings, "onlyMarkdown"));
      return null;
    }

    const content = await this.app.vault.read(file);
    const contentHash = await this.hash(content);
    const history = await this.loadHistory(file);
    const diffStats = this.getDiffStats(history.versions[0]?.content ?? "", content);
    const wordStats = this.getWordStats(content);

    if (history.currentHash === contentHash && history.versions.length > 0) {
      new Notice(translate(this.settings, "noChanges"));
      return null;
    }

    const version: Version = {
      id: (await this.hash(`${file.path}:${contentHash}:${Date.now()}`)).slice(0, 8),
      timestamp: Date.now(),
      message: message.trim() || translate(this.settings, "manualSnapshot"),
      content,
      hash: contentHash,
      filePath: file.path,
      fileName: file.name,
      changeType: "manual",
      additions: diffStats.additions,
      deletions: diffStats.deletions,
      wordCount: wordStats.words,
      charCount: wordStats.chars
    };

    history.filePath = file.path;
    history.fileName = file.name;
    history.currentHash = contentHash;
    history.versions = this.trimVersions([version, ...history.versions]);

    await this.saveHistory(file, history);
    this.cache.set(file.path, history);
    return version;
  }

  async autoCommit(file: TFile, content?: string): Promise<Version | null> {
    if (!this.settings.autoCommitOnSave || !this.isVersionableMarkdown(file)) {
      return null;
    }

    const fileContent = content ?? (await this.app.vault.read(file));
    const contentHash = await this.hash(fileContent);
    
    // Skip if this content matches a recently restored version (prevents revert-triggered auto-snapshot)
    const restoredHash = this.restoredFileHashes.get(file.path);
    if (restoredHash && contentHash === restoredHash) {
      return null;
    }

    const history = await this.loadHistory(file);
    const previousContent = history.versions[0]?.content ?? "";
    const diffStats = this.getDiffStats(previousContent, fileContent);
    const wordStats = this.getWordStats(fileContent);

    if (history.currentHash === contentHash) {
      return null;
    }

    const version: Version = {
      id: (await this.hash(`${file.path}:${contentHash}:${Date.now()}`)).slice(0, 8),
      timestamp: Date.now(),
      message: this.summarizeAutoCommit(file, previousContent, fileContent, diffStats),
      content: fileContent,
      hash: contentHash,
      filePath: file.path,
      fileName: file.name,
      changeType: "auto",
      additions: diffStats.additions,
      deletions: diffStats.deletions,
      wordCount: wordStats.words,
      charCount: wordStats.chars
    };

    history.filePath = file.path;
    history.fileName = file.name;
    history.currentHash = contentHash;
    history.versions = this.trimVersions([version, ...history.versions]);
    await this.saveHistory(file, history);
    this.cache.set(file.path, history);
    return version;
  }

  async loadHistory(file: TFile): Promise<FileHistory> {
    const cached = this.cache.get(file.path);
    if (cached) {
      return {
        ...cached,
        versions: [...cached.versions]
      };
    }

    const path = await this.getHistoryPath(file);
    let history: FileHistory = {
      historyId: await this.getHistoryId(file),
      filePath: file.path,
      fileName: file.name,
      versions: [],
      currentHash: ""
    };

    try {
      if (await this.app.vault.adapter.exists(path)) {
        const raw = await this.app.vault.adapter.read(path);
        history = this.normalizeHistory(JSON.parse(raw), file.path);
      }
    } catch (error) {
      console.error("Failed to load version history", error);
      new Notice(translate(this.settings, "loadHistoryFailed", { name: file.basename }));
    }

    this.cache.set(file.path, history);
    return {
      ...history,
      versions: [...history.versions]
    };
  }

  async revertToVersion(file: TFile, versionId: string): Promise<boolean> {
    const history = await this.loadHistory(file);
    const target = history.versions.find((version) => version.id === versionId);

    if (!target) {
      new Notice(translate(this.settings, "versionNotFound"));
      return false;
    }

    const currentContent = await this.app.vault.read(file);
    const currentHash = await this.hash(currentContent);
    if (currentHash !== history.currentHash || history.versions.length === 0) {
      await this.commit(file, translate(this.settings, "beforeRevert", { id: target.id }));
    }

    this.restoredFileHashes.set(file.path, target.hash);
    try {
      await this.app.vault.modify(file, target.content);
    } finally {
      // Clean up after a brief delay to allow vault modify events to flush
      window.setTimeout(() => {
        this.restoredFileHashes.delete(file.path);
      }, 1000);
    }

    const updatedHistory = await this.loadHistory(file);
    const restoredHash = await this.hash(target.content);
    const diffStats = this.getDiffStats(currentContent, target.content);
    const wordStats = this.getWordStats(target.content);
    const restoreVersion: Version = {
      id: (await this.hash(`${file.path}:${restoredHash}:restore:${Date.now()}`)).slice(0, 8),
      timestamp: Date.now(),
      message: translate(this.settings, "revertMessage", { id: target.id, message: target.message }),
      content: target.content,
      hash: restoredHash,
      filePath: file.path,
      fileName: file.name,
      changeType: "restore",
      additions: diffStats.additions,
      deletions: diffStats.deletions,
      wordCount: wordStats.words,
      charCount: wordStats.chars
    };

    updatedHistory.filePath = file.path;
    updatedHistory.fileName = file.name;
    updatedHistory.currentHash = restoredHash;
    updatedHistory.versions = this.trimVersions([restoreVersion, ...updatedHistory.versions]);
    await this.saveHistory(file, updatedHistory);
    this.cache.set(file.path, updatedHistory);
    return true;
  }

  getVersionDiff(content1: string, content2: string): DiffLine[] {
    const oldLines = content1.split(/\r?\n/);
    const newLines = content2.split(/\r?\n/);
    const table = this.buildLcsTable(oldLines, newLines);
    const result: DiffLine[] = [];
    let oldIndex = 0;
    let newIndex = 0;

    while (oldIndex < oldLines.length && newIndex < newLines.length) {
      if (oldLines[oldIndex] === newLines[newIndex]) {
        result.push({
          type: "context",
          oldLine: oldIndex + 1,
          newLine: newIndex + 1,
          content: oldLines[oldIndex]
        });
        oldIndex++;
        newIndex++;
      } else if (table[oldIndex + 1]?.[newIndex] >= table[oldIndex]?.[newIndex + 1]) {
        result.push({
          type: "removed",
          oldLine: oldIndex + 1,
          content: oldLines[oldIndex]
        });
        oldIndex++;
      } else {
        result.push({
          type: "added",
          newLine: newIndex + 1,
          content: newLines[newIndex]
        });
        newIndex++;
      }
    }

    while (oldIndex < oldLines.length) {
      result.push({ type: "removed", oldLine: oldIndex + 1, content: oldLines[oldIndex] });
      oldIndex++;
    }

    while (newIndex < newLines.length) {
      result.push({ type: "added", newLine: newIndex + 1, content: newLines[newIndex] });
      newIndex++;
    }

    return result;
  }

  clearCacheFor(path: string): void {
    this.cache.delete(path);
  }

  async handleDelete(file: TAbstractFile): Promise<void> {
    const index = await this.loadIndex();
    if (index.files[file.path]) {
      delete index.files[file.path];
      await this.saveIndex(index);
    }
    this.cache.delete(file.path);
  }

  async handleRename(file: TAbstractFile, oldPath: string): Promise<Version | null> {
    if (!(file instanceof TFile) || file.extension !== "md") {
      return null;
    }

    const index = await this.loadIndex();
    let oldHistoryId = index.files[oldPath];
    if (!oldHistoryId) {
      const legacyId = await this.createHistoryIdFromPath(oldPath);
      if (await this.app.vault.adapter.exists(normalizePath(`${this.cleanVersionDir()}/${legacyId}.history.json`))) {
        oldHistoryId = legacyId;
      }
    }
    if (oldHistoryId) {
      index.files[file.path] = oldHistoryId;
      delete index.files[oldPath];
      await this.saveIndex(index);
      this.cache.delete(oldPath);
    }

    if (file.path.startsWith(`${this.cleanVersionDir()}/`)) {
      return null;
    }

    const content = await this.app.vault.read(file);
    const contentHash = await this.hash(content);
    const history = await this.loadHistory(file);
    const wordStats = this.getWordStats(content);
    const oldName = oldPath.split("/").pop() ?? oldPath;

    const version: Version = {
      id: (await this.hash(`${oldPath}:${file.path}:rename:${Date.now()}`)).slice(0, 8),
      timestamp: Date.now(),
      message: translate(this.settings, "renameSnapshot", { oldName, newName: file.name }),
      content,
      hash: contentHash,
      filePath: file.path,
      fileName: file.name,
      previousFilePath: oldPath,
      previousFileName: oldName,
      changeType: "rename",
      additions: 0,
      deletions: 0,
      wordCount: wordStats.words,
      charCount: wordStats.chars
    };

    history.filePath = file.path;
    history.fileName = file.name;
    history.currentHash = contentHash;
    history.versions = this.trimVersions([version, ...history.versions]);
    await this.saveHistory(file, history);
    this.cache.set(file.path, history);
    return version;
  }

  isVersionableMarkdown(file: TAbstractFile | null): file is TFile {
    return file instanceof TFile && file.extension === "md" && !file.path.startsWith(`${this.cleanVersionDir()}/`);
  }

  private async saveHistory(file: TFile, history: FileHistory): Promise<void> {
    await this.ensureVersionDir();
    history.historyId = await this.getHistoryId(file);
    const path = await this.getHistoryPath(file);
    await this.app.vault.adapter.write(path, JSON.stringify(history, null, 2));
  }

  private async ensureVersionDir(): Promise<void> {
    const dir = this.cleanVersionDir();
    const parts = dir.split("/").filter(Boolean);
    let current = "";

    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (!(await this.app.vault.adapter.exists(current))) {
        await this.app.vault.adapter.mkdir(current);
      }
    }
  }

  private async getHistoryPath(file: TFile): Promise<string> {
    const historyId = await this.getHistoryId(file);
    return normalizePath(`${this.cleanVersionDir()}/${historyId}.history.json`);
  }

  private async getHistoryId(file: TFile): Promise<string> {
    const index = await this.loadIndex();
    const existing = index.files[file.path];
    if (existing) {
      return existing;
    }

    const historyId = await this.createHistoryIdFromPath(file.path);
    index.files[file.path] = historyId;
    await this.saveIndex(index);
    return historyId;
  }

  private async createHistoryIdFromPath(path: string): Promise<string> {
    const fileName = path.split("/").pop() ?? "note";
    const basename = fileName.replace(/\.md$/i, "");
    const safeName = basename.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "note";
    const pathHash = (await this.hash(path)).slice(0, 8);
    return `${safeName}-${pathHash}`;
  }

  private async loadIndex(): Promise<FileHistoryIndex> {
    const path = this.getIndexPath();
    try {
      if (await this.app.vault.adapter.exists(path)) {
        const raw = await this.app.vault.adapter.read(path);
        const parsed = JSON.parse(raw) as Partial<FileHistoryIndex>;
        return {
          files: parsed.files && typeof parsed.files === "object" ? { ...parsed.files } : {}
        };
      }
    } catch (error) {
      console.error("Failed to load version history index", error);
    }

    return { files: {} };
  }

  private async saveIndex(index: FileHistoryIndex): Promise<void> {
    await this.ensureVersionDir();
    await this.app.vault.adapter.write(this.getIndexPath(), JSON.stringify(index, null, 2));
  }

  private getIndexPath(): string {
    return normalizePath(`${this.cleanVersionDir()}/index.json`);
  }

  private cleanVersionDir(): string {
    return normalizePath(this.settings.versionDir.trim() || DEFAULT_SETTINGS.versionDir).replace(/\/+$/, "");
  }

  private normalizeHistory(raw: unknown, fallbackPath: string): FileHistory {
    const candidate = raw as Partial<FileHistory>;
    const versions = Array.isArray(candidate.versions)
      ? candidate.versions
          .filter((version): version is Version => {
            const item = version as Partial<Version>;
            return Boolean(item.id && typeof item.content === "string" && typeof item.timestamp === "number");
          })
          .map((version) => ({
            ...version,
            filePath: version.filePath ?? fallbackPath,
            fileName: version.fileName ?? fallbackPath.split("/").pop() ?? fallbackPath,
            changeType: version.changeType ?? "manual",
            wordCount: version.wordCount ?? this.getWordStats(version.content).words,
            charCount: version.charCount ?? this.getWordStats(version.content).chars
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
      : [];

    return {
      historyId: typeof candidate.historyId === "string" ? candidate.historyId : undefined,
      filePath: typeof candidate.filePath === "string" ? candidate.filePath : fallbackPath,
      fileName: typeof candidate.fileName === "string" ? candidate.fileName : fallbackPath.split("/").pop() ?? fallbackPath,
      versions,
      currentHash: typeof candidate.currentHash === "string" ? candidate.currentHash : versions[0]?.hash ?? ""
    };
  }

  getWordStats(content: string): WordStats {
    const cjkMatches = content.match(/[\u4e00-\u9fff]/g) ?? [];
    const latinMatches = content.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) ?? [];
    return {
      words: cjkMatches.length + latinMatches.length,
      chars: content.replace(/\s/g, "").length,
      lines: content.length === 0 ? 0 : content.split(/\r?\n/).length
    };
  }

  private getDiffStats(before: string, after: string): { additions: number; deletions: number } {
    const diff = this.getVersionDiff(before, after);
    return {
      additions: diff.filter((line) => line.type === "added").length,
      deletions: diff.filter((line) => line.type === "removed").length
    };
  }

  private summarizeAutoCommit(
    file: TFile,
    before: string,
    after: string,
    diffStats: { additions: number; deletions: number }
  ): string {
    const beforeTitle = this.getFirstHeading(before);
    const afterTitle = this.getFirstHeading(after);
    if (beforeTitle !== afterTitle && afterTitle) {
      return translate(this.settings, "contentSummaryHeading", { heading: afterTitle });
    }

    if (this.hasTableChange(before, after)) {
      return `${translate(this.settings, "contentSummaryTable")} · ${file.basename}`;
    }

    if (this.hasListChange(before, after)) {
      return `${translate(this.settings, "contentSummaryList")} · ${file.basename}`;
    }

    const total = diffStats.additions + diffStats.deletions;
    if (total >= 12) {
      return `${translate(this.settings, "contentSummaryLarge", diffStats)} · ${file.basename}`;
    }

    return `${translate(this.settings, "contentSummary", diffStats)} · ${file.basename}`;
  }

  private getFirstHeading(content: string): string {
    const heading = content.split(/\r?\n/).find((line) => /^#{1,3}\s+\S/.test(line));
    return heading?.replace(/^#{1,3}\s+/, "").trim().slice(0, 32) ?? "";
  }

  private hasTableChange(before: string, after: string): boolean {
    const tableLines = (content: string) => content.split(/\r?\n/).filter((line) => /^\s*\|.*\|\s*$/.test(line)).join("\n");
    return tableLines(before) !== tableLines(after) && tableLines(after).length > 0;
  }

  private hasListChange(before: string, after: string): boolean {
    const listLines = (content: string) => content.split(/\r?\n/).filter((line) => /^\s*([-*+]|\d+\.)\s+/.test(line)).join("\n");
    return listLines(before) !== listLines(after) && listLines(after).length > 0;
  }

  /**
   * Trim versions with quota isolation:
   * 1. First, trim auto versions beyond maxAutoVersions
   * 2. If total still exceeds maxVersions, trim only auto versions
   * 3. Manual/rename/restore snapshots are never deleted for quota reasons
   */
  private trimVersions(versions: Version[]): Version[] {
    const maxAuto = this.settings.maxAutoVersions;
    const maxTotal = this.settings.maxVersions;

    let autoCount = 0;
    const preserved: Version[] = [];
    const autoVersionsToTrim: Version[] = [];

    // Separate auto and non-auto versions, keeping order
    for (const v of versions) {
      if (v.changeType === "auto") {
        if (autoCount < maxAuto) {
          preserved.push(v);
          autoCount++;
        } else {
          autoVersionsToTrim.push(v);
        }
      } else {
        preserved.push(v);
      }
    }

    // If still over maxTotal, trim oldest auto versions first
    if (preserved.length > maxTotal) {
      const excess = preserved.length - maxTotal;
      let trimmed = 0;
      const result: Version[] = [];
      for (const v of preserved) {
        if (trimmed < excess && v.changeType === "auto") {
          trimmed++;
          continue;
        }
        result.push(v);
      }
      return result;
    }

    return preserved;
  }

  /**
   * Get a summary for large files instead of computing full LCS diff.
   * Returns null if the file is small enough for line-level diff.
   */
  getLargeFileSummary(content1: string, content2: string): LargeFileSummary | null {
    const oldLines = content1.split(/\r?\n/);
    const newLines = content2.split(/\r?\n/);

    if (oldLines.length <= this.LARGE_FILE_LINE_THRESHOLD && newLines.length <= this.LARGE_FILE_LINE_THRESHOLD) {
      return null;
    }

    const oldWords = this.getWordStats(content1).words;
    const newWords = this.getWordStats(content2).words;
    const additions = Math.max(0, newLines.length - oldLines.length);
    const deletions = Math.max(0, oldLines.length - newLines.length);

    return {
      additions,
      deletions,
      words: Math.max(oldWords, newWords)
    };
  }

  private buildLcsTable(oldLines: string[], newLines: string[]): number[][] {
    const table = Array.from({ length: oldLines.length + 1 }, () => Array(newLines.length + 1).fill(0));

    for (let oldIndex = oldLines.length - 1; oldIndex >= 0; oldIndex--) {
      for (let newIndex = newLines.length - 1; newIndex >= 0; newIndex--) {
        table[oldIndex][newIndex] =
          oldLines[oldIndex] === newLines[newIndex]
            ? table[oldIndex + 1][newIndex + 1] + 1
            : Math.max(table[oldIndex + 1][newIndex], table[oldIndex][newIndex + 1]);
      }
    }

    return table;
  }

  private async hash(content: string): Promise<string> {
    const bytes = new TextEncoder().encode(content);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
}

// ──────────────────────────────────────────────
// Shared rendering helpers
// ──────────────────────────────────────────────

function renderMeta(parent: HTMLElement, label: string, value: string): void {
  const item = parent.createDiv("gsvc-meta-item");
  item.createEl("span", { text: label });
  item.createEl("strong", { text: value });
}

function renderStats(parent: HTMLElement, diff: DiffLine[], t: (key: string, replacements?: Record<string, string | number>) => string): void {
  const additions = diff.filter((line) => line.type === "added").length;
  const removals = diff.filter((line) => line.type === "removed").length;
  const stats = parent.createDiv("gsvc-stats");
  stats.createSpan({ cls: "gsvc-added", text: `+${additions}` });
  stats.createSpan({ cls: "gsvc-removed", text: `-${removals}` });
}

function renderDiffRow(parent: HTMLElement, line: DiffLine): void {
  const row = parent.createDiv(`gsvc-diff-line is-${line.type}`);
  row.createEl("span", {
    cls: "gsvc-line-no",
    text: `${line.oldLine ?? ""}${line.oldLine && line.newLine ? " " : ""}${line.newLine ?? ""}`
  });
  row.createEl("span", {
    cls: "gsvc-line-marker",
    text: line.type === "context" ? " " : line.type === "added" ? "+" : "-"
  });
  row.createEl("code", { text: line.content || " " });
}

function renderDiffByMode(
  parent: HTMLElement,
  lines: DiffLine[],
  mode: DiffViewMode,
  t: (key: string, replacements?: Record<string, string | number>) => string
): void {
  const diffEl = parent.createDiv(`gsvc-diff is-${mode}`);

  if (lines.length === 0) {
    diffEl.createDiv("gsvc-diff-empty").setText(t("noDifferences"));
    return;
  }

  if (mode === "split") {
    const grid = diffEl.createDiv("gsvc-split-diff");
    grid.createEl("strong", { text: t("before") });
    grid.createEl("strong", { text: t("after") });
    lines.forEach((line) => {
      const before = grid.createDiv(`gsvc-diff-line is-${line.type === "added" ? "empty" : line.type}`);
      const after = grid.createDiv(`gsvc-diff-line is-${line.type === "removed" ? "empty" : line.type}`);
      if (line.type !== "added") renderDiffRow(before, line);
      if (line.type !== "removed") renderDiffRow(after, line);
    });
    return;
  }

  if (mode === "stacked") {
    const before = diffEl.createDiv("gsvc-stacked-block");
    before.createEl("strong", { text: t("before") });
    lines.filter((line) => line.type !== "added").forEach((line) => renderDiffRow(before, line));
    const after = diffEl.createDiv("gsvc-stacked-block");
    after.createEl("strong", { text: t("after") });
    lines.filter((line) => line.type !== "removed").forEach((line) => renderDiffRow(after, line));
    return;
  }

  // inline
  lines.forEach((line) => renderDiffRow(diffEl, line));
}

function renderTimelineItem(
  list: HTMLElement,
  version: Version,
  isSelected: boolean,
  isLatest: boolean,
  t: (key: string, replacements?: Record<string, string | number>) => string,
  onView: () => void,
  onRevert: (() => void) | null
): void {
  const item = list.createDiv({
    cls: `gsvc-version-item ${isSelected ? "is-selected" : ""}`
  });

  const rail = item.createDiv("gsvc-rail");
  rail.createDiv(`gsvc-dot ${isLatest ? "is-latest" : ""}`);

  const body = item.createDiv("gsvc-version-body");
  const top = body.createDiv("gsvc-version-top");

  const changeLabel =
    version.changeType === "rename" ? t("changedName") :
    version.changeType === "restore" ? t("changedRestore") :
    version.changeType === "manual" ? t("changedManual") :
    t("changedContent");

  top.createEl("span", { cls: `gsvc-change-badge is-${version.changeType}`, text: changeLabel });
  top.createEl("strong", { text: version.message });
  top.createEl("code", { text: version.id });

  const meta = body.createDiv("gsvc-version-meta");
  meta.createSpan({ text: formatDate(version.timestamp) });
  meta.createSpan({ cls: "gsvc-mini-add", text: `+${version.additions ?? 0}` });
  meta.createSpan({ cls: "gsvc-mini-del", text: `-${version.deletions ?? 0}` });
  meta.createSpan({ text: version.fileName });

  const actions = body.createDiv("gsvc-version-actions");
  actions.createEl("button", { text: t("view") }).addEventListener("click", (event) => {
    event.stopPropagation();
    onView();
  });
  if (onRevert) {
    actions.createEl("button", { text: t("revert") }).addEventListener("click", (event) => {
      event.stopPropagation();
      onRevert();
    });
  }

  item.addEventListener("click", onView);
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

class ConfirmRevertModal extends Modal {
  private confirmed = false;

  constructor(
    app: App,
    private settings: VersionControlSettings,
    private version: Version,
    private onConfirm: () => Promise<void>
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("gsvc-confirm-modal");
    contentEl.createEl("h2", { text: translate(this.settings, "confirmRevertTitle") });
    contentEl.createEl("p", {
      text: translate(this.settings, "confirmRevertBody", { id: this.version.id })
    });

    const actions = contentEl.createDiv("gsvc-modal-actions");
    actions.createEl("button", { text: translate(this.settings, "cancel") }).addEventListener("click", () => this.close());
    const confirmButton = actions.createEl("button", {
      text: translate(this.settings, "revert"),
      cls: "mod-warning"
    });
    confirmButton.addEventListener("click", async () => {
      if (this.confirmed) {
        return;
      }
      this.confirmed = true;
      confirmButton.setText(translate(this.settings, "reverting"));
      await this.onConfirm();
      this.close();
    });
  }
}

export class VersionControlView extends ItemView {
  private currentFile: TFile | null = null;
  private history: FileHistory | null = null;
  private selectedVersion: Version | null = null;

  constructor(
    leaf: WorkspaceLeaf,
    private plugin: VersionControlPlugin
  ) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_VERSION_CONTROL;
  }

  getDisplayText(): string {
    return this.plugin.t("viewTitle");
  }

  getIcon(): string {
    return "git-branch";
  }

  async onOpen(): Promise<void> {
    this.containerEl.addClass("gsvc-view");
    await this.setFile(this.plugin.getActiveMarkdownFile());
  }

  async setFile(file: TFile | null): Promise<void> {
    this.currentFile = file;
    if (!file || !this.plugin.controller.isVersionableMarkdown(file)) {
      this.history = null;
      this.selectedVersion = null;
      this.renderEmpty();
      return;
    }

    this.history = await this.plugin.controller.loadHistory(file);
    this.selectedVersion = this.history.versions[0] ?? null;
    await this.render();
  }

  async refresh(): Promise<void> {
    if (this.currentFile) {
      this.plugin.controller.clearCacheFor(this.currentFile.path);
    }
    await this.setFile(this.currentFile ?? this.plugin.getActiveMarkdownFile());
  }

  private renderEmpty(): void {
    const content = this.contentEl;
    content.empty();
    const empty = content.createDiv("gsvc-empty");
    empty.createEl("div", { cls: "gsvc-empty-icon", text: "⌁" });
    empty.createEl("h3", { text: this.plugin.t("noMarkdownTitle") });
    empty.createEl("p", { text: this.plugin.t("noMarkdownBody") });
  }

  private async render(): Promise<void> {
    if (!this.currentFile || !this.history) {
      this.renderEmpty();
      return;
    }

    const content = this.contentEl;
    content.empty();
    const shell = content.createDiv("gsvc-shell");
    this.renderHeader(shell);

    const split = shell.createDiv("gsvc-split");
    this.renderTimeline(split);
    await this.renderDetails(split);
  }

  private renderHeader(parent: HTMLElement): void {
    if (!this.currentFile || !this.history) {
      return;
    }

    const header = parent.createDiv("gsvc-header");
    const titleWrap = header.createDiv("gsvc-title-wrap");
    titleWrap.createEl("div", { cls: "gsvc-eyebrow", text: this.plugin.t("currentNote") });
    titleWrap.createEl("h2", { text: this.currentFile.basename });
    titleWrap.createEl("div", { cls: "gsvc-path", text: this.currentFile.path });

    const actions = header.createDiv("gsvc-header-actions");
    const snapshotButton = actions.createEl("button", { cls: "gsvc-primary", text: this.plugin.t("snapshot") });
    snapshotButton.addEventListener("click", async () => {
      const message = window.prompt(this.plugin.t("commitMessage"), this.plugin.t("manualSnapshot"));
      if (message === null || !this.currentFile) {
        return;
      }
      const version = await this.plugin.controller.commit(this.currentFile, message);
      if (version) {
        new Notice(this.plugin.t("createdSnapshot", { id: version.id }));
      }
      await this.refresh();
    });

    actions.createEl("span", {
      cls: "gsvc-counter",
      text: `${this.history.versions.length}/${this.plugin.settings.maxVersions}`
    });
  }

  private renderTimeline(parent: HTMLElement): void {
    if (!this.history) {
      return;
    }

    const timeline = parent.createDiv("gsvc-timeline");
    const timelineHeader = timeline.createDiv("gsvc-panel-heading");
    timelineHeader.createEl("span", { text: this.plugin.t("timeline") });
    timelineHeader.createEl("small", { text: this.plugin.t("newestFirst") });

    const list = timeline.createDiv("gsvc-version-list");
    if (this.history.versions.length === 0) {
      const blank = list.createDiv("gsvc-blank-list");
      blank.createEl("strong", { text: this.plugin.t("noSnapshots") });
      blank.createEl("span", { text: this.plugin.t("noSnapshotsBody") });
      return;
    }

    this.history.versions.forEach((version, index) => {
      renderTimelineItem(
        list,
        version,
        this.selectedVersion?.id === version.id,
        index === 0,
        this.plugin.t.bind(this.plugin),
        async () => {
          this.selectedVersion = version;
          await this.render();
        },
        this.currentFile ? () => this.confirmRevert(version) : null
      );
    });
  }

  private async renderDetails(parent: HTMLElement): Promise<void> {
    const details = parent.createDiv("gsvc-details");
    const heading = details.createDiv("gsvc-panel-heading");
    heading.createEl("span", { text: this.plugin.t("details") });

    if (!this.currentFile || !this.history || !this.selectedVersion) {
      details.createDiv("gsvc-empty-details").setText(this.plugin.t("selectSnapshot"));
      return;
    }

    heading.createEl("small", { text: this.selectedVersion.id });

    const meta = details.createDiv("gsvc-meta-grid");
    renderMeta(meta, this.plugin.t("message"), this.selectedVersion.message);
    renderMeta(meta, this.plugin.t("created"), formatDate(this.selectedVersion.timestamp));
    renderMeta(meta, this.plugin.t("fileName"), this.selectedVersion.fileName);
    if (this.selectedVersion.previousFileName) {
      renderMeta(meta, this.plugin.t("previousName"), this.selectedVersion.previousFileName);
    }
    renderMeta(meta, this.plugin.t("wordStats"), String(this.selectedVersion.wordCount ?? this.plugin.controller.getWordStats(this.selectedVersion.content).words));
    renderMeta(meta, this.plugin.t("hash"), this.selectedVersion.hash.slice(0, 16));

    const currentContent = await this.app.vault.read(this.currentFile);
    const largeFileSummary = this.plugin.controller.getLargeFileSummary(this.selectedVersion.content, currentContent);

    if (largeFileSummary) {
      // Large file: show simplified stat view
      renderStats(details, [], this.plugin.t.bind(this.plugin));
      const block = details.createDiv("gsvc-section");
      const title = block.createDiv("gsvc-section-title");
      title.createEl("span", { text: this.plugin.t("diffTitle") });
      const fileHeader = block.createDiv("gsvc-diff-file-header");
      fileHeader.createEl("span", { cls: "gsvc-file-icon", text: "MD" });
      fileHeader.createEl("strong", { text: this.selectedVersion.fileName });
      fileHeader.createEl("small", {
        text: this.plugin.t("largeFileDiffSummary", {
          additions: largeFileSummary.additions,
          deletions: largeFileSummary.deletions,
          words: largeFileSummary.words
        })
      });
      const notice = block.createDiv("gsvc-large-file-notice");
      notice.setText(this.plugin.t("largeFileDiffNotice"));
    } else {
      const diff = this.plugin.controller.getVersionDiff(this.selectedVersion.content, currentContent);
      renderStats(details, diff, this.plugin.t.bind(this.plugin));
      this.renderDiff(details, diff);
    }
    this.renderPreview(details, this.selectedVersion.content);
  }

  // --- Diff rendering ---

  private renderDiff(parent: HTMLElement, diff: DiffLine[]): void {
    const block = parent.createDiv("gsvc-section");
    const additions = diff.filter((line) => line.type === "added").length;
    const deletions = diff.filter((line) => line.type === "removed").length;
    const title = block.createDiv("gsvc-section-title");
    title.createEl("span", { text: this.plugin.t("diffTitle") });
    const modeSwitch = title.createDiv("gsvc-diff-modes");
    (["split", "inline", "stacked"] as DiffViewMode[]).forEach((mode) => {
      const button = modeSwitch.createEl("button", {
        text: this.plugin.t(mode === "split" ? "diffModeSplit" : mode === "inline" ? "diffModeInline" : "diffModeStacked"),
        cls: this.plugin.settings.diffViewMode === mode ? "is-active" : ""
      });
      button.addEventListener("click", async () => {
        this.plugin.settings.diffViewMode = mode;
        await this.plugin.saveSettings();
        await this.render();
      });
    });
    if (diff.length > 50) {
      title.createEl("small", { text: this.plugin.t("showingLines", { shown: 50, total: diff.length }) });
    }

    const fileHeader = block.createDiv("gsvc-diff-file-header");
    fileHeader.createEl("span", { cls: "gsvc-file-icon", text: "MD" });
    fileHeader.createEl("strong", { text: this.selectedVersion?.fileName ?? this.plugin.t("diffFileHeader") });
    fileHeader.createEl("small", { text: this.plugin.t("linesChanged", { additions, deletions }) });

    renderDiffByMode(block, diff.slice(0, 50), this.plugin.settings.diffViewMode, this.plugin.t.bind(this.plugin));
  }

  // --- Content preview ---

  private renderPreview(parent: HTMLElement, content: string): void {
    const block = parent.createDiv("gsvc-section");
    const title = block.createDiv("gsvc-section-title");
    title.createEl("span", { text: this.plugin.t("preview") });
    title.createEl("small", { text: this.plugin.t("snapshotBody") });
    block.createEl("pre", { cls: "gsvc-preview", text: content.slice(0, 8000) || this.plugin.t("emptyFile") });
  }

  private confirmRevert(version: Version): void {
    if (!this.currentFile) {
      return;
    }

    new ConfirmRevertModal(this.app, this.plugin.settings, version, async () => {
      if (!this.currentFile) {
        return;
      }
      const restored = await this.plugin.controller.revertToVersion(this.currentFile, version.id);
      if (restored) {
        new Notice(this.plugin.t("restored", { id: version.id }));
        await this.refresh();
      }
    }).open();
  }
}

class VersionControlModal extends Modal {
  private history: FileHistory | null = null;
  private selectedVersion: Version | null = null;

  constructor(
    app: App,
    private plugin: VersionControlPlugin,
    private file: TFile
  ) {
    super(app);
  }

  onOpen(): void {
    this.modalEl.addClass("gsvc-floating-modal");
    this.refresh().catch(console.error);
  }

  private async refresh(): Promise<void> {
    this.plugin.controller.clearCacheFor(this.file.path);
    this.history = await this.plugin.controller.loadHistory(this.file);
    this.selectedVersion = this.selectedVersion
      ? this.history.versions.find((version) => version.id === this.selectedVersion?.id) ?? this.history.versions[0] ?? null
      : this.history.versions[0] ?? null;
    await this.render();
  }

  private async render(): Promise<void> {
    this.contentEl.empty();
    const shell = this.contentEl.createDiv("gsvc-shell gsvc-modal-shell");
    const header = shell.createDiv("gsvc-header");
    const title = header.createDiv("gsvc-title-wrap");
    title.createEl("div", { cls: "gsvc-eyebrow", text: this.plugin.t("currentNote") });
    title.createEl("h2", { text: this.file.basename });
    title.createEl("div", { cls: "gsvc-path", text: this.file.path });

    const actions = header.createDiv("gsvc-header-actions");
    const currentStats = this.plugin.controller.getWordStats(await this.app.vault.read(this.file));
    actions.createEl("span", { cls: "gsvc-counter", text: `${this.plugin.t("wordStats")} ${currentStats.words}` });
    const snapshot = actions.createEl("button", { cls: "gsvc-primary", text: this.plugin.t("snapshot") });
    snapshot.addEventListener("click", async () => {
      const message = window.prompt(this.plugin.t("commitMessage"), this.plugin.t("manualSnapshot"));
      if (message === null) {
        return;
      }
      await this.plugin.controller.commit(this.file, message);
      await this.refresh();
    });

    const split = shell.createDiv("gsvc-split");
    this.renderTimeline(split);
    await this.renderDetails(split);
  }

  private renderTimeline(parent: HTMLElement): void {
    const timeline = parent.createDiv("gsvc-timeline");
    const heading = timeline.createDiv("gsvc-panel-heading");
    heading.createEl("span", { text: this.plugin.t("timeline") });
    heading.createEl("small", { text: this.plugin.t("newestFirst") });
    const list = timeline.createDiv("gsvc-version-list");

    if (!this.history?.versions.length) {
      list.createDiv("gsvc-blank-list").setText(this.plugin.t("noSnapshots"));
      return;
    }

    this.history.versions.forEach((version, index) => {
      renderTimelineItem(
        list,
        version,
        this.selectedVersion?.id === version.id,
        index === 0,
        this.plugin.t.bind(this.plugin),
        async () => {
          this.selectedVersion = version;
          await this.render();
        },
        () => this.confirmRevert(version)
      );
    });
  }

  private async renderDetails(parent: HTMLElement): Promise<void> {
    const details = parent.createDiv("gsvc-details");
    const heading = details.createDiv("gsvc-panel-heading");
    heading.createEl("span", { text: this.plugin.t("details") });
    if (!this.selectedVersion) {
      details.createDiv("gsvc-empty-details").setText(this.plugin.t("selectSnapshot"));
      return;
    }

    const currentContent = await this.app.vault.read(this.file);
    const stats = this.plugin.controller.getWordStats(this.selectedVersion.content);
    const meta = details.createDiv("gsvc-meta-grid");
    renderMeta(meta, this.plugin.t("fileName"), this.selectedVersion.fileName);
    if (this.selectedVersion.previousFileName) {
      renderMeta(meta, this.plugin.t("previousName"), this.selectedVersion.previousFileName);
    }
    renderMeta(meta, this.plugin.t("wordStats"), String(stats.words));
    renderMeta(meta, this.plugin.t("lineStats"), String(stats.lines));
    renderMeta(meta, this.plugin.t("message"), this.selectedVersion.message);
    renderMeta(meta, this.plugin.t("created"), formatDate(this.selectedVersion.timestamp));
    if (this.selectedVersion.hash) {
      renderMeta(meta, this.plugin.t("hash"), this.selectedVersion.hash.slice(0, 16));
    }

    const largeFileSummary = this.plugin.controller.getLargeFileSummary(this.selectedVersion.content, currentContent);

    if (largeFileSummary) {
      renderStats(details, [], this.plugin.t.bind(this.plugin));
      const diffBlock = details.createDiv("gsvc-section");
      const title = diffBlock.createDiv("gsvc-section-title");
      title.createEl("span", { text: this.plugin.t("diffTitle") });
      const fileHeader = diffBlock.createDiv("gsvc-diff-file-header");
      fileHeader.createEl("span", { cls: "gsvc-file-icon", text: "MD" });
      fileHeader.createEl("strong", { text: this.selectedVersion.fileName });
      fileHeader.createEl("small", {
        text: this.plugin.t("largeFileDiffSummary", {
          additions: largeFileSummary.additions,
          deletions: largeFileSummary.deletions,
          words: largeFileSummary.words
        })
      });
      const notice = diffBlock.createDiv("gsvc-large-file-notice");
      notice.setText(this.plugin.t("largeFileDiffNotice"));
    } else {
      const diff = this.plugin.controller.getVersionDiff(this.selectedVersion.content, currentContent);
      renderStats(details, diff, this.plugin.t.bind(this.plugin));
      const diffBlock = details.createDiv("gsvc-section");
      const title = diffBlock.createDiv("gsvc-section-title");
      title.createEl("span", { text: this.plugin.t("diffTitle") });
      const modeSwitch = title.createDiv("gsvc-diff-modes");
      (["split", "inline", "stacked"] as DiffViewMode[]).forEach((mode) => {
        const button = modeSwitch.createEl("button", {
          text: this.plugin.t(mode === "split" ? "diffModeSplit" : mode === "inline" ? "diffModeInline" : "diffModeStacked"),
          cls: this.plugin.settings.diffViewMode === mode ? "is-active" : ""
        });
        button.addEventListener("click", async () => {
          this.plugin.settings.diffViewMode = mode;
          await this.plugin.saveSettings();
          await this.render();
        });
      });
      const fileHeader = diffBlock.createDiv("gsvc-diff-file-header");
      fileHeader.createEl("span", { cls: "gsvc-file-icon", text: "MD" });
      fileHeader.createEl("strong", { text: this.selectedVersion.fileName });
      fileHeader.createEl("small", {
        text: this.plugin.t("linesChanged", {
          additions: diff.filter((line) => line.type === "added").length,
          deletions: diff.filter((line) => line.type === "removed").length
        })
      });
      renderDiffByMode(diffBlock, diff.slice(0, 50), this.plugin.settings.diffViewMode, this.plugin.t.bind(this.plugin));
    }
  }

  private confirmRevert(version: Version): void {
    new ConfirmRevertModal(this.app, this.plugin.settings, version, async () => {
      const restored = await this.plugin.controller.revertToVersion(this.file, version.id);
      if (restored) {
        new Notice(this.plugin.t("restored", { id: version.id }));
        await this.refresh();
      }
    }).open();
  }
}

export default class VersionControlPlugin extends Plugin {
  settings: VersionControlSettings = DEFAULT_SETTINGS;
  controller!: VersionController;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.controller = new VersionController(this.app, this.settings);

    this.registerView(VIEW_TYPE_VERSION_CONTROL, (leaf) => new VersionControlView(leaf, this));
    this.addRibbonIcon("git-branch", this.t("ribbon"), () => this.openFloatingHistory());

    this.addCommand({
      id: "open-version-control",
      name: this.t("commandOpen"),
      callback: () => this.activateView()
    });

    this.addCommand({
      id: "create-version-snapshot",
      name: this.t("commandSnapshot"),
      checkCallback: (checking) => {
        const file = this.getActiveMarkdownFile();
        if (!file) {
          return false;
        }
        if (!checking) {
          this.createSnapshotForFile(file);
        }
        return true;
      }
    });

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", async () => {
        const view = this.getView();
        if (view) {
          await view.setFile(this.getActiveMarkdownFile());
        }
      })
    );

    this.registerEvent(
      this.app.vault.on("modify", async (file) => {
        if (!this.controller.isVersionableMarkdown(file)) {
          return;
        }

        // Debounce per file: cancel existing timer, set new one
        const existingTimer = this.controller["debounceTimers"].get(file.path);
        if (existingTimer) {
          window.clearTimeout(existingTimer);
        }
        const timer = window.setTimeout(async () => {
          this.controller["debounceTimers"].delete(file.path);
          try {
            const version = await this.controller.autoCommit(file);
            if (version) {
              const view = this.getView();
              if (view) {
                await view.refresh();
              }
            }
          } catch (error) {
            console.error("Auto snapshot failed", error);
            new Notice(this.t("autoSnapshotFailed"));
          }
        }, this.controller["DEBOUNCE_MS"]);
        this.controller["debounceTimers"].set(file.path, timer);
      })
    );

    this.registerEvent(
      this.app.vault.on("delete", async (file) => {
        await this.controller.handleDelete(file);
      })
    );

    this.registerEvent(
      this.app.vault.on("rename", async (file, oldPath) => {
        try {
          const version = await this.controller.handleRename(file, oldPath);
          if (version) {
            await this.getView()?.refresh();
          }
        } catch (error) {
          console.error("Rename snapshot failed", error);
        }
      })
    );

    this.addSettingTab(new VersionControlSettingTab(this.app, this));
  }

  onunload(): void {
    // Do NOT detach leaves — that resets user-placed leaf positions
  }

  async loadSettings(): Promise<void> {
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...(await this.loadData())
    };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.controller?.updateSettings(this.settings);
  }

  t(key: TranslationKey, replacements: Record<string, string | number> = {}): string {
    return translate(this.settings, key, replacements);
  }

  getActiveMarkdownFile(): TFile | null {
    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    const file = markdownView?.file ?? this.app.workspace.getActiveFile();
    return this.controller?.isVersionableMarkdown(file) ? file : null;
  }

  async activateView(): Promise<void> {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_VERSION_CONTROL);
    const leaf = leaves[0] ?? this.app.workspace.getRightLeaf(false);
    if (!leaf) {
      new Notice(this.t("openFailed"));
      return;
    }

    await leaf.setViewState({ type: VIEW_TYPE_VERSION_CONTROL, active: true });
    this.app.workspace.revealLeaf(leaf);
    await this.getView()?.setFile(this.getActiveMarkdownFile());
  }

  async openFloatingHistory(): Promise<void> {
    const file = this.getActiveMarkdownFile();
    if (!file) {
      new Notice(this.t("noMarkdownBody"));
      return;
    }
    new VersionControlModal(this.app, this, file).open();
  }

  private async createSnapshotForFile(file: TFile): Promise<void> {
    const message = window.prompt(this.t("commitMessage"), this.t("manualSnapshot"));
    if (message === null) {
      return;
    }

    try {
      const version = await this.controller.commit(file, message);
      if (version) {
        new Notice(this.t("createdSnapshot", { id: version.id }));
        await this.getView()?.refresh();
      }
    } catch (error) {
      console.error("Snapshot failed", error);
      new Notice(this.t("snapshotFailed"));
    }
  }

  private getView(): VersionControlView | null {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_VERSION_CONTROL);
    return leaves[0]?.view instanceof VersionControlView ? leaves[0].view : null;
  }
}

class VersionControlSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private plugin: VersionControlPlugin
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl).setName(this.plugin.t("settingsTitle")).setHeading();

    new Setting(containerEl)
      .setName(this.plugin.t("language"))
      .setDesc(this.plugin.t("languageDesc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("auto", this.plugin.t("languageAuto"))
          .addOption("en", this.plugin.t("languageEnglish"))
          .addOption("zh-CN", this.plugin.t("languageChinese"))
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value as LanguageSetting;
            await this.plugin.saveSettings();
            this.display();
            await this.plugin.activateView();
          })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("storageFolder"))
      .setDesc(this.plugin.t("storageFolderDesc"))
      .addText((text) =>
        text
          .setPlaceholder(".versions")
          .setValue(this.plugin.settings.versionDir)
          .onChange(async (value) => {
            this.plugin.settings.versionDir = normalizePath(value.trim() || DEFAULT_SETTINGS.versionDir);
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("autoOnSave"))
      .setDesc(this.plugin.t("autoOnSaveDesc"))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.autoCommitOnSave).onChange(async (value) => {
          this.plugin.settings.autoCommitOnSave = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("maxVersions"))
      .setDesc(this.plugin.t("maxVersionsDesc"))
      .addText((text) =>
        text
          .setPlaceholder("50")
          .setValue(String(this.plugin.settings.maxVersions))
          .onChange(async (value) => {
            const parsed = Number.parseInt(value, 10);
            this.plugin.settings.maxVersions = Number.isFinite(parsed) ? Math.max(1, parsed) : DEFAULT_SETTINGS.maxVersions;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("maxAutoVersions"))
      .setDesc(this.plugin.t("maxAutoVersionsDesc"))
      .addText((text) =>
        text
          .setPlaceholder("20")
          .setValue(String(this.plugin.settings.maxAutoVersions))
          .onChange(async (value) => {
            const parsed = Number.parseInt(value, 10);
            this.plugin.settings.maxAutoVersions = Number.isFinite(parsed) ? Math.max(1, parsed) : DEFAULT_SETTINGS.maxAutoVersions;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("diffMode"))
      .setDesc(this.plugin.t("modalHint"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("split", this.plugin.t("diffModeSplit"))
          .addOption("inline", this.plugin.t("diffModeInline"))
          .addOption("stacked", this.plugin.t("diffModeStacked"))
          .setValue(this.plugin.settings.diffViewMode)
          .onChange(async (value) => {
            this.plugin.settings.diffViewMode = value as DiffViewMode;
            await this.plugin.saveSettings();
          })
      );
  }
}
