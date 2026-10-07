import React, { useState, useMemo, useRef } from 'react';
import { Book, AuthorProfile } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Star,
  Coins,
  Feather,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Search,
  CheckCircle2,
  Users,
  Compass,
  Bookmark,
  Award,
  Sparkles,
  Heart,
  Globe,
  Clock,
  ExternalLink,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Github,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  Check,
  UserPlus,
  UserCheck,
  ArrowUpRight,
} from 'lucide-react';

interface HomePageProps {
  onExplore: () => void;
  onPublish: () => void;
  onSelectBook: (book: Book) => void;
  onSelectAuthor: (authorId: string) => void;
  onSelectGenre: (genreName: string) => void;
  onOpenLegal: (tab: string) => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onContinueReading?: (book: Book, chapterId?: string) => void;
  onOpenReport?: (type: 'book' | 'review' | 'author', id: string, title: string) => void;
}

// 15 Standard Visual Genres with curated aesthetic accents & icons
const GENRE_CARDS_DATA = [
  { name: 'African Literature', blurb: 'Modern & classic African voices', bg: 'bg-[#f4ebe1]', text: 'text-[#5d3b1e]', border: 'border-[#e6d8c7]', icon: '🌍' },
  { name: 'Romance', blurb: 'Passionate tales of love & longing', bg: 'bg-[#faecee]', text: 'text-[#7e2938]', border: 'border-[#edd0d4]', icon: '💌' },
  { name: 'Drama', blurb: 'Deep human journeys & emotional sagas', bg: 'bg-[#f0f1f7]', text: 'text-[#2a3861]', border: 'border-[#d6daea]', icon: '🎭' },
  { name: 'Thriller', blurb: 'High-stakes suspense & conspiracy', bg: 'bg-[#edeef1]', text: 'text-[#252833]', border: 'border-[#d7dae0]', icon: '⚡' },
  { name: 'Mystery', blurb: 'Enigmatic investigations & secrets', bg: 'bg-[#eef4f2]', text: 'text-[#1c493c]', border: 'border-[#d2e4de]', icon: '🔍' },
  { name: 'Fantasy', blurb: 'Mythic realms, folklore & ancient magic', bg: 'bg-[#f5eef7]', text: 'text-[#562562]', border: 'border-[#e4d4e8]', icon: '✨' },
  { name: 'Comedy', blurb: 'Heartwarming satire & sparkling wit', bg: 'bg-[#fef6e9]', text: 'text-[#794b12]', border: 'border-[#f6e5c8]', icon: '😄' },
  { name: 'Christian', blurb: 'Faith-anchored journeys & grace', bg: 'bg-[#eef3f7]', text: 'text-[#21435d]', border: 'border-[#d3e0eb]', icon: '🕊️' },
  { name: 'Family', blurb: 'Generational bonds & heartfelt roots', bg: 'bg-[#f8ede6]', text: 'text-[#69391e]', border: 'border-[#ebd7cb]', icon: '🏡' },
  { name: 'Children', blurb: 'Whimsical adventures for young minds', bg: 'bg-[#edf7f3]', text: 'text-[#1f563f]', border: 'border-[#cee6dc]', icon: '🎨' },
  { name: 'Young Adult', blurb: 'Coming-of-age spirit & vibrant rebellion', bg: 'bg-[#faedf6]', text: 'text-[#682458]', border: 'border-[#eed3e6]', icon: '🎒' },
  { name: 'Inspirational', blurb: 'Uplifting stories of triumph & grit', bg: 'bg-[#fbf4e8]', text: 'text-[#6c4815]', border: 'border-[#f2e1c3]', icon: '🌱' },
  { name: 'Poetry', blurb: 'Evocative stanzas & spoken word verses', bg: 'bg-[#f3edf7]', text: 'text-[#4b2763]', border: 'border-[#e0d3e7]', icon: '🪶' },
  { name: 'Short Stories', blurb: 'Compelling single-sitting literary gems', bg: 'bg-[#ebf3f7]', text: 'text-[#1d475f]', border: 'border-[#cfdfeb]', icon: '📖' },
  { name: 'Horror', blurb: 'Chilling psychological suspense & dread', bg: 'bg-[#e9e8eb]', text: 'text-[#201e26]', border: 'border-[#d2d0d7]', icon: '🕯️' },
];

