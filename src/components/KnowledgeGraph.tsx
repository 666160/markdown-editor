import { useMemo, useRef, useEffect } from 'react';
import type { Note } from '../types/index';
import { extractWikiLinks } from './WikiLinks';

interface GraphNode {
    id: string;
    label: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
}

interface GraphEdge {
    source: string;
    target: string;
}

interface KnowledgeGraphProps {
    notes: Note[];
    currentNoteId: string | null;
    onSelectNote: (noteId: string) => void;
    onClose: () => void;
}

// 知识图谱组件
export function KnowledgeGraph({ notes, currentNoteId, onSelectNote, onClose }: KnowledgeGraphProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const nodesRef = useRef<GraphNode[]>([]);
    const edgesRef = useRef<GraphEdge[]>([]);
    const dragNodeRef = useRef<GraphNode | null>(null);

    // 构建图数据
    const { nodes, edges } = useMemo(() => {
        const nodeMap = new Map<string, GraphNode>();
        const edgeList: GraphEdge[] = [];

        // 创建节点
        notes.forEach((note, index) => {
            const angle = (2 * Math.PI * index) / notes.length;
            const radius = 150;
            nodeMap.set(note.id, {
                id: note.id,
                label: note.title.slice(0, 15) + (note.title.length > 15 ? '...' : ''),
                x: 300 + radius * Math.cos(angle) + Math.random() * 50,
                y: 250 + radius * Math.sin(angle) + Math.random() * 50,
                vx: 0,
                vy: 0,
            });
        });

        // 创建边（基于双向链接）
        notes.forEach(note => {
            const links = extractWikiLinks(note.content);
            links.forEach(link => {
                const targetNote = notes.find(n =>
                    n.title.toLowerCase() === link.noteName.toLowerCase()
                );
                if (targetNote && targetNote.id !== note.id) {
                    edgeList.push({
                        source: note.id,
                        target: targetNote.id,
                    });
                }
            });
        });

        return {
            nodes: Array.from(nodeMap.values()),
            edges: edgeList
        };
    }, [notes]);

    // 力导向布局
    useEffect(() => {
        nodesRef.current = [...nodes];
        edgesRef.current = edges;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 力导向模拟
        const simulate = () => {
            const nodesList = nodesRef.current;
            const edgesList = edgesRef.current;

            // 斥力
            for (let i = 0; i < nodesList.length; i++) {
                for (let j = i + 1; j < nodesList.length; j++) {
                    const dx = nodesList[j].x - nodesList[i].x;
                    const dy = nodesList[j].y - nodesList[i].y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = 1000 / (dist * dist);

                    nodesList[i].vx -= (dx / dist) * force;
                    nodesList[i].vy -= (dy / dist) * force;
                    nodesList[j].vx += (dx / dist) * force;
                    nodesList[j].vy += (dy / dist) * force;
                }
            }

            // 引力（边）
            edgesList.forEach(edge => {
                const source = nodesList.find(n => n.id === edge.source);
                const target = nodesList.find(n => n.id === edge.target);
                if (!source || !target) return;

                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = (dist - 100) * 0.01;

                source.vx += (dx / dist) * force;
                source.vy += (dy / dist) * force;
                target.vx -= (dx / dist) * force;
                target.vy -= (dy / dist) * force;
            });

            // 向中心引力
            nodesList.forEach(node => {
                node.vx += (300 - node.x) * 0.001;
                node.vy += (250 - node.y) * 0.001;
            });

            // 更新位置
            nodesList.forEach(node => {
                if (node === dragNodeRef.current) return;
                node.vx *= 0.9;
                node.vy *= 0.9;
                node.x += node.vx;
                node.y += node.vy;
                // 边界约束
                node.x = Math.max(50, Math.min(550, node.x));
                node.y = Math.max(50, Math.min(450, node.y));
            });

            // 绘制
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim() || '#1a1a2e';
            ctx.fillRect(0, 0, 600, 500);

            // 绘制边
            ctx.strokeStyle = '#4a5568';
            ctx.lineWidth = 1;
            edgesList.forEach(edge => {
                const source = nodesList.find(n => n.id === edge.source);
                const target = nodesList.find(n => n.id === edge.target);
                if (!source || !target) return;

                ctx.beginPath();
                ctx.moveTo(source.x, source.y);
                ctx.lineTo(target.x, target.y);
                ctx.stroke();
            });

            // 绘制节点
            nodesList.forEach(node => {
                const isActive = node.id === currentNoteId;

                // 节点圆
                ctx.beginPath();
                ctx.arc(node.x, node.y, isActive ? 12 : 8, 0, Math.PI * 2);
                ctx.fillStyle = isActive ? '#10b981' : '#4a5568';
                ctx.fill();

                // 标签
                ctx.fillStyle = '#e2e8f0';
                ctx.font = isActive ? 'bold 11px sans-serif' : '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(node.label, node.x, node.y + 22);
            });

            animationRef.current = requestAnimationFrame(simulate);
        };

        simulate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [nodes, edges, currentNoteId]);

    // 点击处理
    const handleClick = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clickedNode = nodesRef.current.find(node => {
            const dx = node.x - x;
            const dy = node.y - y;
            return dx * dx + dy * dy < 400; // 半径20
        });

        if (clickedNode) {
            onSelectNote(clickedNode.id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">🕸️ 知识图谱</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-[var(--text-secondary)]">
                            {notes.length} 个笔记 · {edges.length} 条链接
                        </span>
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

                <canvas
                    ref={canvasRef}
                    width={600}
                    height={500}
                    onClick={handleClick}
                    className="cursor-pointer"
                />

                <div className="p-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] text-center">
                    点击节点跳转到笔记 · 使用 [[笔记名]] 创建链接
                </div>
            </div>
        </div>
    );
}
