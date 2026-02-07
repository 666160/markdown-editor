import { useMemo } from 'react';

interface OutlineItem {
    level: number;
    text: string;
    line: number;
}

// 提取 Markdown 大纲
export function extractOutline(content: string): OutlineItem[] {
    const lines = content.split('\n');
    const outline: OutlineItem[] = [];

    lines.forEach((line, index) => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
            outline.push({
                level: match[1].length,
                text: match[2].trim(),
                line: index + 1,
            });
        }
    });

    return outline;
}

interface OutlinePanelProps {
    content: string;
    onNavigate: (line: number) => void;
}

// 大纲导航面板
export function OutlinePanel({ content, onNavigate }: OutlinePanelProps) {
    const outline = useMemo(() => extractOutline(content), [content]);

    if (outline.length === 0) {
        return (
            <div className="p-4 text-center text-[var(--text-secondary)] text-sm">
                <p>暂无标题</p>
                <p className="text-xs mt-1 opacity-70">使用 # 创建标题</p>
            </div>
        );
    }

    return (
        <div className="p-2">
            <h3 className="text-xs font-medium text-[var(--text-secondary)] px-2 mb-2">📑 大纲</h3>
            <nav className="space-y-0.5">
                {outline.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => onNavigate(item.line)}
                        className="w-full text-left px-2 py-1.5 rounded text-sm
                      text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                      hover:bg-[var(--bg-tertiary)] transition-colors truncate"
                        style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                        title={item.text}
                    >
                        <span className="opacity-50 mr-1">{'#'.repeat(item.level)}</span>
                        {item.text}
                    </button>
                ))}
            </nav>
        </div>
    );
}

// 浮动大纲按钮
interface FloatingOutlineProps {
    content: string;
    onNavigate: (line: number) => void;
}

export function FloatingOutline({ content, onNavigate }: FloatingOutlineProps) {
    const outline = useMemo(() => extractOutline(content), [content]);

    if (outline.length === 0) return null;

    return (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-lg
                     p-2 max-h-[60vh] overflow-y-auto w-48 opacity-30 hover:opacity-100 transition-opacity">
                <div className="text-xs text-[var(--text-secondary)] mb-2 px-1">大纲</div>
                {outline.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => onNavigate(item.line)}
                        className="w-full text-left px-2 py-1 rounded text-xs
                      text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                      hover:bg-[var(--bg-tertiary)] transition-colors truncate"
                        style={{ paddingLeft: `${(item.level - 1) * 8 + 4}px` }}
                    >
                        {item.text}
                    </button>
                ))}
            </div>
        </div>
    );
}
