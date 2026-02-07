import { useRef } from 'react';

interface ExportButtonProps {
    previewRef: React.RefObject<HTMLDivElement | null>;
    title: string;
    content: string;
}

// 导出按钮组件
export function ExportButton({ previewRef, title, content }: ExportButtonProps) {
    const isExporting = useRef(false);

    // 导出为 PDF（优化样式版本）
    const exportToPdf = async () => {
        if (isExporting.current || !previewRef.current) return;

        isExporting.current = true;

        try {
            const html2pdf = (await import('html2pdf.js')).default;

            // 创建一个用于导出的临时容器，应用打印友好的样式
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = previewRef.current.innerHTML;

            // 应用打印友好的样式
            tempContainer.style.cssText = `
        padding: 40px;
        background: white;
        color: #1a1a1a;
        font-family: 'Georgia', 'Times New Roman', serif;
        font-size: 14px;
        line-height: 1.8;
        max-width: 100%;
      `;

            // 修改内部元素样式
            const headings = tempContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headings.forEach((h) => {
                const el = h as HTMLElement;
                el.style.color = '#1a1a1a';
                el.style.fontFamily = "'Helvetica Neue', Arial, sans-serif";
                el.style.marginTop = '1.5em';
                el.style.marginBottom = '0.5em';
                el.style.background = 'none';
                el.style.webkitTextFillColor = '#1a1a1a';
            });

            // H1 特殊处理
            const h1s = tempContainer.querySelectorAll('h1');
            h1s.forEach((h1) => {
                const el = h1 as HTMLElement;
                el.style.fontSize = '28px';
                el.style.borderBottom = '2px solid #333';
                el.style.paddingBottom = '8px';
            });

            // 段落样式
            const paragraphs = tempContainer.querySelectorAll('p');
            paragraphs.forEach((p) => {
                const el = p as HTMLElement;
                el.style.color = '#333';
                el.style.marginBottom = '1em';
            });

            // 代码块样式
            const codeBlocks = tempContainer.querySelectorAll('pre, code');
            codeBlocks.forEach((code) => {
                const el = code as HTMLElement;
                el.style.background = '#f5f5f5';
                el.style.border = '1px solid #ddd';
                el.style.borderRadius = '4px';
                el.style.padding = '0.5em';
                el.style.fontFamily = "'Courier New', monospace";
                el.style.fontSize = '12px';
                el.style.color = '#333';
            });

            // 图片样式
            const images = tempContainer.querySelectorAll('img');
            images.forEach((img) => {
                const el = img as HTMLElement;
                el.style.maxWidth = '100%';
                el.style.height = 'auto';
                el.style.borderRadius = '4px';
                el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            });

            document.body.appendChild(tempContainer);

            const filename = `${title || '笔记'}.pdf`;

            const opt = {
                margin: [15, 15, 15, 15] as [number, number, number, number],
                filename,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait' as const
                },
                pagebreak: { mode: 'avoid-all' },
            };

            await html2pdf().set(opt).from(tempContainer).save();

            // 清理临时容器
            document.body.removeChild(tempContainer);
        } catch (error) {
            console.error('PDF 导出失败:', error);
            alert('PDF 导出失败，请重试');
        } finally {
            isExporting.current = false;
        }
    };

    // 导出为 Markdown 文件
    const exportToMd = () => {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || '笔记'}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // 导出为 HTML 文件
    const exportToHtml = () => {
        if (!previewRef.current) return;

        const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || '笔记'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.8;
            color: #1a1a1a;
            background: #fff;
        }
        h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
        h1 { font-size: 2em; border-bottom: 2px solid #333; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
        pre, code { background: #f5f5f5; border-radius: 4px; font-family: 'Fira Code', monospace; }
        code { padding: 0.2em 0.4em; font-size: 0.9em; }
        pre { padding: 1em; overflow-x: auto; }
        pre code { padding: 0; background: none; }
        blockquote { border-left: 4px solid #ddd; margin: 1em 0; padding-left: 1em; color: #666; }
        img { max-width: 100%; border-radius: 8px; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
        th { background: #f5f5f5; }
        a { color: #0066cc; }
    </style>
</head>
<body>
${previewRef.current.innerHTML}
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || '笔记'}.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="relative group">
            <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg
                   bg-[var(--accent)] text-white
                   hover:opacity-90 transition-all duration-200
                   shadow-lg shadow-[var(--accent)]/20"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium">导出</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* 下拉菜单 */}
            <div className="absolute right-0 top-full mt-2 py-2 w-40
                      bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-200 z-50">
                <button
                    onClick={exportToPdf}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left
                     text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]
                     transition-colors duration-200"
                >
                    <span>📄</span>
                    <span>导出 PDF</span>
                </button>
                <button
                    onClick={exportToMd}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left
                     text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]
                     transition-colors duration-200"
                >
                    <span>📝</span>
                    <span>导出 Markdown</span>
                </button>
                <button
                    onClick={exportToHtml}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left
                     text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]
                     transition-colors duration-200"
                >
                    <span>🌐</span>
                    <span>导出 HTML</span>
                </button>
            </div>
        </div>
    );
}

