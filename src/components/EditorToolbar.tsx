import { useEffect, type ReactNode, type RefObject } from 'react';

interface ToolbarAction {
    icon: ReactNode;
    label: string;
    shortcut?: string;
    action: () => void;
}

interface EditorToolbarProps {
    textareaRef: RefObject<HTMLTextAreaElement | null>;
    onInsert: (before: string, after?: string, placeholder?: string) => void;
}

// 编辑器工具栏组件
export function EditorToolbar({ textareaRef, onInsert }: EditorToolbarProps) {

    // 工具栏按钮配置
    const actions: ToolbarAction[] = [
        {
            icon: <span className="font-bold">B</span>,
            label: '加粗',
            shortcut: 'Ctrl+B',
            action: () => onInsert('**', '**', '粗体文本'),
        },
        {
            icon: <span className="italic">I</span>,
            label: '斜体',
            shortcut: 'Ctrl+I',
            action: () => onInsert('*', '*', '斜体文本'),
        },
        {
            icon: <span className="line-through">S</span>,
            label: '删除线',
            shortcut: 'Ctrl+D',
            action: () => onInsert('~~', '~~', '删除线文本'),
        },
        {
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            ),
            label: '行内代码',
            shortcut: 'Ctrl+`',
            action: () => onInsert('`', '`', 'code'),
        },
        { icon: <span className="w-px h-4 bg-[var(--border)]" />, label: 'divider', action: () => { } },
        {
            icon: <span className="font-bold text-lg">H1</span>,
            label: '一级标题',
            action: () => onInsert('# ', '', '标题'),
        },
        {
            icon: <span className="font-bold">H2</span>,
            label: '二级标题',
            action: () => onInsert('## ', '', '标题'),
        },
        {
            icon: <span className="font-medium text-sm">H3</span>,
            label: '三级标题',
            action: () => onInsert('### ', '', '标题'),
        },
        { icon: <span className="w-px h-4 bg-[var(--border)]" />, label: 'divider', action: () => { } },
        {
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
            ),
            label: '无序列表',
            action: () => onInsert('- ', '', '列表项'),
        },
        {
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
            ),
            label: '有序列表',
            action: () => onInsert('1. ', '', '列表项'),
        },
        {
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            label: '任务列表',
            action: () => onInsert('- [ ] ', '', '待办事项'),
        },
        { icon: <span className="w-px h-4 bg-[var(--border)]" />, label: 'divider', action: () => { } },
        {
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            ),
            label: '链接',
            shortcut: 'Ctrl+K',
            action: () => onInsert('[', '](url)', '链接文字'),
        },
        {
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            label: '引用',
            action: () => onInsert('> ', '', '引用内容'),
        },
        {
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
            ),
            label: '代码块',
            action: () => onInsert('```javascript\n', '\n```', '// 代码'),
        },
        {
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            ),
            label: '表格',
            action: () => onInsert('| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| ', ' |  |  |', '内容'),
        },
        {
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
            ),
            label: '分割线',
            action: () => onInsert('\n---\n', '', ''),
        },
    ];

    return (
        <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-tertiary)]/50 overflow-x-auto">
            {actions.map((action, index) => {
                if (action.label === 'divider') {
                    return <span key={index} className="w-px h-5 bg-[var(--border)] mx-1" />;
                }

                return (
                    <button
                        key={action.label}
                        onClick={action.action}
                        className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]
                     hover:text-[var(--text-primary)] transition-colors duration-150"
                        title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
                    >
                        {action.icon}
                    </button>
                );
            })}
        </div>
    );
}

// 快捷键 Hook
export function useEditorShortcuts(
    textareaRef: RefObject<HTMLTextAreaElement | null>,
    onInsert: (before: string, after?: string, placeholder?: string) => void
) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!textareaRef.current) return;

            // 只在 textarea 聚焦时触发
            if (document.activeElement !== textareaRef.current) return;

            const isMod = e.ctrlKey || e.metaKey;

            if (isMod && e.key === 'b') {
                e.preventDefault();
                onInsert('**', '**', '粗体文本');
            } else if (isMod && e.key === 'i') {
                e.preventDefault();
                onInsert('*', '*', '斜体文本');
            } else if (isMod && e.key === 'd') {
                e.preventDefault();
                onInsert('~~', '~~', '删除线文本');
            } else if (isMod && e.key === 'k') {
                e.preventDefault();
                onInsert('[', '](url)', '链接文字');
            } else if (isMod && e.key === '`') {
                e.preventDefault();
                onInsert('`', '`', 'code');
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [textareaRef, onInsert]);
}
