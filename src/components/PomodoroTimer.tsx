import { useState, useEffect, useCallback } from 'react';

const POMODORO_STORAGE_KEY = 'pomodoro-state';

interface PomodoroState {
    workMinutes: number;
    breakMinutes: number;
    completedPomodoros: number;
}

// 读取番茄钟状态
function loadState(): PomodoroState {
    try {
        const saved = localStorage.getItem(POMODORO_STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch { }
    return { workMinutes: 25, breakMinutes: 5, completedPomodoros: 0 };
}

// 保存状态
function saveState(state: PomodoroState): void {
    localStorage.setItem(POMODORO_STORAGE_KEY, JSON.stringify(state));
}

interface PomodoroTimerProps {
    onClose: () => void;
    initialState: PomodoroState;
    onStateChange: (state: PomodoroState) => void;
}

// 番茄钟弹窗
export function PomodoroModal({ onClose, initialState, onStateChange }: PomodoroTimerProps) {
    const [state, setState] = useState<PomodoroState>(initialState);
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(state.workMinutes * 60);

    // Sync state changes back to parent
    useEffect(() => {
        onStateChange(state);
    }, [state, onStateChange]);

    // 保存状态
    useEffect(() => {
        saveState(state);
    }, [state]);

    // 计时器 logic...
    useEffect(() => {
        if (!isRunning) return;

        const timer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    playNotification();
                    if (isBreak) {
                        setIsBreak(false);
                        return state.workMinutes * 60;
                    } else {
                        setState(prev => ({ ...prev, completedPomodoros: prev.completedPomodoros + 1 }));
                        setIsBreak(true);
                        return state.breakMinutes * 60;
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, isBreak, state.workMinutes, state.breakMinutes]);

    const playNotification = useCallback(() => {
        if (Notification.permission === 'granted') {
            new Notification(isBreak ? '休息结束！' : '工作完成！', {
                body: isBreak ? '开始新的番茄钟吧' : '休息一下吧',
                icon: '🍅'
            });
        }
    }, [isBreak]);

    useEffect(() => {
        if (Notification.permission === 'default') Notification.requestPermission();
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const totalSeconds = isBreak ? state.breakMinutes * 60 : state.workMinutes * 60;
    const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

    const reset = () => {
        setIsRunning(false);
        setIsBreak(false);
        setSecondsLeft(state.workMinutes * 60);
    };

    const adjustTime = (type: 'work' | 'break', delta: number) => {
        setState(prev => {
            const key = type === 'work' ? 'workMinutes' : 'breakMinutes';
            const newValue = Math.max(1, Math.min(60, prev[key] + delta));
            return { ...prev, [key]: newValue };
        });
        if (!isRunning) {
            setSecondsLeft(type === 'work' && !isBreak ? Math.max(60, (state.workMinutes + delta) * 60) : secondsLeft);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl w-80 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className={`p-4 text-center transition-colors ${isBreak ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <div className="text-4xl mb-2">🍅</div>
                    <div className="text-sm text-[var(--text-secondary)]">{isBreak ? '休息时间' : '专注时间'}</div>
                </div>
                <div className="p-6 text-center">
                    <div className="relative w-40 h-40 mx-auto mb-4">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke={isBreak ? '#10b981' : '#ef4444'} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${progress * 2.83} 283`} className="transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center"><span className="text-4xl font-mono text-[var(--text-primary)]">{formatTime(secondsLeft)}</span></div>
                    </div>
                    <div className="flex justify-center gap-3 mb-4">
                        <button onClick={() => setIsRunning(!isRunning)} className={`px-6 py-2 rounded-lg font-medium transition-colors ${isRunning ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-[var(--accent)] text-white hover:opacity-90'}`}>{isRunning ? '暂停' : '开始'}</button>
                        <button onClick={reset} className="px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">重置</button>
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">今日完成: <span className="text-[var(--accent)] font-medium">{state.completedPomodoros}</span> 个番茄</div>
                </div>
                <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-tertiary)]/30">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2"><span className="text-[var(--text-secondary)]">工作</span><button onClick={() => adjustTime('work', -5)} className="w-5 h-5 rounded bg-[var(--bg-tertiary)]">-</button><span className="w-8 text-center text-[var(--text-primary)]">{state.workMinutes}</span><button onClick={() => adjustTime('work', 5)} className="w-5 h-5 rounded bg-[var(--bg-tertiary)]">+</button></div>
                        <div className="flex items-center gap-2"><span className="text-[var(--text-secondary)]">休息</span><button onClick={() => adjustTime('break', -1)} className="w-5 h-5 rounded bg-[var(--bg-tertiary)]">-</button><span className="w-8 text-center text-[var(--text-primary)]">{state.breakMinutes}</span><button onClick={() => adjustTime('break', 1)} className="w-5 h-5 rounded bg-[var(--bg-tertiary)]">+</button></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 番茄钟小部件/入口
export function PomodoroTimer() {
    const [showModal, setShowModal] = useState(false);
    const [state, setState] = useState<PomodoroState>(loadState);

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2"
                title="番茄钟"
            >
                <span>🍅</span>
                <span className="text-xs font-medium">{state.completedPomodoros > 0 ? state.completedPomodoros : ''}</span>
            </button>
            {showModal && (
                <PomodoroModal
                    onClose={() => setShowModal(false)}
                    initialState={state}
                    onStateChange={setState}
                />
            )}
        </>
    );
}
