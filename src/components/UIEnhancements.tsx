import { useState, useEffect, useRef } from 'react';

interface SaveStatusProps {
    lastSaved: number | null;
}

// 自动保存状态提示组件
export function SaveStatus({ lastSaved }: SaveStatusProps) {
    const [status, setStatus] = useState<'saved' | 'saving'>('saved');
    const prevSavedRef = useRef(lastSaved);

    useEffect(() => {
        if (lastSaved !== prevSavedRef.current) {
            setStatus('saving');
            const timer = setTimeout(() => {
                setStatus('saved');
                prevSavedRef.current = lastSaved;
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [lastSaved]);

    if (!lastSaved) return null;

    const timeAgo = getTimeAgo(lastSaved);

    return (
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            {status === 'saving' ? (
                <>
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span>保存中...</span>
                </>
            ) : (
                <>
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>已保存 {timeAgo}</span>
                </>
            )}
        </div>
    );
}

// 格式化时间差
function getTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 5000) return '刚刚';
    if (diff < 60000) return `${Math.floor(diff / 1000)}秒前`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    return `${Math.floor(diff / 3600000)}小时前`;
}

// 全屏模式按钮
interface FullscreenButtonProps {
    isFullscreen: boolean;
    onToggle: () => void;
}

export function FullscreenButton({ isFullscreen, onToggle }: FullscreenButtonProps) {
    return (
        <button
            onClick={onToggle}
            className={`p-2 rounded-lg transition-all duration-200
                 ${isFullscreen
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
            title={isFullscreen ? '退出全屏 (Esc)' : '全屏编辑'}
        >
            {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
            )}
        </button>
    );
}

// 快捷键帮助面板
interface ShortcutHelpProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ShortcutHelp({ isOpen, onClose }: ShortcutHelpProps) {
    if (!isOpen) return null;

    const shortcuts = [
        { key: 'Ctrl + B', desc: '加粗' },
        { key: 'Ctrl + I', desc: '斜体' },
        { key: 'Ctrl + D', desc: '删除线' },
        { key: 'Ctrl + K', desc: '插入链接' },
        { key: 'Ctrl + `', desc: '行内代码' },
        { key: 'Esc', desc: '退出全屏' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 w-80 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">快捷键</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-2">
                    {shortcuts.map(s => (
                        <div key={s.key} className="flex justify-between items-center py-1.5">
                            <span className="text-[var(--text-secondary)] text-sm">{s.desc}</span>
                            <kbd className="px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border)] 
                            rounded text-xs font-mono text-[var(--text-primary)]">
                                {s.key}
                            </kbd>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
