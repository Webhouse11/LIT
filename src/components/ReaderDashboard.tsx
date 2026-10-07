import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Book, UserProfile, UserReadingPreferences } from '../types';
import {
  BookOpen,
  Bookmark,
  Coins,
  Clock,
  UserCheck,
  Star,
  Compass,
  History,
  Users,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Trash2,
  Sparkles,
  TrendingUp,
  Search,
  CheckCircle2,
  Sliders,
  Menu,
  X,
  ExternalLink,
  Flame,
  Award,
  Layers,
  ArrowRight,
  Shield,
  Palette,
  Check,
} from 'lucide-react';

interface ReaderDashboardProps {
  onSelectBook: (book: Book) => void;
  onReadChapter: (book: Book, chapterId?: string) => void;
  onSelectAuthor: (authorId: string) => void;
  onExplore: (genre?: string) => void;
  onOpenTokenStore: () => void;
  initialTab?: ReaderTab;
}

export type ReaderTab =
  | 'dashboard'
  | 'explore'
  | 'library'
  | 'bookmarks'
  | 'history'
  | 'following'
  | 'wallet'
  | 'notifications'
  | 'profile'
  | 'settings';

const CURATED_AVATARS = [
  {
    name: 'Amara (Scholar)',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Kola (Bibliophile)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Binta (Curator)',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Marcus (Historian)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Zainab (Poet)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'David (Critic)',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
  },
];

const AVAILABLE_GENRES = [
  'African Literature',
  'Romance',
  'Drama',
  'Thriller',
  'Mystery',
  'Fantasy',
  'Historical Fiction',
  'Poetry',
  'Science Fiction',
  'Crime',
  'Comedy',
  'Young Adult',
  'Inspirational',
  'Short Stories',
  'Christian',
  'Family',
  'Children',
];

