import React, { useState, useCallback } from 'react';
import type { Note } from '../types/index';

interface DraggableNoteListProps {
    notes: Note[];
    selectedNoteId: string | null;
    onSelect: (noteId: string) => void;
    onReorder: (noteIds: string[]) => void;
}

// 可拖拽笔记列表
export function DraggableNoteList({ notes, selectedNoteId, onSelect, onReorder }: DraggableNoteListProps) {
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, noteId: string) => {
        setDraggedId(noteId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, noteId: string) => {
        e.preventDefault();
        if (noteId !== draggedId) {
            setDragOverId(noteId);
        }
    };

    const handleDragLeave = () => {
        setDragOverId(null);
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();

        if (!draggedId || draggedId === targetId) {
            setDraggedId(null);
            setDragOverId(null);
            return;
        }

        const newOrder = [...notes];
        const draggedIndex = newOrder.findIndex(n => n.id === draggedId);
        const targetIndex = newOrder.findIndex(n => n.id === targetId);

        const [removed] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, removed);

        onReorder(newOrder.map(n => n.id));
        setDraggedId(null);
        setDragOverId(null);
    };

    const handleDragEnd = () => {
        setDraggedId(null);
        setDragOverId(null);
    };

    return (
        <div className="space-y-1">
            {notes.map(note => (
                <div
                    key={note.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, note.id)}
                    onDragOver={(e) => handleDragOver(e, note.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, note.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onSelect(note.id)}
                    className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer
                     transition-all duration-200
                     ${selectedNoteId === note.id
                            ? 'bg-[var(--accent)]/20 border-l-2 border-[var(--accent)]'
                            : 'hover:bg-[var(--bg-tertiary)]'
                        }
                     ${draggedId === note.id ? 'opacity-50' : ''}
                     ${dragOverId === note.id ? 'border-t-2 border-[var(--accent)]' : ''}`}
                >
                    {/* 拖拽手柄 */}
                    <div className="opacity-0 group-hover:opacity-50 cursor-grab active:cursor-grabbing">
                        <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 8h16M4 16h16" />
                        </svg>
                    </div>

                    {/* 笔记信息 */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            {note.isPinned && <span className="text-xs">📌</span>}
                            <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">
                                {note.title}
                            </h3>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                            {note.content.slice(0, 50).replace(/[#*_`]/g, '')}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// 重排序 Hook
export function useNoteReorder(_notes: Note[], setNotes: React.Dispatch<React.SetStateAction<Note[]>>) {
    const reorderNotes = useCallback((newOrder: string[]) => {
        setNotes(prev => {
            const noteMap = new Map(prev.map(n => [n.id, n]));
            return newOrder.map(id => noteMap.get(id)!).filter(Boolean);
        });
    }, [setNotes]);

    return { reorderNotes };
}
