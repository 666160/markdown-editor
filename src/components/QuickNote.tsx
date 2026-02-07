import { useState, useCallback } from 'react';

interface QuickNoteData {
    content: string;
    timestamp: number;
}

const QUICK_NOTES_KEY = 'quick-notes';

// 读取快速笔记
function loadQuickNotes(): QuickNoteData[] {
    try {
        const saved = localStorage.getItem(QUICK_NOTES_KEY);
        if (saved) return JSON.parse(saved);
    } catch { }
    return [];
}

// 保存快速笔记
function saveQuickNotes(notes: QuickNoteData[]): void {
    localStorage.setItem(QUICK_NOTES_KEY, JSON.stringify(notes));
}

// 快速笔记 Hook
export function useQuickNote() {
    const [quickNotes, setQuickNotes] = useState<QuickNoteData[]>(loadQuickNotes);

    // 添加快速笔记
    const addQuickNote = useCallback((content: string) => {
        const newNote: QuickNoteData = {
            content,
            timestamp: Date.now(),
        };
        setQuickNotes(prev => {
            const updated = [newNote, ...prev].slice(0, 20); // 最多保留20条
            saveQuickNotes(updated);
            return updated;
        });
    }, []);

    // 删除快速笔记
    const removeQuickNote = useCallback((timestamp: number) => {
        setQuickNotes(prev => {
            const updated = prev.filter(n => n.timestamp !== timestamp);
            saveQuickNotes(updated);
            return updated;
        });
    }, []);

    // 清空快速笔记
    const clearQuickNotes = useCallback(() => {
        setQuickNotes([]);
        saveQuickNotes([]);
    }, []);

    return { quickNotes, addQuickNote, removeQuickNote, clearQuickNotes };
}

interface QuickNoteWidgetProps {
    quickNotes: QuickNoteData[];
    onAdd: (content: string) => void;
    onRemove: (timestamp: number) => void;
    onClear: () => void;
    onConvertToNote: (content: string) => void;
    onClose: () => void;
}

// 快速笔记窗口
export function QuickNoteWidget({
    quickNotes,
    onAdd,
    onRemove,
    onClear,
    onConvertToNote,
    onClose,
}: QuickNoteWidgetProps) {
    const [input, setInput] = useState('');

    const handleSubmit = () => {
        if (input.trim()) {
            onAdd(input.trim());
            setInput('');
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[400px] max-h-[70vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">⚡ 快速笔记</h3>
                    <div className="flex items-center gap-2">
                        {quickNotes.length > 0 && (
                            <button
                                onClick={onClear}
                                className="text-xs px-2 py-1 rounded text-red-500 hover:bg-red-500/10"
                            >
                                清空
                            </button>
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

                {/* 输入区 */}
                <div className="p-4 border-b border-[var(--border)]">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="快速记录想法..."
                        className="w-full h-20 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]
                      text-[var(--text-primary)] text-sm resize-none focus:outline-none focus:border-[var(--accent)]"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                                handleSubmit();
                            }
                        }}
                    />
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-[var(--text-secondary)]">Ctrl + Enter 保存</span>
                        <button
                            onClick={handleSubmit}
                            disabled={!input.trim()}
                            className="px-3 py-1 rounded-lg text-sm bg-[var(--accent)] text-white
                        hover:opacity-90 disabled:opacity-50"
                        >
                            保存
                        </button>
                    </div>
                </div>

                {/* 笔记列表 */}
                <div className="max-h-64 overflow-y-auto">
                    {quickNotes.length === 0 ? (
                        <div className="p-8 text-center text-[var(--text-secondary)]">
                            <div className="text-3xl mb-2 opacity-30">⚡</div>
                            <p>暂无快速笔记</p>
                            <p className="text-xs mt-1 opacity-70">快速记录灵感，之后可转为正式笔记</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border)]">
                            {quickNotes.map(note => (
                                <div key={note.timestamp} className="p-3 hover:bg-[var(--bg-tertiary)] transition-colors">
                                    <div className="flex items-start gap-2">
                                        <p className="flex-1 text-sm text-[var(--text-primary)] whitespace-pre-wrap">
                                            {note.content}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    onConvertToNote(note.content);
                                                    onRemove(note.timestamp);
                                                    onClose();
                                                }}
                                                className="p-1 rounded text-green-500 hover:bg-green-500/10"
                                                title="转为正式笔记"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => onRemove(note.timestamp)}
                                                className="p-1 rounded text-red-500 hover:bg-red-500/10"
                                                title="删除"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-[var(--text-secondary)] mt-1">
                                        {formatTime(note.timestamp)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// 快速笔记浮动按钮
export function QuickNoteFloatingButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="fixed right-6 bottom-6 w-12 h-12 rounded-full bg-[var(--accent)] text-white
                shadow-lg hover:shadow-xl hover:scale-105 transition-all z-40
                flex items-center justify-center"
            title="快速笔记"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
        </button>
    );
}
