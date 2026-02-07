import { useMemo } from 'react';
import type { Note } from '../types/index';

interface Statistics {
    totalNotes: number;
    totalWords: number;
    totalCharacters: number;
    totalTags: number;
    uniqueTags: string[];
    avgWordsPerNote: number;
    longestNote: { title: string; words: number } | null;
    recentlyEdited: Note[];
    pinnedCount: number;
    createdThisWeek: number;
    createdThisMonth: number;
}

// 计算统计数据
export function calculateStatistics(notes: Note[]): Statistics {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;

    // 词数计算
    const countWords = (text: string) => {
        const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const english = text.replace(/[\u4e00-\u9fa5]/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
        return chinese + english;
    };

    const wordCounts = notes.map(n => ({ note: n, words: countWords(n.content) }));
    const totalWords = wordCounts.reduce((sum, { words }) => sum + words, 0);
    const totalCharacters = notes.reduce((sum, n) => sum + n.content.length, 0);

    // 标签统计
    const allTags = notes.flatMap(n => n.tags);
    const uniqueTags = [...new Set(allTags)];

    // 最长笔记
    const longest = wordCounts.length > 0
        ? wordCounts.reduce((max, curr) => curr.words > max.words ? curr : max)
        : null;

    // 最近编辑
    const recentlyEdited = [...notes]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 5);

    return {
        totalNotes: notes.length,
        totalWords,
        totalCharacters,
        totalTags: allTags.length,
        uniqueTags,
        avgWordsPerNote: notes.length > 0 ? Math.round(totalWords / notes.length) : 0,
        longestNote: longest ? { title: longest.note.title, words: longest.words } : null,
        recentlyEdited,
        pinnedCount: notes.filter(n => n.isPinned).length,
        createdThisWeek: notes.filter(n => now - n.createdAt < oneWeek).length,
        createdThisMonth: notes.filter(n => now - n.createdAt < oneMonth).length,
    };
}

interface StatisticsPanelProps {
    notes: Note[];
    onClose: () => void;
}

// 统计面板组件
export function StatisticsPanel({ notes, onClose }: StatisticsPanelProps) {
    const stats = useMemo(() => calculateStatistics(notes), [notes]);

    const StatCard = ({ label, value, icon }: { label: string; value: string | number; icon: string }) => (
        <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{icon}</span>
                <span className="text-xs text-[var(--text-secondary)]">{label}</span>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{value}</div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[600px] max-h-[85vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">📊 数据统计</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[70vh]">
                    {/* 主要统计 */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <StatCard label="笔记总数" value={stats.totalNotes} icon="📝" />
                        <StatCard label="总字数" value={stats.totalWords.toLocaleString()} icon="✍️" />
                        <StatCard label="标签数" value={stats.uniqueTags.length} icon="🏷️" />
                    </div>

                    {/* 次要统计 */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                        <div className="bg-[var(--bg-tertiary)]/50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold text-[var(--text-primary)]">{stats.pinnedCount}</div>
                            <div className="text-xs text-[var(--text-secondary)]">置顶</div>
                        </div>
                        <div className="bg-[var(--bg-tertiary)]/50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold text-[var(--text-primary)]">{stats.avgWordsPerNote}</div>
                            <div className="text-xs text-[var(--text-secondary)]">平均字数</div>
                        </div>
                        <div className="bg-[var(--bg-tertiary)]/50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold text-[var(--text-primary)]">{stats.createdThisWeek}</div>
                            <div className="text-xs text-[var(--text-secondary)]">本周新建</div>
                        </div>
                        <div className="bg-[var(--bg-tertiary)]/50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold text-[var(--text-primary)]">{stats.createdThisMonth}</div>
                            <div className="text-xs text-[var(--text-secondary)]">本月新建</div>
                        </div>
                    </div>

                    {/* 最长笔记 */}
                    {stats.longestNote && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">🏆 最长笔记</h4>
                            <div className="bg-[var(--bg-tertiary)]/50 rounded-lg p-3 flex items-center justify-between">
                                <span className="text-sm text-[var(--text-primary)]">{stats.longestNote.title}</span>
                                <span className="text-sm text-[var(--accent)]">{stats.longestNote.words} 字</span>
                            </div>
                        </div>
                    )}

                    {/* 标签分布 */}
                    {stats.uniqueTags.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">🏷️ 标签分布</h4>
                            <div className="flex flex-wrap gap-2">
                                {stats.uniqueTags.slice(0, 10).map(tag => (
                                    <span
                                        key={tag}
                                        className="px-2 py-1 text-xs rounded-full bg-[var(--accent)]/20 text-[var(--accent)]"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {stats.uniqueTags.length > 10 && (
                                    <span className="px-2 py-1 text-xs rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                                        +{stats.uniqueTags.length - 10} 更多
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 最近编辑 */}
                    <div>
                        <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">🕐 最近编辑</h4>
                        <div className="space-y-2">
                            {stats.recentlyEdited.map(note => (
                                <div key={note.id} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-tertiary)]/30">
                                    <span className="text-sm text-[var(--text-primary)] truncate flex-1">{note.title}</span>
                                    <span className="text-xs text-[var(--text-secondary)]">
                                        {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
