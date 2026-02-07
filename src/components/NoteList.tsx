import type { Note } from '../types/index';
import { getTagColor } from '../types';

interface NoteListProps {
    notes: Note[];
    currentNoteId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onTogglePin: (id: string) => void;
}

// 格式化时间显示
const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return '昨天';
    } else if (diffDays < 7) {
        return `${diffDays}天前`;
    } else {
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
};

// 笔记列表组件
export function NoteList({ notes, currentNoteId, onSelect, onDelete, onTogglePin }: NoteListProps) {
    if (notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-[var(--text-secondary)]">
                <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                <p className="text-sm">暂无笔记</p>
                <p className="text-xs mt-1 opacity-75">点击上方按钮创建</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {notes.map((note) => {
                const isActive = note.id === currentNoteId;
                // 提取 Markdown 内容的预览文本
                const preview = note.content
                    .replace(/^#+\s+/gm, '')
                    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                    .replace(/[*_`#]/g, '')
                    .replace(/!\[.*?\]\(.*?\)/g, '[图片]')
                    .trim()
                    .slice(0, 60);

                return (
                    <div
                        key={note.id}
                        onClick={() => onSelect(note.id)}
                        className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200
                       ${isActive
                                ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/50'
                                : 'bg-[var(--bg-tertiary)]/50 border border-transparent hover:bg-[var(--bg-tertiary)] hover:border-[var(--border)]'
                            }`}
                    >
                        {/* 置顶标记 */}
                        {note.isPinned && (
                            <div className="absolute top-2 left-2 text-[var(--accent)]" title="已置顶">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                                </svg>
                            </div>
                        )}

                        {/* 标题 */}
                        <h3 className={`font-medium text-sm truncate mb-1 ${note.isPinned ? 'pl-5' : ''}
                           ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                            {note.title || '未命名笔记'}
                        </h3>

                        {/* 标签 */}
                        {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1.5">
                                {note.tags.slice(0, 3).map(tag => (
                                    <span
                                        key={tag}
                                        className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                                        style={{ backgroundColor: getTagColor(tag) }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {note.tags.length > 3 && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] text-[var(--text-secondary)]">
                                        +{note.tags.length - 3}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* 预览 */}
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2">
                            {preview || '无内容'}
                        </p>

                        {/* 时间 */}
                        <span className="text-xs text-[var(--text-secondary)] opacity-70">
                            {formatTime(note.updatedAt)}
                        </span>

                        {/* 操作按钮 */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* 置顶按钮 */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTogglePin(note.id);
                                }}
                                className={`p-1.5 rounded-md transition-all duration-200
                                   ${note.isPinned
                                        ? 'text-[var(--accent)] bg-[var(--accent)]/10'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10'
                                    }`}
                                title={note.isPinned ? '取消置顶' : '置顶'}
                            >
                                <svg className="w-4 h-4" fill={note.isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            </button>
                            {/* 删除按钮 */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(note.id);
                                }}
                                className="p-1.5 rounded-md text-[var(--text-secondary)] 
                                         hover:text-[var(--danger)] hover:bg-[var(--danger)]/10
                                         transition-all duration-200"
                                title="删除笔记"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
