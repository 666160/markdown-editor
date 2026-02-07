import { useState } from 'react';

// 笔记模板定义
export interface NoteTemplate {
    id: string;
    name: string;
    icon: string;
    content: string;
}

// 预设模板
export const NOTE_TEMPLATES: NoteTemplate[] = [
    {
        id: 'blank',
        name: '空白笔记',
        icon: '📝',
        content: '# 新笔记\n\n开始编写你的内容...',
    },
    {
        id: 'daily',
        name: '每日日记',
        icon: '📅',
        content: `# 📅 ${new Date().toLocaleDateString('zh-CN')} 日记

## 今日计划
- [ ] 任务1
- [ ] 任务2
- [ ] 任务3

## 今日收获
> 

## 明日计划
- 
`,
    },
    {
        id: 'meeting',
        name: '会议记录',
        icon: '🎯',
        content: `# 🎯 会议记录

**日期**：${new Date().toLocaleDateString('zh-CN')}  
**参会人**：  
**主持人**：

---

## 会议议题

### 1. 

### 2. 

## 决议事项
- [ ] 

## 后续跟进
| 责任人 | 事项 | 截止日期 |
|--------|------|----------|
|  |  |  |
`,
    },
    {
        id: 'todo',
        name: '待办清单',
        icon: '✅',
        content: `# ✅ 待办清单

## 🔴 紧急重要
- [ ] 

## 🟡 重要不紧急
- [ ] 

## 🟢 紧急不重要
- [ ] 

## ⚪ 不紧急不重要
- [ ] 
`,
    },
    {
        id: 'project',
        name: '项目文档',
        icon: '📊',
        content: `# 📊 项目名称

## 项目概述
简要描述项目目标和背景。

## 技术栈
- 

## 功能列表
1. 
2. 
3. 

## 进度追踪
| 功能 | 状态 | 负责人 |
|------|------|--------|
|  | 🔵 进行中 |  |

## 参考资料
- [链接名称](url)
`,
    },
    {
        id: 'flowchart',
        name: '流程图示例',
        icon: '📈',
        content: `# 📈 流程图示例

## 简单流程图

\`\`\`mermaid
graph TD
    A[开始] --> B{条件判断}
    B -->|是| C[执行操作1]
    B -->|否| D[执行操作2]
    C --> E[结束]
    D --> E
\`\`\`

## 时序图

\`\`\`mermaid
sequenceDiagram
    participant A as 用户
    participant B as 系统
    A->>B: 发送请求
    B-->>A: 返回响应
\`\`\`
`,
    },
];

interface TemplatePickerProps {
    onSelect: (template: NoteTemplate) => void;
    onClose?: () => void;
    minimalist?: boolean;
}

// 模板选择器组件
export function TemplatePicker({ onSelect, onClose, minimalist = false }: TemplatePickerProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const content = (
        <div
            className={`${minimalist ? '' : 'bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 w-[500px] max-h-[80vh] overflow-auto shadow-2xl'}`}
            onClick={e => e.stopPropagation()}
        >
            {!minimalist && (
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">选择笔记模板</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <div className={`grid ${minimalist ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-3'}`}>
                {NOTE_TEMPLATES.map(template => (
                    <button
                        key={template.id}
                        onClick={() => onSelect(template)}
                        onMouseEnter={() => setHoveredId(template.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`p-3 rounded-lg border text-left transition-all duration-200
                        ${hoveredId === template.id
                                ? 'bg-[var(--accent)]/10 border-[var(--accent)]'
                                : 'bg-[var(--bg-tertiary)] border-[var(--border)] hover:border-[var(--accent)]/50'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-xl">{template.icon}</div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-[var(--text-primary)] text-sm">{template.name}</div>
                                {!minimalist && (
                                    <div className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-1">
                                        {template.content.split('\n')[0].replace('#', '').trim()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    if (minimalist) {
        return <div className="w-full">{content}</div>;
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            {content}
        </div>
    );
}
