import { useCallback } from 'react';
import type { Note } from '../types/index';

interface RandomNoteButtonProps {
    notes: Note[];
    onSelect: (noteId: string) => void;
}

// 随机笔记按钮
export function RandomNoteButton({ notes, onSelect }: RandomNoteButtonProps) {
    const getRandomNote = useCallback(() => {
        if (notes.length === 0) return;
        const randomIndex = Math.floor(Math.random() * notes.length);
        onSelect(notes[randomIndex].id);
    }, [notes, onSelect]);

    if (notes.length === 0) return null;

    return (
        <button
            onClick={getRandomNote}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm
                text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] 
                hover:text-[var(--text-primary)] transition-colors"
            title="随机打开一篇笔记"
        >
            <span>🎲</span>
            <span>随机笔记</span>
        </button>
    );
}

// 随机回顾功能
interface RandomReviewProps {
    notes: Note[];
    onSelectNote: (noteId: string) => void;
    onClose: () => void;
}

export function RandomReview({ notes, onSelectNote, onClose }: RandomReviewProps) {
    // 获取随机笔记列表
    const getRandomNotes = useCallback((count: number) => {
        const shuffled = [...notes].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }, [notes]);

    const randomNotes = getRandomNotes(5);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[400px] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">🎲 随机回顾</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4">
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                        随机选取了 {randomNotes.length} 篇笔记供你回顾：
                    </p>

                    <div className="space-y-2">
                        {randomNotes.map((note, index) => (
                            <button
                                key={note.id}
                                onClick={() => {
                                    onSelectNote(note.id);
                                    onClose();
                                }}
                                className="w-full text-left p-3 rounded-lg bg-[var(--bg-tertiary)]/50
                          hover:bg-[var(--bg-tertiary)] transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-[var(--accent)]/20 text-[var(--accent)]
                                  flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent)]">
                                            {note.title}
                                        </div>
                                        <div className="text-xs text-[var(--text-secondary)]">
                                            创建于 {new Date(note.createdAt).toLocaleDateString('zh-CN')}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-[var(--border)] text-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="text-sm text-[var(--accent)] hover:underline"
                    >
                        🔄 换一批
                    </button>
                </div>
            </div>
        </div>
    );
}
