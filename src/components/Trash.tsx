import { useState, useCallback } from 'react';
import type { Note } from '../types/index';

const TRASH_STORAGE_KEY = 'markdown-notes-trash';
const TRASH_EXPIRY_DAYS = 30;

interface TrashedNote extends Note {
    deletedAt: number;
}

// 读取回收站
function loadTrash(): TrashedNote[] {
    try {
        const saved = localStorage.getItem(TRASH_STORAGE_KEY);
        if (saved) {
            const notes = JSON.parse(saved) as TrashedNote[];
            // 过滤过期笔记（30天）
            const cutoff = Date.now() - TRASH_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
            const validNotes = notes.filter(note => note.deletedAt > cutoff);
            if (validNotes.length !== notes.length) {
                saveTrash(validNotes);
            }
            return validNotes;
        }
    } catch { }
    return [];
}

// 保存回收站
function saveTrash(notes: TrashedNote[]): void {
    localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(notes));
}

// 回收站 Hook
export function useTrash() {
    const [trashedNotes, setTrashedNotes] = useState<TrashedNote[]>(loadTrash);

    // 移动笔记到回收站
    const moveToTrash = useCallback((note: Note) => {
        const trashedNote: TrashedNote = {
            ...note,
            deletedAt: Date.now(),
        };
        setTrashedNotes(prev => {
            const updated = [trashedNote, ...prev];
            saveTrash(updated);
            return updated;
        });
    }, []);

    // 恢复笔记
    const restoreNote = useCallback((noteId: string): Note | null => {
        let restoredNote: Note | null = null;
        setTrashedNotes(prev => {
            const note = prev.find(n => n.id === noteId);
            if (note) {
                const { deletedAt, ...originalNote } = note;
                restoredNote = originalNote;
                const updated = prev.filter(n => n.id !== noteId);
                saveTrash(updated);
                return updated;
            }
            return prev;
        });
        return restoredNote;
    }, []);

    // 永久删除
    const permanentDelete = useCallback((noteId: string) => {
        setTrashedNotes(prev => {
            const updated = prev.filter(n => n.id !== noteId);
            saveTrash(updated);
            return updated;
        });
    }, []);

    // 清空回收站
    const emptyTrash = useCallback(() => {
        setTrashedNotes([]);
        saveTrash([]);
    }, []);

    return {
        trashedNotes,
        moveToTrash,
        restoreNote,
        permanentDelete,
        emptyTrash,
    };
}

interface TrashPanelProps {
    notes: TrashedNote[];
    onRestore: (noteId: string) => void;
    onDelete: (noteId: string) => void;
    onEmpty: () => void;
    onClose: () => void;
}

// 回收站面板
export function TrashPanel({ notes, onRestore, onDelete, onEmpty, onClose }: TrashPanelProps) {
    const [confirmEmpty, setConfirmEmpty] = useState(false);

    // 格式化时间
    const formatDeleteTime = (timestamp: number) => {
        const days = Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000));
        if (days === 0) return '今天删除';
        if (days === 1) return '昨天删除';
        return `${days} 天前删除`;
    };

    // 计算剩余天数
    const getRemainingDays = (deletedAt: number) => {
        const expiry = deletedAt + TRASH_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        return Math.max(0, Math.ceil((expiry - Date.now()) / (24 * 60 * 60 * 1000)));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[500px] max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* 头部 */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🗑️</span>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">回收站</h3>
                        <span className="text-xs text-[var(--text-secondary)]">({notes.length} 篇)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {notes.length > 0 && !confirmEmpty && (
                            <button
                                onClick={() => setConfirmEmpty(true)}
                                className="text-xs px-2 py-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                清空
                            </button>
                        )}
                        {confirmEmpty && (
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-[var(--text-secondary)]">确认？</span>
                                <button
                                    onClick={() => { onEmpty(); setConfirmEmpty(false); }}
                                    className="text-xs px-2 py-1 rounded bg-red-500 text-white"
                                >
                                    是
                                </button>
                                <button
                                    onClick={() => setConfirmEmpty(false)}
                                    className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                                >
                                    否
                                </button>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 笔记列表 */}
                <div className="max-h-96 overflow-y-auto">
                    {notes.length === 0 ? (
                        <div className="p-12 text-center text-[var(--text-secondary)]">
                            <div className="text-4xl mb-3 opacity-30">🗑️</div>
                            <p>回收站为空</p>
                            <p className="text-xs mt-1 opacity-70">删除的笔记会保留 {TRASH_EXPIRY_DAYS} 天</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border)]">
                            {notes.map(note => (
                                <div key={note.id} className="p-4 hover:bg-[var(--bg-tertiary)] transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">
                                                {note.title}
                                            </h4>
                                            <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                                                {note.content.slice(0, 100).replace(/[#*_`]/g, '')}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text-secondary)]">
                                                <span>{formatDeleteTime(note.deletedAt)}</span>
                                                <span>·</span>
                                                <span className="text-yellow-500">{getRemainingDays(note.deletedAt)} 天后永久删除</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 ml-3">
                                            <button
                                                onClick={() => onRestore(note.id)}
                                                className="p-1.5 rounded text-green-500 hover:bg-green-500/10 transition-colors"
                                                title="恢复"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => onDelete(note.id)}
                                                className="p-1.5 rounded text-red-500 hover:bg-red-500/10 transition-colors"
                                                title="永久删除"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 底部 */}
                <div className="p-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] text-center">
                    笔记将在删除后 {TRASH_EXPIRY_DAYS} 天永久删除
                </div>
            </div>
        </div>
    );
}
