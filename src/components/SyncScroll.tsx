import { useRef, useEffect, useCallback } from 'react';
import type { EditorHandle } from './Editor';

// 同步滚动 Hook
export function useSyncScroll(
    editorRef: React.RefObject<EditorHandle | null>,
    previewRef: React.RefObject<HTMLDivElement | null>,
    isEnabled: boolean
) {
    const isScrolling = useRef(false);
    const scrollTimeout = useRef<number | null>(null);

    // 获取编辑器 DOM 元素
    const getEditorElement = useCallback(() => {
        return editorRef.current?.element || null;
    }, [editorRef]);

    // 编辑器滚动时同步预览
    const handleEditorScroll = useCallback(() => {
        if (!isEnabled || isScrolling.current) return;
        const editor = getEditorElement();
        if (!editor || !previewRef.current) return;

        isScrolling.current = true;

        const preview = previewRef.current;

        // 计算滚动百分比
        const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);

        // 应用到预览
        preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);

        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = window.setTimeout(() => {
            isScrolling.current = false;
        }, 50);
    }, [isEnabled, getEditorElement, previewRef]);

    // 预览滚动时同步编辑器
    const handlePreviewScroll = useCallback(() => {
        if (!isEnabled || isScrolling.current) return;
        const editor = getEditorElement();
        if (!editor || !previewRef.current) return;

        isScrolling.current = true;

        const preview = previewRef.current;

        // 计算滚动百分比
        const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);

        // 应用到编辑器
        editor.scrollTop = scrollPercentage * (editor.scrollHeight - editor.clientHeight);

        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = window.setTimeout(() => {
            isScrolling.current = false;
        }, 50);
    }, [isEnabled, getEditorElement, previewRef]);

    // 绑定事件
    useEffect(() => {
        const editor = getEditorElement();
        const preview = previewRef.current;

        if (isEnabled && editor && preview) {
            editor.addEventListener('scroll', handleEditorScroll);
            preview.addEventListener('scroll', handlePreviewScroll);

            return () => {
                editor.removeEventListener('scroll', handleEditorScroll);
                preview.removeEventListener('scroll', handlePreviewScroll);
            };
        }
    }, [isEnabled, handleEditorScroll, handlePreviewScroll, editorRef, previewRef]);

    // return { editorRef, previewRef }; // 不再需要返回 refs，因为是传入的
    return {};
}

// 同步滚动开关组件
interface SyncScrollToggleProps {
    isEnabled: boolean;
    onToggle: () => void;
}

export function SyncScrollToggle({ isEnabled, onToggle }: SyncScrollToggleProps) {
    return (
        <button
            onClick={onToggle}
            className={`p-2 rounded-lg transition-all duration-200
                 ${isEnabled
                    ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
            title={isEnabled ? '关闭同步滚动' : '开启同步滚动'}
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
        </button>
    );
}
