export interface Version {
  id: string;
  timestamp: number;
  message: string;
  content: string;
  hash: string;
  filePath: string;
  fileName: string;
  changeType: "manual" | "auto" | "rename" | "restore";
  previousFilePath?: string;
  previousFileName?: string;
  additions?: number;
  deletions?: number;
  wordCount?: number;
  charCount?: number;
}

export interface FileHistory {
  historyId?: string;
  filePath: string;
  fileName?: string;
  versions: Version[];
  currentHash: string;
}

export type DiffType = "context" | "added" | "removed";

export interface DiffLine {
  type: DiffType;
  oldLine?: number;
  newLine?: number;
  content: string;
}

export interface WordStats {
  words: number;
  chars: number;
  lines: number;
}

export type LanguageSetting = "auto" | "en" | "zh-CN";
export type DiffViewMode = "split" | "inline" | "stacked";

export interface VersionControlSettings {
  versionDir: string;
  autoCommitOnSave: boolean;
  maxVersions: number;
  maxAutoVersions: number;
  language: LanguageSetting;
  diffViewMode: DiffViewMode;
}

export interface FileHistoryIndex {
  files: Record<string, string>;
}

export const DEFAULT_SETTINGS: VersionControlSettings = {
  versionDir: ".versions",
  autoCommitOnSave: false,
  maxVersions: 50,
  maxAutoVersions: 20,
  language: "auto",
  diffViewMode: "split"
};

export interface LargeFileSummary {
  additions: number;
  deletions: number;
  words: number;
}