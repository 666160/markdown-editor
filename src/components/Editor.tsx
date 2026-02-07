import { useMemo, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import type { CSSProperties } from 'react';
import { EditorToolbar, useEditorShortcuts } from './EditorToolbar';
import { handleSmartPaste } from './SmartPaste';

export interface EditorProps {
    title: string;
    content: string;
    onTitleChange: (title: string) => void;
    onContentChange: (content: string) => void;
    onScroll?: (e: React.UIEvent<HTMLTextAreaElement>) => void;
    fontSize?: number;
    lineHeight?: number;
    wordWrap?: boolean;
    className?: string;
    style?: CSSProperties;
}

// 图片占位符正则
const IMAGE_REGEX = /!\[([^\]]*)\]\(data:image\/[^;]+;base64,[^)]+\)/g;
const IMAGE_PLACEHOLDER_PREFIX = '![📷 ';
const IMAGE_PLACEHOLDER_SUFFIX = '](IMAGE_DATA)';

// 定义编辑器对外暴露的接口
export interface EditorHandle {
    element: HTMLTextAreaElement | null;
    insertText: (text: string) => void;
    getSelectedText: () => string;
}

// Markdown 编辑器组件
export const Editor = forwardRef<EditorHandle, EditorProps>(({
    title,
    content,
    onTitleChange,
    onContentChange,
    onScroll,
    fontSize = 16,
    lineHeight = 1.6,
    wordWrap = true,
    className = '',
    style = {}
}, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 将 Base64 图片转换为简短的占位符显示
    const displayContent = useMemo(() => {
        return content.replace(IMAGE_REGEX, (_match, alt) => {
            const name = alt || '图片';
            return `${IMAGE_PLACEHOLDER_PREFIX}${name}${IMAGE_PLACEHOLDER_SUFFIX}`;
        });
    }, [content]);

    // 统计隐藏的图片数量
    const imageCount = useMemo(() => {
        const matches = content.match(IMAGE_REGEX);
        return matches ? matches.length : 0;
    }, [content]);

    // 处理内容变化，将占位符转换回原始 Base64
    const handleContentChange = useCallback((newDisplayContent: string) => {
        // 从原始内容中提取所有图片
        const originalImages: string[] = [];
        content.replace(IMAGE_REGEX, (match) => {
            originalImages.push(match);
            return '';
        });

        // 替换回原始图片
        let imageIndex = 0;
        const restoredContent = newDisplayContent.replace(
            /!\[📷 [^\]]*\]\(IMAGE_DATA\)/g,
            () => {
                if (imageIndex < originalImages.length) {
                    return originalImages[imageIndex++];
                }
                return '';
            }
        );

        onContentChange(restoredContent);
    }, [content, onContentChange]);

    // 插入文本到光标位置
    const handleInsert = useCallback((before: string, after: string = '', placeholder: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = displayContent.substring(start, end);
        const textToInsert = selectedText || placeholder;

        const newContent =
            displayContent.substring(0, start) +
            before +
            textToInsert +
            after +
            displayContent.substring(end);

        handleContentChange(newContent);

        // 恢复焦点并选中插入的文本
        setTimeout(() => {
            textarea.focus();
            const newStart = start + before.length;
            const newEnd = newStart + textToInsert.length;
            textarea.setSelectionRange(newStart, newEnd);
        }, 0);
    }, [displayContent, handleContentChange]);

    // 暴露 ref 方法
    useImperativeHandle(ref, () => ({
        element: textareaRef.current,
        insertText: (text: string) => handleInsert(text),
        getSelectedText: () => {
            const textarea = textareaRef.current;
            if (!textarea) return '';
            return displayContent.substring(textarea.selectionStart, textarea.selectionEnd);
        }
    }));

    // 注册快捷键
    useEditorShortcuts(textareaRef, handleInsert);

    // 处理粘贴
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const handled = handleSmartPaste(e.nativeEvent, (text) => {
            handleInsert(text);
        });

        if (handled) {
            e.preventDefault();
        }
    }, [handleInsert]);

    const editorStyle: CSSProperties = {
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight,
        whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
        fontFamily: 'var(--font-mono)',
        ...style
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* 标题输入 */}
            <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="输入笔记标题..."
                className="w-full px-4 py-3 bg-transparent border-b border-[var(--border)]
                   text-xl font-semibold text-[var(--text-primary)] placeholder-[var(--text-secondary)]
                   focus:outline-none focus:border-[var(--accent)]
                   transition-colors duration-200"
            />

            {/* 图片提示 */}
            {imageCount > 0 && (
                <div className="px-4 py-2 bg-[var(--bg-tertiary)] text-xs text-[var(--text-secondary)]
                       flex items-center gap-2 border-b border-[var(--border)]">
                    <span>📷</span>
                    <span>包含 {imageCount} 张图片（Base64 内容已隐藏，在预览区查看）</span>
                </div>
            )}

            {/* 工具栏 */}
            <EditorToolbar textareaRef={textareaRef} onInsert={handleInsert} />

            {/* 内容编辑区 */}
            <textarea
                ref={textareaRef}
                value={displayContent}
                onChange={(e) => handleContentChange(e.target.value)}
                onScroll={onScroll}
                onPaste={handlePaste}
                placeholder="开始编写 Markdown 内容...

支持的语法：
# 标题
**加粗** 和 *斜体*
- 列表项
> 引用
`行内代码` 和代码块
[链接](url)
![图片](url)

💡 快捷键：Ctrl+B 加粗 | Ctrl+I 斜体 | Ctrl+K 链接"
                className="flex-1 w-full p-4 bg-transparent resize-none
                   text-[var(--text-primary)] placeholder-[var(--text-secondary)]
                   focus:outline-none
                   overflow-auto"
                style={editorStyle}
                spellCheck={false}
            />
        </div>
    );
});

Editor.displayName = 'Editor';
