import { useRef, useState, useEffect, useMemo } from 'react';
import { useNotes } from './hooks/useNotes';
import { useSettings, SettingsPanel } from './components/Settings';
import { useTrash, TrashPanel } from './components/Trash';
import { useFolders, FolderList } from './components/Folders';
import { useTabs, TabBar } from './components/Tabs';
import { useFavorites, FavoriteButton } from './components/Favorites';
import { useQuickNote, QuickNoteWidget, QuickNoteFloatingButton } from './components/QuickNote';

import { useAutoSave, AutoSaveIndicator, useBeforeUnload } from './components/AutoSave';
import { useBatchActions, BatchActions } from './components/BatchActions';
import { useDiffViewer, DiffViewer } from './components/DiffViewer';
import { useEncryption, EncryptDialog, EncryptedBadge } from './components/Encryption';

import { SearchBar } from './components/SearchBar';
import { NoteList } from './components/NoteList';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { ExportButton } from './components/ExportButton';


import { WordCount } from './components/WordCount';
import { SortControl } from './components/SortAndBackup';
import { TemplatePicker } from './components/TemplatePicker';
import { EmojiPicker } from './components/EmojiPicker';
import { CommandPalette, createCommands } from './components/CommandPalette';
import { useDailyNote } from './components/DailyNote';

// New Components
import { useSyncScroll } from './components/SyncScroll';
import { HistoryPanel, useNoteHistory } from './components/NoteHistory';
import { TagCloud } from './components/TagCloud';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { FontSizeControl, ReadingMode, printNote } from './components/UserExperience';
import { PomodoroTimer } from './components/PomodoroTimer';
import { FloatingOutline } from './components/Outline';
import { WordFrequencyPanel } from './components/WordFrequency';
import { MarkdownHelp } from './components/MarkdownHelp';
import { ShortcutReference } from './components/ShortcutReference';
import { StatisticsPanel } from './components/Statistics';
import { TimelineView } from './components/Timeline';
import { NoteCalendar } from './components/NoteCalendar';
import { ActivityHeatmap } from './components/ActivityHeatmap';
import { BackupPanel } from './components/Backup';
import { LinkChecker } from './components/LinkChecker';
import { RandomReview } from './components/RandomNote';
import { AIAssistant } from './components/AIAssistant';
import type { EditorHandle } from './components/Editor';

