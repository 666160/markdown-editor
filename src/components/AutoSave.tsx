import { useState, useEffect, useCallback, useRef } from 'react';

interface AutoSaveState {
    lastSaved: number | null;
    isSaving: boolean;
    hasChanges: boolean;
}

// 自动保存 Hook
export function useAutoSave(
    content: string,
    onSave: () => void,
    delay: number = 2000
) {
    const [state, setState] = useState<AutoSaveState>({
        lastSaved: null,
        isSaving: false,
        hasChanges: false,
    });

    const timeoutRef = useRef<number | null>(null);
    const contentRef = useRef(content);

    // 检测内容变化
    useEffect(() => {
        if (content !== contentRef.current) {
            contentRef.current = content;
            setState(prev => ({ ...prev, hasChanges: true }));

            // 清除之前的定时器
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // 设置新的自动保存定时器
            timeoutRef.current = window.setTimeout(() => {
                setState(prev => ({ ...prev, isSaving: true }));

                try {
                    onSave();
                    setState({
                        lastSaved: Date.now(),
                        isSaving: false,
                        hasChanges: false,
                    });
                } catch (error) {
                    setState(prev => ({ ...prev, isSaving: false }));
                    console.error('自动保存失败:', error);
                }
            }, delay);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [content, onSave, delay]);

    // 手动保存
    const saveNow = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setState(prev => ({ ...prev, isSaving: true }));

        try {
            onSave();
            setState({
                lastSaved: Date.now(),
                isSaving: false,
                hasChanges: false,
            });
        } catch (error) {
            setState(prev => ({ ...prev, isSaving: false }));
        }
    }, [onSave]);

    return { ...state, saveNow };
}

interface AutoSaveIndicatorProps {
    lastSaved: number | null;
    isSaving: boolean;
    hasChanges: boolean;
}

// 自动保存状态指示器
export function AutoSaveIndicator({ lastSaved, isSaving, hasChanges }: AutoSaveIndicatorProps) {
    // 格式化保存时间
    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
        return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    };

    if (isSaving) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span>保存中...</span>
            </div>
        );
    }

    if (hasChanges) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-yellow-500">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>未保存</span>
            </div>
        );
    }

    if (lastSaved) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-green-500">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>已保存 · {formatTime(lastSaved)}</span>
            </div>
        );
    }

    return null;
}

// 离开页面提醒
export function useBeforeUnload(hasChanges: boolean) {
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = '您有未保存的更改，确定要离开吗？';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges]);
}
