import { useRef } from 'react';

interface ImportButtonProps {
    onImport: (notes: { title: string; content: string }[]) => void;
}

// 导入按钮组件
export function ImportButton({ onImport }: ImportButtonProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // 处理文件选择
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const importedNotes: { title: string; content: string }[] = [];

        for (const file of Array.from(files)) {
            // 只处理 .md 和 .txt 文件
            if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
                continue;
            }

            try {
                const content = await file.text();
                const title = file.name.replace(/\.(md|txt)$/, '');
                importedNotes.push({ title, content });
            } catch (error) {
                console.error(`读取文件 ${file.name} 失败:`, error);
            }
        }

        if (importedNotes.length > 0) {
            onImport(importedNotes);
        }

        // 清空 input 以便再次选择同一文件
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <label
            className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                 bg-[var(--bg-tertiary)] border border-[var(--border)]
                 text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                 hover:border-[var(--accent)] transition-all duration-200"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-sm">导入</span>
            <input
                ref={inputRef}
                type="file"
                accept=".md,.txt"
                multiple
                className="hidden"
                onChange={handleFileChange}
            />
        </label>
    );
}