function App() {
  // 核心 Hooks
  const {
    notes,
    allNotes,
    allTags,
    currentNote,
    currentNoteId,
    searchQuery,
    selectedTag,
    sortType,
    sortOrder,

    setSearchQuery,
    setSelectedTag,
    setSortType,
    setSortOrder,
    createNote,
    createNoteFromTemplate,
    updateNote,
    togglePin,
    addTag,
    deleteNote,
    selectNote,
    importNotes,
  } = useNotes();

  const { settings, updateSetting, resetSettings } = useSettings();
  const { folders, createFolder, deleteFolder, folderColors } = useFolders();
  const { trashedNotes, moveToTrash, restoreNote, permanentDelete, emptyTrash } = useTrash();
  const { tabs, activeTabId, setActiveTabId, openTab, closeTab, updateTabTitle } = useTabs();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { quickNotes, addQuickNote, removeQuickNote, clearQuickNotes } = useQuickNote();

  const { selectedIds, toggleSelect, selectAll, clearSelection } = useBatchActions();
  const { encryptContent, decryptContent, isEncrypted } = useEncryption();
  const diffViewer = useDiffViewer(allNotes);

  // 状态管理
  const [showSettings, setShowSettings] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showKnowledgeGraph, setShowKnowledgeGraph] = useState(false);
  const [showWordFrequency, setShowWordFrequency] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showLinkChecker, setShowLinkChecker] = useState(false);
  const [showRandomReview, setShowRandomReview] = useState(false);
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showOutline] = useState(true);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [encryptDialog, setEncryptDialog] = useState<{ isOpen: boolean; mode: 'encrypt' | 'decrypt' }>({ isOpen: false, mode: 'encrypt' });

  // Refs
  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorHandle>(null);

  // 过滤笔记
  const filteredNotes = useMemo(() => {
    let result = notes;
    if (selectedFolderId) {
      const folder = folders.find(f => f.id === selectedFolderId);
      if (folder) {
        result = result.filter(n => folder.noteIds.includes(n.id));
      }
    }
    return result;
  }, [notes, selectedFolderId, folders]);

  // 同步滚动
  useSyncScroll(editorRef, previewRef, true);

  // 笔记历史
  const { history, addVersion, restoreVersion } = useNoteHistory(currentNoteId);

  // 自动保存
  const { lastSaved: autoSavedTime, isSaving, hasChanges } = useAutoSave(
    currentNote?.content || '',
    () => {
      if (currentNote) {
        updateNote(currentNote.id, { content: currentNote.content });
        addVersion(currentNote.content);
      }
    },
    settings.autoSaveInterval * 1000
  );

  useBeforeUnload(hasChanges);

  // 处理笔记选择（联动标签页）
  const handleSelectNote = (noteId: string) => {
    selectNote(noteId);
    const note = allNotes.find(n => n.id === noteId);
    if (note) openTab(note);
  };

  // 处理标签页切换
  const handleTabSelect = (tabId: string) => {
    setActiveTabId(tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab) selectNote(tab.noteId);
  };

  // 处理删除
  const handleDeleteNote = (noteId: string) => {
    const note = allNotes.find(n => n.id === noteId);
    if (note) {
      moveToTrash(note);
      deleteNote(noteId);
      // 关闭对应的标签页
      const tab = tabs.find(t => t.noteId === noteId);
      if (tab) closeTab(tab.id);
    }
  };

  // 处理恢复笔记
  const handleRestoreNote = (noteId: string) => {
    const note = restoreNote(noteId);
    if (note) {
      importNotes([note]);
      // 如果有文件夹关联，需要重新检查，这里简单处理不恢复文件夹关联
    }
  };

  // 每日笔记
  const { openOrCreateDailyNote } = useDailyNote(allNotes, createNoteFromTemplate, handleSelectNote);

  // 命令配置
  const commands = useMemo(() => createCommands({
    createNote: () => { createNote(); },
    createDailyNote: openOrCreateDailyNote,
    toggleFullscreen: () => setIsFullscreen(p => !p),
    exportPdf: () => document.getElementById('export-pdf-trigger')?.click(),
    exportMd: () => document.getElementById('export-md-trigger')?.click(),
    showShortcuts: () => setShowShortcuts(true),
    showTemplates: () => setShowTemplates(true),
    toggleFocus: () => setIsFocusMode(p => !p),
    toggleReading: () => setIsReadingMode(p => !p),
    showGraph: () => setShowKnowledgeGraph(true),
    showStats: () => setShowStats(true),
    showHistory: () => setShowHistory(true),
  }), [createNote, openOrCreateDailyNote]);

  // 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCommandPalette) setShowCommandPalette(false);
        else if (isFullscreen) setIsFullscreen(false);
        else if (isReadingMode) setIsReadingMode(false);
        else if (showQuickNote) setShowQuickNote(false);
        else {
          setShowTemplates(false);
          setShowEmoji(false);
          setShowShortcuts(false);
        }
      }
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(p => !p);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette, isFullscreen, isReadingMode, showQuickNote]);

  return (
    <div className={`flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-${settings.fontFamily}
                    ${isFocusMode ? 'focus-mode' : ''} ${settings.wordWrap ? '' : 'no-wrap'}`}>

      {/* 模态框与弹窗 */}
      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} notes={allNotes} onSelectNote={handleSelectNote} commands={commands} />
      {showSettings && <SettingsPanel settings={settings} onUpdateSetting={updateSetting} onReset={resetSettings} onClose={() => setShowSettings(false)} />}
      {showTrash && <TrashPanel notes={trashedNotes} onRestore={handleRestoreNote} onDelete={permanentDelete} onEmpty={emptyTrash} onClose={() => setShowTrash(false)} />}
      {showStats && <StatisticsPanel notes={allNotes} onClose={() => setShowStats(false)} />}
      {showQuickNote && <QuickNoteWidget quickNotes={quickNotes} onAdd={addQuickNote} onRemove={removeQuickNote} onClear={clearQuickNotes} onConvertToNote={(content) => { createNote(); setTimeout(() => updateNote(currentNoteId!, { content }), 100); }} onClose={() => setShowQuickNote(false)} />}
      {showBatchActions && <BatchActions notes={filteredNotes} selectedIds={selectedIds} onSelectAll={() => selectAll(filteredNotes.map(n => n.id))} onClearSelection={clearSelection} onToggleSelect={toggleSelect} onDelete={(ids) => { ids.forEach(handleDeleteNote); clearSelection(); setShowBatchActions(false); }} onAddTag={(ids, tag) => { ids.forEach(id => addTag(id, tag)); clearSelection(); setShowBatchActions(false); }} onExport={(_ids) => { /* 导出逻辑 */ }} onClose={() => setShowBatchActions(false)} />}
      {showHistory && currentNote && <HistoryPanel noteId={currentNote.id} versions={history} onRestore={(v) => { restoreVersion(v); updateNote(currentNote.id, { content: v.content }); }} onClose={() => setShowHistory(false)} />}
      {showKnowledgeGraph && <div className="fixed inset-0 z-50 bg-[var(--bg-primary)]"><KnowledgeGraph notes={allNotes} currentNoteId={currentNoteId} onSelectNote={(id) => { handleSelectNote(id); setShowKnowledgeGraph(false); }} onClose={() => setShowKnowledgeGraph(false)} /></div>}
      {showWordFrequency && currentNote && <WordFrequencyPanel content={currentNote.content} onClose={() => setShowWordFrequency(false)} />}
      {showBackup && <BackupPanel notes={allNotes} onRestore={(notes) => { importNotes(notes); }} onClose={() => setShowBackup(false)} />}
      {showTimeline && <TimelineView notes={allNotes} onSelectNote={handleSelectNote} onClose={() => setShowTimeline(false)} />}
      {showCalendar && <NoteCalendar notes={allNotes} onSelectNote={handleSelectNote} onClose={() => setShowCalendar(false)} />}
      {showHeatmap && <ActivityHeatmap notes={allNotes} onClose={() => setShowHeatmap(false)} />}
      {showLinkChecker && <LinkChecker notes={allNotes} onSelectNote={handleSelectNote} onClose={() => setShowLinkChecker(false)} />}
      {showRandomReview && <RandomReview notes={allNotes} onSelectNote={handleSelectNote} onClose={() => setShowRandomReview(false)} />}
      {showMarkdownHelp && <MarkdownHelp onInsert={(text) => { if (currentNote) updateNote(currentNote.id, { content: currentNote.content + text }); }} onClose={() => setShowMarkdownHelp(false)} />}
      {showShortcuts && <ShortcutReference onClose={() => setShowShortcuts(false)} />}
      {showTemplates && <TemplatePicker onSelect={(t) => { createNoteFromTemplate(t.name, t.content); setShowTemplates(false); }} onClose={() => setShowTemplates(false)} />}
      {showEmoji && <EmojiPicker onClose={() => setShowEmoji(false)} onSelect={(emoji) => { if (currentNote) updateNote(currentNote.id, { content: currentNote.content + emoji }); }} />}
      {diffViewer.showDiff && <DiffViewer note1={diffViewer.leftNote} note2={diffViewer.rightNote} notes={allNotes} onSelectNote={diffViewer.handleSelectNote} onClose={() => diffViewer.setShowDiff(false)} />}
      {encryptDialog.isOpen && <EncryptDialog mode={encryptDialog.mode} onConfirm={(password) => { if (currentNote) { const content = encryptDialog.mode === 'encrypt' ? encryptContent(currentNote.content, password) : decryptContent(currentNote.content, password); if (content !== null) updateNote(currentNote.id, { content }); else alert('密码错误'); setEncryptDialog({ ...encryptDialog, isOpen: false }); } }} onClose={() => setEncryptDialog({ ...encryptDialog, isOpen: false })} />}
      {showAIAssistant && <AIAssistant editorRef={editorRef} onClose={() => setShowAIAssistant(false)} />}

      {isReadingMode ? (
        <ReadingMode content={currentNote?.content || ''} title={currentNote?.title || ''} onClose={() => setIsReadingMode(false)} />
      ) : (
        <>
          {/* 左侧边栏 */}
          {!isFullscreen && (
            <aside className="w-72 flex-shrink-0 flex flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)]"
              style={{ width: settings.sidebarWidth }}>
              {/* 顶部工具栏 */}
              <div className="p-4 border-b border-[var(--border)]">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-lg font-bold text-[var(--accent)] flex items-center gap-2">
                    Markdown
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--accent)] text-white">Pro</span>
                  </h1>
                  <div className="flex items-center gap-1">
                    <button onClick={openOrCreateDailyNote} className="p-2 rounded hover:bg-[var(--bg-tertiary)]" title="今日笔记">📅</button>
                    <button onClick={() => setShowSettings(true)} className="p-2 rounded hover:bg-[var(--bg-tertiary)]" title="设置">⚙️</button>
                  </div>
                </div>
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setShowBatchActions(true)} className="text-xs text-[var(--accent)] hover:underline">批量操作</button>
                  <button onClick={() => diffViewer.setShowDiff(true)} className="text-xs text-[var(--text-secondary)] hover:underline">分屏对比</button>
                </div>
              </div>

              {/* 文件夹与分类 */}
              <div className="flex-1 overflow-y-auto">
                <FolderList
                  folders={folders}
                  selectedFolderId={selectedFolderId}
                  onSelect={setSelectedFolderId}
                  onCreate={createFolder}
                  onDelete={deleteFolder}
                  notes={allNotes}
                />

                <div className="px-2 py-2">
                  <h3 className="text-xs font-medium text-[var(--text-secondary)] px-2 mb-1">标签</h3>
                  <TagCloud notes={allNotes} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
                </div>

                <div className="px-2 py-2">
                  <div className="flex items-center justify-between px-2 mb-1">
                    <h3 className="text-xs font-medium text-[var(--text-secondary)]">笔记列表</h3>
                    <SortControl sortType={sortType} sortOrder={sortOrder} onSortTypeChange={setSortType} onSortOrderChange={setSortOrder} />
                  </div>
                  <NoteList
                    notes={filteredNotes}
                    currentNoteId={currentNoteId}
                    onSelect={handleSelectNote}
                    onDelete={handleDeleteNote}
                    onTogglePin={togglePin}
                  />
                </div>
              </div>

              {/* 底部工具栏 */}
              <div className="p-3 border-t border-[var(--border)] grid grid-cols-4 gap-1">
                <button onClick={() => setShowTrash(true)} className="p-2 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]" title="回收站">🗑️</button>
                <button onClick={() => setShowStats(true)} className="p-2 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]" title="统计">📊</button>
                <button onClick={() => setShowBackup(true)} className="p-2 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]" title="备份">💾</button>
              </div>
            </aside>
          )}

          {/* 主内容区 */}
          <main className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)]">
            {currentNote ? (
              <>
                {/* 标签栏 */}
                <TabBar tabs={tabs} activeTabId={activeTabId} onSelect={handleTabSelect} onClose={(id) => closeTab(id)} />

                {/* 顶部工具栏 */}
                <header className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                  <div className="flex items-center gap-2">
                    <FavoriteButton isFavorite={isFavorite(currentNote.id)} onToggle={() => toggleFavorite(currentNote.id)} />
                    {currentNote.isPinned && <span title="已置顶">📌</span>}
                    {isEncrypted(currentNote.content) && <EncryptedBadge onClick={() => setEncryptDialog({ isOpen: true, mode: 'decrypt' })} />}
                    <span className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                      <AutoSaveIndicator lastSaved={autoSavedTime} isSaving={isSaving} hasChanges={hasChanges} />
                      {currentNote.updatedAt && <span> 更新于 {new Date(currentNote.updatedAt).toLocaleTimeString()}</span>}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <PomodoroTimer />
                    <div className="h-4 w-px bg-[var(--border)]" />
                    <FontSizeControl
                      fontSize={settings.fontSize}
                      onIncrease={() => updateSetting('fontSize', Math.min(settings.fontSize + 1, 32))}
                      onDecrease={() => updateSetting('fontSize', Math.max(settings.fontSize - 1, 12))}
                      onReset={() => updateSetting('fontSize', 16)}
                    />
                    <button onClick={() => setIsReadingMode(true)} className="p-1.5 rounded hover:bg-[var(--bg-tertiary)]" title="阅读模式">📖</button>
                    <button onClick={() => setIsFocusMode(p => !p)} className={`p-1.5 rounded hover:bg-[var(--bg-tertiary)] ${isFocusMode ? 'text-[var(--accent)]' : ''}`} title="专注模式">🎯</button>
                    <button onClick={() => setShowAIAssistant(p => !p)} className={`p-1.5 rounded hover:bg-[var(--bg-tertiary)] ${showAIAssistant ? 'text-[var(--accent)]' : ''}`} title="AI 助手">✨</button>
                    <button onClick={() => printNote(previewRef, currentNote.title)} className="p-1.5 rounded hover:bg-[var(--bg-tertiary)]" title="打印">🖨️</button>
                    <div className="h-4 w-px bg-[var(--border)]" />
                    <ExportButton previewRef={previewRef} title={currentNote.title} content={currentNote.content} />
                  </div>
                </header>

                {/* 编辑与预览分离容器 */}
                <div className="flex-1 flex min-h-0 relative">
                  {/* 编辑器 */}
                  <div className={`${isFullscreen ? 'flex-1' : 'w-1/2'} flex flex-col border-r border-[var(--border)]`}>
                    {/* 编辑工具栏 */}
                    <div className="px-2 py-1 border-b border-[var(--border)] flex items-center gap-1 bg-[var(--bg-tertiary)]/20">
                      {['**', '*', '~~', '`', '```', '>', '-', '1.', '- [ ]', 'link', 'image', 'table'].map(tool => (
                        <button key={tool} className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-xs font-mono text-[var(--text-secondary)]">
                          {tool}
                        </button>
                      ))}
                      <div className="flex-1" />
                      <button onClick={() => setShowMarkdownHelp(true)} className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Markdown 语法</button>
                    </div>

                    <div className="flex-1 relative">
                      <Editor
                        ref={editorRef}
                        title={currentNote.title}
                        content={currentNote.content}
                        onTitleChange={(title) => { updateNote(currentNote.id, { title }); updateTabTitle(currentNote.id, title); }}
                        onContentChange={(content) => updateNote(currentNote.id, { content })}
                        fontSize={settings.fontSize}
                        lineHeight={settings.lineHeight}
                        wordWrap={settings.wordWrap}
                      />
                      {/* 浮动大纲 */}
                      {showOutline && <FloatingOutline content={currentNote.content} onNavigate={(line) => {
                        if (editorRef.current?.element) {
                          const lineHeight = settings.fontSize * settings.lineHeight;
                          editorRef.current.element.scrollTop = (line - 1) * lineHeight;
                        }
                      }} />}
                    </div>

                    <div className="px-4 py-1 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] flex justify-between bg-[var(--bg-tertiary)]/20">
                      <div className="flex items-center gap-4">
                        <WordCount content={currentNote.content} />
                        <AutoSaveIndicator lastSaved={autoSavedTime} isSaving={isSaving} hasChanges={hasChanges} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setShowHistory(true)}>历史版本</button>
                        <button onClick={() => setShowWordFrequency(true)}>词频</button>
                        <button onClick={() => setEncryptDialog({ isOpen: true, mode: 'encrypt' })}>加密</button>
                      </div>
                    </div>
                  </div>

                  {/* 预览 */}
                  {!isFullscreen && (
                    <div className="w-1/2 flex flex-col bg-[var(--bg-secondary)]">
                      <div className="flex-1 overflow-auto" ref={previewRef}>
                        <Preview content={currentNote.content} />
                      </div>
                      {/* 底部工具 */}
                      <div className="px-4 py-1 border-t border-[var(--border)] flex justify-between">
                        <TemplatePicker onSelect={(t) => updateNote(currentNote.id, { content: t.content })} minimalist />
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)]">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Markdown Pro</h2>
                <div className="flex gap-4 mt-8">
                  <div className="text-center p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] cursor-pointer hover:border-[var(--accent)] transition-all" onClick={createNote}>
                    <div className="text-2xl mb-2">📄</div>
                    <div className="font-medium">新建笔记</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] cursor-pointer hover:border-[var(--accent)] transition-all" onClick={() => setShowTemplates(true)}>
                    <div className="text-2xl mb-2">📑</div>
                    <div className="font-medium">使用模板</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] cursor-pointer hover:border-[var(--accent)] transition-all" onClick={() => setShowQuickNote(true)}>
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="font-medium">快速笔记</div>
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-3 gap-8 text-center text-sm opacity-60">
                  <div>
                    <div className="text-lg font-bold">{allNotes.length}</div>
                    <div>笔记总数</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{allTags.length}</div>
                    <div>标签总数</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{folderColors.length}</div>
                    <div>文件夹颜色</div>
                  </div>
                </div>
              </div>
            )}

            <QuickNoteFloatingButton onClick={() => setShowQuickNote(true)} />
          </main>
        </>
      )}
    </div>
  );
}

export default App;
