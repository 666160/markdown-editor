import { useState, useCallback } from 'react';

// 简单的加密/解密（XOR + Base64）
// 注意：这只是基础保护，不是真正的安全加密
function encrypt(text: string, password: string): string {
    const encoded = new TextEncoder().encode(text);
    const key = new TextEncoder().encode(password);
    const result = new Uint8Array(encoded.length);

    for (let i = 0; i < encoded.length; i++) {
        result[i] = encoded[i] ^ key[i % key.length];
    }

    return btoa(String.fromCharCode(...result));
}

function decrypt(encrypted: string, password: string): string {
    try {
        const decoded = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
        const key = new TextEncoder().encode(password);
        const result = new Uint8Array(decoded.length);

        for (let i = 0; i < decoded.length; i++) {
            result[i] = decoded[i] ^ key[i % key.length];
        }

        return new TextDecoder().decode(result);
    } catch {
        return '';
    }
}

interface EncryptDialogProps {
    mode: 'encrypt' | 'decrypt';
    onConfirm: (password: string) => void;
    onClose: () => void;
}

// 加密/解密对话框
export function EncryptDialog({ mode, onConfirm, onClose }: EncryptDialogProps) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!password) {
            setError('请输入密码');
            return;
        }

        if (mode === 'encrypt' && password !== confirmPassword) {
            setError('两次密码不一致');
            return;
        }

        if (password.length < 4) {
            setError('密码至少4个字符');
            return;
        }

        onConfirm(password);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-80"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                        <span>🔒</span>
                        {mode === 'encrypt' ? '加密笔记' : '解密笔记'}
                    </h3>
                </div>

                <div className="p-4 space-y-3">
                    <div>
                        <label className="block text-xs text-[var(--text-secondary)] mb-1">
                            {mode === 'encrypt' ? '设置密码' : '输入密码'}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            placeholder="请输入密码"
                            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]
                        text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]"
                            autoFocus
                        />
                    </div>

                    {mode === 'encrypt' && (
                        <div>
                            <label className="block text-xs text-[var(--text-secondary)] mb-1">确认密码</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                placeholder="再次输入密码"
                                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]
                          text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]"
                            />
                        </div>
                    )}

                    {error && (
                        <p className="text-xs text-red-500">{error}</p>
                    )}

                    <p className="text-xs text-[var(--text-secondary)]">
                        {mode === 'encrypt'
                            ? '⚠️ 请牢记密码，忘记将无法恢复内容'
                            : '输入正确密码解密笔记内容'}
                    </p>
                </div>

                <div className="p-4 border-t border-[var(--border)] flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:opacity-90"
                    >
                        确定
                    </button>
                </div>
            </div>
        </div>
    );
}

// 加密笔记 Hook
export function useEncryption() {
    // 加密内容
    const encryptContent = useCallback((content: string, password: string): string => {
        const marker = '🔒ENCRYPTED:';
        return marker + encrypt(content, password);
    }, []);

    // 解密内容
    const decryptContent = useCallback((content: string, password: string): string | null => {
        const marker = '🔒ENCRYPTED:';
        if (!content.startsWith(marker)) return content;

        const encrypted = content.slice(marker.length);
        const decrypted = decrypt(encrypted, password);

        // 简单验证（加密内容解密后应该是可读文本）
        if (!decrypted || decrypted.includes('\x00')) {
            return null; // 密码错误
        }

        return decrypted;
    }, []);

    // 检查是否加密
    const isEncrypted = useCallback((content: string): boolean => {
        return content.startsWith('🔒ENCRYPTED:');
    }, []);

    return { encryptContent, decryptContent, isEncrypted };
}

// 加密状态指示器
interface EncryptedBadgeProps {
    onClick: () => void;
}

export function EncryptedBadge({ onClick }: EncryptedBadgeProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-500
                text-xs hover:bg-yellow-500/30 transition-colors"
            title="点击解密"
        >
            <span>🔒</span>
            <span>已加密</span>
        </button>
    );
}
