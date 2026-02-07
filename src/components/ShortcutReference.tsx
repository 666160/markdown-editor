interface ShortcutCategory {
    name: string;
    shortcuts: { key: string; description: string }[];
}

const shortcutCategories: ShortcutCategory[] = [
    {
        name: '通用',
        shortcuts: [
            { key: 'Ctrl + N', description: '新建笔记' },
            { key: 'Ctrl + S', description: '保存笔记' },
            { key: 'Ctrl + P', description: '命令面板' },
            { key: 'Ctrl + /', description: '快捷键帮助' },
            { key: 'Escape', description: '关闭弹窗' },
        ],
    },
    {
        name: '文本格式',
        shortcuts: [
            { key: 'Ctrl + B', description: '粗体' },
            { key: 'Ctrl + I', description: '斜体' },
            { key: 'Ctrl + K', description: '插入链接' },
            { key: 'Ctrl + `', description: '行内代码' },
            { key: 'Ctrl + Shift + K', description: '代码块' },
        ],
    },
    {
        name: '列表',
        shortcuts: [
            { key: 'Ctrl + L', description: '无序列表' },
            { key: 'Ctrl + Shift + L', description: '有序列表' },
            { key: 'Ctrl + Shift + C', description: '任务列表' },
            { key: 'Tab', description: '缩进' },
            { key: 'Shift + Tab', description: '取消缩进' },
        ],
    },
    {
        name: '视图',
        shortcuts: [
            { key: 'F11', description: '全屏模式' },
            { key: 'Ctrl + E', description: '切换编辑/预览' },
            { key: 'Ctrl + \\', description: '分屏视图' },
            { key: 'Ctrl + +', description: '放大字体' },
            { key: 'Ctrl + -', description: '缩小字体' },
        ],
    },
];

interface ShortcutReferenceProps {
    onClose: () => void;
}

// 快捷键参考卡
export function ShortcutReference({ onClose }: ShortcutReferenceProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">⌨️ 快捷键参考</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    <div className="grid grid-cols-2 gap-6">
                        {shortcutCategories.map(category => (
                            <div key={category.name}>
                                <h4 className="text-sm font-semibold text-[var(--accent)] mb-3">{category.name}</h4>
                                <div className="space-y-2">
                                    {category.shortcuts.map(shortcut => (
                                        <div key={shortcut.key} className="flex items-center justify-between">
                                            <span className="text-sm text-[var(--text-secondary)]">{shortcut.description}</span>
                                            <kbd className="px-2 py-1 rounded bg-[var(--bg-tertiary)] text-xs font-mono
                                     text-[var(--text-primary)] border border-[var(--border)]">
                                                {shortcut.key}
                                            </kbd>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] text-center">
                    按 <kbd className="px-1 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">Ctrl + /</kbd> 随时查看
                </div>
            </div>
        </div>
    );
}
