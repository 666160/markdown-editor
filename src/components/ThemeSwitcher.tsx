import { useTheme, type ThemeType } from '../contexts/ThemeContext';

const themes: { value: ThemeType; label: string; icon: string; desc: string }[] = [
    { value: 'neon', label: '霓虹风格', icon: '🌈', desc: '绿色高亮 + 深色' },
    { value: 'github', label: 'GitHub', icon: '🐙', desc: '经典黑白简洁' },
    { value: 'standard', label: '标准风格', icon: '📝', desc: '蓝色调 + 浅色' },
    { value: 'dracula', label: 'Dracula', icon: '🧛', desc: '紫色暗黑风格' },
    { value: 'monokai', label: 'Monokai', icon: '🎨', desc: '橙黄暖色调' },
    { value: 'solarized', label: 'Solarized', icon: '☀️', desc: '护眼米色调' },
];

// 主题切换组件
export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="relative group">
            <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg
                   bg-[var(--bg-secondary)] border border-[var(--border)]
                   text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                   transition-all duration-200"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span className="text-sm">主题</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* 下拉菜单 */}
            <div className="absolute right-0 top-full mt-2 py-2 w-48
                      bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-200 z-50">
                {themes.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                       transition-colors duration-200
                       ${theme === t.value
                                ? 'text-[var(--accent)] bg-[var(--accent)]/10'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                            }`}
                    >
                        <span className="text-lg">{t.icon}</span>
                        <div className="flex-1">
                            <div className="font-medium">{t.label}</div>
                            <div className="text-xs opacity-60">{t.desc}</div>
                        </div>
                        {theme === t.value && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
