import { useMemo } from 'react';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content: string;
    onItemClick?: (id: string) => void;
}

// 目录导航组件
export function TableOfContents({ content, onItemClick }: TableOfContentsProps) {
    // 解析 Markdown 内容，提取标题
    const tocItems = useMemo<TocItem[]>(() => {
        const lines = content.split('\n');
        const items: TocItem[] = [];

        lines.forEach((line, index) => {
            const match = line.match(/^(#{1,6})\s+(.+)$/);
            if (match) {
                const level = match[1].length;
                const text = match[2].replace(/[*_`#\[\]]/g, '').trim();
                const id = `heading-${index}`;
                items.push({ id, text, level });
            }
        });

        return items;
    }, [content]);

    if (tocItems.length === 0) {
        return (
            <div className="text-center text-[var(--text-secondary)] text-sm py-4">
                <p>暂无目录</p>
                <p className="text-xs mt-1 opacity-75">添加标题后自动生成</p>
            </div>
        );
    }

    return (
        <nav className="space-y-1">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 px-2">
                目录
            </h3>
            {tocItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onItemClick?.(item.id)}
                    className="w-full text-left px-2 py-1.5 rounded-md text-sm
                     text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                     hover:bg-[var(--bg-tertiary)] transition-colors duration-200
                     truncate"
                    style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                >
                    <span className={`
            ${item.level === 1 ? 'font-semibold text-[var(--accent)]' : ''}
            ${item.level === 2 ? 'font-medium' : ''}
          `}>
                        {item.text}
                    </span>
                </button>
            ))}
        </nav>
    );
}
