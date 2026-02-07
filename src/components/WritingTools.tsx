import { useState, useEffect } from 'react';

// 从 localStorage 读取写作目标
const GOAL_STORAGE_KEY = 'writing-goal';
const PROGRESS_STORAGE_KEY = 'writing-progress';

interface DailyProgress {
    date: string;
    words: number;
}

// 获取今天的日期字符串
function getTodayStr(): string {
    return new Date().toISOString().split('T')[0];
}

// 读取写作目标
function loadGoal(): number {
    try {
        return parseInt(localStorage.getItem(GOAL_STORAGE_KEY) || '500', 10);
    } catch {
        return 500;
    }
}

// 保存写作目标
function saveGoal(goal: number): void {
    localStorage.setItem(GOAL_STORAGE_KEY, goal.toString());
}

// 读取历史进度
function loadProgress(): DailyProgress[] {
    try {
        return JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

// 保存进度
function saveProgress(progress: DailyProgress[]): void {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

interface WritingGoalProps {
    currentWordCount: number;
}

// 写作目标组件
export function WritingGoal({ currentWordCount }: WritingGoalProps) {
    const [goal, setGoal] = useState(loadGoal);
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(goal.toString());
    const [todayWords, setTodayWords] = useState(0);

    // 更新今日字数
    useEffect(() => {
        const progress = loadProgress();
        const today = getTodayStr();
        const todayProgress = progress.find(p => p.date === today);

        // 记录今天的最高字数
        if (!todayProgress || currentWordCount > todayProgress.words) {
            const newProgress = progress.filter(p => p.date !== today);
            newProgress.push({ date: today, words: currentWordCount });
            // 只保留最近30天
            const recent = newProgress.slice(-30);
            saveProgress(recent);
            setTodayWords(currentWordCount);
        } else {
            setTodayWords(todayProgress.words);
        }
    }, [currentWordCount]);

    // 计算进度百分比
    const percentage = Math.min(100, Math.round((todayWords / goal) * 100));
    const isCompleted = percentage >= 100;

    // 保存目标
    const handleSaveGoal = () => {
        const newGoal = parseInt(inputValue, 10);
        if (newGoal > 0) {
            setGoal(newGoal);
            saveGoal(newGoal);
        }
        setIsEditing(false);
    };

    return (
        <div className="p-3 border-t border-[var(--border)]">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--text-secondary)]">今日目标</span>
                {isEditing ? (
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-16 px-1 py-0.5 text-xs bg-[var(--bg-tertiary)] border border-[var(--border)]
                        rounded text-[var(--text-primary)] text-center"
                            min="100"
                            step="100"
                        />
                        <button
                            onClick={handleSaveGoal}
                            className="text-xs text-[var(--accent)] hover:underline"
                        >
                            保存
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            setInputValue(goal.toString());
                            setIsEditing(true);
                        }}
                        className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)]"
                    >
                        {todayWords} / {goal} 字
                    </button>
                )}
            </div>

            {/* 进度条 */}
            <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-[var(--accent)]'}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* 完成提示 */}
            {isCompleted && (
                <div className="mt-1 text-xs text-green-500 flex items-center gap-1">
                    <span>🎉</span>
                    <span>今日目标已完成！</span>
                </div>
            )}
        </div>
    );
}

interface FocusModeProps {
    isEnabled: boolean;
    onToggle: () => void;
}

// 专注模式开关组件
export function FocusModeToggle({ isEnabled, onToggle }: FocusModeProps) {
    return (
        <button
            onClick={onToggle}
            className={`p-2 rounded-lg transition-all duration-200
                 ${isEnabled
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
            title={isEnabled ? '退出专注模式' : '专注模式'}
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        </button>
    );
}

// 专注模式样式（高亮当前行）
export const focusModeStyles = `
  .focus-mode textarea {
    line-height: 2;
  }
  
  .focus-mode .editor-content {
    position: relative;
  }
  
  .focus-mode .current-line-highlight {
    position: absolute;
    left: 0;
    right: 0;
    height: 2em;
    background: var(--accent);
    opacity: 0.1;
    pointer-events: none;
    transition: top 0.1s ease;
  }
`;
