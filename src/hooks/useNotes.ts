import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Note, SortType, SortOrder } from '../types';

const STORAGE_KEY = 'markdown-notes';

// 生成唯一 ID
const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// 从 LocalStorage 读取笔记数据
const loadNotes = (): Note[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        const notes = JSON.parse(data);
        // 兼容旧数据，添加新字段
        return notes.map((note: Note) => ({
            ...note,
            tags: note.tags || [],
            isPinned: note.isPinned || false,
        }));
    } catch {
        console.error('读取笔记数据失败');
        return [];
    }
};

// 保存笔记到 LocalStorage
const saveNotes = (notes: Note[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
        console.error('保存笔记数据失败');
    }
};

// 笔记管理 Hook
export function useNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [sortType, setSortType] = useState<SortType>('updatedAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [lastSaved, setLastSaved] = useState<number | null>(null);

    // 初始化：从 LocalStorage 加载数据
    useEffect(() => {
        const loadedNotes = loadNotes();
        setNotes(loadedNotes);
        // 如果有笔记，默认选中第一个
        if (loadedNotes.length > 0) {
            setCurrentNoteId(loadedNotes[0].id);
        }
    }, []);

    // 保存到 LocalStorage
    useEffect(() => {
        if (notes.length > 0) {
            saveNotes(notes);
            setLastSaved(Date.now());
        }
    }, [notes]);

    // 获取当前选中的笔记
    const currentNote = notes.find(note => note.id === currentNoteId) || null;

    // 获取所有标签（去重）
    const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

    // 排序函数
    const sortNotes = useCallback((notesToSort: Note[]): Note[] => {
        return [...notesToSort].sort((a, b) => {
            // 置顶笔记永远在前
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;

            let comparison = 0;
            switch (sortType) {
                case 'title':
                    comparison = a.title.localeCompare(b.title, 'zh-CN');
                    break;
                case 'createdAt':
                    comparison = a.createdAt - b.createdAt;
                    break;
                case 'updatedAt':
                default:
                    comparison = a.updatedAt - b.updatedAt;
                    break;
            }
            return sortOrder === 'desc' ? -comparison : comparison;
        });
    }, [sortType, sortOrder]);

    // 根据搜索关键词和标签过滤并排序笔记
    const filteredNotes = useMemo(() => {
        let result = notes.filter(note => {
            // 标签过滤
            if (selectedTag && !note.tags.includes(selectedTag)) {
                return false;
            }
            // 搜索过滤
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();
            return (
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query) ||
                note.tags.some(tag => tag.toLowerCase().includes(query))
            );
        });
        return sortNotes(result);
    }, [notes, selectedTag, searchQuery, sortNotes]);

    // 创建新笔记
    const createNote = useCallback(() => {
        const now = Date.now();
        const newNote: Note = {
            id: generateId(),
            title: '未命名笔记',
            content: '# 新笔记\n\n开始编写你的内容...',
            tags: selectedTag ? [selectedTag] : [],
            isPinned: false,
            createdAt: now,
            updatedAt: now,
        };
        setNotes(prev => [newNote, ...prev]);
        setCurrentNoteId(newNote.id);
    }, [selectedTag]);

    // 从模板创建笔记
    const createNoteFromTemplate = useCallback((title: string, content: string) => {
        const now = Date.now();
        const newNote: Note = {
            id: generateId(),
            title,
            content,
            tags: selectedTag ? [selectedTag] : [],
            isPinned: false,
            createdAt: now,
            updatedAt: now,
        };
        setNotes(prev => [newNote, ...prev]);
        setCurrentNoteId(newNote.id);
    }, [selectedTag]);

    // 更新笔记
    const updateNote = useCallback((id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags'>>) => {
        setNotes(prev =>
            prev.map(note =>
                note.id === id
                    ? { ...note, ...updates, updatedAt: Date.now() }
                    : note
            )
        );
    }, []);

    // 切换置顶
    const togglePin = useCallback((id: string) => {
        setNotes(prev =>
            prev.map(note =>
                note.id === id
                    ? { ...note, isPinned: !note.isPinned, updatedAt: Date.now() }
                    : note
            )
        );
    }, []);

    // 添加标签
    const addTag = useCallback((noteId: string, tag: string) => {
        setNotes(prev =>
            prev.map(note =>
                note.id === noteId && !note.tags.includes(tag)
                    ? { ...note, tags: [...note.tags, tag], updatedAt: Date.now() }
                    : note
            )
        );
    }, []);

    // 移除标签
    const removeTag = useCallback((noteId: string, tag: string) => {
        setNotes(prev =>
            prev.map(note =>
                note.id === noteId
                    ? { ...note, tags: note.tags.filter(t => t !== tag), updatedAt: Date.now() }
                    : note
            )
        );
    }, []);

    // 删除笔记
    const deleteNote = useCallback((id: string) => {
        setNotes(prev => {
            const newNotes = prev.filter(note => note.id !== id);
            if (id === currentNoteId) {
                setCurrentNoteId(newNotes.length > 0 ? newNotes[0].id : null);
            }
            return newNotes;
        });
    }, [currentNoteId]);

    // 选择笔记
    const selectNote = useCallback((id: string) => {
        setCurrentNoteId(id);
    }, []);

    // 导入笔记
    const importNotes = useCallback((notesToImport: { title: string; content: string }[]) => {
        const now = Date.now();
        const newNotes: Note[] = notesToImport.map((note, index) => ({
            id: generateId() + index,
            title: note.title,
            content: note.content,
            tags: [],
            isPinned: false,
            createdAt: now,
            updatedAt: now,
        }));

        setNotes(prev => [...newNotes, ...prev]);

        if (newNotes.length > 0) {
            setCurrentNoteId(newNotes[0].id);
        }
    }, []);

    // 导出所有笔记为 JSON
    const exportAllNotes = useCallback(() => {
        const data = JSON.stringify(notes, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `markdown-notes-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [notes]);

    // 从备份恢复
    const restoreFromBackup = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (Array.isArray(data)) {
                    const restoredNotes = data.map(note => ({
                        ...note,
                        tags: note.tags || [],
                        isPinned: note.isPinned || false,
                    }));
                    setNotes(restoredNotes);
                    if (restoredNotes.length > 0) {
                        setCurrentNoteId(restoredNotes[0].id);
                    }
                }
            } catch {
                console.error('恢复备份失败');
            }
        };
        reader.readAsText(file);
    }, []);

    return {
        notes: filteredNotes,
        allNotes: notes,
        allTags,
        currentNote,
        currentNoteId,
        searchQuery,
        selectedTag,
        sortType,
        sortOrder,
        lastSaved,
        setSearchQuery,
        setSelectedTag,
        setSortType,
        setSortOrder,
        createNote,
        createNoteFromTemplate,
        updateNote,
        togglePin,
        addTag,
        removeTag,
        deleteNote,
        selectNote,
        importNotes,
        exportAllNotes,
        restoreFromBackup,
    };
}
