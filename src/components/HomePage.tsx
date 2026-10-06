import React from 'react';
import { Book, AuthorProfile } from '../types';
import { useApp } from '../context/AppContext';
import {
  ArrowRight,
  Star,
  Coins,
  Feather,
  ChevronRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { AdSlot } from './AdSlot';

interface HomePageProps {
  onExplore: () => void;
  onPublish: () => void;
  onSelectBook: (book: Book) => void;
  onSelectAuthor: (authorId: string) => void;
  onSelectGenre: (genreName: string) => void;
  onOpenLegal: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onExplore,
  onPublish,
  onSelectBook,
  onSelectAuthor,
  onSelectGenre,
  onOpenLegal,
}) => {
  const { books, authors, genres, settings, isAuthorFollowed, toggleFollowAuthor } = useApp();

  const publishedBooks = books.filter(b => b.status === 'published');
  const leadBook = publishedBooks.find(b => b.id === 'book-echoes-savanna') || publishedBooks[0];
  const featuredBooks = publishedBooks.filter(b => b.featured && b.id !== leadBook?.id).slice(0, 3);
  const africanLitBooks = publishedBooks.filter(b => b.genre === 'African Literature').slice(0, 4);
  const freeBooks = publishedBooks.filter(b => !b.isPremium).slice(0, 4);
  const premiumBooks = publishedBooks.filter(b => b.isPremium).slice(0, 4);
  const trendingBooks = [...publishedBooks].sort((a, b) => b.readsCount - a.readsCount).slice(0, 4);

  return (
    <div className="bg-[#faf8f5] text-stone-900 selection:bg-amber-100">
      {/* Announcement ribbon if present */}
      {settings.announcement && (
        <aside className="bg-stone-900 text-stone-300 text-xs py-2.5 px-4 text-center font-editorial tracking-wide border-b border-stone-800">
          <span className="text-amber-400 font-sans font-semibold text-[11px] uppercase tracking-widest mr-2">
            Notice
          </span>
          {settings.announcement}
        </aside>
      )}

      {/* Hero Section: Editorial Marquee with Asymmetric Focal Anchor */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-stone-200/80 bg-gradient-to-b from-[#f7f4ee] via-[#faf8f5] to-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-900">
                LitVault International Press · Vol. MMXXVI
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.12]">
                {settings.heroHeadline || 'Stories Worth Reading. Authors Worth Discovering.'}
              </h1>

              <p className="text-base sm:text-lg text-stone-600 font-editorial leading-relaxed max-w-xl mx-auto lg:mx-0">
                {settings.heroSubheadline ||
                  'Discover captivating novels, powerful stories and unforgettable voices from Africa and around the world.'}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={onExplore}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs tracking-wider uppercase shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Explore Books
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onPublish}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-stone-300 hover:border-stone-400 text-stone-800 hover:bg-stone-100/60 font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Feather className="w-4 h-4 text-amber-800" />
                  Publish Your Book
                </button>
              </div>

              {/* Operational Curatorial Ribbon (Zero-pill text separators) */}
              <div className="pt-8 border-t border-stone-200/70 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs text-stone-500 font-medium">
                <span>24,000+ Reads</span>
                <span aria-hidden="true">·</span>
                <span>{settings.authorRevenueSharePercent}% Creator Fair Share</span>
                <span aria-hidden="true">·</span>
                <span>Verified Authors</span>
                <span aria-hidden="true">·</span>
                <span>Zero Subscription Lock-In</span>
              </div>
            </div>

            {/* Right Column: Lead Story Master Showcase */}
            {leadBook && (
              <div className="lg:col-span-5 flex justify-center">
                <div
                  onClick={() => onSelectBook(leadBook)}
                  className="w-full max-w-sm bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  {/* Hardcover Book Frame */}
                  <div className="relative mb-6 mx-auto aspect-[3/4] max-w-[240px] book-spine-effect overflow-hidden bg-stone-100">
                    <img
                      src={leadBook.coverImage}
                      alt={leadBook.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>

                  {/* Clean unboxed metadata */}
                  <div className="flex items-center gap-2 text-xs text-amber-900 font-semibold mb-1">
                    <span>{leadBook.genre}</span>
                    <span aria-hidden="true">·</span>
                    <span>Curator's Selection</span>
                  </div>

                  <h3 className="font-display font-bold text-xl text-stone-900 group-hover:text-amber-800 transition-colors leading-snug">
                    {leadBook.title}
                  </h3>

                  <p className="text-xs text-stone-500 mt-1">
                    by {leadBook.authorName}
                  </p>

                  <p className="mt-3 text-xs text-stone-600 line-clamp-2 font-editorial leading-relaxed">
                    {leadBook.synopsis || leadBook.description}
                  </p>

                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 font-bold text-stone-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{leadBook.rating.toFixed(1)}</span>
                      <span className="text-stone-400 font-normal">({leadBook.reviewCount})</span>
                    </div>

                    <span className="text-amber-800 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Preview <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 1: Featured Literature Showcase */}
      {featuredBooks.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-stone-200 gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-amber-800">
                Editorial Dispatch
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                Featured Literary Works
              </h2>
            </div>
            <button
              onClick={onExplore}
              className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition-colors"
            >
              View Full Catalog <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBooks.map(book => (
              <article
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[3/4] mb-5 book-spine-effect overflow-hidden bg-stone-100 max-w-[200px] mx-auto">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Clean unboxed metadata (No pills) */}
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                    <span className="font-medium text-amber-900">{book.genre}</span>
                    <span aria-hidden="true">·</span>
                    <span>{book.language}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-stone-700">
                      {book.isPremium ? `${book.tokenPrice} Tokens` : 'Free'}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                    {book.title}
                  </h3>

                  <p className="text-xs text-stone-500 mt-0.5">
                    by {book.authorName}
                  </p>

                  <p className="text-xs text-stone-600 line-clamp-2 mt-2 font-editorial leading-relaxed">
                    {book.synopsis || book.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-mono">
                  <span className="flex items-center gap-1 font-sans font-bold text-stone-800">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {book.rating.toFixed(1)}
                  </span>
                  <span>{book.readsCount.toLocaleString()} readers</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: African Literature Spotlight (Dedicated Heritage Row) */}
      {africanLitBooks.length > 0 && (
        <section className="py-20 bg-[#f6f2ea] border-y border-stone-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-stone-300/60 gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-amber-900">
                  Continental & Diaspora Anthology
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                  Voices of African Literature
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 font-editorial mt-1 max-w-xl">
                  Stories rooted in Yoruba folklore, Accra espionage, Cape Town Afrofuturism, and Nile oral traditions.
                </p>
              </div>
              <button
                onClick={() => onSelectGenre('African Literature')}
                className="text-xs font-bold text-amber-900 hover:text-stone-900 flex items-center gap-1.5 transition-colors"
              >
                Browse Collection <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {africanLitBooks.map(book => (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[3/4] mb-4 book-spine-effect overflow-hidden bg-stone-100">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1">
                      <span>{book.language}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{book.isPremium ? `${book.tokenPrice} Tokens` : 'Free Read'}</span>
                    </div>

                    <h3 className="font-display font-bold text-base text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">by {book.authorName}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-900">
                    <span>Read Work</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AD SLOT: Responsive Editorial Sponsor Leaderboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdSlot position="header" />
      </div>

      {/* SECTION 3: Trending Literature vs Free Access Reads (Dual Column Layout) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Trending Now (Left 6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
                Trending on LitVault
              </h2>
              <span className="text-xs text-stone-400 font-mono">Most Read This Week</span>
            </div>

            <div className="divide-y divide-stone-200/60">
              {trendingBooks.map((book, idx) => (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  className="py-4 flex items-center gap-5 hover:bg-white/60 px-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <span className="font-display font-bold text-2xl text-stone-300 group-hover:text-amber-800 transition-colors w-8 shrink-0">
                    0{idx + 1}
                  </span>
                  <div className="w-14 h-20 book-spine-effect overflow-hidden bg-stone-100 shrink-0">
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <span>{book.genre}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{book.readsCount.toLocaleString()} reads</span>
                    </div>
                    <h4 className="font-display font-bold text-base text-stone-900 group-hover:text-amber-800 transition-colors truncate mt-0.5">
                      {book.title}
                    </h4>
                    <p className="text-xs text-stone-500">by {book.authorName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Free Reads (Right 6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
                Free Complete Reads
              </h2>
              <span className="text-xs text-emerald-700 font-semibold">Zero Tokens Required</span>
            </div>

            <div className="divide-y divide-stone-200/60">
              {freeBooks.map((book, idx) => (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  className="py-4 flex items-center gap-5 hover:bg-white/60 px-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="w-14 h-20 book-spine-effect overflow-hidden bg-stone-100 shrink-0">
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <span className="text-emerald-800 font-semibold">Open Access</span>
                      <span aria-hidden="true">·</span>
                      <span>{book.genre}</span>
                    </div>
                    <h4 className="font-display font-bold text-base text-stone-900 group-hover:text-amber-800 transition-colors truncate mt-0.5">
                      {book.title}
                    </h4>
                    <p className="text-xs text-stone-500">by {book.authorName}</p>
                    <p className="text-xs text-stone-600 line-clamp-1 font-editorial mt-1">
                      {book.synopsis || book.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-amber-800 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Premium Stories (LitTokens Vault Access) */}
      <section className="py-20 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-stone-800 gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
                LitToken Premium Vault
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Monetized Literary Serials & Novels
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-editorial mt-1">
                One-time token unlock grants lifetime reading. {settings.authorRevenueSharePercent}% of every unlock supports the author directly.
              </p>
            </div>
            <button
              onClick={onExplore}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
            >
              Explore Vault <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumBooks.map(book => (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="bg-stone-950/70 p-5 rounded-2xl border border-stone-800 hover:border-amber-700/80 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[3/4] mb-4 book-spine-effect overflow-hidden bg-stone-900">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-amber-400/90 font-mono mb-1">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{book.tokenPrice} LitTokens</span>
                    <span aria-hidden="true" className="text-stone-600">·</span>
                    <span className="text-stone-400 font-sans">{book.genre}</span>
                  </div>

                  <h3 className="font-display font-bold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">by {book.authorName}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs font-semibold text-amber-400">
                  <span>Unlock Work</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: Author Discovery Spotlight */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-900">
            Voices of the Platform
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            Discover Acclaimed Authors
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-editorial mt-2">
            Follow independent novelists, historical biographers, and spoken-word poets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {authors.map(author => {
            const isFollowed = isAuthorFollowed(author.id);
            return (
              <div
                key={author.id}
                className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group"
              >
                <div
                  onClick={() => onSelectAuthor(author.id)}
                  className="cursor-pointer"
                >
                  <img
                    src={author.photoURL}
                    alt={author.name}
                    className="w-20 h-20 rounded-full object-cover mb-4 border border-stone-200 group-hover:scale-105 transition-transform duration-200"
                  />
                  <h3 className="font-display font-bold text-base text-stone-900 group-hover:text-amber-800 transition-colors">
                    {author.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">{author.location}</p>
                  <p className="text-xs text-stone-600 line-clamp-2 mt-2 font-editorial leading-relaxed">
                    {author.bio}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 w-full flex items-center justify-between text-xs">
                  <span className="font-mono text-stone-500 text-[11px]">
                    {author.totalReaders.toLocaleString()} readers
                  </span>
                  <button
                    onClick={() => toggleFollowAuthor(author.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isFollowed
                        ? 'bg-stone-100 text-stone-700'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    {isFollowed ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 6: Browse by Genre (Refined Typographic Taxonomy) */}
      <section className="py-20 bg-[#f7f4ee] border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-stone-300/60 gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-amber-900">
                Taxonomy & Curations
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                Browse Literary Catalog by Genre
              </h2>
            </div>
            <button
              onClick={onExplore}
              className="text-xs font-bold text-stone-700 hover:text-stone-900 flex items-center gap-1.5"
            >
              All Genres <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.filter(g => g.active).slice(0, 12).map(genre => (
              <button
                key={genre.id}
                onClick={() => onSelectGenre(genre.name)}
                className="bg-white p-5 rounded-xl border border-stone-200/80 hover:border-amber-800 hover:bg-amber-50/20 text-left transition-all cursor-pointer group"
              >
                <h4 className="font-display font-bold text-sm text-stone-900 group-hover:text-amber-900 transition-colors">
                  {genre.name}
                </h4>
                <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-editorial">
                  {genre.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Institutional Publisher CTA */}
      <section className="py-20 bg-stone-900 text-white border-t border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto text-amber-400 border border-amber-500/20">
            <Feather className="w-6 h-6" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Publish on LitVault. Build Your Global Readership.
          </h2>

          <p className="text-sm sm:text-base text-stone-300 font-editorial max-w-xl mx-auto leading-relaxed">
            From serialized novels to independent poetry collections, monetize your writing with transparent LitTokens and {settings.authorRevenueSharePercent}% creator fair share royalties.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onPublish}
              className="px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs tracking-wider uppercase shadow-md transition-all"
            >
              Open Author Studio
            </button>
            <button
              onClick={() => onOpenLegal('agreement')}
              className="px-6 py-3.5 rounded-xl border border-stone-700 text-stone-300 hover:text-white hover:bg-white/5 font-semibold text-xs tracking-wider uppercase transition-all"
            >
              Read Author Agreement
            </button>
          </div>
        </div>
      </section>

      {/* Institutional Editorial Footer */}
      <footer className="bg-white border-t border-stone-200/80 pt-16 pb-12 text-stone-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Imprint Column */}
            <div className="col-span-2 space-y-3">
              <span className="font-display text-2xl font-bold text-stone-900 tracking-tight block">
                LitVault
              </span>
              <p className="text-xs text-stone-500 max-w-sm font-editorial leading-relaxed">
                The international digital publishing and reading ecosystem dedicated to celebrating contemporary and heritage literature with fair creator economics.
              </p>
              <div className="flex items-center gap-2 text-stone-500 font-mono text-[11px] pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Protected by LitVault Copyright Protocol</span>
              </div>
            </div>

            {/* Catalog Links */}
            <div>
              <h4 className="font-bold text-stone-900 uppercase tracking-widest text-[11px] mb-3">
                Discover
              </h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={onExplore} className="hover:text-amber-800 transition-colors">Catalog Directory</button></li>
                <li><button onClick={() => onSelectGenre('African Literature')} className="hover:text-amber-800 transition-colors">African Literature</button></li>
                <li><button onClick={() => onSelectGenre('Historical Fiction')} className="hover:text-amber-800 transition-colors">Historical Fiction</button></li>
                <li><button onClick={() => onSelectGenre('Poetry')} className="hover:text-amber-800 transition-colors">Poetry Collections</button></li>
              </ul>
            </div>

            {/* Creators Links */}
            <div>
              <h4 className="font-bold text-stone-900 uppercase tracking-widest text-[11px] mb-3">
                Publishing
              </h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={onPublish} className="hover:text-amber-800 transition-colors">Author Studio</button></li>
                <li><button onClick={() => onOpenLegal('agreement')} className="hover:text-amber-800 transition-colors">Publishing Agreement</button></li>
                <li><button onClick={() => onOpenLegal('guidelines')} className="hover:text-amber-800 transition-colors">Content Guidelines</button></li>
                <li><button onClick={() => onOpenLegal('copyright')} className="hover:text-amber-800 transition-colors">Copyright & DMCA</button></li>
              </ul>
            </div>

            {/* Governance Links */}
            <div>
              <h4 className="font-bold text-stone-900 uppercase tracking-widest text-[11px] mb-3">
                Governance
              </h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => onOpenLegal('terms')} className="hover:text-amber-800 transition-colors">Terms of Service</button></li>
                <li><button onClick={() => onOpenLegal('privacy')} className="hover:text-amber-800 transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => onOpenLegal('copyright')} className="hover:text-amber-800 transition-colors">DMCA Notice Procedure</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-400 text-[11px]">
            <span>© {new Date().getFullYear()} LitVault Technology Press. All rights reserved.</span>
            <span className="font-editorial italic">"Read. Discover. Publish."</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
