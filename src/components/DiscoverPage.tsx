import React, { useState, useMemo } from 'react';
import { Book } from '../types';
import { useApp } from '../context/AppContext';
import {
  Search,
  Filter,
  Star,
  Coins,
  BookOpen,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';

interface DiscoverPageProps {
  onSelectBook: (book: Book) => void;
  initialGenre?: string;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  onSelectBook,
  initialGenre,
}) => {
  const { books, genres } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre || 'all');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [sortBy, setSortBy] = useState<'trending' | 'rating' | 'newest' | 'priceAsc' | 'priceDesc'>('trending');

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      if (book.status !== 'published') return false;

      // Genre filter
      if (selectedGenre !== 'all' && book.genre !== selectedGenre) {
        return false;
      }

      // Pricing filter
      if (pricingFilter === 'free' && book.isPremium) return false;
      if (pricingFilter === 'premium' && !book.isPremium) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = book.title.toLowerCase().includes(q);
        const matchAuthor = book.authorName.toLowerCase().includes(q);
        const matchGenre = book.genre.toLowerCase().includes(q);
        const matchDesc = book.description.toLowerCase().includes(q);
        const matchTags = book.tags.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchAuthor && !matchGenre && !matchDesc && !matchTags) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'trending') return b.readsCount - a.readsCount;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'priceAsc') return a.tokenPrice - b.tokenPrice;
      if (sortBy === 'priceDesc') return b.tokenPrice - a.tokenPrice;
      return 0;
    });
  }, [books, searchQuery, selectedGenre, pricingFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-700">
          Literary Catalog & Discoveries
        </span>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 mt-1">
          Explore Books & Stories
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2">
          Discover celebrated novels, serialized thrillers, African epics, and indie poetry collections.
        </p>
      </div>

      {/* Search and Filter Control Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-xs mb-8 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by book title, author, themes, African mythology, or keywords..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all placeholder:text-stone-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-3.5 text-xs text-stone-400 hover:text-stone-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Pricing Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setPricingFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pricingFilter === 'all' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
              }`}
            >
              All Works
            </button>
            <button
              onClick={() => setPricingFilter('free')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pricingFilter === 'free' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
              }`}
            >
              Free Reads
            </button>
            <button
              onClick={() => setPricingFilter('premium')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pricingFilter === 'premium' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
              }`}
            >
              Premium LitTokens
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="trending">Most Popular / Trending</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Releases</option>
              <option value="priceAsc">Token Price: Low to High</option>
              <option value="priceDesc">Token Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Genre Pill Carousel */}
        <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedGenre('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              selectedGenre === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Genres
          </button>
          {genres.filter(g => g.active).map(genre => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.name)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedGenre === genre.name
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6 text-xs text-stone-500">
        <span>
          Showing <strong className="text-stone-900">{filteredBooks.length}</strong> literary works
        </span>
        {selectedGenre !== 'all' && (
          <span className="font-semibold text-amber-800">
            Filtered by: {selectedGenre}
          </span>
        )}
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-stone-200">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-display text-lg font-bold text-stone-800">
            No matching books found
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            Try adjusting your search terms, genre filter, or pricing selection.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGenre('all');
              setPricingFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="bg-white rounded-2xl p-4 border border-stone-200/80 hover:shadow-xl hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative mb-3.5 book-spine-effect overflow-hidden bg-stone-100 aspect-[3/4]">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {book.isPremium ? (
                    <div className="absolute top-2.5 right-2.5 bg-stone-900/85 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                      <Coins className="w-3 h-3 text-amber-300" />
                      {book.tokenPrice} Tokens
                    </div>
                  ) : (
                    <div className="absolute top-2.5 right-2.5 bg-emerald-800/85 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                      Free Read
                    </div>
                  )}
                </div>

                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">
                  {book.genre}
                </span>
                <h3 className="font-bold text-sm text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1 mt-0.5">
                  {book.title}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-1">
                  by {book.authorName}
                </p>
                <p className="text-xs text-stone-600 line-clamp-2 mt-1.5 font-editorial">
                  {book.synopsis || book.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-bold text-stone-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {book.rating.toFixed(1)}
                </span>
                <span className="text-stone-400 font-mono text-[11px]">
                  {book.readsCount.toLocaleString()} reads
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
