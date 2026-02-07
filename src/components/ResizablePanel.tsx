import { useState, useCallback, useRef, useEffect } from 'react';

interface ResizablePanelProps {
    leftPanel: React.ReactNode;
    rightPanel: React.ReactNode;
    defaultRatio?: number; // 默认左侧面板占比 (0-1)
    minRatio?: number;     // 最小占比
    maxRatio?: number;     // 最大占比
}

// 可调整大小的双栏面板
export function ResizablePanel({
    leftPanel,
    rightPanel,
    defaultRatio = 0.5,
    minRatio = 0.25,
    maxRatio = 0.75,
}: ResizablePanelProps) {
    const [ratio, setRatio] = useState(defaultRatio);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 处理拖拽
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const newRatio = (e.clientX - rect.left) / rect.width;

            // 限制在最小和最大之间
            const clampedRatio = Math.max(minRatio, Math.min(maxRatio, newRatio));
            setRatio(clampedRatio);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, minRatio, maxRatio]);

    return (
        <div ref={containerRef} className="flex h-full w-full relative">
            {/* 左侧面板 */}
            <div
                className="h-full overflow-hidden"
                style={{ width: `${ratio * 100}%` }}
            >
                {leftPanel}
            </div>

            {/* 拖拽手柄 */}
            <div
                onMouseDown={handleMouseDown}
                className={`w-1 h-full cursor-col-resize flex-shrink-0 relative group
                   ${isDragging ? 'bg-[var(--accent)]' : 'bg-[var(--border)] hover:bg-[var(--accent)]'}
                   transition-colors duration-150`}
            >
                {/* 拖拽指示器 */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-4 h-8 flex items-center justify-center
                        bg-[var(--bg-tertiary)] border border-[var(--border)] rounded
                        opacity-0 group-hover:opacity-100 transition-opacity
                        ${isDragging ? 'opacity-100 bg-[var(--accent)]' : ''}`}>
                    <div className="flex flex-col gap-0.5">
                        <span className="w-0.5 h-1.5 bg-[var(--text-secondary)] rounded-full" />
                        <span className="w-0.5 h-1.5 bg-[var(--text-secondary)] rounded-full" />
                        <span className="w-0.5 h-1.5 bg-[var(--text-secondary)] rounded-full" />
                    </div>
                </div>
            </div>

            {/* 右侧面板 */}
            <div
                className="h-full overflow-hidden flex-1"
                style={{ width: `${(1 - ratio) * 100}%` }}
            >
                {rightPanel}
            </div>

            {/* 拖拽时的遮罩层，防止 iframe 等元素捕获事件 */}
            {isDragging && (
                <div className="fixed inset-0 z-50 cursor-col-resize" />
            )}
        </div>
    );
}
