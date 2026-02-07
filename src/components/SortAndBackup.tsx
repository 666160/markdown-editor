import type { SortType, SortOrder } from '../types/index';

interface SortControlProps {
    sortType: SortType;
    sortOrder: SortOrder;
    onSortTypeChange: (type: SortType) => void;
    onSortOrderChange: (order: SortOrder) => void;
}

// 排序控制组件
export function SortControl({ sortType, sortOrder, onSortTypeChange, onSortOrderChange }: SortControlProps) {
    return (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)]">
            <span className="text-xs text-[var(--text-secondary)]">排序:</span>
            <select
                value={sortType}
                onChange={(e) => onSortTypeChange(e.target.value as SortType)}
                className="text-xs bg-[var(--bg-tertiary)] border border-[var(--border)] rounded px-2 py-1
                   text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            >
                <option value="updatedAt">更新时间</option>
                <option value="createdAt">创建时间</option>
                <option value="title">标题</option>
            </select>
            <button
                onClick={() => onSortOrderChange(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]
                   transition-colors"
                title={sortOrder === 'desc' ? '降序' : '升序'}
            >
                {sortOrder === 'desc' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                )}
            </button>
        </div>
    );
}

// 备份控制组件
interface BackupControlProps {
    onExport: () => void;
    onRestore: (file: File) => void;
}

export function BackupControl({ onExport, onRestore }: BackupControlProps) {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onExport}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs
                   bg-[var(--bg-tertiary)] text-[var(--text-secondary)]
                   hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]
                   border border-[var(--border)] transition-colors"
                title="备份所有笔记"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                备份
            </button>
            <label className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs cursor-pointer
                       bg-[var(--bg-tertiary)] text-[var(--text-secondary)]
                       hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]
                       border border-[var(--border)] transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                恢复
                <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onRestore(file);
                    }}
                />
            </label>
        </div>
    );
}
