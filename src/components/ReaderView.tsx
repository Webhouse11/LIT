import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Book, Chapter } from '../types';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Bookmark as BookmarkIcon,
  Sliders,
  List,
  Lock,
  Maximize2,
  Minimize2,
  Coins,
  Check,
  Eye,
  EyeOff,
  AlignLeft,
  AlignJustify,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { AdSlot } from './AdSlot';

interface ReaderViewProps {
  book: Book;
  initialChapterId?: string;
  onBack: () => void;
  onOpenUnlockModal: () => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  book,
  initialChapterId,
  onBack,
  onOpenUnlockModal,
}) => {
  const {
    chaptersMap,
    isBookUnlocked,
    saveBookmark,
    saveProgress,
    readingPrefs,
    setReadingPreferences,
    bookmarks,
    readingProgress,
  } = useApp();

  const chapters: Chapter[] = chaptersMap[book.id] || [];

  // Determine starting chapter index:
  // Prefer explicit initialChapterId, or saved progress for this book, or first chapter
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(() => {
    if (initialChapterId) {
      const idx = chapters.findIndex(c => c.id === initialChapterId);
      if (idx !== -1) return idx;
    }
    const saved = readingProgress[book.id];
    if (saved?.chapterId) {
      const idx = chapters.findIndex(c => c.id === saved.chapterId);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  const [distractionFree, setDistractionFree] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [bookmarkedToast, setBookmarkedToast] = useState<string | null>(null);
  const [textAlign, setTextAlign] = useState<'left' | 'justify'>('justify');
  const [showResumeBanner, setShowResumeBanner] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentChapter = chapters[currentChapterIndex] || chapters[0];

  const unlocked = isBookUnlocked(book);
  const isChapterLocked = currentChapter?.isPremium && !unlocked;

  // Bookmarks for this specific book
  const bookBookmarks = useMemo(() => {
    return bookmarks.filter(b => b.bookId === book.id);
  }, [bookmarks, book.id]);

  const isCurrentBookmarked = bookBookmarks.some(
    b => b.chapterId === currentChapter?.id
  );

  // Word count & reading time estimate
  const stats = useMemo(() => {
    if (!currentChapter?.content) return { words: 0, mins: 1 };
    const words = currentChapter.content.trim().split(/\s+/).length;
    const mins = Math.max(1, Math.ceil(words / 220));
    return { words, mins };
  }, [currentChapter?.content]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowLeft' && currentChapterIndex > 0) {
        setCurrentChapterIndex(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentChapterIndex < chapters.length - 1) {
        if (!isChapterLocked) {
          setCurrentChapterIndex(prev => prev + 1);
        }
      } else if (e.key.toLowerCase() === 'b') {
        handleBookmark();
      } else if (e.key.toLowerCase() === 'd') {
        setDistractionFree(prev => !prev);
      } else if (e.key === 'Escape') {
        setShowSettings(false);
        setShowToc(false);
        setDistractionFree(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapterIndex, chapters.length, isChapterLocked]);

  // Scroll tracking & automatic progress saving
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const totalHeight = container.scrollHeight - container.clientHeight;
      if (totalHeight <= 0) {
        setScrollProgress(100);
        return;
      }
      const current = Math.min(100, Math.max(0, Math.round((container.scrollTop / totalHeight) * 100)));
      setScrollProgress(current);

      if (currentChapter && !isChapterLocked) {
        saveProgress(book.id, currentChapter.id, currentChapter.chapterNumber, current);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Check if we have previous progress to restore for this chapter
    const saved = readingProgress[book.id];
    if (saved && saved.chapterId === currentChapter?.id && saved.progressPercent > 5) {
      setShowResumeBanner(true);
      setTimeout(() => setShowResumeBanner(false), 4500);
    }

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [currentChapterIndex, book.id, isChapterLocked]);

  // Reset scroll on chapter change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollProgress(0);
    }
  }, [currentChapterIndex]);

  const handleBookmark = () => {
    if (!currentChapter) return;
    saveBookmark(book.id, currentChapter.id, scrollProgress);
    setBookmarkedToast(`Bookmark saved at ${scrollProgress}%`);
    setTimeout(() => setBookmarkedToast(null), 2500);
  };

  const handleResumePosition = () => {
    const saved = readingProgress[book.id];
    if (!saved || !containerRef.current) return;
    const totalHeight = containerRef.current.scrollHeight - containerRef.current.clientHeight;
    containerRef.current.scrollTo({
      top: (totalHeight * saved.progressPercent) / 100,
      behavior: 'smooth',
    });
    setShowResumeBanner(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Theme Styling
  const themeStyles = {
    light: 'bg-[#faf8f5] text-[#1c1917]',
    sepia: 'bg-[#f5ecdc] text-[#382a1c]',
    dark: 'bg-[#18181b] text-[#e4e4e7]',
    night: 'bg-[#090a0f] text-[#cbd5e1]',
  }[readingPrefs.theme || 'light'];

  const themeChromeStyles = {
    light: 'bg-[#faf8f5]/95 border-stone-200/70 text-stone-800',
    sepia: 'bg-[#f5ecdc]/95 border-[#e2d5bd] text-[#382a1c]',
    dark: 'bg-[#18181b]/95 border-stone-800 text-stone-200',
    night: 'bg-[#090a0f]/95 border-stone-900 text-stone-300',
  }[readingPrefs.theme || 'light'];

  const fontSizeClass = {
    sm: 'text-sm md:text-base',
    base: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl',
    xl: 'text-xl md:text-2xl',
    '2xl': 'text-2xl md:text-3xl',
  }[readingPrefs.fontSize || 'base'];

  const lineHeightClass = {
    normal: 'leading-normal md:leading-relaxed',
    relaxed: 'leading-relaxed md:leading-[1.85]',
    loose: 'leading-loose md:leading-[2.2]',
  }[readingPrefs.lineHeight || 'relaxed'];

  const maxWidthClass = {
    narrow: 'max-w-xl', // 576px - optimal for focused reading & poetry
    medium: 'max-w-2xl', // 672px - 65-75 chars per line
    wide: 'max-w-4xl',   // 896px - expanded broadsheet
  }[readingPrefs.maxWidth || 'medium'];

  const fontFaceClass = readingPrefs.fontFace === 'sans' ? 'font-sans' : 'font-editorial';

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${themeStyles} select-text transition-colors duration-200 overflow-hidden`}
    >
      {/* Top Reading Navigation Bar (Distraction-Free Auto Hide) */}
      <header
        className={`shrink-0 h-14 md:h-16 border-b px-4 md:px-8 flex items-center justify-between backdrop-blur-md z-30 transition-transform duration-300 ${
          themeChromeStyles
        } ${distractionFree ? '-translate-y-full pointer-events-none' : 'translate-y-0'}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
            title="Return to Book Overview"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </button>

          <div className="h-4 w-px bg-stone-300/60 dark:bg-stone-700 hidden sm:block shrink-0" />

          {/* Book Title & Chapter Indicator */}
          <div className="truncate min-w-0">
            <span className="text-[11px] font-medium opacity-65 truncate block">
              {book.title}
            </span>
            <span className="text-xs md:text-sm font-display font-bold truncate block">
              {currentChapter ? currentChapter.title : 'Reading Chapter'}
            </span>
          </div>
        </div>

        {/* Right Reading Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Table of Contents Drawer Toggle */}
          <button
            onClick={() => {
              setShowToc(!showToc);
              setShowSettings(false);
            }}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              showToc ? 'bg-amber-600/20 text-amber-700 dark:text-amber-300' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title="Table of Contents (Chapters & Bookmarks)"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isCurrentBookmarked
                ? 'text-amber-600 dark:text-amber-400'
                : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title="Save Bookmark (Press 'B')"
          >
            <BookmarkIcon className={`w-4 h-4 ${isCurrentBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Typography & Appearance Drawer Toggle */}
          <button
            onClick={() => {
              setShowSettings(!showSettings);
              setShowToc(false);
            }}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              showSettings ? 'bg-amber-600/20 text-amber-700 dark:text-amber-300' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title="Typography, Margins & Themes"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Distraction-Free Toggle */}
          <button
            onClick={() => setDistractionFree(true)}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Enter Distraction-Free Focus Mode (Press 'D')"
          >
            <EyeOff className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle (Desktop) */}
          <button
            onClick={toggleFullscreen}
            className="hidden lg:flex p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Reading Progress Line */}
      <div
        className={`w-full h-1 shrink-0 bg-black/5 dark:bg-white/10 transition-opacity duration-300 ${
          distractionFree ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          className="h-full bg-amber-600 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Distraction-Free Exit Button & Floating HUD */}
      {distractionFree && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2 animate-in fade-in duration-200">
          <button
            onClick={() => setDistractionFree(false)}
            className="px-3 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-xs font-medium hover:bg-stone-900 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            title="Exit Focus Mode (or press Escape)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Show Controls</span>
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {bookmarkedToast && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <BookmarkIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
          {bookmarkedToast}
        </div>
      )}

      {/* Resume Position Banner */}
      {showResumeBanner && (
        <div className="fixed bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 z-40 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-4 text-xs animate-in slide-in-from-bottom-4 duration-200 max-w-sm w-full mx-4">
          <div className="flex-1">
            <span className="font-bold block">Resume reading?</span>
            <span className="text-stone-300 text-[11px]">
              You were at {readingProgress[book.id]?.progressPercent}% in this chapter.
            </span>
          </div>
          <button
            onClick={handleResumePosition}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors shrink-0"
          >
            Jump
          </button>
          <button
            onClick={() => setShowResumeBanner(false)}
            className="text-stone-400 hover:text-white text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Table of Contents & Bookmarks Drawer */}
      {showToc && (
        <aside
          className={`absolute top-14 md:top-16 left-0 bottom-0 w-80 md:w-96 shadow-2xl z-40 p-6 overflow-y-auto border-r animate-in slide-in-from-left duration-200 ${themeChromeStyles}`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-5">
            <div>
              <h4 className="font-display font-bold text-sm tracking-wide">
                Table of Contents
              </h4>
              <span className="text-xs opacity-60">
                {chapters.length} Chapters · {stats.words} words
              </span>
            </div>
            <button
              onClick={() => setShowToc(false)}
              className="text-xs font-semibold opacity-60 hover:opacity-100 cursor-pointer"
            >
              Close
            </button>
          </div>

          {/* Chapters List */}
          <div className="space-y-1 mb-6">
            {chapters.map((ch, idx) => {
              const isSelected = idx === currentChapterIndex;
              const isLocked = ch.isPremium && !unlocked;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    setCurrentChapterIndex(idx);
                    setShowToc(false);
                  }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-600/15 font-bold border-l-3 border-amber-600 text-amber-900 dark:text-amber-200'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="text-[10px] font-mono opacity-50 block">
                      Chapter {ch.chapterNumber}
                    </span>
                    <span className="truncate">{ch.title}</span>
                  </div>
                  {isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  ) : (
                    isSelected && <span className="text-[10px] text-amber-700 font-bold shrink-0">Reading</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Saved Bookmarks for this Book */}
          {bookBookmarks.length > 0 && (
            <div className="pt-4 border-t border-black/10 dark:border-white/10">
              <h5 className="font-display font-bold text-xs uppercase tracking-wider mb-3 opacity-70">
                Saved Bookmarks ({bookBookmarks.length})
              </h5>
              <div className="space-y-1.5">
                {bookBookmarks.map(bm => (
                  <button
                    key={bm.id}
                    onClick={() => {
                      const idx = chapters.findIndex(c => c.id === bm.chapterId);
                      if (idx !== -1) setCurrentChapterIndex(idx);
                      setShowToc(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg text-xs bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">{bm.chapterTitle}</span>
                    <span className="font-mono text-[10px] opacity-60 shrink-0">
                      {bm.progressPercent}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Typography & Appearance Control Drawer */}
      {showSettings && (
        <div
          className={`absolute top-14 md:top-16 right-0 w-80 md:w-96 shadow-2xl z-40 p-6 rounded-bl-3xl border-l border-b animate-in slide-in-from-right duration-200 max-h-[85vh] overflow-y-auto ${themeChromeStyles}`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-5">
            <h4 className="font-display font-bold text-sm tracking-wide">
              Reader Appearance
            </h4>
            <button
              onClick={() => setShowSettings(false)}
              className="text-xs font-semibold opacity-60 hover:opacity-100 cursor-pointer"
            >
              Done
            </button>
          </div>

          {/* Theme Palette */}
          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
              Color Palette
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'light', label: 'Paper', bg: 'bg-[#faf8f5]', text: 'text-[#1c1917]', border: 'border-stone-300' },
                { id: 'sepia', label: 'Sepia', bg: 'bg-[#f5ecdc]', text: 'text-[#382a1c]', border: 'border-[#e2d5bd]' },
                { id: 'dark', label: 'Slate', bg: 'bg-[#18181b]', text: 'text-[#e4e4e7]', border: 'border-stone-700' },
                { id: 'night', label: 'Midnight', bg: 'bg-[#090a0f]', text: 'text-[#cbd5e1]', border: 'border-stone-800' },
              ].map(th => (
                <button
                  key={th.id}
                  onClick={() => setReadingPreferences({ theme: th.id as any })}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${th.bg} ${th.text} ${th.border} ${
                    readingPrefs.theme === th.id
                      ? 'ring-2 ring-amber-600 shadow-sm font-bold'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="text-[11px]">{th.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Typeface Selection */}
          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
              Typeface
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setReadingPreferences({ fontFace: 'serif' })}
                className={`py-2 px-3 rounded-xl border text-xs font-editorial cursor-pointer ${
                  readingPrefs.fontFace === 'serif'
                    ? 'border-amber-600 bg-amber-600/10 font-bold'
                    : 'border-black/10 dark:border-white/10 opacity-70'
                }`}
              >
                Editorial Lora (Serif)
              </button>
              <button
                onClick={() => setReadingPreferences({ fontFace: 'sans' })}
                className={`py-2 px-3 rounded-xl border text-xs font-sans cursor-pointer ${
                  readingPrefs.fontFace === 'sans'
                    ? 'border-amber-600 bg-amber-600/10 font-bold'
                    : 'border-black/10 dark:border-white/10 opacity-70'
                }`}
              >
                Modern Jakarta (Sans)
              </button>
            </div>
          </div>

          {/* Font Size Steps */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider opacity-60">
                Text Size
              </label>
              <span className="font-mono text-xs opacity-70 uppercase font-semibold">
                {readingPrefs.fontSize || 'base'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {(['sm', 'base', 'lg', 'xl', '2xl'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setReadingPreferences({ fontSize: size })}
                  className={`py-1.5 rounded-lg border text-xs font-semibold text-center cursor-pointer ${
                    readingPrefs.fontSize === size
                      ? 'border-amber-600 bg-amber-600/15 font-bold'
                      : 'border-black/10 dark:border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Column Width */}
          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
              Measure / Column Width
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'narrow', label: 'Narrow (580px)' },
                { id: 'medium', label: 'Standard (680px)' },
                { id: 'wide', label: 'Wide (900px)' },
              ].map(w => (
                <button
                  key={w.id}
                  onClick={() => setReadingPreferences({ maxWidth: w.id as any })}
                  className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold text-center cursor-pointer ${
                    readingPrefs.maxWidth === w.id
                      ? 'border-amber-600 bg-amber-600/15 font-bold'
                      : 'border-black/10 dark:border-white/10 opacity-70'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Line Height */}
          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
              Line Spacing
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: 'Compact' },
                { id: 'relaxed', label: 'Relaxed' },
                { id: 'loose', label: 'Spacious' },
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => setReadingPreferences({ lineHeight: l.id as any })}
                  className={`py-1.5 rounded-lg border text-xs font-semibold text-center cursor-pointer ${
                    readingPrefs.lineHeight === l.id
                      ? 'border-amber-600 bg-amber-600/15 font-bold'
                      : 'border-black/10 dark:border-white/10 opacity-70'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Alignment */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
              Text Alignment
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTextAlign('justify')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                  textAlign === 'justify'
                    ? 'border-amber-600 bg-amber-600/15 font-bold'
                    : 'border-black/10 dark:border-white/10 opacity-70'
                }`}
              >
                <AlignJustify className="w-3.5 h-3.5" /> Book Justified
              </button>
              <button
                onClick={() => setTextAlign('left')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                  textAlign === 'left'
                    ? 'border-amber-600 bg-amber-600/15 font-bold'
                    : 'border-black/10 dark:border-white/10 opacity-70'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" /> Left Ragged
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Prose Reading Canvas */}
      <main
        ref={containerRef}
        onClick={() => {
          // If drawer is open, close it; otherwise toggle distraction-free mode
          if (showSettings || showToc) {
            setShowSettings(false);
            setShowToc(false);
          }
        }}
        className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 md:py-16 flex flex-col items-center focus:outline-none"
        tabIndex={0}
      >
        <div className={`w-full ${maxWidthClass} transition-all duration-150`}>
          {isChapterLocked ? (
            /* Premium Chapter Unlock Wall */
            <div className="my-12 md:my-20 p-8 md:p-12 rounded-3xl border border-black/10 dark:border-white/10 text-center shadow-lg bg-black/5 dark:bg-white/5 backdrop-blur-xs">
              <div className="w-16 h-16 rounded-2xl bg-amber-600/15 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-xs">
                <Lock className="w-8 h-8" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                Premium Vault Work
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-bold mt-1.5 leading-snug">
                {currentChapter.title}
              </h3>
              <p className="mt-3 text-sm opacity-70 max-w-md mx-auto leading-relaxed font-editorial">
                Unlock <strong className="font-semibold">{book.title}</strong> to read all chapters seamlessly with no ads or subscription interruptions.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <button
                  onClick={onOpenUnlockModal}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  Unlock for {book.tokenPrice} LitTokens
                </button>
                <button
                  onClick={onBack}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-black/20 dark:border-white/20 opacity-80 hover:opacity-100 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Return to Catalog
                </button>
              </div>
            </div>
          ) : (
            /* Full Chapter Content */
            <article className="pb-24">
              {/* Chapter Editorial Opening */}
              <header className="mb-12 text-center pb-8 border-b border-black/10 dark:border-white/10">
                <div className="text-xs uppercase tracking-widest font-semibold opacity-60 mb-2">
                  {book.title} · Chapter {currentChapter?.chapterNumber || currentChapterIndex + 1}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                  {currentChapter?.title}
                </h1>
                <div className="mt-4 flex items-center justify-center gap-3 text-xs opacity-60 font-mono">
                  <span>By {book.authorName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ~{stats.mins} min read ({stats.words} words)
                  </span>
                </div>
              </header>

              {/* Prose Body with Drop-Cap on first paragraph */}
              <div
                className={`${fontFaceClass} ${fontSizeClass} ${lineHeightClass} ${
                  textAlign === 'justify' ? 'text-justify' : 'text-left'
                } space-y-6 opacity-95`}
              >
                {currentChapter?.content.split('\n\n').map((paragraph, pIdx) => {
                  const isFirstParagraph = pIdx === 0;
                  const isMidway = pIdx === Math.floor(currentChapter.content.split('\n\n').length / 2);
                  return (
                    <React.Fragment key={pIdx}>
                      <p
                        className={
                          isFirstParagraph
                            ? 'first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-display first-letter:font-extrabold first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:text-amber-800 dark:first-letter:text-amber-400'
                            : ''
                        }
                      >
                        {paragraph}
                      </p>

                      {/* Midway In-Article Ad Placement */}
                      {isMidway && (
                        <div className="my-10">
                          <AdSlot position="reading_break" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* End of Chapter Section */}
              <footer className="mt-20 pt-10 border-t border-black/10 dark:border-white/10 flex flex-col items-center gap-8">
                <div className="text-center space-y-1">
                  <div className="w-10 h-1 bg-amber-600 mx-auto rounded-full mb-3" />
                  <p className="text-xs font-semibold opacity-70">
                    End of Chapter {currentChapter?.chapterNumber}
                  </p>
                  <p className="text-[11px] opacity-50 font-mono">
                    Progress auto-saved to LitVault cloud
                  </p>
                </div>

                {/* Chapter Navigation Controls */}
                <div className="flex items-center justify-between w-full max-w-md gap-4">
                  <button
                    disabled={currentChapterIndex <= 0}
                    onClick={() => setCurrentChapterIndex(prev => prev - 1)}
                    className="flex-1 py-3.5 px-4 rounded-xl border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-20 disabled:pointer-events-none transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous Chapter
                  </button>

                  {currentChapterIndex < chapters.length - 1 ? (
                    <button
                      onClick={() => setCurrentChapterIndex(prev => prev + 1)}
                      className="flex-1 py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Next Chapter
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={onBack}
                      className="flex-1 py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Complete & Review
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </footer>
            </article>
          )}
        </div>
      </main>

      {/* Bottom Sticky Status & Chapter Switcher Bar */}
      <footer
        className={`shrink-0 h-12 md:h-14 border-t px-4 md:px-8 flex items-center justify-between text-xs backdrop-blur-md z-30 transition-transform duration-300 ${
          themeChromeStyles
        } ${distractionFree ? 'translate-y-full pointer-events-none' : 'translate-y-0'}`}
      >
        <button
          disabled={currentChapterIndex <= 0}
          onClick={() => setCurrentChapterIndex(prev => prev - 1)}
          className="flex items-center gap-1 font-semibold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev Chapter</span>
        </button>

        {/* Central reading progress telemetry */}
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold opacity-70">
          <span>{scrollProgress}% Read</span>
          <span aria-hidden="true">·</span>
          <span>
            {currentChapterIndex + 1} of {chapters.length}
          </span>
        </div>

        <button
          disabled={currentChapterIndex >= chapters.length - 1}
          onClick={() => setCurrentChapterIndex(prev => prev + 1)}
          className="flex items-center gap-1 font-semibold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <span className="hidden sm:inline">Next Chapter</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
