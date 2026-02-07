import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// 初始化 Mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
});

interface MermaidDiagramProps {
    chart: string;
}

// Mermaid 图表渲染组件
export function MermaidDiagram({ chart }: MermaidDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const renderChart = async () => {
            if (!chart.trim()) return;

            try {
                // 生成唯一 ID
                const id = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                const { svg } = await mermaid.render(id, chart);
                setSvg(svg);
                setError(null);
            } catch (err) {
                console.error('Mermaid 渲染错误:', err);
                setError('图表语法错误');
                setSvg('');
            }
        };

        renderChart();
    }, [chart]);

    if (error) {
        return (
            <div className="my-4 p-4 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-lg">
                <p className="text-[var(--danger)] text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mermaid 图表语法错误
                </p>
                <pre className="mt-2 text-xs text-[var(--text-secondary)] overflow-auto">
                    {chart}
                </pre>
            </div>
        );
    }

    if (!svg) {
        return (
            <div className="my-4 p-4 bg-[var(--bg-tertiary)] rounded-lg animate-pulse">
                <div className="h-32 flex items-center justify-center text-[var(--text-secondary)]">
                    加载图表中...
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="my-4 p-4 bg-[var(--bg-tertiary)] rounded-lg overflow-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
