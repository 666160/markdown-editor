import { useState, useEffect, useCallback } from 'react';

const SNIPPETS_STORAGE_KEY = 'quick-snippets';

interface Snippet {
    id: string;
    trigger: string; // 触发词，如 /date
    content: string; // 展开内容
    description: string;
}

// 默认快捷短语
const defaultSnippets: Snippet[] = [
    { id: '1', trigger: '/date', content: new Date().toLocaleDateString('zh-CN'), description: '当前日期' },
    { id: '2', trigger: '/time', content: new Date().toLocaleTimeString('zh-CN'), description: '当前时间' },
    { id: '3', trigger: '/todo', content: '- [ ] ', description: '待办事项' },
    { id: '4', trigger: '/done', content: '- [x] ', description: '已完成事项' },
    { id: '5', trigger: '/code', content: '```\n\n```', description: '代码块' },
    { id: '6', trigger: '/table', content: '| 列1 | 列2 | 列3 |\n|---|---|---|\n| | | |', description: '表格' },
    { id: '7', trigger: '/link', content: '[链接文字](url)', description: '链接' },
    { id: '8', trigger: '/img', content: '![图片描述](url)', description: '图片' },
    { id: '9', trigger: '/hr', content: '\n---\n', description: '分割线' },
    { id: '10', trigger: '/quote', content: '> ', description: '引用' },
];

// 读取快捷短语
function loadSnippets(): Snippet[] {
    try {
        const saved = localStorage.getItem(SNIPPETS_STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch { }
    return defaultSnippets;
}

// 保存快捷短语
function saveSnippets(snippets: Snippet[]): void {
    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(snippets));
}

// 快捷短语 Hook
export function useSnippets() {
    const [snippets, setSnippets] = useState<Snippet[]>(loadSnippets);

    // 保存
    useEffect(() => {
        saveSnippets(snippets);
    }, [snippets]);

    // 查找匹配的快捷短语
    const findSnippet = useCallback((trigger: string): Snippet | undefined => {
        return snippets.find(s => s.trigger === trigger);
    }, [snippets]);

    // 添加快捷短语
    const addSnippet = useCallback((trigger: string, content: string, description: string) => {
        const newSnippet: Snippet = {
            id: Date.now().toString(),
            trigger,
            content,
            description,
        };
        setSnippets(prev => [...prev, newSnippet]);
    }, []);

    // 删除快捷短语
    const removeSnippet = useCallback((id: string) => {
        setSnippets(prev => prev.filter(s => s.id !== id));
    }, []);

    // 重置为默认
    const resetSnippets = useCallback(() => {
        setSnippets(defaultSnippets);
    }, []);

    // 展开快捷短语（处理动态内容）
    const expandSnippet = useCallback((snippet: Snippet): string => {
        let content = snippet.content;

        // 动态替换
        content = content.replace('{date}', new Date().toLocaleDateString('zh-CN'));
        content = content.replace('{time}', new Date().toLocaleTimeString('zh-CN'));
        content = content.replace('{datetime}', new Date().toLocaleString('zh-CN'));

        // 特殊触发词的动态内容
        if (snippet.trigger === '/date') {
            content = new Date().toLocaleDateString('zh-CN');
        } else if (snippet.trigger === '/time') {
            content = new Date().toLocaleTimeString('zh-CN');
        }

        return content;
    }, []);

    return { snippets, findSnippet, addSnippet, removeSnippet, resetSnippets, expandSnippet };
}

interface SnippetListProps {
    snippets: Snippet[];
    onSelect: (snippet: Snippet) => void;
    filter?: string;
}

// 快捷短语选择列表
export function SnippetList({ snippets, onSelect, filter = '' }: SnippetListProps) {
    const filtered = filter
        ? snippets.filter(s =>
            s.trigger.includes(filter) ||
            s.description.includes(filter)
        )
        : snippets;

    if (filtered.length === 0) {
        return (
            <div className="p-3 text-center text-[var(--text-secondary)] text-sm">
                无匹配的快捷短语
            </div>
        );
    }

    return (
        <div className="py-1">
            {filtered.map(snippet => (
                <button
                    key={snippet.id}
                    onClick={() => onSelect(snippet)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left
                    hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                    <code className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent)]">
                        {snippet.trigger}
                    </code>
                    <span className="text-sm text-[var(--text-secondary)]">{snippet.description}</span>
                </button>
            ))}
        </div>
    );
}

interface SnippetManagerProps {
    snippets: Snippet[];
    onAdd: (trigger: string, content: string, description: string) => void;
    onRemove: (id: string) => void;
    onReset: () => void;
    onClose: () => void;
}

// 快捷短语管理面板
export function SnippetManager({ snippets, onAdd, onRemove, onReset, onClose }: SnippetManagerProps) {
    const [newTrigger, setNewTrigger] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newDescription, setNewDescription] = useState('');

    const handleAdd = () => {
        if (!newTrigger.startsWith('/')) {
            alert('触发词必须以 / 开头');
            return;
        }
        if (!newContent || !newDescription) {
            alert('请填写完整');
            return;
        }
        onAdd(newTrigger, newContent, newDescription);
        setNewTrigger('');
        setNewContent('');
        setNewDescription('');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[500px] max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">⚡ 快捷短语</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onReset}
                            className="text-xs px-2 py-1 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                        >
                            重置默认
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 添加新短语 */}
                <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-tertiary)]/30">
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        <input
                            type="text"
                            value={newTrigger}
                            onChange={(e) => setNewTrigger(e.target.value)}
                            placeholder="/trigger"
                            className="px-2 py-1.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border)]
                        text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]"
                        />
                        <input
                            type="text"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder="描述"
                            className="px-2 py-1.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border)]
                        text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]"
                        />
                        <button
                            onClick={handleAdd}
                            className="px-3 py-1.5 rounded bg-[var(--accent)] text-white text-sm hover:opacity-90"
                        >
                            添加
                        </button>
                    </div>
                    <input
                        type="text"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="展开内容"
                        className="w-full px-2 py-1.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border)]
                      text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    />
                </div>

                {/* 现有短语列表 */}
                <div className="max-h-64 overflow-y-auto">
                    {snippets.map(snippet => (
                        <div key={snippet.id} className="flex items-center gap-3 p-3 border-b border-[var(--border)]">
                            <code className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent)]">
                                {snippet.trigger}
                            </code>
                            <span className="flex-1 text-sm text-[var(--text-secondary)]">{snippet.description}</span>
                            <button
                                onClick={() => onRemove(snippet.id)}
                                className="p-1 rounded text-red-500 hover:bg-red-500/10"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] text-center">
                    在编辑器中输入触发词后按 Tab 展开
                </div>
            </div>
        </div>
    );
}
