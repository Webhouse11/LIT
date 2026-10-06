import React from 'react';
import { AuthorProfile, Book } from '../types';
import { useApp } from '../context/AppContext';
import { sanitizeUrl, sanitizeTwitterHandle } from '../lib/security';
import {
  Star,
  MapPin,
  Globe,
  Twitter,
  UserCheck,
  UserPlus,
  BookOpen,
  Coins,
  ArrowLeft,
  Users,
  Award,
} from 'lucide-react';

interface AuthorProfilePageProps {
  authorId: string;
  onSelectBook: (book: Book) => void;
  onBack: () => void;
}

export const AuthorProfilePage: React.FC<AuthorProfilePageProps> = ({
  authorId,
  onSelectBook,
  onBack,
}) => {
  const { authors, books, isAuthorFollowed, toggleFollowAuthor } = useApp();
  const author = authors.find(a => a.id === authorId);

  if (!author) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <p className="text-stone-500 mb-4">Author profile not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const authorBooks = books.filter(b => b.authorId === author.id && b.status === 'published');
  const isFollowed = isAuthorFollowed(author.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Author Hero Banner */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden mb-10">
        {/* Decorative banner header */}
        <div className="h-40 sm:h-52 bg-gradient-to-r from-amber-900 via-stone-800 to-amber-950 relative">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <div className="px-6 sm:px-10 pb-8 relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <img
              src={author.photoURL}
              alt={author.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-4 border-white shadow-xl bg-stone-100"
            />
            <div className="mb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {author.name}
                </h1>
                <span title="Verified LitVault Author">
                  <Award className="w-5 h-5 text-amber-600 shrink-0" />
                </span>
              </div>
              {author.location && (
                <p className="text-xs text-stone-500 flex items-center justify-center sm:justify-start gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {author.location}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleFollowAuthor(author.id)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 ${
                isFollowed
                  ? 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {isFollowed ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Follow Author
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bio & Social links */}
        <div className="px-6 sm:px-10 pb-8 pt-2 border-t border-stone-100 flex flex-col md:flex-row gap-8 justify-between">
          <div className="max-w-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Author Biography
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-editorial">
              {author.bio}
            </p>

            {/* Social links */}
            <div className="mt-4 flex items-center gap-4 text-xs font-medium text-stone-500">
              {author.website && sanitizeUrl(author.website) && (
                <a
                  href={sanitizeUrl(author.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-amber-700 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
              {author.twitter && sanitizeTwitterHandle(author.twitter) && (
                <a
                  href={`https://twitter.com/${sanitizeTwitterHandle(author.twitter)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-amber-700 text-stone-600 transition-colors"
                >
                  <Twitter className="w-3.5 h-3.5" /> @{sanitizeTwitterHandle(author.twitter)}
                </a>
              )}
            </div>
          </div>

          {/* Key metrics grid */}
          <div className="grid grid-cols-3 gap-3 md:w-80 shrink-0">
            <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100 text-center">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Published</span>
              <span className="font-mono text-base font-bold text-stone-900 mt-1 block">
                {authorBooks.length} Books
              </span>
            </div>
            <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100 text-center">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Readers</span>
              <span className="font-mono text-base font-bold text-stone-900 mt-1 block">
                {author.totalReaders.toLocaleString()}
              </span>
            </div>
            <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100 text-center">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Avg Rating</span>
              <span className="font-bold text-base text-amber-600 mt-1 flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {author.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Published Works Catalog */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
              Published Works by {author.name}
            </h2>
            <p className="text-xs text-stone-500">
              Novels, anthologies, and stories available on LitVault
            </p>
          </div>
        </div>

        {authorBooks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-stone-500 text-xs">No public books listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorBooks.map(book => (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="bg-white rounded-2xl p-4 border border-stone-200/80 hover:shadow-lg hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative mb-3 overflow-hidden rounded-xl">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {book.isPremium ? (
                      <div className="absolute top-2.5 right-2.5 bg-amber-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Coins className="w-3 h-3 text-amber-200" />
                        {book.tokenPrice} Tokens
                      </div>
                    ) : (
                      <div className="absolute top-2.5 right-2.5 bg-emerald-700/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
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
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 font-editorial">
                    {book.synopsis || book.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-bold text-stone-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {book.rating.toFixed(1)}
                  </span>
                  <span className="text-stone-400 font-mono text-[11px]">
                    {book.readsCount} reads
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
