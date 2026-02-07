import { useState, useEffect } from 'react';
import type { EditorHandle } from './Editor';

// 默认 API 地址（OpenAI）
const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface AIAssistantProps {
    editorRef: React.RefObject<EditorHandle | null>;
    onClose: () => void;
}

export function AIAssistant({ editorRef, onClose }: AIAssistantProps) {
    // 状态
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('ai_api_key') || '');
    const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem('ai_base_url') || DEFAULT_BASE_URL);
    const [model, setModel] = useState(() => localStorage.getItem('ai_model') || 'gpt-3.5-turbo');

    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 保存设置
    useEffect(() => {
        localStorage.setItem('ai_api_key', apiKey);
        localStorage.setItem('ai_base_url', baseUrl);
        localStorage.setItem('ai_model', model);
    }, [apiKey, baseUrl, model]);

    // 获取选中文本
    const getSelectedText = () => { 
        return editorRef.current?.getSelectedText() || '';
    };

    // 插入文本
    const insertText = (text: string) => {
        editorRef.current?.insertText(text);
    };

    // 调用 API
    const callAI = async (currentPrompt: string) => {
        if (!apiKey) {
            setError('请先配置 API Key');
            setShowSettings(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        setResponse('');

        try {
            // URL 规范化处理
            let finalBaseUrl = baseUrl.replace(/\/$/, ''); // 去除末尾斜杠

            // 简单智能修正：如果用户只填了域名且没填 /v1，大多数中转服务需要 /v1
            // 但为了不破坏某些特殊 API，我们主要依赖用户的输入，只在显而易见的情况下提示或处理

            const endpoint = `${finalBaseUrl}/chat/completions`;

            const messages: Message[] = [
                { role: 'system', content: 'You are a helpful assistant for a Markdown editor. Please answer in Markdown format.' },
                { role: 'user', content: currentPrompt }
            ];

            console.log('Requesting AI:', endpoint); // 调试日志

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    stream: false // 暂时强制关闭流式，以避免复杂的 CORS/读取问题，先确保能通
                })
            }).catch(e => {
                // 处理网络级别的错误（如 CORS，DNS）
                console.error('Network Error:', e);
                if (e.message === 'Failed to fetch') {
                    throw new Error('网络请求失败（CORS）。请尝试将 Base URL 改为代理地址（如 /api/proxy/...）并重启服务。');
                }
                throw e;
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                console.error('API Error:', res.status, errData);
                // 兼容不同的错误格式：
                // 1. OpenAI 标准: { error: { message: "..." } }
                // 2. 简易格式/其他服务商: { error: "..." } 或 { message: "..." }
                const errorMessage =
                    errData.error?.message ||
                    (typeof errData.error === 'string' ? errData.error : '') ||
                    errData.message ||
                    `API 请求失败: ${res.status} ${res.statusText}`;

                throw new Error(errorMessage);
            }

            const data = await res.json();
            const content = data.choices[0]?.message?.content || '';
            setResponse(content);

        } catch (err: any) {
            console.error('AI Call Failed:', err);
            setError(err.message || '发生未知错误');
        } finally {
            setIsLoading(false);
        }
    };

    // 预定义动作
    const handleAction = (type: 'summarize' | 'polish' | 'translate') => {
        const selected = getSelectedText();
        if (!selected) {
            setError('请先在编辑器中选择文本');
            return;
        }

        let actionPrompt = '';
        switch (type) {
            case 'summarize':
                actionPrompt = `请总结以下内容：\n\n${selected}`;
                break;
            case 'polish':
                actionPrompt = `请润色以下内容，使其更通顺专业：\n\n${selected}`;
                break;
            case 'translate':
                actionPrompt = `请将以下内容翻译成英文（如果是英文则翻译成中文）：\n\n${selected}`;
                break;
        }

        setPrompt(actionPrompt); // 回显
        callAI(actionPrompt);
    };

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-[var(--bg-secondary)] border-l border-[var(--border)] shadow-xl z-50 flex flex-col transition-transform duration-300 transform translate-x-0">
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--bg-primary)]">
                <div className="flex items-center gap-2 font-semibold">
                    <span className="text-xl">✨</span>
                    <span>AI 助手</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-1.5 rounded hover:bg-[var(--bg-tertiary)] ${showSettings ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
                        title="设置"
                    >
                        ⚙️
                    </button>
                    <button onClick={onClose} className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">✕</button>
                </div>
            </div>

            {/* 设置面板 */}
            {showSettings && (
                <div className="p-4 bg-[var(--bg-tertiary)]/30 border-b border-[var(--border)] space-y-3">
                    <div>
                        <label className="block text-xs text-[var(--text-secondary)] mb-1">Base URL</label>
                        <input
                            type="text"
                            value={baseUrl}
                            onChange={e => setBaseUrl(e.target.value)}
                            placeholder="https://api.openai.com/v1"
                            title="请确保地址包含 /v1（如果服务商要求）"
                            className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded focus:border-[var(--accent)] outline-none"
                        />
                        <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                            如果遇到跨域(CORS)错误，请使用代理地址（如 <code>/api/proxy/...</code>）而非完整 URL。
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs text-[var(--text-secondary)] mb-1">API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded focus:border-[var(--accent)] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[var(--text-secondary)] mb-1">Model</label>
                        <input
                            type="text"
                            value={model}
                            onChange={e => setModel(e.target.value)}
                            placeholder="gpt-3.5-turbo"
                            className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded focus:border-[var(--accent)] outline-none"
                        />
                    </div>
                </div>
            )}

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 快捷操作 */}
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleAction('summarize')} className="px-3 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 rounded text-xs text-[var(--text-primary)] transition-colors">
                        📝 总结
                    </button>
                    <button onClick={() => handleAction('polish')} className="px-3 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 rounded text-xs text-[var(--text-primary)] transition-colors">
                        🎨 润色
                    </button>
                    <button onClick={() => handleAction('translate')} className="px-3 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 rounded text-xs text-[var(--text-primary)] transition-colors">
                        🌐 翻译
                    </button>
                </div>

                {/* 错误提示 */}
                {error && (
                    <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded border border-red-500/20">
                        {error}
                    </div>
                )}

                {/* 输入框 */}
                <div>
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="输入您的指令，或选择文本后点击上方按钮..."
                        className="w-full h-24 p-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg resize-none focus:border-[var(--accent)] outline-none text-sm"
                    />
                    <button
                        onClick={() => callAI(prompt)}
                        disabled={isLoading || !prompt.trim()}
                        className="mt-2 w-full py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        {isLoading ? '思考中...' : '发送'}
                    </button>
                </div>

                {/* 响应结果 */}
                {(response || isLoading) && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-[var(--text-secondary)]">AI 响应</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigator.clipboard.writeText(response)}
                                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                    title="复制"
                                >
                                    复制
                                </button>
                                <button
                                    onClick={() => insertText(response)}
                                    className="text-xs text-[var(--accent)] hover:underline"
                                    title="插入到编辑器"
                                >
                                    插入
                                </button>
                            </div>
                        </div>
                        <div className="p-3 bg-[var(--bg-tertiary)]/30 border border-[var(--border)] rounded-lg text-sm leading-relaxed min-h-[100px] whitespace-pre-wrap">
                            {response}
                            {isLoading && <span className="animate-pulse">...</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