// Reusable Literary Loading Skeletons
export const BookCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs flex flex-col justify-between animate-pulse">
    <div>
      <div className="aspect-[2/3] rounded-xl bg-stone-200 mb-3.5" />
      <div className="space-y-2">
        <div className="h-2.5 w-16 bg-stone-200 rounded" />
        <div className="h-4 w-3/4 bg-stone-200 rounded" />
        <div className="h-3 w-1/2 bg-stone-200 rounded" />
      </div>
    </div>
    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
      <div className="h-3 w-10 bg-stone-200 rounded" />
      <div className="h-7 w-20 bg-stone-200 rounded-lg" />
    </div>
  </div>
);

export const AuthorCardSkeleton: React.FC = () => (
  <div className="bg-[#faf8f5] rounded-2xl border border-stone-200 p-5 shadow-2xs flex flex-col justify-between animate-pulse">
    <div>
      <div className="flex items-center gap-3.5 mb-3.5">
        <div className="w-14 h-14 rounded-full bg-stone-200 shrink-0" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="h-4 w-28 bg-stone-200 rounded" />
          <div className="h-3 w-20 bg-stone-200 rounded" />
          <div className="h-2.5 w-24 bg-stone-200 rounded" />
        </div>
      </div>
      <div className="space-y-1.5 pt-1">
        <div className="h-2.5 w-full bg-stone-200 rounded" />
        <div className="h-2.5 w-4/5 bg-stone-200 rounded" />
      </div>
    </div>
    <div className="mt-5 pt-3 border-t border-stone-200/60 flex items-center justify-between">
      <div className="h-3 w-16 bg-stone-200 rounded" />
      <div className="h-7 w-20 bg-stone-200 rounded-lg" />
    </div>
  </div>
);

export const GenreCardSkeleton: React.FC = () => (
  <div className="p-4 rounded-2xl border border-stone-200 bg-stone-100/60 flex flex-col justify-between animate-pulse min-h-[140px]">
    <div className="space-y-2">
      <div className="w-8 h-8 rounded-full bg-stone-200" />
      <div className="h-3.5 w-24 bg-stone-200 rounded" />
      <div className="h-2.5 w-full bg-stone-200 rounded" />
    </div>
    <div className="mt-4 pt-2 border-t border-stone-200/80 flex justify-between">
      <div className="h-2.5 w-12 bg-stone-200 rounded" />
      <div className="h-2.5 w-4 bg-stone-200 rounded" />
    </div>
  </div>
);

export const RecommendationHeroSkeleton: React.FC = () => (
  <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/90 shadow-xl max-w-sm sm:max-w-md w-full animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="h-3 w-24 bg-stone-200 rounded" />
      <div className="h-4 w-20 bg-stone-200 rounded" />
    </div>
    <div className="aspect-[2/3] max-w-[220px] mx-auto rounded-xl bg-stone-200 mb-5" />
    <div className="space-y-2 text-center">
      <div className="h-3 w-20 bg-stone-200 rounded mx-auto" />
      <div className="h-5 w-40 bg-stone-200 rounded mx-auto" />
      <div className="h-3 w-28 bg-stone-200 rounded mx-auto" />
    </div>
  </div>
);

