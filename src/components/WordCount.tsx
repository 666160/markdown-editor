import { useMemo } from 'react';

interface WordCountProps {
    content: string;
}

// 计算统计数据
function calculateStats(content: string) {
    // 移除 Markdown 语法来计算纯文本
    const plainText = content
        .replace(/```[\s\S]*?```/g, '') // 移除代码块
        .replace(/!\[.*?\]\(.*?\)/g, '[图片]') // 替换图片
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接格式
        .replace(/^#+\s+/gm, '') // 移除标题标记
        .replace(/[*_`~#]/g, '') // 移除格式符号
        .replace(/\|.*\|/g, '') // 移除表格
        .replace(/-{3,}/g, '') // 移除分割线
        .trim();

    // 字符数（不含空格）
    const charCount = plainText.replace(/\s/g, '').length;

    // 字符数（含空格）
    const charWithSpaceCount = plainText.length;

    // 中文字数
    const chineseChars = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length;

    // 英文单词数
    const englishWords = (plainText.match(/[a-zA-Z]+/g) || []).length;

    // 总词数（中文按字计算，英文按词计算）
    const wordCount = chineseChars + englishWords;

    // 行数
    const lineCount = content.split('\n').length;

    // 预计阅读时间（假设每分钟阅读 300 个中文字或 200 个英文单词）
    const readingTime = Math.max(1, Math.ceil(wordCount / 300));

    return {
        charCount,
        charWithSpaceCount,
        chineseChars,
        englishWords,
        wordCount,
        lineCount,
        readingTime,
    };
}

// 字数统计组件
export function WordCount({ content }: WordCountProps) {
    const stats = useMemo(() => calculateStats(content), [content]);

    return (
        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
            <span title="字符数（不含空格）">
                <span className="font-medium text-[var(--text-primary)]">{stats.charCount}</span> 字符
            </span>
            <span className="w-px h-3 bg-[var(--border)]" />
            <span title={`中文 ${stats.chineseChars} 字 + 英文 ${stats.englishWords} 词`}>
                <span className="font-medium text-[var(--text-primary)]">{stats.wordCount}</span> 词
            </span>
            <span className="w-px h-3 bg-[var(--border)]" />
            <span title="行数">
                <span className="font-medium text-[var(--text-primary)]">{stats.lineCount}</span> 行
            </span>
            <span className="w-px h-3 bg-[var(--border)]" />
            <span title="预计阅读时间">
                ≈ <span className="font-medium text-[var(--text-primary)]">{stats.readingTime}</span> 分钟阅读
            </span>
        </div>
    );
}
