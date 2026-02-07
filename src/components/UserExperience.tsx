import { useState, useEffect } from 'react';

const FONT_SIZE_KEY = 'editor-font-size';
const MIN_SIZE = 12;
const MAX_SIZE = 24;
const DEFAULT_SIZE = 16;

// 读取字体大小
function loadFontSize(): number {
    try {
        const saved = localStorage.getItem(FONT_SIZE_KEY);
        if (saved) {
            const size = parseInt(saved, 10);
            if (size >= MIN_SIZE && size <= MAX_SIZE) {
                return size;
            }
        }
    } catch { }
    return DEFAULT_SIZE;
}

// 保存字体大小
function saveFontSize(size: number): void {
    localStorage.setItem(FONT_SIZE_KEY, size.toString());
}

// 字体大小调节 Hook
export function useFontSize() {
    const [fontSize, setFontSize] = useState(loadFontSize);

    // 应用到 CSS 变量
    useEffect(() => {
        document.documentElement.style.setProperty('--editor-font-size', `${fontSize}px`);
        saveFontSize(fontSize);
    }, [fontSize]);

    const increase = () => setFontSize(prev => Math.min(prev + 1, MAX_SIZE));
    const decrease = () => setFontSize(prev => Math.max(prev - 1, MIN_SIZE));
    const reset = () => setFontSize(DEFAULT_SIZE);

    return { fontSize, increase, decrease, reset };
}

interface FontSizeControlProps {
    fontSize: number;
    onIncrease: () => void;
    onDecrease: () => void;
    onReset: () => void;
}

// 字体大小控制组件
export function FontSizeControl({ fontSize, onIncrease, onDecrease, onReset }: FontSizeControlProps) {
    return (
        <div className="flex items-center gap-1">
            <button
                onClick={onDecrease}
                className="w-6 h-6 flex items-center justify-center rounded text-[var(--text-secondary)]
                  hover:bg-[var(--bg-tertiary)] transition-colors text-sm"
                title="减小字体"
            >
                A-
            </button>
            <button
                onClick={onReset}
                className="px-1.5 h-6 flex items-center justify-center rounded text-[var(--text-secondary)]
                  hover:bg-[var(--bg-tertiary)] transition-colors text-xs"
                title="重置字体大小"
            >
                {fontSize}px
            </button>
            <button
                onClick={onIncrease}
                className="w-6 h-6 flex items-center justify-center rounded text-[var(--text-secondary)]
                  hover:bg-[var(--bg-tertiary)] transition-colors text-sm font-bold"
                title="增大字体"
            >
                A+
            </button>
        </div>
    );
}

interface ReadingModeProps {
    content: string;
    title: string;
    onClose: () => void;
}

// 阅读模式组件
export function ReadingMode({ content, title, onClose }: ReadingModeProps) {
    useEffect(() => {
        // 禁用滚动
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // ESC 关闭
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-[#f5f0e8] dark:bg-[#1a1a1a] z-50 overflow-auto">
            {/* 顶部工具栏 */}
            <div className="fixed top-0 left-0 right-0 bg-[#f5f0e8]/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm
                     border-b border-[#e0d8c8] dark:border-[#333] py-3 px-6 flex items-center justify-between">
                <h1 className="text-lg font-serif text-[#333] dark:text-[#e0e0e0]">{title}</h1>
                <button
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-lg bg-[#e0d8c8] dark:bg-[#333] text-[#666] dark:text-[#aaa]
                    hover:bg-[#d0c8b8] dark:hover:bg-[#444] transition-colors text-sm"
                >
                    退出阅读模式 (ESC)
                </button>
            </div>

            {/* 内容区 */}
            <article className="max-w-3xl mx-auto px-8 py-24 font-serif leading-relaxed
                        text-[#333] dark:text-[#e0e0e0]"
                style={{ fontSize: '18px', lineHeight: '1.9' }}>
                <div
                    className="prose prose-lg dark:prose-invert prose-headings:font-serif
                    prose-p:text-justify prose-p:indent-8 
                    prose-blockquote:border-l-4 prose-blockquote:border-[#d0c8b8]
                    prose-code:bg-[#e8e0d0] dark:prose-code:bg-[#2a2a2a]
                    prose-img:rounded-lg prose-img:shadow-md"
                    dangerouslySetInnerHTML={{
                        __html: content
                            .replace(/^# (.+)$/gm, '<h1 class="text-3xl mt-8 mb-4">$1</h1>')
                            .replace(/^## (.+)$/gm, '<h2 class="text-2xl mt-6 mb-3">$1</h2>')
                            .replace(/^### (.+)$/gm, '<h3 class="text-xl mt-5 mb-2">$1</h3>')
                            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.+?)\*/g, '<em>$1</em>')
                            .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded">$1</code>')
                            .replace(/\n\n/g, '</p><p class="my-4">')
                    }}
                />
            </article>
        </div>
    );
}

// 打印功能
export function printNote(previewRef: React.RefObject<HTMLDivElement | null>, title: string) {
    if (!previewRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('请允许弹出窗口以使用打印功能');
        return;
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          line-height: 1.8;
          color: #1a1a1a;
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        h1 { font-size: 2em; border-bottom: 2px solid #333; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #ddd; padding-bottom: 0.3em; }
        pre, code { background: #f5f5f5; border-radius: 4px; font-family: 'Consolas', monospace; }
        code { padding: 0.2em 0.4em; font-size: 0.9em; }
        pre { padding: 1em; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 1em 0; padding-left: 1em; color: #666; }
        img { max-width: 100%; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
        th { background: #f5f5f5; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      ${previewRef.current.innerHTML}
    </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();

    // 等待内容加载后打印
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}
