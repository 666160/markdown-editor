import { useState, useCallback } from 'react';
import type { Note } from '../types/index';

const FAVORITES_STORAGE_KEY = 'note-favorites';

// 读取收藏
function loadFavorites(): string[] {
    try {
        const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch { }
    return [];
}

// 保存收藏
function saveFavorites(ids: string[]): void {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
}

// 收藏夹 Hook
export function useFavorites() {
    const [favoriteIds, setFavoriteIds] = useState<string[]>(loadFavorites);

    // 切换收藏状态
    const toggleFavorite = useCallback((noteId: string) => {
        setFavoriteIds(prev => {
            const updated = prev.includes(noteId)
                ? prev.filter(id => id !== noteId)
                : [...prev, noteId];
            saveFavorites(updated);
            return updated;
        });
    }, []);

    // 检查是否收藏
    const isFavorite = useCallback((noteId: string): boolean => {
        return favoriteIds.includes(noteId);
    }, [favoriteIds]);

    return { favoriteIds, toggleFavorite, isFavorite };
}

interface FavoriteButtonProps {

    isFavorite: boolean;
    onToggle: () => void;
}

// 收藏按钮
export function FavoriteButton({ isFavorite, onToggle }: FavoriteButtonProps) {
    return (
        <button
            onClick={onToggle}
            className={`p-1.5 rounded-lg transition-colors ${isFavorite
                ? 'text-yellow-500 bg-yellow-500/10'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                }`}
            title={isFavorite ? '取消收藏' : '收藏'}
        >
            <svg
                className="w-5 h-5"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
            </svg>
        </button>
    );
}

interface FavoritesPanelProps {
    notes: Note[];
    favoriteIds: string[];
    onSelectNote: (noteId: string) => void;
    onToggleFavorite: (noteId: string) => void;
    onClose: () => void;
}

// 收藏夹面板
export function FavoritesPanel({ notes, favoriteIds, onSelectNote, onToggleFavorite, onClose }: FavoritesPanelProps) {
    const favoriteNotes = notes.filter(n => favoriteIds.includes(n.id));

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[400px] max-h-[70vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">⭐ 收藏夹</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {favoriteNotes.length === 0 ? (
                        <div className="p-8 text-center text-[var(--text-secondary)]">
                            <div className="text-3xl mb-2 opacity-30">⭐</div>
                            <p>暂无收藏</p>
                            <p className="text-xs mt-1 opacity-70">点击笔记上的星星图标添加收藏</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border)]">
                            {favoriteNotes.map(note => (
                                <div
                                    key={note.id}
                                    className="flex items-center gap-3 p-3 hover:bg-[var(--bg-tertiary)] transition-colors"
                                >
                                    <button
                                        onClick={() => {
                                            onSelectNote(note.id);
                                            onClose();
                                        }}
                                        className="flex-1 text-left min-w-0"
                                    >
                                        <div className="text-sm font-medium text-[var(--text-primary)] truncate hover:text-[var(--accent)]">
                                            {note.title}
                                        </div>
                                        <div className="text-xs text-[var(--text-secondary)]">
                                            {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => onToggleFavorite(note.id)}
                                        className="p-1 rounded text-yellow-500 hover:bg-yellow-500/10"
                                        title="取消收藏"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] text-center">
                    共 {favoriteNotes.length} 篇收藏
                </div>
            </div>
        </div>
    );
}
