import { useState, useCallback, useEffect } from 'react';

const SETTINGS_STORAGE_KEY = 'app-settings';

interface AppSettings {
    // 编辑器设置
    fontSize: number;
    lineHeight: number;
    fontFamily: string;
    tabSize: number;
    wordWrap: boolean;

    // 自动保存
    autoSave: boolean;
    autoSaveInterval: number; // 秒

    // 界面设置
    showLineNumbers: boolean;
    showWordCount: boolean;
    sidebarWidth: number;
    previewPosition: 'right' | 'bottom';

    // 其他
    defaultNoteTitle: string;
    spellCheck: boolean;
}

const defaultSettings: AppSettings = {
    fontSize: 16,
    lineHeight: 1.6,
    fontFamily: 'system-ui',
    tabSize: 2,
    wordWrap: true,
    autoSave: true,
    autoSaveInterval: 3,
    showLineNumbers: true,
    showWordCount: true,
    sidebarWidth: 280,
    previewPosition: 'right',
    defaultNoteTitle: '未命名笔记',
    spellCheck: false,
};

// 读取设置
function loadSettings(): AppSettings {
    try {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (saved) {
            return { ...defaultSettings, ...JSON.parse(saved) };
        }
    } catch { }
    return defaultSettings;
}

// 保存设置
function saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

// 设置 Hook
export function useSettings() {
    const [settings, setSettings] = useState<AppSettings>(loadSettings);

    // 更新设置
    const updateSetting = useCallback(<K extends keyof AppSettings>(
        key: K,
        value: AppSettings[K]
    ) => {
        setSettings(prev => {
            const updated = { ...prev, [key]: value };
            saveSettings(updated);
            return updated;
        });
    }, []);

    // 重置设置
    const resetSettings = useCallback(() => {
        setSettings(defaultSettings);
        saveSettings(defaultSettings);
    }, []);

    return { settings, updateSetting, resetSettings };
}

interface SettingsPanelProps {
    settings: AppSettings;
    onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
    onReset: () => void;
    onClose: () => void;
}

