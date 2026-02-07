// 笔记数据类型定义
export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];    // 标签数组
    isPinned: boolean; // 是否置顶
    createdAt: number;
    updatedAt: number;
}

// 排序类型
export type SortType = 'updatedAt' | 'createdAt' | 'title';
export type SortOrder = 'asc' | 'desc';

// 预定义的标签颜色
export const TAG_COLORS: Record<string, string> = {
    '工作': '#3b82f6',      // 蓝色
    '学习': '#10b981',      // 绿色
    '生活': '#f59e0b',      // 橙色
    '项目': '#8b5cf6',      // 紫色
    '灵感': '#ec4899',      // 粉色
    '待办': '#ef4444',      // 红色
    '归档': '#6b7280',      // 灰色
};

// 获取标签颜色
export function getTagColor(tag: string): string {
    return TAG_COLORS[tag] || '#6b7280';
}
