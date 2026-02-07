import { useState, useCallback, useMemo } from 'react';

const HISTORY_STORAGE_KEY = 'note-history';
const MAX_HISTORY_PER_NOTE = 10;

interface NoteVersion {
    timestamp: number;
    title: string;
    content: string;
}

interface NoteHistory {
    [noteId: string]: NoteVersion[];
}

// 读取历史记录
function loadHistory(): NoteHistory {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

// 保存历史记录
function saveHistory(history: NoteHistory): void {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

// 历史版本 Hook
export function useNoteHistory(currentNoteId: string | null) {
    const [historyData, setHistory] = useState<NoteHistory>(loadHistory);

    // 保存一个版本
    const addVersion = useCallback((content: string, title: string = '') => {
        if (!currentNoteId) return;

        setHistory(prev => {
            const noteHistory = prev[currentNoteId] || [];

            // 如果内容与最新版本相同，不保存
            if (noteHistory.length > 0) {
                const latest = noteHistory[noteHistory.length - 1];
                if (latest.content === content && (title ? latest.title === title : true)) {
                    return prev;
                }
            }

            // 添加新版本
            const newVersion: NoteVersion = {
                timestamp: Date.now(),
                title: title || '未命名',
                content,
            };

            const updatedHistory = [...noteHistory, newVersion].slice(-MAX_HISTORY_PER_NOTE);
            const newHistory = { ...prev, [currentNoteId]: updatedHistory };
            saveHistory(newHistory);
            return newHistory;
        });
    }, [currentNoteId]);

    // 获取当前笔记的历史版本
    const history = useMemo(() => {
        return currentNoteId ? (historyData[currentNoteId] || []) : [];
    }, [historyData, currentNoteId]);

    const getVersions = useCallback((noteId: string): NoteVersion[] => {
        return historyData[noteId] || [];
    }, [historyData]);

    // 恢复版本 (App.tsx seems to implement the restoration logic itself, this hook just provides data)
    // But for completeness we can expose a restore helper if needed, but App.tsx doesn't use it from here mostly.
    // Actually App.tsx tries to destructure `restoreVersion` from this hook?
    // "const { history, addVersion, restoreVersion } = useNoteHistory(currentNoteId);"
    // So we should provide it.
    const restoreVersion = useCallback((version: NoteVersion) => {
        // This is a no-op in the hook state, it just returns the version content for the app to use
        // or we could log it. The actual restoration happens by updating the note content.
        return version;
    }, []);

    // 删除笔记的历史
    const clearHistory = useCallback((noteId: string) => {
        setHistory(prev => {
            const newHistory = { ...prev };
            delete newHistory[noteId];
            saveHistory(newHistory);
            return newHistory;
        });
    }, []);

    return { history, addVersion, restoreVersion, getVersions, clearHistory };
}

interface HistoryPanelProps {
    noteId: string;
    versions: NoteVersion[];
    onRestore: (version: NoteVersion) => void;
    onClose: () => void;
}

// 历史版本面板
export function HistoryPanel({ noteId: _noteId, versions, onRestore, onClose }: HistoryPanelProps) {
    // 格式化时间
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[400px] max-h-[70vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">历史版本</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {versions.length === 0 ? (
                        <div className="p-8 text-center text-[var(--text-secondary)]">
                            <p>暂无历史版本</p>
                            <p className="text-xs mt-1 opacity-70">编辑笔记时会自动保存版本</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border)]">
                            {[...versions].reverse().map((version, index) => (
                                <div
                                    key={version.timestamp}
                                    className="p-3 hover:bg-[var(--bg-tertiary)] transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-[var(--text-primary)]">
                                            {version.title}
                                        </span>
                                        <button
                                            onClick={() => onRestore(version)}
                                            className="text-xs px-2 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)]
                                hover:bg-[var(--accent)]/20 transition-colors"
                                        >
                                            恢复
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                        <span>{formatTime(version.timestamp)}</span>
                                        <span>·</span>
                                        <span>{version.content.length} 字符</span>
                                        {index === 0 && <span className="text-[var(--accent)]">最新</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] text-center">
                    最多保留 {MAX_HISTORY_PER_NOTE} 个版本
                </div>
            </div>
        </div>
    );
}
