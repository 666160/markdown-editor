import { useMemo } from 'react';
import { getTagColor } from '../types';
import type { Note } from '../types/index';

interface TagCloudProps {
    notes: Note[];
    selectedTag: string | null;
    onSelectTag: (tag: string | null) => void;
}

// 标签云组件
export function TagCloud({ notes, selectedTag, onSelectTag }: TagCloudProps) {
    // 计算标签统计
    const tagStats = useMemo(() => {
        const stats: Record<string, number> = {};
        notes.forEach(note => {
            note.tags.forEach(tag => {
                stats[tag] = (stats[tag] || 0) + 1;
            });
        });
        return Object.entries(stats)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);
    }, [notes]);

    // 计算字体大小（根据使用频率）
    const getFontSize = (count: number) => {
        const max = Math.max(...tagStats.map(t => t.count));
        const min = Math.min(...tagStats.map(t => t.count));
        const range = max - min || 1;
        const normalized = (count - min) / range;
        return 0.75 + normalized * 0.5; // 0.75rem - 1.25rem
    };

    if (tagStats.length === 0) {
        return (
            <div className="p-4 text-center text-[var(--text-secondary)] text-sm">
                暂无标签
            </div>
        );
    }

    return (
        <div className="p-4">
            <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-3">标签云</h3>
            <div className="flex flex-wrap gap-2">
                {tagStats.map(({ tag, count }) => (
                    <button
                        key={tag}
                        onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
                        className={`px-2 py-1 rounded-full transition-all duration-200
                      ${selectedTag === tag
                                ? 'ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--bg-secondary)]'
                                : 'hover:opacity-80'
                            }`}
                        style={{
                            backgroundColor: getTagColor(tag),
                            fontSize: `${getFontSize(count)}rem`,
                            color: 'white',
                        }}
                        title={`${count} 篇笔记`}
                    >
                        {tag}
                        <span className="ml-1 opacity-70 text-[0.7em]">{count}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
