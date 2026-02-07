import { useMemo } from 'react';

interface WordFrequency {
    word: string;
    count: number;
}

// 提取词频
export function extractWordFrequency(content: string, topN: number = 20): WordFrequency[] {
    // 移除 Markdown 语法
    const cleanText = content
        .replace(/```[\s\S]*?```/g, '') // 代码块
        .replace(/`[^`]+`/g, '') // 行内代码
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 图片
        .replace(/^#+\s+/gm, '') // 标题
        .replace(/[*_~`#>|-]/g, '') // Markdown 符号
        .replace(/\d+/g, ' '); // 数字

    // 分词（简单的中英文分词）
    const words: string[] = [];

    // 英文单词
    const englishWords = cleanText.match(/[a-zA-Z]{2,}/g) || [];
    words.push(...englishWords.map(w => w.toLowerCase()));

    // 中文词语（2-4字）
    const chineseText = cleanText.replace(/[a-zA-Z\s\d\n]/g, '');
    for (let i = 0; i < chineseText.length; i++) {
        if (i + 2 <= chineseText.length) {
            words.push(chineseText.slice(i, i + 2));
        }
    }

    // 统计词频
    const frequency: Record<string, number> = {};
    const stopWords = new Set([
        // 英文停用词
        'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with',
        'to', 'for', 'of', 'as', 'by', 'that', 'this', 'it', 'from', 'be', 'are', 'was',
        'were', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
        'would', 'could', 'should', 'may', 'might', 'must', 'can', 'if', 'then',
        // 中文停用词
        '的', '是', '在', '了', '和', '与', '或', '但', '也', '就', '都', '而', '及',
        '着', '把', '被', '比', '等', '给', '让', '向', '往', '从', '自', '对', '为'
    ]);

    words.forEach(word => {
        if (word.length >= 2 && !stopWords.has(word)) {
            frequency[word] = (frequency[word] || 0) + 1;
        }
    });

    // 排序并返回前 N 个
    return Object.entries(frequency)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, topN);
}

interface WordFrequencyPanelProps {
    content: string;
    onClose: () => void;
}

// 词频统计面板
export function WordFrequencyPanel({ content, onClose }: WordFrequencyPanelProps) {
    const frequencies = useMemo(() => extractWordFrequency(content, 30), [content]);
    const maxCount = frequencies[0]?.count || 1;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[400px] max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">📊 词频统计</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 max-h-96 overflow-y-auto">
                    {frequencies.length === 0 ? (
                        <div className="text-center text-[var(--text-secondary)] py-8">
                            暂无足够内容进行分析
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {frequencies.map((item, index) => (
                                <div key={item.word} className="flex items-center gap-3">
                                    <span className="w-6 text-xs text-[var(--text-secondary)] text-right">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-[var(--text-primary)]">{item.word}</span>
                                            <span className="text-xs text-[var(--text-secondary)]">{item.count}次</span>
                                        </div>
                                        <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[var(--accent)] rounded-full transition-all"
                                                style={{ width: `${(item.count / maxCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] text-center">
                    共分析 {frequencies.reduce((sum, f) => sum + f.count, 0)} 个词语
                </div>
            </div>
        </div>
    );
}