export const HomePage: React.FC<HomePageProps> = ({
  onExplore,
  onPublish,
  onSelectBook,
  onSelectAuthor,
  onSelectGenre,
  onOpenLegal,
  onOpenAuth,
  onContinueReading,
  onOpenReport,
}) => {
  const { user } = useAuth();
  const { books, authors, settings, readingProgress, chaptersMap, isAuthorFollowed, toggleFollowAuthor } = useApp();

  // Search & Filter state for "Discover Your Next Story" section
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'books' | 'authors' | 'genres'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Carousel refs for smooth horizontal scrolling
  const freeCarouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const offset = direction === 'left' ? -320 : 320;
      ref.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Curated slices of published books
  const publishedBooks = useMemo(() => books.filter(b => b.status === 'published'), [books]);

  // Lead / Hero showcase books
  const leadBook = useMemo(() => {
    return publishedBooks.find(b => b.id === 'book-echoes-savanna') || publishedBooks[0];
  }, [publishedBooks]);

  const secondaryHeroBooks = useMemo(() => {
    return publishedBooks.filter(b => b.id !== leadBook?.id).slice(0, 3);
  }, [publishedBooks, leadBook]);

  // Free books slice
  const freeBooks = useMemo(() => {
    return publishedBooks.filter(b => !b.isPremium);
  }, [publishedBooks]);

  // Premium books slice
  const premiumBooks = useMemo(() => {
    return publishedBooks.filter(b => b.isPremium);
  }, [publishedBooks]);

  // Trending books: sorted by readsCount descending
  const trendingBooks = useMemo(() => {
    return [...publishedBooks].sort((a, b) => (b.readsCount || 0) - (a.readsCount || 0)).slice(0, 4);
  }, [publishedBooks]);

  // Active verified authors
  const popularAuthors = useMemo(() => {
    return authors.filter(a => a.status === 'approved').slice(0, 4);
  }, [authors]);

  // Personalized "Continue Reading" books for logged in user
  const inProgressBooks = useMemo(() => {
    if (!user) return [];
    const entries = Object.values(readingProgress);
    if (!entries.length) return [];

    return entries
      .map(prog => {
        const book = publishedBooks.find(b => b.id === prog.bookId);
        if (!book) return null;
        const totalChapters = chaptersMap[book.id]?.length || 10;
        return {
          book,
          progress: prog,
          totalChapters,
        };
      })
      .filter(Boolean)
      .slice(0, 3);
  }, [user, readingProgress, publishedBooks, chaptersMap]);

  // Real-time Discovery Search Filtering
  const searchFilteredBooks = useMemo(() => {
    if (!searchQuery.trim()) {
      return publishedBooks.slice(0, 8);
    }
    const q = searchQuery.toLowerCase().trim();
    return publishedBooks.filter(b => {
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchAuthor = b.authorName.toLowerCase().includes(q);
      const matchGenre = b.genre.toLowerCase().includes(q);
      const matchSynopsis = (b.synopsis || b.description || '').toLowerCase().includes(q);
      const matchTags = (b.tags || []).some(t => t.toLowerCase().includes(q));

      if (activeFilter === 'books') return matchTitle || matchSynopsis;
      if (activeFilter === 'authors') return matchAuthor;
      if (activeFilter === 'genres') return matchGenre || matchTags;
      return matchTitle || matchAuthor || matchGenre || matchSynopsis || matchTags;
    });
  }, [publishedBooks, searchQuery, activeFilter]);

  return (
    <div className="bg-[#faf8f5] text-stone-900 selection:bg-amber-200">
      {/* =========================================================================
          1. HERO SECTION: "Stories Worth Reading. Authors Worth Discovering."
          ========================================================================= */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 border-b border-stone-200/70 overflow-hidden bg-gradient-to-b from-[#f7f3ec] via-[#faf8f5] to-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Quiet unboxed kicker */}
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-700" />
                <span>LitVault — Read. Discover. Publish.</span>
              </div>

              {/* Headline */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.12]">
                Stories Worth Reading.
                <br />
                <span className="text-amber-900">Authors Worth Discovering.</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-stone-600 font-editorial leading-relaxed max-w-xl mx-auto lg:mx-0">
                Discover captivating novels, powerful stories, short stories and unforgettable voices from Africa and around the world.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <button
                  onClick={onExplore}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Start Reading</span>
                </button>

                <button
                  onClick={onPublish}
                  className="w-full sm:w-auto px-7 py-4 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs uppercase tracking-wider shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Feather className="w-4 h-4 text-amber-800" />
                  <span>Publish Your Book</span>
                </button>
              </div>

              {/* Secondary Sign-In Link */}
              <div className="pt-1 text-xs text-stone-500">
                {!user ? (
                  <p>
                    Already have an account?{' '}
                    <button
                      onClick={() => onOpenAuth?.('signin')}
                      className="font-bold text-amber-900 hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                ) : (
                  <p className="text-stone-600 flex items-center justify-center lg:justify-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                    <span>Logged in as <strong>{user.displayName}</strong></span>
                  </p>
                )}
              </div>

              {/* Value Props Ribbon */}
              <div className="pt-6 border-t border-stone-200/60 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-stone-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Thousands of Verified Stories
                </span>
                <span aria-hidden="true" className="opacity-40">·</span>
                <span>Fair 70% Author Royalties</span>
                <span aria-hidden="true" className="opacity-40">·</span>
                <span>Zero Subscription Lock-In</span>
                <span aria-hidden="true" className="opacity-40">·</span>
                <span>Mobile-First Reading</span>
              </div>
            </div>

            {/* Right Column: Literary Visual Showcase (Book Spine Depth) */}
            <div className="lg:col-span-5 flex justify-center">
              {leadBook ? (
                <div className="relative w-full max-w-sm sm:max-w-md">
                  {/* Decorative warm ambient glow */}
                  <div className="absolute -inset-4 bg-gradient-to-tr from-amber-200/40 via-stone-200/30 to-amber-100/20 rounded-3xl blur-xl -z-10" />

                  {/* Master Card */}
                  <div
                    onClick={() => onSelectBook(leadBook)}
                    className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/90 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  >
                    {/* Featured Ribbon */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Editor's Lead Story
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                        {leadBook.isPremium ? 'Premium Work' : 'Free Open Access'}
                      </span>
                    </div>

                    {/* Book Cover Frame */}
                    <div className="relative mb-5 mx-auto aspect-[2/3] max-w-[220px] rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow bg-stone-100">
                      <img
                        src={leadBook.coverImage}
                        alt={leadBook.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        loading="eager"
                      />
                      {/* Book spine lighting edge */}
                      <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />
                    </div>

                    {/* Metadata */}
                    <div className="text-center space-y-1.5">
                      <div className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                        {leadBook.genre}
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900 group-hover:text-amber-900 transition-colors leading-snug">
                        {leadBook.title}
                      </h3>
                      <p className="text-xs text-stone-500 font-medium">
                        By {leadBook.authorName}
                      </p>

                      <p className="text-xs text-stone-600 font-editorial line-clamp-2 pt-2 leading-relaxed">
                        {leadBook.synopsis || leadBook.description}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-stone-700 font-semibold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        <span>{leadBook.rating.toFixed(1)}</span>
                        <span className="text-stone-400 font-normal">({leadBook.reviewCount || 42} reviews)</span>
                      </div>

                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read Now <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <RecommendationHeroSkeleton />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. PERSONALIZED SECTION: "Welcome back, [Name]" & "Continue Reading"
          (Only displayed when user is logged in and has progress or saved books)
          ========================================================================= */}
      {user && inProgressBooks.length > 0 && (
        <section className="py-12 border-b border-stone-200/80 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Welcome back, {user.displayName}
                </span>
                <h2 className="font-display text-2xl font-bold text-stone-900 mt-0.5">
                  Continue Reading
                </h2>
              </div>
              <button
                onClick={() => onExplore()}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
              >
                My Library <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {inProgressBooks.map(item => {
                if (!item) return null;
                const { book, progress, totalChapters } = item;
                const percent = progress.progressPercent || 25;
                const currentChapterNum = progress.chapterNumber || 1;

                return (
                  <div
                    key={book.id}
                    className="p-4 rounded-2xl border border-stone-200/90 bg-[#faf8f5] hover:bg-white hover:border-stone-300 shadow-2xs hover:shadow-md transition-all flex gap-4 items-center"
                  >
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-16 h-24 object-cover rounded-xl shadow-xs shrink-0 cursor-pointer"
                      onClick={() => onSelectBook(book)}
                    />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h4
                        onClick={() => onSelectBook(book)}
                        className="font-display text-sm font-bold text-stone-900 truncate hover:text-amber-800 cursor-pointer"
                      >
                        {book.title}
                      </h4>
                      <p className="text-xs text-stone-500 truncate">
                        Chapter {currentChapterNum} of {totalChapters}
                      </p>

                      {/* Reading Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-600 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                          <span>{percent}% complete</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onContinueReading ? onContinueReading(book, progress.chapterId) : onSelectBook(book)}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3 h-3 text-amber-400" />
                        <span>Continue Reading</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {user && inProgressBooks.length === 0 && (
        <section className="py-8 border-b border-stone-200/80 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-6 rounded-2xl bg-[#faf8f5] border border-stone-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Welcome back, {user.displayName}
                </span>
                <h3 className="font-display text-xl font-bold text-stone-900 mt-0.5">
                  Ready to dive into a new story?
                </h3>
                <p className="text-xs text-stone-600 font-editorial">
                  Discover free open-access stories or continue browsing your personalized reading library.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => onExplore()}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider shadow-2xs transition-colors cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          3. HOMEPAGE BOOK DISCOVERY: "Discover Your Next Story"
          ========================================================================= */}
      <section id="discovery-section" className="py-16 md:py-20 border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Literary Catalog
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Discover Your Next Story
            </h2>
            <p className="text-sm text-stone-600 font-editorial leading-relaxed">
              Explore thousands of titles across contemporary fiction, folklore, historical thrillers, and heartfelt poetry.
            </p>

            {/* Prominent Search Bar */}
            <div className="pt-4 max-w-xl mx-auto">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-stone-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search books, authors, genres and stories..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 text-xs font-bold text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Segmented Filter Buttons */}
              <div className="flex items-center justify-center gap-1.5 mt-4 p-1 rounded-xl bg-stone-200/60 max-w-xs mx-auto">
                {(['all', 'books', 'authors', 'genres'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                      activeFilter === tab
                        ? 'bg-white text-stone-900 shadow-2xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Book Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
              {Array.from({ length: 8 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          ) : searchFilteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
              {searchFilteredBooks.map(book => (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover Frame */}
                    <div
                      onClick={() => onSelectBook(book)}
                      className="relative aspect-[2/3] rounded-xl overflow-hidden bg-stone-100 shadow-xs mb-3.5 cursor-pointer"
                    >
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />

                      {/* Badge in corner: Free or Premium */}
                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs ${
                            book.isPremium
                              ? 'bg-amber-600 text-white font-mono'
                              : 'bg-stone-900/90 text-white'
                          }`}
                        >
                          {book.isPremium ? `${book.tokenPrice} Tokens` : 'Free'}
                        </span>
                      </div>
                    </div>

                    {/* Book Metadata */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                        {book.genre}
                      </div>
                      <h3
                        onClick={() => onSelectBook(book)}
                        className="font-display text-sm sm:text-base font-bold text-stone-900 line-clamp-1 group-hover:text-amber-800 transition-colors cursor-pointer"
                      >
                        {book.title}
                      </h3>
                      <button
                        onClick={() => onSelectAuthor(book.authorId)}
                        className="text-xs text-stone-500 hover:text-stone-800 truncate block text-left transition-colors cursor-pointer"
                      >
                        By {book.authorName}
                      </button>
                    </div>
                  </div>

                  {/* Card Footer: Rating + Read Now Button */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-stone-700 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{book.rating.toFixed(1)}</span>
                    </div>

                    <button
                      onClick={() => onSelectBook(book)}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-900 text-stone-800 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Read Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Friendly Empty State */
            <div className="py-16 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="font-display text-lg font-bold text-stone-800">
                Your next favourite story is coming soon.
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                No titles matched your query "{searchQuery}". Try searching for another genre, keyword, or author name.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs"
              >
                Reset Search Filters
              </button>
            </div>
          )}

          {/* Explore full catalog link */}
          <div className="mt-12 text-center">
            <button
              onClick={onExplore}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-stone-300 hover:border-stone-400 bg-white text-stone-800 text-xs font-bold uppercase tracking-wider shadow-2xs hover:shadow-sm transition-all cursor-pointer"
            >
              <span>Explore Complete Catalog ({publishedBooks.length} Titles)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. FREE READING SECTION: "Free Reads"
          ========================================================================= */}
      <section id="free-reads-section" className="py-16 md:py-20 border-b border-stone-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Open Access Books
              </span>
              <h2 className="font-display text-3xl font-extrabold text-stone-900">
                Free Reads
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-editorial">
                Great stories you can start reading today — completely free.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollCarousel(freeCarouselRef, 'left')}
                className="p-2.5 rounded-xl border border-stone-200 hover:border-stone-400 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                aria-label="Scroll left in free reads"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCarousel(freeCarouselRef, 'right')}
                className="p-2.5 rounded-xl border border-stone-200 hover:border-stone-400 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                aria-label="Scroll right in free reads"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal carousel layout on desktop, swipeable on mobile */}
          {isLoading ? (
            <div className="flex gap-5 sm:gap-6 overflow-x-hidden pb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-64 sm:w-72 shrink-0">
                  <BookCardSkeleton />
                </div>
              ))}
            </div>
          ) : freeBooks.length > 0 ? (
            <div
              ref={freeCarouselRef}
              className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-none"
            >
              {freeBooks.map(book => (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  className="w-64 sm:w-72 shrink-0 snap-start bg-[#faf8f5] rounded-2xl border border-stone-200 p-4 shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-stone-100 shadow-xs mb-3.5">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[10px] font-bold">
                        Free Read
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        {book.genre}
                      </span>
                      <h3 className="font-display text-base font-bold text-stone-900 line-clamp-1 group-hover:text-amber-800 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-stone-500 truncate">
                        By {book.authorName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-stone-700 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{book.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs font-bold text-stone-900 group-hover:text-amber-800 flex items-center gap-1">
                      Read Free <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center max-w-md mx-auto space-y-2">
              <h4 className="font-display text-base font-bold text-stone-800">
                Your next favourite story is coming soon.
              </h4>
              <p className="text-xs text-stone-500">
                Check back shortly for newly published open-access titles.
              </p>
            </div>
          )}

          <div className="mt-8 text-center sm:text-left">
            <button
              onClick={() => onSelectGenre('African Literature')}
              className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider shadow-2xs cursor-pointer"
            >
              Explore Free Reads
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. PREMIUM STORIES SECTION: "Premium Stories"
          ========================================================================= */}
      <section id="premium-section" className="py-16 md:py-20 border-b border-stone-200/80 bg-gradient-to-b from-[#faf8f5] to-[#f5f1ea]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-700" />
                Monetized Literary Works
              </span>
              <h2 className="font-display text-3xl font-extrabold text-stone-900">
                Premium Stories
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-editorial">
                Discover exceptional stories from talented authors and unlock them with LitTokens.
              </p>
            </div>

            <button
              onClick={onExplore}
              className="px-6 py-2.5 rounded-xl border border-stone-300 hover:border-stone-400 bg-white text-stone-800 font-bold text-xs uppercase tracking-wider shadow-2xs cursor-pointer self-start sm:self-auto"
            >
              Explore Premium
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          ) : premiumBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {premiumBooks.map(book => (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  className="bg-white rounded-2xl border border-amber-200/70 p-5 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-stone-100 shadow-xs mb-4">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-amber-600 text-white text-xs font-mono font-bold shadow-xs flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        {book.tokenPrice} Tokens
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        {book.genre}
                      </span>
                      <h3 className="font-display text-base font-bold text-stone-900 line-clamp-1 group-hover:text-amber-800 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-stone-500 truncate">
                        By {book.authorName}
                      </p>
                      <p className="text-xs text-stone-600 font-editorial line-clamp-2 pt-1">
                        {book.synopsis || book.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-500 text-[11px]">
                      70% to Author
                    </span>
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      Unlock Book <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center max-w-md mx-auto space-y-2">
              <h4 className="font-display text-base font-bold text-stone-800">
                Your next favourite story is coming soon.
              </h4>
              <p className="text-xs text-stone-500">
                Premium works from verified authors are on their way.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          6. GENRE SECTION: "Explore by Genre" (All 15 visual genre cards)
          ========================================================================= */}
      <section id="genres-section" className="py-16 md:py-20 border-b border-stone-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Curated Taxonomy
            </span>
            <h2 className="font-display text-3xl font-extrabold text-stone-900">
              Explore by Genre
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-editorial">
              Find your next obsession across 15 hand-curated literary genres.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <GenreCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
              {GENRE_CARDS_DATA.map(genre => {
                const count = publishedBooks.filter(b => b.genre.toLowerCase() === genre.name.toLowerCase()).length;

                return (
                  <button
                    key={genre.name}
                    onClick={() => onSelectGenre(genre.name)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col justify-between ${genre.bg} ${genre.border} ${genre.text}`}
                  >
                    <div className="space-y-2">
                      <span className="text-2xl block">{genre.icon}</span>
                      <h3 className="font-display text-sm font-bold leading-snug">
                        {genre.name}
                      </h3>
                      <p className="text-[11px] opacity-80 leading-relaxed font-sans line-clamp-2">
                        {genre.blurb}
                      </p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-bold opacity-75">
                      <span>{count} {count === 1 ? 'Title' : 'Titles'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          7. TRENDING SECTION: "Trending Now" (Real Database Engagement)
          ========================================================================= */}
      <section className="py-16 md:py-20 border-b border-stone-200/80 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                Reader Engagement
              </span>
              <h2 className="font-display text-3xl font-extrabold text-stone-900">
                Trending Now
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-editorial">
                Books currently receiving high reader engagement across LitVault.
              </p>
            </div>

            <button
              onClick={onExplore}
              className="text-xs font-bold text-stone-700 hover:text-stone-900 flex items-center gap-1"
            >
              See All Trending <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          ) : trendingBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingBooks.map((book, idx) => (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-mono font-extrabold text-stone-400">
                        #{idx + 1}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-500 font-mono">
                        {book.readsCount.toLocaleString()} reads
                      </span>
                    </div>

                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-stone-100 shadow-xs mb-3.5">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        {book.genre}
                      </span>
                      <h3 className="font-display text-base font-bold text-stone-900 line-clamp-1 group-hover:text-amber-800 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-stone-500 truncate">
                        By {book.authorName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 font-semibold text-stone-700">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{book.rating.toFixed(1)}</span>
                    </div>
                    <span className="font-bold text-stone-900 group-hover:text-amber-800 flex items-center gap-1">
                      Read Now <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center max-w-md mx-auto space-y-2">
              <h4 className="font-display text-base font-bold text-stone-800">
                Your next favourite story is coming soon.
              </h4>
              <p className="text-xs text-stone-500">
                Trending rankings update automatically as readers engage with books.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          8. POPULAR AUTHORS: "Meet Popular Authors"
          ========================================================================= */}
      <section id="authors-section" className="py-16 md:py-20 border-b border-stone-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Creators & Mentors
              </span>
              <h2 className="font-display text-3xl font-extrabold text-stone-900">
                Meet Popular Authors
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-editorial">
                The inspiring novelists, poets, and storytellers defining contemporary African and international letters.
              </p>
            </div>

            <button
              onClick={onExplore}
              className="px-6 py-2.5 rounded-xl border border-stone-300 hover:border-stone-400 bg-white text-stone-800 font-bold text-xs uppercase tracking-wider shadow-2xs cursor-pointer"
            >
              Explore Authors
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <AuthorCardSkeleton key={i} />
              ))}
            </div>
          ) : popularAuthors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularAuthors.map(author => {
                const authorBooksCount = publishedBooks.filter(b => b.authorId === author.id).length;
                const isFollowed = isAuthorFollowed(author.id);

                return (
                  <div
                    key={author.id}
                    className="bg-[#faf8f5] rounded-2xl border border-stone-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3.5 mb-3.5">
                        <img
                          src={author.photoURL}
                          alt={author.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer"
                          onClick={() => onSelectAuthor(author.id)}
                        />
                        <div className="min-w-0">
                          <h4
                            onClick={() => onSelectAuthor(author.id)}
                            className="font-display text-base font-bold text-stone-900 truncate hover:text-amber-800 cursor-pointer"
                          >
                            {author.name}
                          </h4>
                          <p className="text-xs text-stone-500 truncate">
                            {author.location || 'Author & Mentor'}
                          </p>
                          <span className="text-[11px] font-semibold text-amber-800 font-mono">
                            {authorBooksCount} {authorBooksCount === 1 ? 'Book' : 'Books'} Published
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 font-editorial line-clamp-3 leading-relaxed">
                        {author.bio}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-stone-200/60 flex items-center justify-between">
                      <button
                        onClick={() => onSelectAuthor(author.id)}
                        className="text-xs font-bold text-stone-700 hover:text-stone-900 cursor-pointer"
                      >
                        View Profile
                      </button>

                      <button
                        onClick={() => toggleFollowAuthor(author.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isFollowed
                            ? 'bg-stone-200 text-stone-800'
                            : 'bg-stone-900 hover:bg-stone-800 text-white shadow-2xs'
                        }`}
                      >
                        {isFollowed ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center max-w-md mx-auto space-y-2">
              <h4 className="font-display text-base font-bold text-stone-800">
                Our authors are publishing new works soon.
              </h4>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          9. READING COMMUNITY SECTION: Why Join LitVault
          ========================================================================= */}
      <section className="py-16 md:py-24 border-b border-stone-200/80 bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
                A Welcoming Reading Community
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Read Freely. Connect Deeply. Support Authors.
              </h2>
              <p className="text-sm sm:text-base text-stone-300 font-editorial leading-relaxed">
                LitVault brings together passionate book lovers and talented creators. Build your personalized literary sanctuary with tools designed for comfortable reading.
              </p>

              {/* Six Community Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3">
                {[
                  'Discover thousands of stories',
                  'Save books to your personal library',
                  'Continue reading anytime, anywhere',
                  'Follow your favourite authors',
                  'Unlock premium stories with LitTokens',
                  'Build your own reading history',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-stone-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onOpenAuth ? onOpenAuth('signup') : onExplore()}
                  className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Create Your Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md bg-stone-900/80 p-7 rounded-3xl border border-stone-700/80 shadow-2xl backdrop-blur-sm space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    LV
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-white">LitVault Reader Sanctuary</h4>
                    <p className="text-[11px] text-stone-400">Synchronized reading across phone, tablet & web</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-200">Sepia, Paper & Midnight Themes</span>
                    <span className="text-amber-400 text-[11px]">Distraction-Free</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed font-editorial">
                    "LitVault gives African authors the prestige presentation their masterworks deserve while making reading effortless."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center pt-2">
                  <div className="p-3 rounded-xl bg-stone-800/40 border border-stone-800">
                    <div className="font-mono text-xl font-bold text-amber-400">100%</div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">Author Control</div>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-800/40 border border-stone-800">
                    <div className="font-mono text-xl font-bold text-emerald-400">Zero</div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">Monthly Subscriptions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. AUTHOR SECTION: "Have a Story to Share?"
          ========================================================================= */}
      <section className="py-16 md:py-20 border-b border-stone-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#faf8f5] rounded-3xl border border-stone-200 p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
            <div className="max-w-2xl space-y-3 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Author Publishing Studio
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900">
                Have a Story to Share?
              </h2>
              <p className="text-sm sm:text-base text-stone-600 font-editorial leading-relaxed">
                Turn your stories into an audience. Publish your work on LitVault and connect with readers around the world.
              </p>
              <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-500 justify-center md:justify-start">
                <span>✓ Retain 100% of your copyright</span>
                <span>✓ Non-exclusive publishing</span>
                <span>✓ Payouts via Bank Wire, Paystack & Mobile Money</span>
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={onPublish}
                className="px-8 py-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Feather className="w-4 h-4 text-amber-400" />
                <span>Become an Author</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          11. FOOTER: Large Professional Literary Footer
          ========================================================================= */}
      <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-10 pb-12 border-b border-stone-800/80">
            {/* Column 1: Brand & Identity */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-display font-black text-lg">
                  L
                </div>
                <span className="font-display font-black text-2xl text-white tracking-tight">
                  LitVault
                </span>
              </div>

              <p className="text-xs text-stone-400 font-editorial max-w-sm leading-relaxed">
                "Read. Discover. Publish."
                <br />
                A modern digital literary platform where readers discover captivating novels, short stories, and poetry, while authors publish and monetize their books.
              </p>

              {/* Social Media Icons */}
              <div className="flex items-center gap-3 pt-2 text-stone-400">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-stone-900 hover:text-white hover:bg-stone-800 transition-colors"
                  aria-label="LitVault on Twitter / X"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-stone-900 hover:text-white hover:bg-stone-800 transition-colors"
                  aria-label="LitVault on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-stone-900 hover:text-white hover:bg-stone-800 transition-colors"
                  aria-label="LitVault on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-stone-900 hover:text-white hover:bg-stone-800 transition-colors"
                  aria-label="LitVault on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-stone-900 hover:text-white hover:bg-stone-800 transition-colors"
                  aria-label="LitVault on GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Navigation
              </h4>
              <ul className="space-y-2 text-xs text-stone-400">
                <li>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={onExplore} className="hover:text-white transition-colors cursor-pointer">
                    Explore Books
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectGenre('African Literature')} className="hover:text-white transition-colors cursor-pointer">
                    Genres Taxonomy
                  </button>
                </li>
                <li>
                  <button onClick={onExplore} className="hover:text-white transition-colors cursor-pointer">
                    Authors Directory
                  </button>
                </li>
                <li>
                  <button onClick={() => { const el = document.getElementById('free-reads-section'); el?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">
                    Free Reads
                  </button>
                </li>
                <li>
                  <button onClick={() => { const el = document.getElementById('premium-section'); el?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">
                    Premium Stories
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenLegal('about')} className="hover:text-white transition-colors cursor-pointer">
                    About LitVault
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: For Authors */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                For Authors
              </h4>
              <ul className="space-y-2 text-xs text-stone-400">
                <li>
                  <button onClick={onPublish} className="hover:text-white transition-colors cursor-pointer">
                    Become an Author
                  </button>
                </li>
                <li>
                  <button onClick={onPublish} className="hover:text-white transition-colors cursor-pointer">
                    Author Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenLegal('guidelines')} className="hover:text-white transition-colors cursor-pointer">
                    Publishing Guidelines
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenLegal('copyright')} className="hover:text-white transition-colors cursor-pointer">
                    Creator Royalties & Payouts
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Support
              </h4>
              <ul className="space-y-2 text-xs text-stone-400">
                <li>
                  <button onClick={() => onOpenLegal('help')} className="hover:text-white transition-colors cursor-pointer">
                    Help Center
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenLegal('contact')} className="hover:text-white transition-colors cursor-pointer">
                    Contact
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (onOpenReport) {
                        onOpenReport('book', 'general-report', 'Content or Book Report');
                      } else {
                        onOpenLegal('contact');
                      }
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Report a Book
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenLegal('copyright')} className="hover:text-white transition-colors cursor-pointer">
                    Copyright Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 5: Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Legal
              </h4>
              <ul className="space-y-2 text-xs text-stone-400">
                <li>
                  <button onClick={() => onOpenLegal('terms')} className="hover:text-white transition-colors cursor-pointer">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition-colors cursor-pointer">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenLegal('guidelines')} className="hover:text-white transition-colors cursor-pointer">
                    Content Guidelines
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <p>© 2026 LitVault. All rights reserved.</p>
            <p className="flex items-center gap-4 text-[11px]">
              <span className="hover:text-stone-300 cursor-pointer" onClick={() => onOpenLegal('terms')}>Terms</span>
              <span>·</span>
              <span className="hover:text-stone-300 cursor-pointer" onClick={() => onOpenLegal('privacy')}>Privacy</span>
              <span>·</span>
              <span className="hover:text-stone-300 cursor-pointer" onClick={() => onOpenLegal('copyright')}>DMCA Notice</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
