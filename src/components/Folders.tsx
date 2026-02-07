import { useState, useCallback } from 'react';
import type { Note } from '../types/index';

const FOLDERS_STORAGE_KEY = 'note-folders';

interface Folder {
    id: string;
    name: string;
    color: string;
    noteIds: string[];
}

// 读取文件夹
function loadFolders(): Folder[] {
    try {
        const saved = localStorage.getItem(FOLDERS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch { }
    return [];
}

// 保存文件夹
function saveFolders(folders: Folder[]): void {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
}

// 文件夹颜色选项
const folderColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#1f2937',
];

// 文件夹 Hook
export function useFolders() {
    const [folders, setFolders] = useState<Folder[]>(loadFolders);

    // 创建文件夹
    const createFolder = useCallback((name: string, color: string = '#3b82f6') => {
        const newFolder: Folder = {
            id: `folder-${Date.now()}`,
            name,
            color,
            noteIds: [],
        };
        setFolders(prev => {
            const updated = [...prev, newFolder];
            saveFolders(updated);
            return updated;
        });
        return newFolder;
    }, []);

    // 删除文件夹
    const deleteFolder = useCallback((folderId: string) => {
        setFolders(prev => {
            const updated = prev.filter(f => f.id !== folderId);
            saveFolders(updated);
            return updated;
        });
    }, []);

    // 重命名文件夹
    const renameFolder = useCallback((folderId: string, name: string) => {
        setFolders(prev => {
            const updated = prev.map(f => f.id === folderId ? { ...f, name } : f);
            saveFolders(updated);
            return updated;
        });
    }, []);

    // 添加笔记到文件夹
    const addNoteToFolder = useCallback((folderId: string, noteId: string) => {
        setFolders(prev => {
            const updated = prev.map(f => {
                if (f.id === folderId && !f.noteIds.includes(noteId)) {
                    return { ...f, noteIds: [...f.noteIds, noteId] };
                }
                return f;
            });
            saveFolders(updated);
            return updated;
        });
    }, []);

    // 从文件夹移除笔记
    const removeNoteFromFolder = useCallback((folderId: string, noteId: string) => {
        setFolders(prev => {
            const updated = prev.map(f => {
                if (f.id === folderId) {
                    return { ...f, noteIds: f.noteIds.filter(id => id !== noteId) };
                }
                return f;
            });
            saveFolders(updated);
            return updated;
        });
    }, []);

    // 获取笔记所在的文件夹
    const getNoteFolder = useCallback((noteId: string): Folder | null => {
        return folders.find(f => f.noteIds.includes(noteId)) || null;
    }, [folders]);

    return {
        folders,
        createFolder,
        deleteFolder,
        renameFolder,
        addNoteToFolder,
        removeNoteFromFolder,
        getNoteFolder,
        folderColors,
    };
}

interface FolderListProps {
    folders: Folder[];
    selectedFolderId: string | null;
    onSelect: (folderId: string | null) => void;
    onCreate: (name: string, color: string) => void;
    onDelete: (folderId: string) => void;
    notes: Note[];
}

// 文件夹列表组件
export function FolderList({ folders, selectedFolderId, onSelect, onCreate, onDelete, notes }: FolderListProps) {
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(folderColors[0]);

    const handleCreate = () => {
        if (newName.trim()) {
            onCreate(newName.trim(), newColor);
            setNewName('');
            setShowCreate(false);
        }
    };

    return (
        <div className="p-2">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-[var(--text-secondary)]">📁 文件夹</h3>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            {/* 创建表单 */}
            {showCreate && (
                <div className="mb-3 p-2 rounded-lg bg-[var(--bg-tertiary)]">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="文件夹名称"
                        className="w-full px-2 py-1 mb-2 rounded text-sm bg-[var(--bg-secondary)] border border-[var(--border)]
                      text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <div className="flex gap-1 mb-2">
                        {folderColors.map(color => (
                            <button
                                key={color}
                                onClick={() => setNewColor(color)}
                                className={`w-5 h-5 rounded-full ${newColor === color ? 'ring-2 ring-offset-1 ring-white' : ''}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleCreate}
                        className="w-full py-1 rounded text-xs bg-[var(--accent)] text-white hover:opacity-90"
                    >
                        创建
                    </button>
                </div>
            )}

            {/* 全部笔记 */}
            <button
                onClick={() => onSelect(null)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left mb-1
                  ${selectedFolderId === null
                        ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
            >
                <span>📋</span>
                <span className="flex-1">全部笔记</span>
                <span className="text-xs opacity-60">{notes.length}</span>
            </button>

            {/* 文件夹列表 */}
            {folders.map(folder => (
                <div
                    key={folder.id}
                    className={`group flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer mb-1
                    ${selectedFolderId === folder.id
                            ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
                    onClick={() => onSelect(folder.id)}
                >
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: folder.color }} />
                    <span className="flex-1 truncate">{folder.name}</span>
                    <span className="text-xs opacity-60">{folder.noteIds.length}</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(folder.id); }}
                        className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-500"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}
