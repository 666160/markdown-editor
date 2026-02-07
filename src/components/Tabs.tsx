import { useState, useCallback } from 'react';
import type { Note } from '../types/index';

interface Tab {
    id: string;
    noteId: string;
    title: string;
}

// 多标签页 Hook
export function useTabs() {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);

    // 生成 Tab ID
    const generateTabId = () => `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // 打开新标签
    const openTab = useCallback((note: Note) => {
        // 检查是否已打开
        const existing = tabs.find(t => t.noteId === note.id);
        if (existing) {
            setActiveTabId(existing.id);
            return;
        }

        const newTab: Tab = {
            id: generateTabId(),
            noteId: note.id,
            title: note.title,
        };
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
    }, [tabs]);

    // 关闭标签
    const closeTab = useCallback((tabId: string) => {
        setTabs(prev => {
            const index = prev.findIndex(t => t.id === tabId);
            const newTabs = prev.filter(t => t.id !== tabId);

            // 如果关闭的是当前标签，切换到相邻标签
            if (activeTabId === tabId && newTabs.length > 0) {
                const newIndex = Math.min(index, newTabs.length - 1);
                setActiveTabId(newTabs[newIndex].id);
            } else if (newTabs.length === 0) {
                setActiveTabId(null);
            }

            return newTabs;
        });
    }, [activeTabId]);

    // 更新标签标题
    const updateTabTitle = useCallback((noteId: string, title: string) => {
        setTabs(prev => prev.map(t =>
            t.noteId === noteId ? { ...t, title } : t
        ));
    }, []);

    // 获取当前活动标签
    const activeTab = tabs.find(t => t.id === activeTabId) || null;

    return {
        tabs,
        activeTabId,
        activeTab,
        openTab,
        closeTab,
        setActiveTabId,
        updateTabTitle,
    };
}

interface TabBarProps {
    tabs: Tab[];
    activeTabId: string | null;
    onSelect: (tabId: string) => void;
    onClose: (tabId: string) => void;
}

// 标签栏组件
export function TabBar({ tabs, activeTabId, onSelect, onClose }: TabBarProps) {
    if (tabs.length === 0) return null;

    return (
        <div className="flex items-center bg-[var(--bg-tertiary)] border-b border-[var(--border)] overflow-x-auto">
            {tabs.map(tab => (
                <div
                    key={tab.id}
                    className={`group flex items-center gap-2 px-3 py-2 cursor-pointer
                     border-r border-[var(--border)] min-w-[120px] max-w-[200px]
                     ${activeTabId === tab.id
                            ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/50'
                        }`}
                >
                    <div
                        className="flex-1 truncate text-sm"
                        onClick={() => onSelect(tab.id)}
                    >
                        {tab.title}
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
                        className="w-4 h-4 flex items-center justify-center rounded
                      opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-tertiary)]
                      transition-opacity"
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
