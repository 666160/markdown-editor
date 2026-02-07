import { useMemo } from 'react';
import type { Note } from '../types/index';

// Wiki 链接正则表达式：匹配 [[笔记名]] 或 [[笔记名|显示文本]]
const WIKI_LINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

// 解析双向链接
export interface WikiLink {
    fullMatch: string;
    noteName: string;
    displayText: string;
}

// 从内容中提取所有 Wiki 链接
export function extractWikiLinks(content: string): WikiLink[] {
    const links: WikiLink[] = [];
    let match;

    while ((match = WIKI_LINK_REGEX.exec(content)) !== null) {
        links.push({
            fullMatch: match[0],
            noteName: match[1].trim(),
            displayText: match[2]?.trim() || match[1].trim(),
        });
    }

    return links;
}

// 获取反向链接（哪些笔记链接到了当前笔记）
export function getBacklinks(notes: Note[], currentNote: Note | null): Note[] {
    if (!currentNote) return [];

    return notes.filter(note => {
        if (note.id === currentNote.id) return false;
        const links = extractWikiLinks(note.content);
        return links.some(link =>
            link.noteName.toLowerCase() === currentNote.title.toLowerCase()
        );
    });
}

// 根据名称查找笔记
export function findNoteByName(notes: Note[], name: string): Note | undefined {
    const normalizedName = name.toLowerCase().trim();
    return notes.find(note =>
        note.title.toLowerCase().trim() === normalizedName
    );
}

interface BacklinksPanelProps {
    notes: Note[];
    currentNote: Note | null;
    onNoteClick: (noteId: string) => void;
}

// 反向链接面板组件
export function BacklinksPanel({ notes, currentNote, onNoteClick }: BacklinksPanelProps) {
    const backlinks = useMemo(() => getBacklinks(notes, currentNote), [notes, currentNote]);

    // 当前笔记的外链
    const outgoingLinks = useMemo(() => {
        if (!currentNote) return [];
        const wikiLinks = extractWikiLinks(currentNote.content);
        return wikiLinks.map(link => ({
            ...link,
            targetNote: findNoteByName(notes, link.noteName),
        }));
    }, [currentNote, notes]);

    if (!currentNote) return null;

    return (
        <div className="space-y-4">
            {/* 反向链接 */}
            <div>
                <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    反向链接 ({backlinks.length})
                </h4>
                {backlinks.length === 0 ? (
                    <p className="text-xs text-[var(--text-secondary)] opacity-60">暂无笔记链接到此</p>
                ) : (
                    <div className="space-y-1">
                        {backlinks.map(note => (
                            <button
                                key={note.id}
                                onClick={() => onNoteClick(note.id)}
                                className="w-full text-left px-2 py-1.5 rounded text-xs
                          bg-[var(--bg-tertiary)] text-[var(--text-primary)]
                          hover:bg-[var(--accent)]/20 transition-colors truncate"
                            >
                                {note.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 外向链接 */}
            <div>
                <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    外向链接 ({outgoingLinks.length})
                </h4>
                {outgoingLinks.length === 0 ? (
                    <p className="text-xs text-[var(--text-secondary)] opacity-60">
                        使用 [[笔记名]] 创建链接
                    </p>
                ) : (
                    <div className="space-y-1">
                        {outgoingLinks.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => link.targetNote && onNoteClick(link.targetNote.id)}
                                disabled={!link.targetNote}
                                className={`w-full text-left px-2 py-1.5 rounded text-xs truncate
                          ${link.targetNote
                                        ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--accent)]/20'
                                        : 'bg-[var(--danger)]/10 text-[var(--danger)] cursor-not-allowed'
                                    } transition-colors`}
                                title={link.targetNote ? undefined : '笔记不存在，点击可创建'}
                            >
                                {link.displayText}
                                {!link.targetNote && ' (不存在)'}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// 将 Wiki 链接转换为可点击的链接
export function renderWikiLinks(
    content: string,
    notes: Note[]
): string {
    return content.replace(WIKI_LINK_REGEX, (_match, noteName, displayText) => {
        const note = findNoteByName(notes, noteName);
        const text = displayText || noteName;
        if (note) {
            return `[${text}](#note:${note.id})`;
        }
        return `~~${text}~~`; // 不存在的笔记显示删除线
    });
}
