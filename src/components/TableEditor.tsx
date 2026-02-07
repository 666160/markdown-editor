import { useState, useCallback } from 'react';

interface TableEditorProps {
    onInsert: (tableMarkdown: string) => void;
    onClose: () => void;
}

// 表格可视化编辑器
export function TableEditor({ onInsert, onClose }: TableEditorProps) {
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);
    const [data, setData] = useState<string[][]>(() =>
        Array(3).fill(null).map(() => Array(3).fill(''))
    );
    const [alignments, setAlignments] = useState<('left' | 'center' | 'right')[]>(
        Array(3).fill('left')
    );

    // 更新数据
    const updateCell = (row: number, col: number, value: string) => {
        const newData = [...data];
        newData[row] = [...newData[row]];
        newData[row][col] = value;
        setData(newData);
    };

    // 调整行数
    const adjustRows = (newRows: number) => {
        if (newRows < 1 || newRows > 10) return;
        const newData = [...data];
        if (newRows > rows) {
            for (let i = rows; i < newRows; i++) {
                newData.push(Array(cols).fill(''));
            }
        } else {
            newData.splice(newRows);
        }
        setData(newData);
        setRows(newRows);
    };

    // 调整列数
    const adjustCols = (newCols: number) => {
        if (newCols < 1 || newCols > 8) return;
        const newData = data.map(row => {
            const newRow = [...row];
            if (newCols > cols) {
                for (let i = cols; i < newCols; i++) {
                    newRow.push('');
                }
            } else {
                newRow.splice(newCols);
            }
            return newRow;
        });

        const newAlignments = [...alignments];
        if (newCols > cols) {
            for (let i = cols; i < newCols; i++) {
                newAlignments.push('left');
            }
        } else {
            newAlignments.splice(newCols);
        }

        setData(newData);
        setAlignments(newAlignments);
        setCols(newCols);
    };

    // 切换对齐方式
    const toggleAlignment = (colIndex: number) => {
        const newAlignments = [...alignments];
        const current = newAlignments[colIndex];
        newAlignments[colIndex] = current === 'left' ? 'center' : current === 'center' ? 'right' : 'left';
        setAlignments(newAlignments);
    };

    // 生成 Markdown 表格
    const generateMarkdown = useCallback(() => {
        const headerRow = data[0] || [];
        const bodyRows = data.slice(1);

        // 表头
        const header = '| ' + headerRow.map(cell => cell || '列标题').join(' | ') + ' |';

        // 分隔行
        const separator = '| ' + alignments.map(align => {
            if (align === 'center') return ':---:';
            if (align === 'right') return '---:';
            return '---';
        }).join(' | ') + ' |';

        // 数据行
        const body = bodyRows.map(row =>
            '| ' + row.map(cell => cell || ' ').join(' | ') + ' |'
        ).join('\n');

        return `${header}\n${separator}\n${body}`;
    }, [data, alignments]);

    // 插入表格
    const handleInsert = () => {
        const markdown = generateMarkdown();
        onInsert('\n' + markdown + '\n\n');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* 头部 */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">📊 表格编辑器</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 行列控制 */}
                <div className="p-4 border-b border-[var(--border)] flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--text-secondary)]">行数:</span>
                        <button onClick={() => adjustRows(rows - 1)} className="w-6 h-6 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">-</button>
                        <span className="w-6 text-center text-[var(--text-primary)]">{rows}</span>
                        <button onClick={() => adjustRows(rows + 1)} className="w-6 h-6 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">+</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--text-secondary)]">列数:</span>
                        <button onClick={() => adjustCols(cols - 1)} className="w-6 h-6 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">-</button>
                        <span className="w-6 text-center text-[var(--text-primary)]">{cols}</span>
                        <button onClick={() => adjustCols(cols + 1)} className="w-6 h-6 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">+</button>
                    </div>
                </div>

                {/* 表格编辑区 */}
                <div className="p-4 overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                {Array(cols).fill(null).map((_, colIndex) => (
                                    <th key={colIndex} className="p-1">
                                        <button
                                            onClick={() => toggleAlignment(colIndex)}
                                            className="w-full text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]
                                hover:bg-[var(--accent)]/20 transition-colors"
                                            title="点击切换对齐方式"
                                        >
                                            {alignments[colIndex] === 'left' ? '⬅️ 左' :
                                                alignments[colIndex] === 'center' ? '⬛ 中' : '➡️ 右'}
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                        <td key={colIndex} className="p-1">
                                            <input
                                                type="text"
                                                value={cell}
                                                onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                                                placeholder={rowIndex === 0 ? `列 ${colIndex + 1}` : ''}
                                                className={`w-full px-2 py-1.5 rounded border border-[var(--border)]
                                  bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm
                                  focus:outline-none focus:border-[var(--accent)]
                                  ${rowIndex === 0 ? 'font-semibold' : ''}`}
                                                style={{ textAlign: alignments[colIndex] }}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 预览 */}
                <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-tertiary)]/30">
                    <div className="text-xs text-[var(--text-secondary)] mb-2">Markdown 预览：</div>
                    <pre className="text-xs text-[var(--text-primary)] bg-[var(--bg-primary)] p-2 rounded overflow-x-auto">
                        {generateMarkdown()}
                    </pre>
                </div>

                {/* 底部按钮 */}
                <div className="p-4 border-t border-[var(--border)] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleInsert}
                        className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
                    >
                        插入表格
                    </button>
                </div>
            </div>
        </div>
    );
}
