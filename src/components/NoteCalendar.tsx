import { useMemo, useState } from 'react';
import type { Note } from '../types/index';

interface CalendarDay {
    date: Date;
    notes: Note[];
    isCurrentMonth: boolean;
    isToday: boolean;
}

// 生成日历数据
function generateCalendarDays(year: number, month: number, notes: Note[]): CalendarDay[] {
    const days: CalendarDay[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 获取第一天是星期几（0-6）
    const startDayOfWeek = firstDay.getDay();

    // 上个月的天
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month, -i);
        days.push({
            date,
            notes: notes.filter(n => isSameDay(new Date(n.createdAt), date)),
            isCurrentMonth: false,
            isToday: false,
        });
    }

    // 当前月的天
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d);
        days.push({
            date,
            notes: notes.filter(n => isSameDay(new Date(n.createdAt), date)),
            isCurrentMonth: true,
            isToday: isSameDay(date, today),
        });
    }

    // 下个月的天（补齐到42天）
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
            date,
            notes: notes.filter(n => isSameDay(new Date(n.createdAt), date)),
            isCurrentMonth: false,
            isToday: false,
        });
    }

    return days;
}

function isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

interface NoteCalendarProps {
    notes: Note[];
    onSelectNote: (noteId: string) => void;
    onClose: () => void;
}

// 笔记日历
export function NoteCalendar({ notes, onSelectNote, onClose }: NoteCalendarProps) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

    const days = useMemo(() => generateCalendarDays(year, month, notes), [year, month, notes]);
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

    const prevMonth = () => {
        if (month === 0) {
            setYear(year - 1);
            setMonth(11);
        } else {
            setMonth(month - 1);
        }
    };

    const nextMonth = () => {
        if (month === 11) {
            setYear(year + 1);
            setMonth(0);
        } else {
            setMonth(month + 1);
        }
    };

    const goToday = () => {
        setYear(today.getFullYear());
        setMonth(today.getMonth());
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[450px] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">📅 笔记日历</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 月份导航 */}
                <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
                    <button onClick={prevMonth} className="p-1 hover:bg-[var(--bg-tertiary)] rounded">
                        <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-medium text-[var(--text-primary)]">{year}年 {monthNames[month]}</span>
                        <button
                            onClick={goToday}
                            className="text-xs px-2 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)]"
                        >
                            今天
                        </button>
                    </div>
                    <button onClick={nextMonth} className="p-1 hover:bg-[var(--bg-tertiary)] rounded">
                        <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* 日历网格 */}
                <div className="p-3">
                    {/* 星期标题 */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-xs text-[var(--text-secondary)] py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* 日期 */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => (
                            <button
                                key={index}
                                onClick={() => day.notes.length > 0 && setSelectedDay(day)}
                                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm
                          transition-colors relative
                          ${!day.isCurrentMonth ? 'opacity-30' : ''}
                          ${day.isToday ? 'ring-2 ring-[var(--accent)]' : ''}
                          ${day.notes.length > 0
                                        ? 'bg-[var(--accent)]/20 hover:bg-[var(--accent)]/30 cursor-pointer'
                                        : 'hover:bg-[var(--bg-tertiary)]'
                                    }
                          ${selectedDay?.date.getTime() === day.date.getTime() ? 'bg-[var(--accent)]/40' : ''}`}
                            >
                                <span className={`${day.isToday ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-primary)]'}`}>
                                    {day.date.getDate()}
                                </span>
                                {day.notes.length > 0 && (
                                    <div className="absolute bottom-1 flex gap-0.5">
                                        {Array(Math.min(day.notes.length, 3)).fill(0).map((_, i) => (
                                            <div key={i} className="w-1 h-1 rounded-full bg-[var(--accent)]" />
                                        ))}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 选中日期的笔记 */}
                {selectedDay && selectedDay.notes.length > 0 && (
                    <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-tertiary)]/30 max-h-40 overflow-y-auto">
                        <div className="text-xs text-[var(--text-secondary)] mb-2">
                            {selectedDay.date.toLocaleDateString('zh-CN')} 的笔记
                        </div>
                        <div className="space-y-1">
                            {selectedDay.notes.map(note => (
                                <button
                                    key={note.id}
                                    onClick={() => {
                                        onSelectNote(note.id);
                                        onClose();
                                    }}
                                    className="w-full text-left p-2 rounded bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]
                            transition-colors text-sm text-[var(--text-primary)] truncate"
                                >
                                    {note.title}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


