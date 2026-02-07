import { useMemo } from 'react';
import type { Note } from '../types/index';

interface HeatmapData {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

// 生成过去一年的热力图数据
function generateHeatmapData(notes: Note[]): HeatmapData[] {
    const data: HeatmapData[] = [];
    const today = new Date();
    const oneYear = 365;

    // 统计每天的笔记数
    const countByDate = new Map<string, number>();
    notes.forEach(note => {
        const date = new Date(note.createdAt).toISOString().split('T')[0];
        countByDate.set(date, (countByDate.get(date) || 0) + 1);
    });

    // 找最大值
    const maxCount = Math.max(...countByDate.values(), 1);

    // 生成过去365天的数据
    for (let i = oneYear - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = countByDate.get(dateStr) || 0;

        // 计算等级 (0-4)
        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (count > 0) {
            const ratio = count / maxCount;
            if (ratio <= 0.25) level = 1;
            else if (ratio <= 0.5) level = 2;
            else if (ratio <= 0.75) level = 3;
            else level = 4;
        }

        data.push({ date: dateStr, count, level });
    }

    return data;
}

interface ActivityHeatmapProps {
    notes: Note[];
    onClose: () => void;
}

// 活动热力图
export function ActivityHeatmap({ notes, onClose }: ActivityHeatmapProps) {

    const data = useMemo(() => generateHeatmapData(notes), [notes]);

    // 按周分组
    const weeks = useMemo(() => {
        const result: HeatmapData[][] = [];
        let week: HeatmapData[] = [];

        // 找到第一天是星期几，补充空白
        const firstDate = new Date(data[0].date);
        const firstDayOfWeek = firstDate.getDay();
        for (let i = 0; i < firstDayOfWeek; i++) {
            week.push({ date: '', count: 0, level: 0 });
        }

        data.forEach(d => {
            week.push(d);
            if (week.length === 7) {
                result.push(week);
                week = [];
            }
        });

        if (week.length > 0) {
            result.push(week);
        }

        return result;
    }, [data]);

    // 统计信息
    const stats = useMemo(() => {
        const totalDays = data.filter(d => d.count > 0).length;
        const totalNotes = data.reduce((sum, d) => sum + d.count, 0);
        const maxStreak = calculateMaxStreak(data);
        const currentStreak = calculateCurrentStreak(data);
        return { totalDays, totalNotes, maxStreak, currentStreak };
    }, [data]);

    // 计算最长连续天数
    function calculateMaxStreak(data: HeatmapData[]): number {
        let max = 0, current = 0;
        data.forEach(d => {
            if (d.count > 0) {
                current++;
                max = Math.max(max, current);
            } else {
                current = 0;
            }
        });
        return max;
    }

    // 计算当前连续天数
    function calculateCurrentStreak(data: HeatmapData[]): number {
        let streak = 0;
        for (let i = data.length - 1; i >= 0; i--) {
            if (data[i].count > 0) streak++;
            else if (i < data.length - 1) break; // 允许今天还没写
        }
        return streak;
    }

    // 颜色等级
    const colors = [
        'var(--bg-tertiary)',
        '#0e4429',
        '#006d32',
        '#26a641',
        '#39d353',
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[900px] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">🔥 活动热力图</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 统计信息 */}
                <div className="grid grid-cols-4 gap-4 p-4 border-b border-[var(--border)]">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[var(--accent)]">{stats.totalNotes}</div>
                        <div className="text-xs text-[var(--text-secondary)]">年度笔记</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalDays}</div>
                        <div className="text-xs text-[var(--text-secondary)]">活跃天数</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.maxStreak}</div>
                        <div className="text-xs text-[var(--text-secondary)]">最长连续</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">{stats.currentStreak}</div>
                        <div className="text-xs text-[var(--text-secondary)]">当前连续</div>
                    </div>
                </div>

                {/* 热力图 */}
                <div className="p-4 overflow-x-auto">
                    <div className="flex gap-0.5">
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-0.5">
                                {week.map((day, dayIndex) => (
                                    <div
                                        key={dayIndex}
                                        className="w-3 h-3 rounded-sm transition-colors"
                                        style={{ backgroundColor: day.date ? colors[day.level] : 'transparent' }}
                                        title={day.date ? `${day.date}: ${day.count} 篇笔记` : ''}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* 图例 */}
                    <div className="flex items-center justify-end gap-2 mt-4 text-xs text-[var(--text-secondary)]">
                        <span>少</span>
                        {colors.map((color, i) => (
                            <div
                                key={i}
                                className="w-3 h-3 rounded-sm"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                        <span>多</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
