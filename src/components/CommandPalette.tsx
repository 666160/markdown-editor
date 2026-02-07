import { useState, useMemo, useEffect, useRef } from 'react';
import type { Note } from '../types/index';

interface Command {
    id: string;
    name: string;
    icon: string;
    shortcut?: string;
    action: () => void;
    category: 'note' | 'edit' | 'view' | 'export';
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    notes: Note[];
    onSelectNote: (noteId: string) => void;
    commands: Command[];
}

// 命令面板组件
export function CommandPalette({
    isOpen,
    onClose,
    notes,
    onSelectNote,
    commands
}: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // 过滤笔记和命令
    const filteredItems = useMemo(() => {
        const q = query.toLowerCase().trim();

        // 如果以 > 开头，只搜索命令
        if (q.startsWith('>')) {
            const cmdQuery = q.slice(1).trim();
            return {
                type: 'commands' as const,
                items: commands.filter(cmd =>
                    cmd.name.toLowerCase().includes(cmdQuery)
                ),
            };
        }

        // 否则搜索笔记
        const filteredNotes = q
            ? notes.filter(note =>
                note.title.toLowerCase().includes(q) ||
                note.content.toLowerCase().includes(q)
            )
            : notes.slice(0, 10); // 最多显示10个

        return {
            type: 'notes' as const,
            items: filteredNotes,
        };
    }, [query, notes, commands]);

    // 重置选中索引
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // 打开时聚焦
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // 键盘导航
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const items = filteredItems.items;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.max(prev - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (items.length > 0) {
                        const item = items[selectedIndex];
                        if (filteredItems.type === 'notes') {
                            onSelectNote((item as Note).id);
                        } else {
                            (item as Command).action();
                        }
                        onClose();
                    }
                    break;
                case 'Escape':
                    onClose();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredItems, selectedIndex, onSelectNote, onClose]);

    // 滚动到选中项
    useEffect(() => {
        if (listRef.current) {
            const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
            selectedEl?.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-24 z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[500px] max-h-[60vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* 搜索框 */}
                <div className="p-3 border-b border-[var(--border)]">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="搜索笔记... 输入 > 执行命令"
                        className="w-full bg-transparent text-[var(--text-primary)] text-sm
                      placeholder:text-[var(--text-secondary)] outline-none"
                    />
                </div>

                {/* 结果列表 */}
                <div ref={listRef} className="max-h-80 overflow-y-auto">
                    {filteredItems.items.length === 0 ? (
                        <div className="p-8 text-center text-[var(--text-secondary)] text-sm">
                            {query ? '没有找到匹配的结果' : '输入关键词搜索笔记'}
                        </div>
                    ) : (
                        filteredItems.type === 'notes' ? (
                            // 笔记列表
                            (filteredItems.items as Note[]).map((note, index) => (
                                <button
                                    key={note.id}
                                    onClick={() => {
                                        onSelectNote(note.id);
                                        onClose();
                                    }}
                                    className={`w-full text-left px-4 py-3 flex items-center gap-3
                            ${index === selectedIndex
                                            ? 'bg-[var(--accent)]/20'
                                            : 'hover:bg-[var(--bg-tertiary)]'
                                        } transition-colors`}
                                >
                                    <svg className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                                            {note.title}
                                        </div>
                                        <div className="text-xs text-[var(--text-secondary)] truncate">
                                            {note.content.slice(0, 60).replace(/[#*_`]/g, '')}
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            // 命令列表
                            (filteredItems.items as Command[]).map((cmd, index) => (
                                <button
                                    key={cmd.id}
                                    onClick={() => {
                                        cmd.action();
                                        onClose();
                                    }}
                                    className={`w-full text-left px-4 py-3 flex items-center gap-3
                            ${index === selectedIndex
                                            ? 'bg-[var(--accent)]/20'
                                            : 'hover:bg-[var(--bg-tertiary)]'
                                        } transition-colors`}
                                >
                                    <span className="text-lg">{cmd.icon}</span>
                                    <span className="flex-1 text-sm text-[var(--text-primary)]">{cmd.name}</span>
                                    {cmd.shortcut && (
                                        <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] border border-[var(--border)]
                                  rounded text-xs text-[var(--text-secondary)]">
                                            {cmd.shortcut}
                                        </kbd>
                                    )}
                                </button>
                            ))
                        )
                    )}
                </div>

                {/* 底部提示 */}
                <div className="px-4 py-2 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] flex gap-4">
                    <span>↑↓ 导航</span>
                    <span>Enter 选择</span>
                    <span>Esc 关闭</span>
                </div>
            </div>
        </div>
    );
}

// 命令生成器
// 命令生成器
export function createCommands(actions: {
    createNote: () => void;
    createDailyNote: () => void;
    toggleFullscreen: () => void;
    exportPdf: () => void;
    exportMd: () => void;
    showShortcuts: () => void;
    showTemplates: () => void;
    toggleFocus: () => void;
    toggleReading: () => void;
    showGraph: () => void;
    showStats: () => void;
    showHistory: () => void;
}): Command[] {
    return [
        { id: 'new-note', name: '新建笔记', icon: '📝', shortcut: 'Ctrl+N', category: 'note', action: actions.createNote },
        { id: 'daily-note', name: '今日笔记', icon: '📅', shortcut: '', category: 'note', action: actions.createDailyNote },
        { id: 'templates', name: '从模板创建', icon: '📋', shortcut: '', category: 'note', action: actions.showTemplates },
        { id: 'fullscreen', name: '全屏模式', icon: '🖥️', shortcut: 'F11', category: 'view', action: actions.toggleFullscreen },
        { id: 'focus-mode', name: '专注模式', icon: '🎯', shortcut: '', category: 'view', action: actions.toggleFocus },
        { id: 'reading-mode', name: '阅读模式', icon: '📖', shortcut: '', category: 'view', action: actions.toggleReading },
        { id: 'shortcuts', name: '快捷键帮助', icon: '⌨️', shortcut: 'Ctrl+/', category: 'view', action: actions.showShortcuts },
        { id: 'knowledge-graph', name: '知识图谱', icon: '🕸️', shortcut: '', category: 'view', action: actions.showGraph },
        { id: 'statistics', name: '统计数据', icon: '📊', shortcut: '', category: 'view', action: actions.showStats },
        { id: 'history', name: '历史版本', icon: '🕒', shortcut: '', category: 'note', action: actions.showHistory },
        { id: 'export-pdf', name: '导出 PDF', icon: '📄', shortcut: '', category: 'export', action: actions.exportPdf },
        { id: 'export-md', name: '导出 Markdown', icon: '📑', shortcut: '', category: 'export', action: actions.exportMd },
    ];
}
