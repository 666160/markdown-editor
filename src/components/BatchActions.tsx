import { useState, useCallback } from 'react';
import type { Note } from '../types/index';

interface BatchActionsProps {
    notes: Note[];
    selectedIds: string[];
    onSelectAll: () => void;
    onClearSelection: () => void;
    onToggleSelect: (noteId: string) => void;
    onDelete: (noteIds: string[]) => void;
    onAddTag: (noteIds: string[], tag: string) => void;
    onExport: (noteIds: string[]) => void;
    onClose: () => void;
}

// 批量操作面板
export function BatchActions({
    notes,
    selectedIds,
    onSelectAll,
    onClearSelection,
    onToggleSelect,
    onDelete,
    onAddTag,
    onExport,
    onClose,
}: BatchActionsProps) {
    const [tagInput, setTagInput] = useState('');
    const [showTagInput, setShowTagInput] = useState(false);

    const handleAddTag = () => {
        if (tagInput.trim() && selectedIds.length > 0) {
            onAddTag(selectedIds, tagInput.trim());
            setTagInput('');
            setShowTagInput(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[500px] max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">📦 批量操作</h3>
                        <span className="text-sm text-[var(--accent)]">已选 {selectedIds.length} 篇</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 操作按钮 */}
                <div className="p-4 border-b border-[var(--border)] flex flex-wrap gap-2">
                    <button
                        onClick={onSelectAll}
                        className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)]
                      hover:bg-[var(--accent)]/20 hover:text-[var(--accent)] transition-colors"
                    >
                        全选
                    </button>
                    <button
                        onClick={onClearSelection}
                        className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)]
                      hover:bg-[var(--accent)]/20 hover:text-[var(--accent)] transition-colors"
                    >
                        取消选择
                    </button>
                    <div className="flex-1" />
                    <button
                        onClick={() => setShowTagInput(!showTagInput)}
                        disabled={selectedIds.length === 0}
                        className="px-3 py-1.5 rounded-lg text-sm bg-green-500/20 text-green-500
                      hover:bg-green-500/30 transition-colors disabled:opacity-50"
                    >
                        添加标签
                    </button>
                    <button
                        onClick={() => onExport(selectedIds)}
                        disabled={selectedIds.length === 0}
                        className="px-3 py-1.5 rounded-lg text-sm bg-blue-500/20 text-blue-500
                      hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                    >
                        导出
                    </button>
                    <button
                        onClick={() => {
                            if (confirm(`确定删除 ${selectedIds.length} 篇笔记吗？`)) {
                                onDelete(selectedIds);
                            }
                        }}
                        disabled={selectedIds.length === 0}
                        className="px-3 py-1.5 rounded-lg text-sm bg-red-500/20 text-red-500
                      hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                        删除
                    </button>
                </div>

                {/* 添加标签输入 */}
                {showTagInput && (
                    <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-tertiary)]/30 flex gap-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="输入标签名称"
                            className="flex-1 px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-secondary)] border border-[var(--border)]
                        text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        />
                        <button
                            onClick={handleAddTag}
                            className="px-3 py-1.5 rounded-lg text-sm bg-[var(--accent)] text-white hover:opacity-90"
                        >
                            添加
                        </button>
                    </div>
                )}

                {/* 笔记列表 */}
                <div className="max-h-80 overflow-y-auto">
                    {notes.map(note => (
                        <label
                            key={note.id}
                            className="flex items-center gap-3 p-3 hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(note.id)}
                                onChange={() => onToggleSelect(note.id)}
                                className="w-4 h-4 rounded border-[var(--border)] accent-[var(--accent)]"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                                    {note.title}
                                </div>
                                <div className="text-xs text-[var(--text-secondary)]">
                                    {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}

// 批量操作 Hook
export function useBatchActions() {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleSelect = useCallback((noteId: string) => {
        setSelectedIds(prev =>
            prev.includes(noteId)
                ? prev.filter(id => id !== noteId)
                : [...prev, noteId]
        );
    }, []);

    const selectAll = useCallback((noteIds: string[]) => {
        setSelectedIds(noteIds);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedIds([]);
    }, []);

    return { selectedIds, toggleSelect, selectAll, clearSelection };
}
