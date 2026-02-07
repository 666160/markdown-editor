import { useState } from 'react';
import type { Note } from '../types/index';

interface DiffViewerProps {
    note1: Note | null;
    note2: Note | null;
    notes: Note[];
    onSelectNote: (position: 'left' | 'right', noteId: string) => void;
    onClose: () => void;
}

// 分屏对比组件
export function DiffViewer({ note1, note2, notes, onSelectNote, onClose }: DiffViewerProps) {
    // 计算差异（简单的行级对比）
    const computeDiff = (content1: string, content2: string) => {
        const lines1 = content1.split('\n');
        const lines2 = content2.split('\n');
        const maxLines = Math.max(lines1.length, lines2.length);

        const result: {
            left: { text: string; status: 'same' | 'different' | 'deleted' }[];
            right: { text: string; status: 'same' | 'different' | 'added' }[]
        } = {
            left: [],
            right: [],
        };

        for (let i = 0; i < maxLines; i++) {
            const line1 = lines1[i] ?? '';
            const line2 = lines2[i] ?? '';

            if (line1 === line2) {
                result.left.push({ text: line1, status: 'same' });
                result.right.push({ text: line2, status: 'same' });
            } else if (i >= lines1.length) {
                result.left.push({ text: '', status: 'deleted' });
                result.right.push({ text: line2, status: 'added' });
            } else if (i >= lines2.length) {
                result.left.push({ text: line1, status: 'deleted' });
                result.right.push({ text: '', status: 'same' });
            } else {
                result.left.push({ text: line1, status: 'different' });
                result.right.push({ text: line2, status: 'different' });
            }
        }

        return result;
    };

    const diff = note1 && note2 ? computeDiff(note1.content, note2.content) : null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[90vw] h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* 头部 */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">📋 分屏对比</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 选择器 */}
                <div className="grid grid-cols-2 gap-4 p-4 border-b border-[var(--border)] bg-[var(--bg-tertiary)]/30">
                    <select
                        value={note1?.id || ''}
                        onChange={(e) => onSelectNote('left', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]
                      text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    >
                        <option value="">选择左侧笔记...</option>
                        {notes.map(note => (
                            <option key={note.id} value={note.id}>{note.title}</option>
                        ))}
                    </select>
                    <select
                        value={note2?.id || ''}
                        onChange={(e) => onSelectNote('right', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]
                      text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    >
                        <option value="">选择右侧笔记...</option>
                        {notes.map(note => (
                            <option key={note.id} value={note.id}>{note.title}</option>
                        ))}
                    </select>
                </div>

                {/* 对比区域 */}
                <div className="grid grid-cols-2 h-[calc(100%-140px)]">
                    {/* 左侧 */}
                    <div className="border-r border-[var(--border)] overflow-auto p-4 font-mono text-sm">
                        {diff ? (
                            diff.left.map((line, index) => (
                                <div
                                    key={index}
                                    className={`px-2 py-0.5 ${line.status === 'different' ? 'bg-yellow-500/20' :
                                        line.status === 'deleted' ? 'bg-red-500/20' : ''
                                        }`}
                                >
                                    <span className="inline-block w-8 text-[var(--text-secondary)] text-xs opacity-50">
                                        {index + 1}
                                    </span>
                                    <span className="text-[var(--text-primary)]">{line.text || ' '}</span>
                                </div>
                            ))
                        ) : note1 ? (
                            <pre className="whitespace-pre-wrap text-[var(--text-primary)]">{note1.content}</pre>
                        ) : (
                            <div className="text-center text-[var(--text-secondary)] py-8">请选择左侧笔记</div>
                        )}
                    </div>

                    {/* 右侧 */}
                    <div className="overflow-auto p-4 font-mono text-sm">
                        {diff ? (
                            diff.right.map((line, index) => (
                                <div
                                    key={index}
                                    className={`px-2 py-0.5 ${line.status === 'different' ? 'bg-yellow-500/20' :
                                        line.status === 'added' ? 'bg-green-500/20' : ''
                                        }`}
                                >
                                    <span className="inline-block w-8 text-[var(--text-secondary)] text-xs opacity-50">
                                        {index + 1}
                                    </span>
                                    <span className="text-[var(--text-primary)]">{line.text || ' '}</span>
                                </div>
                            ))
                        ) : note2 ? (
                            <pre className="whitespace-pre-wrap text-[var(--text-primary)]">{note2.content}</pre>
                        ) : (
                            <div className="text-center text-[var(--text-secondary)] py-8">请选择右侧笔记</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// 分屏对比 Hook
export function useDiffViewer(notes: Note[]) {
    const [showDiff, setShowDiff] = useState(false);
    const [leftNoteId, setLeftNoteId] = useState<string | null>(null);
    const [rightNoteId, setRightNoteId] = useState<string | null>(null);

    const leftNote = notes.find(n => n.id === leftNoteId) || null;
    const rightNote = notes.find(n => n.id === rightNoteId) || null;

    const handleSelectNote = (position: 'left' | 'right', noteId: string) => {
        if (position === 'left') {
            setLeftNoteId(noteId || null);
        } else {
            setRightNoteId(noteId || null);
        }
    };

    return {
        showDiff,
        setShowDiff,
        leftNote,
        rightNote,
        handleSelectNote,
    };
}
