import React, { useState } from 'react';
import { Book, Chapter } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Coins,
  Star,
  Bookmark,
  Share2,
  Flag,
  Check,
  UserCheck,
  UserPlus,
  Lock,
  Unlock,
  ChevronRight,
  Clock,
  Sparkles,
  Heart,
  Globe,
  ArrowLeft,
} from 'lucide-react';
import { AdSlot } from './AdSlot';

interface BookDetailPageProps {
  book: Book;
  onRead: (chapterId?: string) => void;
  onOpenUnlockModal: () => void;
  onOpenReportModal: () => void;
  onOpenReviewModal: () => void;
  onSelectAuthor: (authorId: string) => void;
  onSelectBook: (book: Book) => void;
  onBack: () => void;
}

export const BookDetailPage: React.FC<BookDetailPageProps> = ({
  book,
  onRead,
  onOpenUnlockModal,
  onOpenReportModal,
  onOpenReviewModal,
  onSelectAuthor,
  onSelectBook,
  onBack,
}) => {
  const {
    chaptersMap,
    authors,
    isBookUnlocked,
    isInLibrary,
    toggleLibrary,
    isAuthorFollowed,
    toggleFollowAuthor,
    reviews,
    books,
    readingProgress,
  } = useApp();

  const [copiedShare, setCopiedShare] = useState(false);
  const chapters: Chapter[] = chaptersMap[book.id] || [];
  const author = authors.find(a => a.id === book.authorId);
  const bookReviews = reviews[book.id] || [];
  const unlocked = isBookUnlocked(book);
  const inLibrary = isInLibrary(book.id);
  const followingAuthor = isAuthorFollowed(book.authorId);
  const currentProgress = readingProgress[book.id];

  // Related books (same genre or other titles by same author)
  const relatedBooks = books
    .filter(b => b.id !== book.id && (b.genre === book.genre || b.authorId === book.authorId))
    .slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </button>

      {/* Hero Book Showcase */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-sm mb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Cover Column */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center">
            <div className="relative group w-full max-w-[280px]">
              <div className="book-spine-effect overflow-hidden bg-stone-100">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full aspect-[3/4] object-cover group-hover:scale-[1.01] transition-transform duration-300"
                />
              </div>
              {book.isPremium && (
                <div className="absolute top-3 right-3 bg-amber-600/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-200" />
                  {book.tokenPrice} LitTokens
                </div>
              )}
            </div>

            {/* Quick stats under cover */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] mt-5 text-center">
              <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Rating</span>
                <span className="font-bold text-sm text-stone-900 flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {book.rating.toFixed(1)}
                </span>
              </div>
              <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Reads</span>
                <span className="font-bold text-sm text-stone-900 font-mono">
                  {book.readsCount.toLocaleString()}
                </span>
              </div>
              <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Chapters</span>
                <span className="font-bold text-sm text-stone-900 font-mono">
                  {chapters.length}
                </span>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between h-full">
            <div>
              {/* Category & Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100/80 text-amber-900 border border-amber-200/50">
                  {book.genre}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                  {book.language}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                  Rated {book.ageRating}
                </span>
                {unlocked && book.isPremium && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> Unlocked in Vault
                  </span>
                )}
              </div>

              {/* Title & Author */}
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                {book.title}
              </h1>

              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => onSelectAuthor(book.authorId)}
                  className="flex items-center gap-2.5 group cursor-pointer text-left"
                >
                  {book.authorPhoto ? (
                    <img
                      src={book.authorPhoto}
                      alt={book.authorName}
                      className="w-8 h-8 rounded-full object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-700">
                      {book.authorName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-stone-400 block">Author</span>
                    <span className="text-sm font-semibold text-stone-900 group-hover:text-amber-700 transition-colors">
                      {book.authorName}
                    </span>
                  </div>
                </button>

                <div className="h-6 w-px bg-stone-200 mx-1" />

                <button
                  onClick={() => toggleFollowAuthor(book.authorId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    followingAuthor
                      ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  {followingAuthor ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Follow Author
                    </>
                  )}
                </button>
              </div>

              {/* Continue Reading Bar if progress exists */}
              {currentProgress && (
                <div className="mt-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-700" />
                    <div>
                      <span className="text-xs font-semibold text-amber-950 block">
                        Reading in Progress • Chapter {currentProgress.chapterNumber}
                      </span>
                      <span className="text-[11px] text-amber-800">
                        {currentProgress.progressPercent}% completed
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRead(currentProgress.chapterId)}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
                  >
                    Resume
                  </button>
                </div>
              )}

              {/* Synopsis & Description */}
              <div className="mt-6 space-y-3 text-stone-600 text-sm leading-relaxed">
                <p className="font-editorial text-base text-stone-800 italic">
                  "{book.synopsis || book.description}"
                </p>
                {book.description !== book.synopsis && (
                  <p className="text-xs md:text-sm text-stone-600">
                    {book.description}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="mt-6 flex flex-wrap gap-1.5">
                {book.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-8 pt-6 border-t border-stone-200 flex flex-wrap items-center gap-3">
              {unlocked ? (
                <button
                  onClick={() => onRead()}
                  className="px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  Read Complete Book
                </button>
              ) : (
                <button
                  onClick={onOpenUnlockModal}
                  className="px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Coins className="w-4 h-4 text-amber-200" />
                  Unlock for {book.tokenPrice} LitTokens
                </button>
              )}

              {/* Free preview button if locked */}
              {!unlocked && chapters.length > 0 && (
                <button
                  onClick={() => onRead(chapters[0].id)}
                  className="px-4 py-3.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-stone-500" />
                  Read Free Sample
                </button>
              )}

              {/* Save to library */}
              <button
                onClick={() => toggleLibrary(book)}
                className={`p-3.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                  inLibrary
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : 'border-stone-300 text-stone-700 hover:bg-stone-50'
                }`}
                title={inLibrary ? 'In Your Library' : 'Save to Library'}
              >
                <Bookmark className={`w-4 h-4 ${inLibrary ? 'fill-amber-600 text-amber-600' : ''}`} />
                <span className="hidden sm:inline">{inLibrary ? 'Saved' : 'Library'}</span>
              </button>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="p-3.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors text-xs font-semibold flex items-center gap-1.5"
                title="Share Book"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">{copiedShare ? 'Copied Link!' : 'Share'}</span>
              </button>

              {/* Report button */}
              <button
                onClick={onOpenReportModal}
                className="p-3.5 rounded-xl border border-stone-200 text-stone-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-colors ml-auto"
                title="Report Inappropriate Content or Copyright"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Table of Contents */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm mb-10">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900">
              Table of Contents
            </h2>
            <p className="text-xs text-stone-500">
              Structured chapters & reading episodes
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md">
            {chapters.length} Chapters
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {chapters.map((chapter, index) => {
            const isChapterLocked = chapter.isPremium && !unlocked;
            return (
              <div
                key={chapter.id}
                className="py-4 flex items-center justify-between hover:bg-stone-50/80 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-mono font-bold text-stone-600 shrink-0">
                    {chapter.chapterNumber}
                  </span>
                  <div>
                    <h4 className="font-semibold text-sm text-stone-900">
                      {chapter.title}
                    </h4>
                    <span className="text-[11px] text-stone-400">
                      Approx 5 min read
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isChapterLocked ? (
                    <button
                      onClick={onOpenUnlockModal}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/70 text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      Unlock Chapter
                    </button>
                  ) : (
                    <button
                      onClick={() => onRead(chapter.id)}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      Read
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ad Placement */}
      <AdSlot position="header" />

      {/* About the Author Section */}
      {author && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm mb-10">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
            <h2 className="font-display text-xl font-bold text-stone-900">
              About the Author
            </h2>
            <button
              onClick={() => onSelectAuthor(author.id)}
              className="text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              View Full Profile →
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={author.photoURL}
              alt={author.name}
              className="w-16 h-16 rounded-2xl object-cover border border-stone-200 shadow-xs shrink-0"
            />
            <div className="flex-1">
              <h3 className="text-base font-bold text-stone-900">{author.name}</h3>
              <p className="text-xs text-stone-500 mb-2">{author.location}</p>
              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                {author.bio}
              </p>
            </div>
            <button
              onClick={() => toggleFollowAuthor(author.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                followingAuthor
                  ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {followingAuthor ? 'Following' : 'Follow Author'}
            </button>
          </div>
        </section>
      )}

      {/* Readers Reviews Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm mb-10">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900">
              Reader Reviews ({bookReviews.length})
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(book.rating) ? 'fill-amber-400' : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-stone-800">
                {book.rating.toFixed(1)} out of 5
              </span>
            </div>
          </div>
          <button
            onClick={onOpenReviewModal}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Write a Review
          </button>
        </div>

        {bookReviews.length === 0 ? (
          <div className="py-8 text-center text-stone-400 text-xs">
            No reviews yet. Be the first reader to review this work!
          </div>
        ) : (
          <div className="space-y-4">
            {bookReviews.map(rev => (
              <div key={rev.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {rev.userPhoto ? (
                      <img
                        src={rev.userPhoto}
                        alt={rev.userName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center justify-center">
                        {rev.userName.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs font-bold text-stone-800">{rev.userName}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400' : 'text-stone-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-stone-400 mt-2 block">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-xl font-bold text-stone-900 mb-6">
            More in {book.genre}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedBooks.map(rel => (
              <div
                key={rel.id}
                onClick={() => onSelectBook(rel)}
                className="bg-white rounded-2xl p-4 border border-stone-200/80 hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group flex flex-col"
              >
                <img
                  src={rel.coverImage}
                  alt={rel.title}
                  className="w-full aspect-[2/3] object-cover rounded-xl mb-3 group-hover:scale-[1.01] transition-transform"
                />
                <span className="text-[10px] uppercase font-bold text-amber-800">{rel.genre}</span>
                <h3 className="font-bold text-sm text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                  {rel.title}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-1">by {rel.authorName}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
