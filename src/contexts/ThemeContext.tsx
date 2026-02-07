import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// 主题类型
export type ThemeType = 'neon' | 'github' | 'standard' | 'dracula' | 'monokai' | 'solarized';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'markdown-notes-theme';

// 主题提供者组件
export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<ThemeType>(() => {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        return (saved as ThemeType) || 'neon';
    });

    useEffect(() => {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        // 更新 document 的 data-theme 属性
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// 使用主题的 Hook
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme 必须在 ThemeProvider 内部使用');
    }
    return context;
}
