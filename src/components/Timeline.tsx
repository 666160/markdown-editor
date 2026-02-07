import { useMemo } from 'react';
import type { Note } from '../types/index';

interface TimelineItem {
    date: string;
    notes: Note[];
}

// 按日期分组笔记
function groupNotesByDate(notes: Note[]): TimelineItem[] {
    const groups = new Map<string, Note[]>();

    notes.forEach(note => {
        const date = new Date(note.createdAt).toLocaleDateString('zh-CN');
        if (!groups.has(date)) {
            groups.set(date, []);
        }
        groups.get(date)!.push(note);
    });

    return Array.from(groups.entries())
        .map(([date, notes]) => ({ date, notes }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

interface TimelineViewProps {
    notes: Note[];
    onSelectNote: (noteId: string) => void;
    onClose: () => void;
}

// 时间线视图
export function TimelineView({ notes, onSelectNote, onClose }: TimelineViewProps) {
    const timeline = useMemo(() => groupNotesByDate(notes), [notes]);

    // 格式化日期显示
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return '今天';
        if (date.toDateString() === yesterday.toDateString()) return '昨天';

        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const diffDays = Math.floor((today.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));

        if (diffDays < 7) return weekdays[date.getDay()];

        return `${date.getMonth() + 1}月${date.getDate()}日`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[500px] max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">📅 时间线</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[65vh]">
                    {timeline.length === 0 ? (
                        <div className="text-center text-[var(--text-secondary)] py-8">暂无笔记</div>
                    ) : (
                        <div className="relative">
                            {/* 时间线 */}
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border)]" />

                            {timeline.map((group, _groupIndex) => (
                                <div key={group.date} className="relative mb-6">
                                    {/* 日期节点 */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold z-10">
                                            {group.notes.length}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-[var(--text-primary)]">
                                                {formatDate(group.date)}
                                            </div>
                                            <div className="text-xs text-[var(--text-secondary)]">{group.date}</div>
                                        </div>
                                    </div>

                                    {/* 当日笔记 */}
                                    <div className="ml-11 space-y-2">
                                        {group.notes.map(note => (
                                            <button
                                                key={note.id}
                                                onClick={() => {
                                                    onSelectNote(note.id);
                                                    onClose();
                                                }}
                                                className="w-full text-left p-3 rounded-lg bg-[var(--bg-tertiary)]/50
                                  hover:bg-[var(--bg-tertiary)] transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {note.isPinned && <span className="text-xs">📌</span>}
                                                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                                                        {note.title}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[var(--text-secondary)] truncate mt-1">
                                                    {note.content.slice(0, 60).replace(/[#*_`]/g, '')}
                                                </p>
                                                {note.tags.length > 0 && (
                                                    <div className="flex gap-1 mt-2">
                                                        {note.tags.slice(0, 3).map(tag => (
                                                            <span
                                                                key={tag}
                                                                className="px-1.5 py-0.5 text-[10px] rounded bg-[var(--accent)]/10 text-[var(--accent)]"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
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