export const ReaderDashboard: React.FC<ReaderDashboardProps> = ({
  onSelectBook,
  onReadChapter,
  onSelectAuthor,
  onExplore,
  onOpenTokenStore,
  initialTab = 'dashboard',
}) => {
  const { user, signOut, updateUserProfile, switchDemoRole } = useAuth();
  const {
    books,
    authors,
    library,
    bookmarks,
    readingProgress,
    unlockedBooks,
    followedAuthors,
    wallet,
    transactions,
    notifications,
    readingPrefs,
    setReadingPreferences,
    toggleLibrary,
    toggleFollowAuthor,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const [activeTab, setActiveTab] = useState<ReaderTab>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'saved' | 'unlocked'>('all');
  const [librarySearch, setLibrarySearch] = useState('');

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.displayName || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.photoURL || '');
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>(
    user?.readingPreferences?.favoriteGenres || ['African Literature', 'Thriller']
  );
  const [readingGoal, setReadingGoal] = useState<number>(
    user?.readingPreferences?.readingGoal || 20
  );
  const [themePref, setThemePref] = useState<'light' | 'sepia' | 'dark' | 'night'>(
    user?.readingPreferences?.theme || readingPrefs.theme || 'light'
  );
  const [fontPref, setFontPref] = useState<'serif' | 'sans'>(
    user?.readingPreferences?.fontFace || readingPrefs.fontFace || 'serif'
  );
  const [fontSizePref, setFontSizePref] = useState<'sm' | 'base' | 'lg' | 'xl' | '2xl'>(
    user?.readingPreferences?.fontSize || readingPrefs.fontSize || 'base'
  );
  const [emailUpdates, setEmailUpdates] = useState<boolean>(
    user?.readingPreferences?.emailUpdates ?? true
  );
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Compute reader first name cleanly (handles "Amara Vance (Reader)" -> "Amara")
  const firstName = useMemo(() => {
    if (!user?.displayName) return 'Reader';
    const clean = user.displayName.replace(/\s*\(.*?\)/, '').trim();
    return clean.split(' ')[0] || 'Reader';
  }, [user?.displayName]);

  // Books currently in progress (reading progress with > 0% completion)
  const inProgressList = useMemo(() => {
    return Object.values(readingProgress)
      .map(prog => {
        const book = books.find(b => b.id === prog.bookId);
        return { prog, book };
      })
      .filter((item): item is { prog: typeof item.prog; book: Book } => item.book !== undefined)
      .sort((a, b) => new Date(b.prog.lastReadAt).getTime() - new Date(a.prog.lastReadAt).getTime());
  }, [readingProgress, books]);

  // Populated bookmarks
  const populatedBookmarks = useMemo(() => {
    return bookmarks
      .map(bm => {
        const book = books.find(b => b.id === bm.bookId);
        return { ...bm, book };
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [bookmarks, books]);

  // Unlocked books list
  const unlockedBooksList = useMemo(() => {
    return books.filter(b => unlockedBooks.includes(b.id));
  }, [books, unlockedBooks]);

  // Combined library list (saved items + unlocked books, deduplicated)
  const fullLibraryList = useMemo(() => {
    const map = new Map<string, { book: Book; source: 'saved' | 'unlocked' | 'both'; savedAt?: string }>();

    // Add saved
    library.forEach(item => {
      const b = books.find(book => book.id === item.bookId);
      if (b) {
        map.set(b.id, { book: b, source: 'saved', savedAt: item.savedAt });
      }
    });

    // Add unlocked
    unlockedBooksList.forEach(b => {
      const existing = map.get(b.id);
      if (existing) {
        map.set(b.id, { ...existing, source: 'both' });
      } else {
        map.set(b.id, { book: b, source: 'unlocked' });
      }
    });

    return Array.from(map.values());
  }, [library, unlockedBooksList, books]);

  // Filtered library
  const displayedLibrary = useMemo(() => {
    return fullLibraryList.filter(item => {
      if (libraryFilter === 'saved' && item.source === 'unlocked') return false;
      if (libraryFilter === 'unlocked' && item.source === 'saved') return false;
      if (librarySearch.trim()) {
        const q = librarySearch.toLowerCase();
        const matchesTitle = item.book.title.toLowerCase().includes(q);
        const matchesAuthor = item.book.authorName.toLowerCase().includes(q);
        const matchesGenre = item.book.genre.toLowerCase().includes(q);
        return matchesTitle || matchesAuthor || matchesGenre;
      }
      return true;
    });
  }, [fullLibraryList, libraryFilter, librarySearch]);

  // Followed authors list
  const followedAuthorsList = useMemo(() => {
    return authors.filter(a => followedAuthors.includes(a.id));
  }, [authors, followedAuthors]);

  // Recommendation engine:
  // "Use reading history and genre preferences where data is available.
  // Do not invent personalized data. If insufficient data exists, show popular books instead."
  const { recommendations, recommendationReason } = useMemo(() => {
    // Collect genres from reading preferences and currently read books
    const userPreferredGenres = new Set<string>();
    if (user?.readingPreferences?.favoriteGenres) {
      user?.readingPreferences?.favoriteGenres.forEach(g => userPreferredGenres.add(g));
    }
    favoriteGenres.forEach(g => userPreferredGenres.add(g));
    inProgressList.forEach(item => userPreferredGenres.add(item.book.genre));
    fullLibraryList.forEach(item => userPreferredGenres.add(item.book.genre));

    // Exclude books already started or already in library
    const readOrSavedBookIds = new Set([
      ...inProgressList.map(item => item.book.id),
      ...fullLibraryList.map(item => item.book.id),
    ]);

    const genreArray = Array.from(userPreferredGenres);

    if (genreArray.length > 0) {
      const matched = books.filter(
        b => b.status === 'published' && !readOrSavedBookIds.has(b.id) && userPreferredGenres.has(b.genre)
      );

      if (matched.length > 0) {
        return {
          recommendations: matched.slice(0, 8),
          recommendationReason: `Curated for you based on your interest in ${genreArray.slice(0, 2).join(' & ')}`,
        };
      }
    }

    // Fallback: Show top popular published books
    const popular = books
      .filter(b => b.status === 'published' && !readOrSavedBookIds.has(b.id))
      .sort((a, b) => b.readsCount - a.readsCount || b.rating - a.rating)
      .slice(0, 8);

    return {
      recommendations: popular,
      recommendationReason: 'Popular Across LitVault — Loved by our global reading community',
    };
  }, [books, inProgressList, fullLibraryList, user?.readingPreferences?.favoriteGenres, favoriteGenres]);

  // Unread notifications count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Handle saving profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPreferences: UserReadingPreferences = {
      favoriteGenres,
      readingGoal,
      theme: themePref,
      fontFace: fontPref,
      fontSize: fontSizePref,
      emailUpdates,
    };

    updateUserProfile({
      displayName: profileName.trim() || user?.displayName,
      bio: profileBio.trim(),
      photoURL: profilePhoto.trim() || user?.photoURL,
      readingPreferences: updatedPreferences,
    });

    setReadingPreferences({
      theme: themePref,
      fontFace: fontPref,
      fontSize: fontSizePref,
    });

    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);
  };

  const handleTabChange = (tab: ReaderTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleGenreSelection = (genre: string) => {
    setFavoriteGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col md:flex-row">
      {/* ============================================================== */}
      {/* DESKTOP SIDEBAR NAVIGATION                                     */}
      {/* ============================================================== */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-stone-200/90 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        {/* Reader Profile Header inside sidebar */}
        <div className="p-5 border-b border-stone-100 flex items-center gap-3.5">
          <div className="relative">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-12 h-12 rounded-2xl object-cover border border-amber-200/60 shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-stone-900 text-amber-400 font-display font-bold flex items-center justify-center text-lg shadow-xs">
                {firstName.charAt(0)}
              </div>
            )}
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"
              title="Online"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" /> Reader Vault
            </span>
            <h2 className="font-bold text-sm text-stone-900 truncate">
              {user?.displayName || 'Reader'}
            </h2>
            <p className="text-[11px] text-stone-400 font-mono truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* LitToken Wallet Quick Glance */}
        <div className="p-4 mx-4 my-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-700" /> LitTokens
            </span>
            <div className="text-lg font-black text-amber-950 font-mono">
              {wallet.tokenBalance}
            </div>
          </div>
          <button
            onClick={onOpenTokenStore}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Buy Tokens
          </button>
        </div>

        {/* Primary Sidebar Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 text-xs font-semibold py-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Layers },
            { id: 'explore', label: 'Explore Catalog', icon: Compass },
            { id: 'library', label: 'My Library', icon: BookOpen, count: fullLibraryList.length },
            { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, count: bookmarks.length },
            { id: 'history', label: 'Reading History', icon: History, count: inProgressList.length },
            { id: 'following', label: 'Following Authors', icon: Users, count: followedAuthorsList.length },
            { id: 'wallet', label: 'Wallet & Ledger', icon: Coins },
            { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadCount, badgeColor: 'bg-rose-500' },
            { id: 'profile', label: 'Profile Management', icon: User },
            { id: 'settings', label: 'Reader Settings', icon: Settings },
          ].map(item => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'explore') {
                    onExplore();
                  } else {
                    handleTabChange(item.id as ReaderTab);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-amber-400' : 'text-stone-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-stone-800 text-amber-300'
                        : item.badgeColor
                        ? `${item.badgeColor} text-white`
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Sign Out & Role Info */}
        <div className="p-3 border-t border-stone-100 mt-auto">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MOBILE HEADER & QUICK NAVIGATION                               */}
      {/* ============================================================== */}
      <div className="md:hidden bg-white border-b border-stone-200 sticky top-16 z-20">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-700"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                LitVault Reader
              </span>
              <h1 className="font-bold text-sm text-stone-900 leading-none">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTokenStore}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono font-bold"
            >
              <Coins className="w-3.5 h-3.5 text-amber-700" />
              <span>{wallet.tokenBalance}</span>
            </button>
            <button
              onClick={() => handleTabChange('notifications')}
              className="relative p-1.5 rounded-xl text-stone-600 hover:bg-stone-100"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile quick scrollable navigation pills */}
        <div className="px-3 pb-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'dashboard', label: 'Overview' },
            { id: 'library', label: `Library (${fullLibraryList.length})` },
            { id: 'bookmarks', label: `Bookmarks (${bookmarks.length})` },
            { id: 'history', label: 'History' },
            { id: 'following', label: 'Following' },
            { id: 'wallet', label: 'Wallet' },
            { id: 'profile', label: 'Profile' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => handleTabChange(p.id as ReaderTab)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                activeTab === p.id
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Mobile Full Slideout Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-stone-200 bg-white p-4 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'explore', label: 'Explore Catalog', icon: Compass },
              { id: 'library', label: 'My Library', icon: BookOpen },
              { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
              { id: 'history', label: 'Reading History', icon: History },
              { id: 'following', label: 'Following Authors', icon: Users },
              { id: 'wallet', label: 'Wallet & Ledger', icon: Coins },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'profile', label: 'Profile Management', icon: User },
              { id: 'settings', label: 'Reader Settings', icon: Settings },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'explore') onExplore();
                    else handleTabChange(item.id as ReaderTab);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold ${
                    activeTab === item.id
                      ? 'bg-stone-900 text-white font-bold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-2 border-t border-stone-100">
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-3.5 py-2 text-rose-600 text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MAIN DASHBOARD CONTENT AREA                                    */}
      {/* ============================================================== */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {/* Profile update feedback toast */}
        {profileSavedToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-stone-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold">Profile Updated</p>
              <p className="text-[11px] text-stone-300">
                Your reading preferences and personal details have been saved.
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* 1. DASHBOARD OVERVIEW TAB                                    */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-200">
            {/* TOP GREETING BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950 text-white p-6 sm:p-10 shadow-xl border border-stone-800">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold uppercase tracking-widest mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Reader Sanctuary
                </span>
                <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Welcome back, {firstName}
                </h1>
                <p className="text-stone-300 text-sm sm:text-base mt-2 font-serif leading-relaxed">
                  Ready to continue your reading journey?
                </p>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-stone-800/80">
                  <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                      In Progress
                    </span>
                    <span className="text-xl font-black text-amber-400 font-mono">
                      {inProgressList.length}
                    </span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                      Saved Books
                    </span>
                    <span className="text-xl font-black text-white font-mono">
                      {fullLibraryList.length}
                    </span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                      Bookmarks
                    </span>
                    <span className="text-xl font-black text-white font-mono">
                      {bookmarks.length}
                    </span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                      LitTokens
                    </span>
                    <span className="text-xl font-black text-amber-300 font-mono">
                      {wallet.tokenBalance}
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative background watermark */}
              <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none select-none">
                <BookOpen className="w-80 h-80 text-white" />
              </div>
            </div>

            {/* CONTINUE READING SECTION */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-700" />
                    Continue Reading
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Pick up right where you last turned the page.
                  </p>
                </div>
                {inProgressList.length > 0 && (
                  <button
                    onClick={() => handleTabChange('history')}
                    className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                  >
                    View Reading History <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {inProgressList.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-stone-200/80 shadow-2xs">
                  <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="font-display text-base sm:text-lg font-bold text-stone-800">
                    Your reading desk is clear
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    You haven't opened any stories yet. Discover award-winning novels, short stories, and captivating African literature.
                  </p>
                  <button
                    onClick={() => onExplore()}
                    className="mt-5 px-6 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 shadow-md transition-all cursor-pointer"
                  >
                    Start Reading Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {inProgressList.slice(0, 4).map(({ prog, book }) => (
                    <div
                      key={book.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="flex gap-4">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-20 sm:w-24 aspect-[2/3] object-cover rounded-xl shadow-xs border border-stone-100 shrink-0 group-hover:scale-102 transition-transform cursor-pointer"
                          onClick={() => onSelectBook(book)}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                            {book.genre}
                          </span>
                          <h3
                            onClick={() => onSelectBook(book)}
                            className="font-display font-bold text-base text-stone-900 mt-1 truncate hover:text-amber-800 transition-colors cursor-pointer"
                          >
                            {book.title}
                          </h3>
                          <p className="text-xs text-stone-500 truncate">
                            by {book.authorName}
                          </p>

                          <div className="mt-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700">
                              <span>Chapter {prog.chapterNumber}</span>
                              <span className="font-mono text-amber-800 font-bold">
                                {prog.progressPercent}% complete
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-stone-200 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(5, prog.progressPercent))}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 font-mono">
                          Last read {new Date(prog.lastReadAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => onReadChapter(book, prog.chapterId)}
                          className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <span>Continue Reading</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* MY LIBRARY PREVIEW */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-700" />
                    My Library
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Your saved manuscripts and unlocked premium titles ({fullLibraryList.length}).
                  </p>
                </div>
                <button
                  onClick={() => handleTabChange('library')}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                >
                  View All Shelves <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {fullLibraryList.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/80">
                  <Bookmark className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">
                    Your bookshelf is currently empty. Bookmark or save books while exploring!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {fullLibraryList.slice(0, 4).map(({ book, source }) => (
                    <div
                      key={book.id}
                      className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div
                        onClick={() => onSelectBook(book)}
                        className="cursor-pointer"
                      >
                        <div className="relative mb-2.5 overflow-hidden rounded-xl">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full aspect-[2/3] object-cover group-hover:scale-104 transition-transform duration-300"
                          />
                          <span className="absolute top-2 left-2 text-[9px] font-bold uppercase bg-stone-900/80 text-white px-2 py-0.5 rounded-full">
                            {book.genre}
                          </span>
                          {source === 'unlocked' && (
                            <span className="absolute bottom-2 right-2 text-[9px] font-bold uppercase bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full shadow-xs">
                              Unlocked
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-stone-900 truncate">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-stone-500 truncate">
                          {book.authorName}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                        <button
                          onClick={() => onSelectBook(book)}
                          className="text-[11px] font-bold text-amber-800 hover:text-amber-950"
                        >
                          Open Book →
                        </button>
                        <button
                          onClick={() => toggleLibrary(book)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* RECOMMENDATIONS SECTION */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Handpicked for You
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2 mt-0.5">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    Recommended For You
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {recommendationReason}
                  </p>
                </div>
                <button
                  onClick={() => onExplore()}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                >
                  Explore Catalog <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {recommendations.slice(0, 4).map(book => (
                  <div
                    key={book.id}
                    className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div
                      onClick={() => onSelectBook(book)}
                      className="cursor-pointer"
                    >
                      <div className="relative mb-2.5 overflow-hidden rounded-xl">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full aspect-[2/3] object-cover group-hover:scale-104 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 text-[9px] font-bold uppercase bg-stone-900/80 text-white px-2 py-0.5 rounded-full">
                          {book.genre}
                        </span>
                        {book.isPremium ? (
                          <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full font-mono">
                            {book.tokenPrice} Tokens
                          </span>
                        ) : (
                          <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                            Free
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-amber-700 font-bold mb-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{book.rating.toFixed(1)}</span>
                        <span className="text-stone-400 font-normal">({book.readsCount} reads)</span>
                      </div>
                      <h4 className="font-bold text-xs text-stone-900 truncate">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 truncate">
                        by {book.authorName}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                      <button
                        onClick={() => onSelectBook(book)}
                        className="w-full py-1.5 rounded-lg bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-800 text-[11px] font-bold transition-all text-center"
                      >
                        Read Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* RECENTLY READ & BOOKMARKS SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recently Read */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-base text-stone-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-700" />
                    Recently Read
                  </h3>
                  <button
                    onClick={() => handleTabChange('history')}
                    className="text-xs font-bold text-amber-800 hover:text-amber-950"
                  >
                    View All
                  </button>
                </div>

                {inProgressList.length === 0 ? (
                  <p className="text-xs text-stone-400 py-6 text-center">
                    No recent reading activity recorded yet.
                  </p>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {inProgressList.slice(0, 3).map(({ prog, book }) => (
                      <div
                        key={book.id}
                        className="py-3 flex items-center justify-between hover:bg-stone-50 px-2 rounded-xl transition-colors"
                      >
                        <div
                          onClick={() => onSelectBook(book)}
                          className="flex items-center gap-3 cursor-pointer min-w-0"
                        >
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-9 h-12 object-cover rounded-md shadow-2xs"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-stone-900 truncate">
                              {book.title}
                            </h4>
                            <p className="text-[11px] text-stone-500 truncate">
                              Chapter {prog.chapterNumber} • {prog.progressPercent}%
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => onReadChapter(book, prog.chapterId)}
                          className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-[11px] font-bold hover:bg-stone-800 shrink-0"
                        >
                          Resume
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bookmarked Chapters */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-base text-stone-900 flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-amber-700" />
                    Bookmarked Books ({bookmarks.length})
                  </h3>
                  <button
                    onClick={() => handleTabChange('bookmarks')}
                    className="text-xs font-bold text-amber-800 hover:text-amber-950"
                  >
                    View All
                  </button>
                </div>

                {populatedBookmarks.length === 0 ? (
                  <p className="text-xs text-stone-400 py-6 text-center">
                    No bookmarks saved yet. Use the bookmark icon inside chapters.
                  </p>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {populatedBookmarks.slice(0, 3).map(bm => (
                      <div
                        key={bm.id}
                        className="py-3 flex items-center justify-between hover:bg-stone-50 px-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {bm.coverImage && (
                            <img
                              src={bm.coverImage}
                              alt={bm.bookTitle}
                              className="w-9 h-12 object-cover rounded-md shadow-2xs"
                            />
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-stone-900 truncate">
                              {bm.bookTitle}
                            </h4>
                            <p className="text-[11px] text-stone-500 truncate">
                              {bm.chapterTitle}
                            </p>
                          </div>
                        </div>
                        {bm.book && (
                          <button
                            onClick={() => onReadChapter(bm.book!, bm.chapterId)}
                            className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-900 hover:bg-stone-900 hover:text-white text-[11px] font-bold shrink-0 transition-colors"
                          >
                            Jump
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* FOLLOWED AUTHORS SECTION */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-700" />
                    Followed Authors ({followedAuthorsList.length})
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Stay updated when your favorite writers release new manuscripts.
                  </p>
                </div>
                <button
                  onClick={() => handleTabChange('following')}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                >
                  Manage Following <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {followedAuthorsList.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center border border-stone-200/80">
                  <p className="text-xs text-stone-500">
                    You haven't followed any authors yet. Explore the author roster to follow!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {followedAuthorsList.map(author => {
                    const authorBooks = books.filter(b => b.authorId === author.id);
                    return (
                      <div
                        key={author.id}
                        onClick={() => onSelectAuthor(author.id)}
                        className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group"
                      >
                        <img
                          src={author.photoURL}
                          alt={author.name}
                          className="w-13 h-13 rounded-full object-cover border border-amber-200/80 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-amber-800 transition-colors truncate">
                            {author.name}
                          </h4>
                          <p className="text-[11px] text-stone-500 truncate">
                            {author.location || 'Author'} • {authorBooks.length} books
                          </p>
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-700 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{author.rating.toFixed(1)} rating</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* 2. MY LIBRARY TAB                                            */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'library' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                Personal Sanctuary
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-0.5">
                My Literary Library
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                All manuscripts saved to your reading shelf, plus unlocked premium editions.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs">
              <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto text-xs font-bold">
                {[
                  { id: 'all', label: `All Books (${fullLibraryList.length})` },
                  { id: 'saved', label: `Saved (${library.length})` },
                  { id: 'unlocked', label: `Unlocked Premium (${unlockedBooksList.length})` },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setLibraryFilter(f.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                      libraryFilter === f.id
                        ? 'bg-stone-900 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter library titles..."
                  value={librarySearch}
                  onChange={e => setLibrarySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            {/* Library Grid */}
            {displayedLibrary.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80">
                <Bookmark className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-display font-bold text-base text-stone-800">
                  No matching books found
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  {librarySearch
                    ? 'No books match your search filter. Try clearing the search query.'
                    : 'Your library is empty. Click "Save to Library" on books you want to read later.'}
                </p>
                <button
                  onClick={() => onExplore()}
                  className="mt-5 px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
                >
                  Browse Explore Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {displayedLibrary.map(({ book, source }) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div
                      onClick={() => onSelectBook(book)}
                      className="cursor-pointer"
                    >
                      <div className="relative mb-3 overflow-hidden rounded-xl">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full aspect-[2/3] object-cover group-hover:scale-104 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 text-[9px] font-bold uppercase bg-stone-900/80 text-white px-2 py-0.5 rounded-full">
                          {book.genre}
                        </span>
                        {source === 'unlocked' && (
                          <span className="absolute bottom-2 right-2 text-[9px] font-bold uppercase bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full shadow-xs">
                            Vault Unlocked
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-stone-900 truncate">
                        {book.title}
                      </h4>
                      <p className="text-xs text-stone-500 truncate">
                        by {book.authorName}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <button
                        onClick={() => onSelectBook(book)}
                        className="text-xs font-bold text-amber-800 hover:text-amber-950"
                      >
                        Read Book →
                      </button>
                      <button
                        onClick={() => toggleLibrary(book)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                        title="Remove from Library"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* 3. BOOKMARKS TAB                                             */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                Chapter Ribbon Markers
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-0.5">
                Saved Bookmarks ({bookmarks.length})
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Your exact reading positions across all manuscripts. Click any bookmark to jump directly into the text.
              </p>
            </div>

            {populatedBookmarks.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80">
                <Bookmark className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-display font-bold text-base text-stone-800">
                  No bookmarks saved yet
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  While reading any chapter, click the bookmark ribbon icon at the top of the reader to save your position.
                </p>
                <button
                  onClick={() => onExplore()}
                  className="mt-5 px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800"
                >
                  Start Reading
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-2xs divide-y divide-stone-100">
                {populatedBookmarks.map(bm => (
                  <div
                    key={bm.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/60 px-3 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {bm.coverImage && (
                        <img
                          src={bm.coverImage}
                          alt={bm.bookTitle}
                          className="w-12 h-16 object-cover rounded-xl shadow-2xs shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-amber-800 font-mono">
                          Saved at {bm.progressPercent}% of chapter
                        </span>
                        <h4 className="font-display font-bold text-sm sm:text-base text-stone-900 truncate">
                          {bm.bookTitle}
                        </h4>
                        <p className="text-xs text-stone-600 truncate mt-0.5">
                          {bm.chapterTitle}
                        </p>
                        <span className="text-[10px] text-stone-400">
                          Updated {new Date(bm.updatedAt).toLocaleDateString()} at{' '}
                          {new Date(bm.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {bm.book && (
                        <button
                          onClick={() => onReadChapter(bm.book!, bm.chapterId)}
                          className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors shadow-xs"
                        >
                          Jump to Chapter →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* 4. READING HISTORY TAB                                       */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                Chronicle of Books Read
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-0.5">
                Reading History & Log
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Your chronological log of reading sessions, chapter milestones, and completed progress.
              </p>
            </div>

            {inProgressList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80">
                <History className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-display font-bold text-base text-stone-800">
                  No reading history yet
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Every book you open and read will be automatically tracked here with chapter milestones.
                </p>
                <button
                  onClick={() => onExplore()}
                  className="mt-5 px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800"
                >
                  Explore Books
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-2xs divide-y divide-stone-100">
                {inProgressList.map(({ prog, book }) => (
                  <div
                    key={book.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/60 px-3 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-14 h-20 object-cover rounded-xl shadow-xs shrink-0 cursor-pointer"
                        onClick={() => onSelectBook(book)}
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          {book.genre}
                        </span>
                        <h4
                          onClick={() => onSelectBook(book)}
                          className="font-display font-bold text-sm sm:text-base text-stone-900 truncate hover:text-amber-800 cursor-pointer mt-1"
                        >
                          {book.title}
                        </h4>
                        <p className="text-xs text-stone-500">
                          by {book.authorName} • Chapter {prog.chapterNumber}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="w-36 h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-600 rounded-full"
                              style={{ width: `${prog.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-stone-700 font-bold">
                            {prog.progressPercent}% finished
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <span className="text-[11px] text-stone-400 font-mono">
                        {new Date(prog.lastReadAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => onReadChapter(book, prog.chapterId)}
                        className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        Continue Reading
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* 5. FOLLOWING AUTHORS TAB                                     */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'following' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                Literary Connections
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-0.5">
                Followed Authors ({followedAuthorsList.length})
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Receive instant notifications when your followed authors publish new chapters and books.
              </p>
            </div>

            {followedAuthorsList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80">
                <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-display font-bold text-base text-stone-800">
                  Not following any authors yet
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Follow authors to populate this feed with their newest books, essays, and stories.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {followedAuthorsList.map(author => {
                  const authorBooks = books.filter(b => b.authorId === author.id);
                  return (
                    <div
                      key={author.id}
                      className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-2xs flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={author.photoURL}
                          alt={author.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-amber-200/80 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-display font-bold text-base text-stone-900 truncate">
                              {author.name}
                            </h3>
                            <button
                              onClick={() => toggleFollowAuthor(author.id)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-stone-500 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 transition-colors"
                            >
                              Following ✓
                            </button>
                          </div>
                          <p className="text-xs text-amber-800 font-semibold mt-0.5">
                            {author.location || 'LitVault Author'}
                          </p>
                          <p className="text-xs text-stone-500 line-clamp-2 mt-1.5 leading-relaxed">
                            {author.bio}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-xs text-stone-600 font-semibold">
                          {authorBooks.length} Published Books
                        </span>
                        <button
                          onClick={() => onSelectAuthor(author.id)}
                          className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                        >
                          View Author Profile <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* 6. WALLET & TOKENS TAB                                       */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'wallet' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                Financial Vault & Reader Tokens
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-0.5">
                LitToken Wallet
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                LitTokens are our platform currency. Use them to unlock premium manuscripts while paying authors directly.
              </p>
            </div>

            {/* Wallet Balance Hero Card */}
            <div className="bg-gradient-to-br from-amber-900 via-amber-950 to-stone-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" /> Current LitToken Balance
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-white mt-2">
                  {wallet.tokenBalance}{' '}
                  <span className="text-lg font-sans font-normal text-amber-300">
                    Tokens
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-2 max-w-md">
                  Unlocked titles remain permanently accessible in your library with no expiration. 70% of every unlock directly rewards the author.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={onOpenTokenStore}
                  className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black shadow-lg hover:shadow-xl transition-all cursor-pointer text-center active:scale-95"
                >
                  Buy LitTokens
                </button>
              </div>
            </div>

            {/* Security Notice: Balance cannot be modified client side */}
            <div className="bg-stone-100 rounded-2xl p-4 border border-stone-200 text-xs text-stone-600 flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-800 shrink-0" />
              <span>
                <strong>Verified Ledger Security:</strong> Token balances are cryptographically recorded and verified with automated anti-tamper accounting. Unlocks are immutable.
              </span>
            </div>

            {/* Transaction History Summary */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs">
              <h3 className="font-display font-bold text-base text-stone-900 mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-amber-700" />
                Recent Transaction History
              </h3>

              {transactions.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">
                  No purchases or token transactions yet.
                </p>
              ) : (
                <div className="divide-y divide-stone-100">
                  {transactions.slice(0, 5).map(tx => (
                    <div
                      key={tx.id}
                      className="py-3.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-stone-900 block">
                          {tx.packageName}
                        </span>
                        <span className="text-[11px] text-stone-400 font-mono">
                          Ref: {tx.paymentReference} • {tx.paymentProvider}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-700 block font-mono">
                          +{tx.tokensPurchased} Tokens
                        </span>
                        <span className="text-[11px] text-stone-400">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* 7. NOTIFICATIONS TAB                                         */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                  Inbox & Alerts
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-0.5">
                  Notifications ({notifications.length})
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Updates on book releases, chapter unlocks, and platform announcements.
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={() => markAllNotificationsRead()}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80">
                <Bell className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-display font-bold text-base text-stone-800">
                  No notifications yet
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  You're all caught up with your latest reading alerts.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-2xs divide-y divide-stone-100">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`py-4 px-3 rounded-2xl transition-colors cursor-pointer flex items-start gap-3.5 ${
                      !n.read ? 'bg-amber-50/60 font-medium' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        !n.read
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* 8. PROFILE MANAGEMENT TAB                                    */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                Personal Identity
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-0.5">
                Profile Management
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Customize your public reader name, avatar image, personal biography, and reading preferences.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Card: Avatar & Name */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-2xs space-y-6">
                <h3 className="font-display font-bold text-base text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-700" />
                  Reader Profile Details
                </h3>

                {/* Avatar Preview & URL */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Profile Image
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <img
                      src={profilePhoto || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'}
                      alt="Avatar Preview"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-300 shadow-md shrink-0"
                    />
                    <div className="w-full space-y-2">
                      <input
                        type="url"
                        placeholder="Enter custom image URL..."
                        value={profilePhoto}
                        onChange={e => setProfilePhoto(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                      />
                      <span className="text-[11px] text-stone-400 block">
                        Or pick from our curated literary reader avatars below:
                      </span>

                      {/* Quick Avatar Swatches */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {CURATED_AVATARS.map(av => (
                          <button
                            key={av.name}
                            type="button"
                            onClick={() => setProfilePhoto(av.url)}
                            className={`w-9 h-9 rounded-xl overflow-hidden border-2 shrink-0 transition-transform ${
                              profilePhoto === av.url
                                ? 'border-amber-600 scale-105 ring-2 ring-amber-300'
                                : 'border-stone-200 hover:border-stone-400'
                            }`}
                            title={av.name}
                          >
                            <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Name / Pen Name */}
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                    Full Name / Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                    placeholder="Your name or reading pseudonym"
                  />
                </div>

                {/* Email (Readonly) */}
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-2.5 text-xs bg-stone-100/80 border border-stone-200 rounded-xl text-stone-500 font-mono cursor-not-allowed"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Account email is managed securely via LitVault Authentication.
                  </span>
                </div>

                {/* Bio / Reading Philosophy */}
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                    Reader Biography
                  </label>
                  <textarea
                    rows={3}
                    value={profileBio}
                    onChange={e => setProfileBio(e.target.value)}
                    placeholder="Tell authors and the community about your reading tastes and favorite stories..."
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Reading Preferences Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-2xs space-y-6">
                <h3 className="font-display font-bold text-base text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-700" />
                  Reading Preferences & Curation
                </h3>

                {/* Favorite Genres Pills */}
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                    Favorite Genres (Select all that you love)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_GENRES.map(genre => {
                      const isSelected = favoriteGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => toggleGenreSelection(genre)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-stone-900 text-white shadow-xs'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-stone-400 mt-2 block">
                    LitVault will customize your recommended homepage reads based on these genre preferences.
                  </span>
                </div>

                {/* Annual Reading Goal */}
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                    Annual Reading Goal ({readingGoal} Books / Year)
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={readingGoal}
                    onChange={e => setReadingGoal(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                  <div className="flex justify-between text-[11px] text-stone-400 font-mono mt-1">
                    <span>5 books</span>
                    <span>50 books</span>
                    <span>100 books</span>
                  </div>
                </div>

                {/* Default Reading Interface Theme */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                      Reader Color Palette
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      {[
                        { id: 'light', label: 'Paper White', bg: 'bg-[#faf8f5] text-stone-900 border-stone-300' },
                        { id: 'sepia', label: 'Vintage Sepia', bg: 'bg-[#f4ecd8] text-[#5c4b37] border-[#d8c29d]' },
                        { id: 'dark', label: 'Charcoal Dark', bg: 'bg-[#222222] text-stone-200 border-stone-700' },
                        { id: 'night', label: 'Midnight Pitch', bg: 'bg-[#121212] text-stone-300 border-stone-800' },
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setThemePref(t.id as any)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${t.bg} ${
                            themePref === t.id ? 'ring-2 ring-amber-500 font-bold' : ''
                          }`}
                        >
                          <span>{t.label}</span>
                          {themePref === t.id && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                      Reading Typography Style
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      {[
                        { id: 'serif', label: 'Literary Serif (Lora)', desc: 'Warm novel font' },
                        { id: 'sans', label: 'Modern Sans (Jakarta)', desc: 'Crisp digital font' },
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFontPref(f.id as any)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                            fontPref === f.id
                              ? 'border-stone-900 bg-stone-900 text-white font-bold'
                              : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <div>{f.label}</div>
                          <div className={`text-[10px] ${fontPref === f.id ? 'text-stone-300' : 'text-stone-400'}`}>
                            {f.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Email Updates toggle */}
                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailUpdates}
                      onChange={e => setEmailUpdates(e.target.checked)}
                      className="w-4 h-4 rounded-md border-stone-300 text-stone-900 focus:ring-stone-900"
                    />
                    <span className="text-xs text-stone-700 font-medium">
                      Email me weekly chapter digests from my followed authors and community book recommendations.
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleTabChange('dashboard')}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* 9. SETTINGS TAB                                              */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                Preferences & Controls
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-0.5">
                Reader Settings
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Configure your reading comfort, device display, and privacy settings.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-2xs space-y-6">
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-700" />
                  Reader Comfort Controls
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="font-bold text-stone-800 block">Default Font Size</span>
                    <span className="text-[11px] text-stone-400 block mb-2">Adjust comfort for long reading sessions</span>
                    <div className="grid grid-cols-4 gap-1">
                      {(['sm', 'base', 'lg', 'xl'] as const).map(size => (
                        <button
                          key={size}
                          onClick={() => setReadingPreferences({ fontSize: size })}
                          className={`py-1 rounded font-mono text-center uppercase font-bold text-[10px] ${
                            readingPrefs.fontSize === size
                              ? 'bg-stone-900 text-white'
                              : 'bg-white border border-stone-200 text-stone-700'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="font-bold text-stone-800 block">Line Spacing</span>
                    <span className="text-[11px] text-stone-400 block mb-2">Optimize vertical eye-scanning</span>
                    <div className="grid grid-cols-3 gap-1">
                      {(['normal', 'relaxed', 'loose'] as const).map(lh => (
                        <button
                          key={lh}
                          onClick={() => setReadingPreferences({ lineHeight: lh })}
                          className={`py-1 rounded capitalize font-medium text-[10px] ${
                            readingPrefs.lineHeight === lh
                              ? 'bg-stone-900 text-white font-bold'
                              : 'bg-white border border-stone-200 text-stone-700'
                          }`}
                        >
                          {lh}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="font-bold text-stone-800 block">Column Reading Width</span>
                    <span className="text-[11px] text-stone-400 block mb-2">Ideal reading column constraint</span>
                    <div className="grid grid-cols-3 gap-1">
                      {(['narrow', 'medium', 'wide'] as const).map(mw => (
                        <button
                          key={mw}
                          onClick={() => setReadingPreferences({ maxWidth: mw })}
                          className={`py-1 rounded capitalize font-medium text-[10px] ${
                            readingPrefs.maxWidth === mw
                              ? 'bg-stone-900 text-white font-bold'
                              : 'bg-white border border-stone-200 text-stone-700'
                          }`}
                        >
                          {mw}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo Role Switcher for preview evaluation */}
              <div className="pt-6 border-t border-stone-100">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                  Preview Sandbox Role Switcher
                </span>
                <p className="text-xs text-stone-500 mb-3">
                  Instantly preview how LitVault responds across Reader, Author, and Administrator interfaces.
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => switchDemoRole('reader')}
                    className="p-3 rounded-xl border border-stone-900 bg-stone-900 text-white font-bold text-center"
                  >
                    Reader (Active)
                  </button>
                  <button
                    onClick={() => switchDemoRole('author')}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 font-bold text-center"
                  >
                    Switch to Author Studio
                  </button>
                  <button
                    onClick={() => switchDemoRole('admin')}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 font-bold text-center"
                  >
                    Switch to Super Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
