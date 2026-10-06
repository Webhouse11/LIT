import React, { useState } from 'react';
import { Book } from '../types';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Bookmark,
  Coins,
  Clock,
  Trash2,
  ChevronRight,
  UserCheck,
  Star,
} from 'lucide-react';

interface LibraryPageProps {
  onSelectBook: (book: Book) => void;
  onReadChapter: (book: Book, chapterId?: string) => void;
  onSelectAuthor: (authorId: string) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  onSelectBook,
  onReadChapter,
  onSelectAuthor,
}) => {
  const {
    library,
    bookmarks,
    readingProgress,
    unlockedBooks,
    followedAuthors,
    authors,
    books,
    toggleLibrary,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'saved' | 'unlocked' | 'bookmarks' | 'authors'>('saved');

  // Bookmarks with linked book data
  const populatedBookmarks = bookmarks.map(bm => {
    const book = books.find(b => b.id === bm.bookId);
    return { ...bm, book };
  });

  // Unlocked books list
  const unlockedBooksList = books.filter(b => unlockedBooks.includes(b.id));

  // Followed authors list
  const followedAuthorsList = authors.filter(a => followedAuthors.includes(a.id));

  // Find most recent reading progress
  const progressList = Object.values(readingProgress).sort(
    (a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
  );
  const mostRecentProgress = progressList[0];
  const mostRecentBook = mostRecentProgress ? books.find(b => b.id === mostRecentProgress.bookId) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      <div className="mb-8">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-700">
          Personal Vault & Shelves
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
          My Literary Library
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Access saved manuscripts, resume reading bookmarks, and monitor followed authors.
        </p>
      </div>

      {/* Continue Reading Banner */}
      {mostRecentBook && mostRecentProgress && (
        <div className="mb-10 bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={mostRecentBook.coverImage}
              alt={mostRecentBook.title}
              className="w-16 h-24 object-cover rounded-xl shadow-md border border-stone-700"
            />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Continue Reading
              </span>
              <h2 className="font-display text-lg sm:text-xl font-bold mt-1 text-white">
                {mostRecentBook.title}
              </h2>
              <p className="text-xs text-stone-300">
                Chapter {mostRecentProgress.chapterNumber} • {mostRecentProgress.progressPercent}% finished
              </p>
              <div className="w-48 h-1.5 bg-stone-700 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="h-full bg-amber-500"
                  style={{ width: `${mostRecentProgress.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => onReadChapter(mostRecentBook, mostRecentProgress.chapterId)}
            className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all whitespace-nowrap"
          >
            Resume Chapter
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 mb-8 pb-1 overflow-x-auto text-xs font-bold">
        {[
          { id: 'saved', label: `Saved Library (${library.length})`, icon: BookOpen },
          { id: 'unlocked', label: `Unlocked Titles (${unlockedBooksList.length})`, icon: Coins },
          { id: 'bookmarks', label: `Bookmarks (${bookmarks.length})`, icon: Bookmark },
          { id: 'authors', label: `Followed Authors (${followedAuthorsList.length})`, icon: UserCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. SAVED LIBRARY TAB */}
      {activeTab === 'saved' && (
        <div>
          {library.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-stone-200">
              <Bookmark className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold text-stone-800">
                Your bookshelf is empty
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Explore the catalog and click "Save to Library" on books you want to read later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {library.map(item => {
                const fullBook = books.find(b => b.id === item.bookId);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex flex-col justify-between group"
                  >
                    <div
                      onClick={() => fullBook && onSelectBook(fullBook)}
                      className="cursor-pointer"
                    >
                      <div className="relative mb-3 overflow-hidden rounded-xl">
                        <img
                          src={item.coverImage}
                          alt={item.bookTitle}
                          className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase bg-stone-900/80 text-white px-2 py-0.5 rounded-full">
                          {item.genre}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-stone-900 truncate">
                        {item.bookTitle}
                      </h4>
                      <p className="text-xs text-stone-500 truncate">
                        by {item.authorName}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <button
                        onClick={() => fullBook && onSelectBook(fullBook)}
                        className="text-xs font-bold text-amber-700 hover:text-amber-800"
                      >
                        Open Book →
                      </button>
                      <button
                        onClick={() => fullBook && toggleLibrary(fullBook)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                        title="Remove from Library"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. UNLOCKED TITLES TAB */}
      {activeTab === 'unlocked' && (
        <div>
          {unlockedBooksList.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-stone-200">
              <Coins className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold text-stone-800">
                No unlocked premium titles
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Any premium books you unlock using LitTokens will appear permanently here for unlimited reading.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {unlockedBooksList.map(book => (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full aspect-[2/3] object-cover rounded-xl mb-3 group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[10px] uppercase font-bold text-emerald-800">
                      Vault Unlocked
                    </span>
                    <h4 className="font-bold text-sm text-stone-900 truncate">
                      {book.title}
                    </h4>
                    <p className="text-xs text-stone-500 truncate">
                      by {book.authorName}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-700">
                    <span>Read Unlocked Edition</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. BOOKMARKS TAB */}
      {activeTab === 'bookmarks' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
          {populatedBookmarks.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No saved chapter bookmarks yet. Click the bookmark icon inside any reading chapter to save your place!
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {populatedBookmarks.map(bm => (
                <div
                  key={bm.id}
                  className="py-4 flex items-center justify-between hover:bg-stone-50 px-3 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {bm.coverImage && (
                      <img src={bm.coverImage} alt={bm.bookTitle} className="w-10 h-14 object-cover rounded" />
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">{bm.bookTitle}</h4>
                      <p className="text-xs text-stone-500 font-medium">{bm.chapterTitle}</p>
                      <span className="text-[10px] text-amber-800 font-mono">
                        Saved at {bm.progressPercent}% of chapter
                      </span>
                    </div>
                  </div>

                  {bm.book && (
                    <button
                      onClick={() => onReadChapter(bm.book!, bm.chapterId)}
                      className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
                    >
                      Jump to Place
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. FOLLOWED AUTHORS TAB */}
      {activeTab === 'authors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {followedAuthorsList.map(author => (
            <div
              key={author.id}
              onClick={() => onSelectAuthor(author.id)}
              className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
            >
              <img
                src={author.photoURL}
                alt={author.name}
                className="w-14 h-14 rounded-full object-cover border border-stone-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-stone-900 group-hover:text-amber-700 transition-colors truncate">
                  {author.name}
                </h4>
                <p className="text-xs text-stone-500 truncate">{author.location}</p>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {author.rating.toFixed(1)} rating
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
