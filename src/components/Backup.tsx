import { useState } from 'react';
import type { Note } from '../types/index';

const BACKUP_PREFIX = 'markdown-backup-';

interface BackupInfo {
    id: string;
    timestamp: number;
    noteCount: number;
    size: number;
}

// 创建备份
export function createBackup(notes: Note[]): BackupInfo {
    const id = `${BACKUP_PREFIX}${Date.now()}`;
    const data = JSON.stringify(notes);
    localStorage.setItem(id, data);

    return {
        id,
        timestamp: Date.now(),
        noteCount: notes.length,
        size: data.length,
    };
}

// 获取所有备份
export function getBackups(): BackupInfo[] {
    const backups: BackupInfo[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(BACKUP_PREFIX)) {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    const notes = JSON.parse(data) as Note[];
                    const timestamp = parseInt(key.replace(BACKUP_PREFIX, ''));
                    backups.push({
                        id: key,
                        timestamp,
                        noteCount: notes.length,
                        size: data.length,
                    });
                } catch { }
            }
        }
    }

    return backups.sort((a, b) => b.timestamp - a.timestamp);
}

// 恢复备份
export function restoreBackup(backupId: string): Note[] | null {
    const data = localStorage.getItem(backupId);
    if (data) {
        try {
            return JSON.parse(data);
        } catch { }
    }
    return null;
}

// 删除备份
export function deleteBackup(backupId: string): void {
    localStorage.removeItem(backupId);
}

// 导出备份文件
export function exportBackupFile(notes: Note[]): void {
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `markdown-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// 导入备份文件
export function importBackupFile(file: File): Promise<Note[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const notes = JSON.parse(reader.result as string);
                resolve(notes);
            } catch {
                reject(new Error('无效的备份文件'));
            }
        };
        reader.onerror = () => reject(new Error('读取文件失败'));
        reader.readAsText(file);
    });
}

interface BackupPanelProps {
    notes: Note[];
    onRestore: (notes: Note[]) => void;
    onClose: () => void;
}

// 备份恢复面板
export function BackupPanel({ notes, onRestore, onClose }: BackupPanelProps) {
    const [backups, setBackups] = useState<BackupInfo[]>(getBackups);
    const [importing, setImporting] = useState(false);

    const handleCreateBackup = () => {
        const backup = createBackup(notes);
        setBackups(prev => [backup, ...prev]);
    };

    const handleRestore = (backupId: string) => {
        if (confirm('恢复备份将覆盖当前所有笔记，确定继续吗？')) {
            const restoredNotes = restoreBackup(backupId);
            if (restoredNotes) {
                onRestore(restoredNotes);
                onClose();
            }
        }
    };

    const handleDelete = (backupId: string) => {
        if (confirm('确定删除此备份吗？')) {
            deleteBackup(backupId);
            setBackups(prev => prev.filter(b => b.id !== backupId));
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const importedNotes = await importBackupFile(file);
            if (confirm(`导入 ${importedNotes.length} 篇笔记将覆盖当前所有笔记，确定继续吗？`)) {
                onRestore(importedNotes);
                onClose();
            }
        } catch (error) {
            alert('导入失败：' + (error as Error).message);
        } finally {
            setImporting(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[500px] max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">💾 备份与恢复</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 操作按钮 */}
                <div className="p-4 border-b border-[var(--border)] flex flex-wrap gap-2">
                    <button
                        onClick={handleCreateBackup}
                        className="px-3 py-1.5 rounded-lg text-sm bg-[var(--accent)] text-white hover:opacity-90"
                    >
                        创建备份
                    </button>
                    <button
                        onClick={() => exportBackupFile(notes)}
                        className="px-3 py-1.5 rounded-lg text-sm bg-green-500/20 text-green-500 hover:bg-green-500/30"
                    >
                        导出文件
                    </button>
                    <label className="px-3 py-1.5 rounded-lg text-sm bg-blue-500/20 text-blue-500
                          hover:bg-blue-500/30 cursor-pointer">
                        {importing ? '导入中...' : '导入文件'}
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                            disabled={importing}
                        />
                    </label>
                </div>

                {/* 备份列表 */}
                <div className="max-h-80 overflow-y-auto">
                    {backups.length === 0 ? (
                        <div className="p-8 text-center text-[var(--text-secondary)]">
                            <div className="text-3xl mb-2 opacity-30">💾</div>
                            <p>暂无备份</p>
                            <p className="text-xs mt-1 opacity-70">点击"创建备份"保存当前数据</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border)]">
                            {backups.map(backup => (
                                <div key={backup.id} className="p-3 hover:bg-[var(--bg-tertiary)] transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-[var(--text-primary)]">
                                                {new Date(backup.timestamp).toLocaleString('zh-CN')}
                                            </div>
                                            <div className="text-xs text-[var(--text-secondary)] mt-1">
                                                {backup.noteCount} 篇笔记 · {formatSize(backup.size)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleRestore(backup.id)}
                                                className="px-2 py-1 rounded text-xs text-green-500 hover:bg-green-500/10"
                                            >
                                                恢复
                                            </button>
                                            <button
                                                onClick={() => handleDelete(backup.id)}
                                                className="px-2 py-1 rounded text-xs text-red-500 hover:bg-red-500/10"
                                            >
                                                删除
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] text-center">
                    备份存储在浏览器本地，建议定期导出文件
                </div>
            </div>
        </div>
    );
}
