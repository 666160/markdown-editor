import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useTheme } from '../contexts/ThemeContext';
import { MermaidDiagram } from './MermaidDiagram';

interface PreviewProps {
    content: string;
}

// 代码块组件配置
function CodeBlock({ className, children }: { className?: string; children?: React.ReactNode }) {
    const { theme } = useTheme();
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const codeString = String(children).replace(/\n$/, '');

    // Mermaid 图表特殊处理
    if (language === 'mermaid') {
        return <MermaidDiagram chart={codeString} />;
    }

    // 浅色主题使用 prism 样式，深色主题使用 atomDark
    const isLightTheme = theme === 'standard' || theme === 'solarized';
    const codeStyle = isLightTheme ? prism : atomDark;

    // 如果没有语言标记且不包含换行，视为行内代码
    const isInline = !match && !codeString.includes('\n');

    if (isInline) {
        return (
            <code
                className="bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded text-[var(--code-text)] font-mono text-sm"
            >
                {children}
            </code>
        );
    }

    return (
        <SyntaxHighlighter
            style={codeStyle}
            language={language || 'javascript'}
            PreTag="div"
            showLineNumbers={true}
            wrapLines={true}
            customStyle={{
                margin: '1em 0',
                borderRadius: '12px',
                fontSize: '0.9rem',
                boxShadow: isLightTheme
                    ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                    : '0 4px 20px rgba(0, 0, 0, 0.4)',
                border: isLightTheme
                    ? '1px solid var(--border)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
            }}
            lineNumberStyle={{
                color: isLightTheme ? '#999' : '#4a5568',
                paddingRight: '1em',
                borderRight: `1px solid ${isLightTheme ? '#ddd' : '#2d3748'}`,
                marginRight: '1em',
            }}
        >
            {codeString}
        </SyntaxHighlighter>
    );
}

// Markdown 预览组件
export function Preview({ content }: PreviewProps) {
    if (!content.trim()) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)]">
                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                </svg>
                <p className="text-sm">在左侧输入 Markdown</p>
                <p className="text-xs mt-1 opacity-75">预览将在这里显示</p>
            </div>
        );
    }

    // 创建代码块组件
    const CodeBlockComponent: Components['code'] = ({ className, children }) => (
        <CodeBlock className={className}>{children}</CodeBlock>
    );

    return (
        <div className="h-full overflow-auto p-6">
            <article className="markdown-preview max-w-none">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    urlTransform={(url) => url}
                    components={{
                        code: CodeBlockComponent,
                        img: ({ src, alt }) => (
                            <img
                                src={src}
                                alt={alt || '图片'}
                                className="max-w-full h-auto rounded-lg shadow-lg my-4"
                                style={{ maxHeight: '500px' }}
                                loading="lazy"
                            />
                        ),
                    }}
                >
                    {content}
                </ReactMarkdown>
            </article>
        </div>
    );
}
