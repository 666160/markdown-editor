interface MarkdownElement {
    name: string;
    syntax: string;
    example: string;
}

const markdownElements: MarkdownElement[] = [
    { name: '标题', syntax: '# H1\n## H2\n### H3', example: '# 一级标题' },
    { name: '粗体', syntax: '**文字**', example: '**粗体文字**' },
    { name: '斜体', syntax: '*文字*', example: '*斜体文字*' },
    { name: '删除线', syntax: '~~文字~~', example: '~~删除线~~' },
    { name: '链接', syntax: '[文字](url)', example: '[Google](https://google.com)' },
    { name: '图片', syntax: '![描述](url)', example: '![Logo](image.png)' },
    { name: '行内代码', syntax: '`code`', example: '`console.log()`' },
    { name: '代码块', syntax: '```lang\ncode\n```', example: '```js\nconsole.log("Hello");\n```' },
    { name: '引用', syntax: '> 引用文字', example: '> 这是引用' },
    { name: '无序列表', syntax: '- 项目\n- 项目', example: '- 项目1\n- 项目2' },
    { name: '有序列表', syntax: '1. 项目\n2. 项目', example: '1. 第一项\n2. 第二项' },
    { name: '任务列表', syntax: '- [ ] 待办\n- [x] 完成', example: '- [ ] 未完成\n- [x] 已完成' },
    { name: '分割线', syntax: '---', example: '---' },
    { name: '表格', syntax: '| A | B |\n|---|---|\n| 1 | 2 |', example: '| 姓名 | 年龄 |\n|------|------|\n| 张三 | 25 |' },
    { name: '数学公式', syntax: '$E=mc^2$', example: '$\\sum_{i=1}^n i$' },
    { name: '脚注', syntax: '文字[^1]\n[^1]: 注释', example: '这是文字[^1]\n\n[^1]: 这是脚注' },
    { name: '高亮', syntax: '==文字==', example: '==高亮文字==' },
    { name: '双向链接', syntax: '[[笔记名]]', example: '[[我的笔记]]' },
];

interface MarkdownHelpProps {
    onInsert: (text: string) => void;
    onClose: () => void;
}

// Markdown 语法帮助
export function MarkdownHelp({ onInsert, onClose }: MarkdownHelpProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[700px] max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">📖 Markdown 语法参考</h3>
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
                    <div className="grid grid-cols-2 gap-3">
                        {markdownElements.map(element => (
                            <div
                                key={element.name}
                                className="p-3 rounded-lg bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)]
                          transition-colors cursor-pointer group"
                                onClick={() => {
                                    onInsert(element.example);
                                    onClose();
                                }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-[var(--text-primary)]">{element.name}</span>
                                    <span className="text-xs text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                                        点击插入
                                    </span>
                                </div>
                                <pre className="text-xs text-[var(--text-secondary)] font-mono whitespace-pre-wrap">
                                    {element.syntax}
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-3 border-t border-[var(--border)] flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">点击任意语法将其插入到编辑器</span>
                    <a
                        href="https://www.markdownguide.org/cheat-sheet/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--accent)] hover:underline"
                    >
                        完整文档 ↗
                    </a>
                </div>
            </div>
        </div>
    );
}
