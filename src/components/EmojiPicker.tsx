import { useState } from 'react';

// 常用表情分类
const EMOJI_CATEGORIES = {
    '😀 表情': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😎', '🤔', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '🥱', '😴'],
    '👋 手势': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🖐️', '✋', '👋', '🖖', '👆', '👇', '👈', '👉', '🖕', '☝️', '👃'],
    '❤️ 符号': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '⭐', '🌟', '✨', '💫', '🔥', '💯', '✅', '❌', '⚠️', '❓', '❗', '💡'],
    '🎉 活动': ['🎉', '🎊', '🎈', '🎁', '🎀', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '📢', '📣', '🔔', '🎵', '🎶', '🎤', '🎧', '📱', '💻', '⌨️', '🖥️', '📷', '📹', '🎬', '📺', '📻', '🎮', '🕹️', '🎯'],
    '🌈 自然': ['🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌧️', '⛈️', '🌩️', '❄️', '💨', '🌊', '🌸', '🌺', '🌻', '🌹', '🌷', '🌱', '🌲', '🌳', '🍀', '🍁', '🍂', '🌍', '🌎', '🌏', '🌙', '⭐', '🌟', '💫'],
    '🍎 食物': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭', '🍍', '🥝', '🍅', '🥑', '🍔', '🍕', '🌮', '🌯', '🍜', '🍣', '🍦', '🍩', '🍪', '🎂', '🍰', '☕', '🍵', '🧃'],
};

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

// 表情选择器组件
export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
    const [activeCategory, setActiveCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);

    // 获取当前分类的表情
    const currentEmojis = EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES] || [];

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-80"
                onClick={e => e.stopPropagation()}
            >
                {/* 头部 */}
                <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
                    <span className="text-sm font-medium text-[var(--text-primary)]">选择表情</span>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 分类标签 */}
                <div className="flex overflow-x-auto p-2 gap-1 border-b border-[var(--border)]">
                    {Object.keys(EMOJI_CATEGORIES).map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-2 py-1 rounded text-sm whitespace-nowrap transition-colors
                        ${activeCategory === category
                                    ? 'bg-[var(--accent)] text-white'
                                    : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* 表情网格 */}
                <div className="p-2 h-48 overflow-y-auto">
                    <div className="grid grid-cols-8 gap-1">
                        {currentEmojis.map((emoji, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    onSelect(emoji);
                                    onClose();
                                }}
                                className="w-8 h-8 flex items-center justify-center text-xl rounded
                         hover:bg-[var(--bg-tertiary)] transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