// 设置面板
export function SettingsPanel({ settings, onUpdateSetting, onReset, onClose }: SettingsPanelProps) {
    const [activeTab, setActiveTab] = useState<'editor' | 'interface' | 'other'>('editor');

    const tabs = [
        { id: 'editor' as const, label: '编辑器', icon: '✏️' },
        { id: 'interface' as const, label: '界面', icon: '🎨' },
        { id: 'other' as const, label: '其他', icon: '⚙️' },
    ];

    const fontFamilies = [
        { value: 'system-ui', label: '系统默认' },
        { value: 'Monaco, monospace', label: 'Monaco' },
        { value: 'Consolas, monospace', label: 'Consolas' },
        { value: '"Fira Code", monospace', label: 'Fira Code' },
        { value: '"JetBrains Mono", monospace', label: 'JetBrains Mono' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">⚙️ 设置</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onReset}
                            className="text-xs px-2 py-1 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                        >
                            重置默认
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 标签页 */}
                <div className="flex border-b border-[var(--border)]">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors
                        ${activeTab === tab.id
                                    ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            <span className="mr-1">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 设置内容 */}
                <div className="p-4 max-h-96 overflow-y-auto">
                    {activeTab === 'editor' && (
                        <div className="space-y-4">
                            {/* 字体大小 */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-[var(--text-primary)]">字体大小</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min={12}
                                        max={24}
                                        value={settings.fontSize}
                                        onChange={(e) => onUpdateSetting('fontSize', parseInt(e.target.value))}
                                        className="w-24"
                                    />
                                    <span className="text-sm text-[var(--text-secondary)] w-8">{settings.fontSize}px</span>
                                </div>
                            </div>

                            {/* 行高 */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-[var(--text-primary)]">行高</label>
                                <select
                                    value={settings.lineHeight}
                                    onChange={(e) => onUpdateSetting('lineHeight', parseFloat(e.target.value))}
                                    className="px-2 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border)]
                            text-[var(--text-primary)] text-sm"
                                >
                                    <option value={1.4}>紧凑 (1.4)</option>
                                    <option value={1.6}>默认 (1.6)</option>
                                    <option value={1.8}>宽松 (1.8)</option>
                                    <option value={2}>超宽 (2.0)</option>
                                </select>
                            </div>

                            {/* 字体 */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-[var(--text-primary)]">字体</label>
                                <select
                                    value={settings.fontFamily}
                                    onChange={(e) => onUpdateSetting('fontFamily', e.target.value)}
                                    className="px-2 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border)]
                            text-[var(--text-primary)] text-sm"
                                >
                                    {fontFamilies.map(f => (
                                        <option key={f.value} value={f.value}>{f.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Tab 大小 */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-[var(--text-primary)]">Tab 大小</label>
                                <select
                                    value={settings.tabSize}
                                    onChange={(e) => onUpdateSetting('tabSize', parseInt(e.target.value))}
                                    className="px-2 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border)]
                            text-[var(--text-primary)] text-sm"
                                >
                                    <option value={2}>2 空格</option>
                                    <option value={4}>4 空格</option>
                                </select>
                            </div>

                            {/* 自动换行 */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-[var(--text-primary)]">自动换行</label>
                                <button
                                    onClick={() => onUpdateSetting('wordWrap', !settings.wordWrap)}
                                    className={`w-10 h-6 rounded-full transition-colors ${settings.wordWrap ? 'bg-[var(--accent)]' : 'bg-[var(--bg-tertiary)]'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-1 ${settings.wordWrap ? 'translate-x-4' : ''
                                        }`} />
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'interface' && (
                        <div className="space-y-4">
                            {/* 显示行号 */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-[var(--text-primary)]">显示行号</label>
                                <button
                                    onClick={() => onUpdateSetting('showLineNumbers', !settings.showLineNumbers)}
                                    className={`w-10 h-6 rounded-full transition-colors ${settings.showLineNumbers ? 'bg-[var(--accent)]' : 'bg-[var(--bg-tertiary)]'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-1 ${settings.showLineNumbers ? 'translate-x-4' : ''
                                        }`} />
                                </button>
                            </div>

                            {/* 显示字数 */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-[var(--text-primary)]">显示字数统计</label>
                                <button
                                    onClick={() => onUpdateSetting('showWordCount', !settings.showWordCount)}
                                    className={`w-10 h-6 rounded-full transition-colors ${settings.showWordCount ? 'bg-[var(--accent)]' : 'bg-[var(--bg-tertiary)]'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-1 ${settings.showWordCount ? 'translate-x-4' : ''
                                        }`} />
                                </button>
                            </div>

                            {/* 预览位置 */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-[var(--text-primary)]">预览位置</label>
                                <select
                                    value={settings.previewPosition}
                                    onChange={(e) => onUpdateSetting('previewPosition', e.target.value as 'right' | 'bottom')}
                                    className="px-2 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border)]
                            text-[var(--text-primary)] text-sm"
                                >
                                    <option value="right">右侧</option>
                                    <option value="bottom">底部</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'other' && (
                        <div className="space-y-4">
                            {/* 自动保存 */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-[var(--text-primary)]">自动保存</label>
                                <button
                                    onClick={() => onUpdateSetting('autoSave', !settings.autoSave)}
                                    className={`w-10 h-6 rounded-full transition-colors ${settings.autoSave ? 'bg-[var(--accent)]' : 'bg-[var(--bg-tertiary)]'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-1 ${settings.autoSave ? 'translate-x-4' : ''
                                        }`} />
                                </button>
                            </div>

                            {/* 自动保存间隔 */}
                            {settings.autoSave && (
                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-[var(--text-primary)]">保存间隔</label>
                                    <select
                                        value={settings.autoSaveInterval}
                                        onChange={(e) => onUpdateSetting('autoSaveInterval', parseInt(e.target.value))}
                                        className="px-2 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border)]
                              text-[var(--text-primary)] text-sm"
                                    >
                                        <option value={1}>1 秒</option>
                                        <option value={3}>3 秒</option>
                                        <option value={5}>5 秒</option>
                                        <option value={10}>10 秒</option>
                                    </select>
                                </div>
                            )}

                            {/* 默认标题 */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-[var(--text-primary)]">默认笔记标题</label>
                                <input
                                    type="text"
                                    value={settings.defaultNoteTitle}
                                    onChange={(e) => onUpdateSetting('defaultNoteTitle', e.target.value)}
                                    className="w-32 px-2 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border)]
                            text-[var(--text-primary)] text-sm"
                                />
                            </div>

                            {/* 拼写检查 */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-[var(--text-primary)]">拼写检查</label>
                                <button
                                    onClick={() => onUpdateSetting('spellCheck', !settings.spellCheck)}
                                    className={`w-10 h-6 rounded-full transition-colors ${settings.spellCheck ? 'bg-[var(--accent)]' : 'bg-[var(--bg-tertiary)]'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-1 ${settings.spellCheck ? 'translate-x-4' : ''
                                        }`} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
