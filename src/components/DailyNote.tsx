import { useCallback } from 'react';

// 获取今天的日期字符串
function getTodayStr(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// 生成每日笔记内容
export function generateDailyNoteContent(): { title: string; content: string } {
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    return {
        title: `📅 ${getTodayStr()}`,
        content: `# 📅 ${dateStr}

## ☀️ 今日计划
- [ ] 
- [ ] 
- [ ] 

## 📝 笔记


## 💭 想法


## 🌙 今日总结

`,
    };
}

// 每日笔记 Hook
export function useDailyNote(
    notes: { title: string; id: string }[],
    createNoteFromTemplate: (title: string, content: string) => void,
    selectNote: (id: string) => void
) {
    const openOrCreateDailyNote = useCallback(() => {
        const todayTitle = `📅 ${getTodayStr()}`;

        // 查找今天的笔记
        const existingNote = notes.find(note => note.title === todayTitle);

        if (existingNote) {
            // 如果存在，直接打开
            selectNote(existingNote.id);
        } else {
            // 如果不存在，创建新的
            const { title, content } = generateDailyNoteContent();
            createNoteFromTemplate(title, content);
        }
    }, [notes, createNoteFromTemplate, selectNote]);

    return { openOrCreateDailyNote };
}
