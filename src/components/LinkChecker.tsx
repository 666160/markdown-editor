import { useMemo } from 'react';
import type { Note } from '../types/index';

interface LinkInfo {
    url: string;
    text: string;
    noteId: string;
    noteTitle: string;
    line: number;
    status: 'valid' | 'broken' | 'internal' | 'unknown';
}

// 提取笔记中的所有链接
function extractLinks(notes: Note[]): LinkInfo[] {
    const links: LinkInfo[] = [];
    const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    const noteTitles = new Set(notes.map(n => n.title.toLowerCase()));

    notes.forEach(note => {
        const lines = note.content.split('\n');

        lines.forEach((line, lineIndex) => {
            // Markdown 链接
            let match;
            while ((match = linkRegex.exec(line)) !== null) {
                const url = match[2];
                let status: LinkInfo['status'] = 'unknown';

                if (url.startsWith('http://') || url.startsWith('https://')) {
                    status = 'unknown'; // 需要检查
                } else if (url.startsWith('#')) {
                    status = 'internal';
                } else if (url.startsWith('./') || url.startsWith('../')) {
                    status = 'unknown';
                }

                links.push({
                    url,
                    text: match[1],
                    noteId: note.id,
                    noteTitle: note.title,
                    line: lineIndex + 1,
                    status,
                });
            }

            // Wiki 链接
            while ((match = wikiLinkRegex.exec(line)) !== null) {
                const target = match[1].toLowerCase();
                const exists = noteTitles.has(target);

                links.push({
                    url: `[[${match[1]}]]`,
                    text: match[1],
                    noteId: note.id,
                    noteTitle: note.title,
                    line: lineIndex + 1,
                    status: exists ? 'valid' : 'broken',
                });
            }
        });
    });

    return links;
}

interface LinkCheckerProps {
    notes: Note[];
    onSelectNote: (noteId: string) => void;
    onClose: () => void;
}

// 链接检查器
export function LinkChecker({ notes, onSelectNote, onClose }: LinkCheckerProps) {
    const links = useMemo(() => extractLinks(notes), [notes]);

    const brokenLinks = links.filter(l => l.status === 'broken');
    const externalLinks = links.filter(l => l.url.startsWith('http'));
    const wikiLinks = links.filter(l => l.url.startsWith('[['));

    const stats = {
        total: links.length,
        broken: brokenLinks.length,
        external: externalLinks.length,
        wiki: wikiLinks.length,
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">🔗 链接检查</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 统计 */}
                <div className="grid grid-cols-4 gap-3 p-4 border-b border-[var(--border)]">
                    <div className="text-center p-2 rounded-lg bg-[var(--bg-tertiary)]">
                        <div className="text-lg font-bold text-[var(--text-primary)]">{stats.total}</div>
                        <div className="text-xs text-[var(--text-secondary)]">总链接</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-red-500/10">
                        <div className="text-lg font-bold text-red-500">{stats.broken}</div>
                        <div className="text-xs text-[var(--text-secondary)]">失效</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-blue-500/10">
                        <div className="text-lg font-bold text-blue-500">{stats.external}</div>
                        <div className="text-xs text-[var(--text-secondary)]">外部</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-green-500/10">
                        <div className="text-lg font-bold text-green-500">{stats.wiki}</div>
                        <div className="text-xs text-[var(--text-secondary)]">Wiki</div>
                    </div>
                </div>

                {/* 问题链接 */}
                <div className="max-h-80 overflow-y-auto">
                    {brokenLinks.length > 0 ? (
                        <div className="p-4">
                            <h4 className="text-sm font-medium text-red-500 mb-3">❌ 失效链接 ({brokenLinks.length})</h4>
                            <div className="space-y-2">
                                {brokenLinks.map((link, index) => (
                                    <div
                                        key={index}
                                        className="p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="text-sm text-[var(--text-primary)]">
                                                    {link.url}
                                                </div>
                                                <div className="text-xs text-[var(--text-secondary)] mt-1">
                                                    在 <button
                                                        onClick={() => {
                                                            onSelectNote(link.noteId);
                                                            onClose();
                                                        }}
                                                        className="text-[var(--accent)] hover:underline"
                                                    >
                                                        {link.noteTitle}
                                                    </button> 第 {link.line} 行
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-[var(--text-secondary)]">
                            <div className="text-3xl mb-2">✅</div>
                            <p>所有链接正常</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
