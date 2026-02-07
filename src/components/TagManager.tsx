import { useState, useRef, useEffect } from 'react';
import { TAG_COLORS, getTagColor } from '../types/index';

interface TagManagerProps {
    tags: string[];
    allTags: string[];
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
}

// 预设标签列表
const PRESET_TAGS = Object.keys(TAG_COLORS);

// 标签管理组件
export function TagManager({ tags, allTags, onAddTag, onRemoveTag }: TagManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 可选的标签（预设 + 已有标签，排除已添加的）
    const availableTags = Array.from(new Set([...PRESET_TAGS, ...allTags]))
        .filter(tag => !tags.includes(tag));

    // 点击外部关闭下拉
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
                setIsAdding(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 聚焦输入框
    useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

    // 添加标签
    const handleAddTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            onAddTag(trimmedTag);
        }
        setNewTag('');
        setIsAdding(false);
        setShowDropdown(false);
    };

    // 过滤可选标签
    const filteredTags = availableTags.filter(tag =>
        tag.toLowerCase().includes(newTag.toLowerCase())
    );

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {/* 已添加的标签 */}
            {tags.map(tag => (
                <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: getTagColor(tag) }}
                >
                    {tag}
                    <button
                        onClick={() => onRemoveTag(tag)}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </span>
            ))}

            {/* 添加标签按钮/输入框 */}
            <div className="relative" ref={dropdownRef}>
                {isAdding ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={newTag}
                        onChange={(e) => {
                            setNewTag(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && newTag.trim()) {
                                handleAddTag(newTag);
                            } else if (e.key === 'Escape') {
                                setIsAdding(false);
                                setNewTag('');
                            }
                        }}
                        placeholder="输入标签..."
                        className="w-24 px-2 py-0.5 text-xs rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)]
                     text-[var(--text-primary)] placeholder-[var(--text-secondary)]
                     focus:outline-none focus:border-[var(--accent)]"
                    />
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                     bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-dashed border-[var(--border)]
                     hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        标签
                    </button>
                )}

                {/* 下拉选择 */}
                {showDropdown && filteredTags.length > 0 && (
                    <div className="absolute left-0 top-full mt-1 py-1 w-32 max-h-40 overflow-y-auto
                        bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl z-50">
                        {filteredTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => handleAddTag(tag)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left
                         text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]
                         transition-colors"
                            >
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: getTagColor(tag) }}
                                />
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// 标签筛选器组件
interface TagFilterProps {
    allTags: string[];
    selectedTag: string | null;
    onSelectTag: (tag: string | null) => void;
}

export function TagFilter({ allTags, selectedTag, onSelectTag }: TagFilterProps) {
    if (allTags.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5 px-3 py-2 border-b border-[var(--border)]">
            <button
                onClick={() => onSelectTag(null)}
                className={`px-2 py-1 rounded-full text-xs transition-colors
                  ${selectedTag === null
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
            >
                全部
            </button>
            {allTags.map(tag => (
                <button
                    key={tag}
                    onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
                    className={`px-2 py-1 rounded-full text-xs transition-colors
                    ${selectedTag === tag
                            ? 'text-white'
                            : 'text-[var(--text-secondary)] hover:text-white'
                        }`}
                    style={{
                        backgroundColor: selectedTag === tag ? getTagColor(tag) : 'var(--bg-tertiary)',
                        ...(selectedTag !== tag && { opacity: 0.7 }),
                    }}
                >
                    {tag}
                </button>
            ))}
        </div>
    );
}
