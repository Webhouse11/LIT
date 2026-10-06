import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Book,
  BookStatus,
  Chapter,
  AuthorProfile,
  TokenPackage,
  GenreItem,
  PlatformSettings,
  AdSlotConfig,
  Wallet,
  Transaction,
  BookUnlock,
  Bookmark,
  ReadingProgress,
  LibraryItem,
  Review,
  Report,
  Withdrawal,
  AuditLog,
  ReadingPreferences,
  Notification,
  UserProfile,
} from '../types';
import {
  INITIAL_GENRES,
  INITIAL_TOKEN_PACKAGES,
  INITIAL_AUTHORS,
  INITIAL_BOOKS,
  INITIAL_CHAPTERS,
  INITIAL_SETTINGS,
  INITIAL_AD_SLOTS,
  INITIAL_USERS,
} from '../data/seedData';
import { useAuth } from './AuthContext';
import {
  validateFinancialInteger,
  sanitizeTextInput,
  sanitizeUrl,
} from '../lib/security';

interface AppContextType {
  books: Book[];
  authors: AuthorProfile[];
  chaptersMap: Record<string, Chapter[]>;
  genres: GenreItem[];
  tokenPackages: TokenPackage[];
  settings: PlatformSettings;
  adSlots: AdSlotConfig[];
  wallet: Wallet;
  library: LibraryItem[];
  bookmarks: Bookmark[];
  readingProgress: Record<string, ReadingProgress>; // keyed by bookId
  unlockedBooks: string[]; // bookIds
  transactions: Transaction[];
  reviews: Record<string, Review[]>; // keyed by bookId
  reports: Report[];
  withdrawals: Withdrawal[];
  auditLogs: AuditLog[];
  readingPrefs: ReadingPreferences;
  followedAuthors: string[];
  notifications: Notification[];
  users: UserProfile[];

  // Reader actions
  purchaseTokens: (packageId: string, provider: Transaction['paymentProvider']) => Promise<boolean>;
  unlockBook: (bookId: string) => Promise<{ success: boolean; message: string }>;
  saveBookmark: (bookId: string, chapterId: string, progressPercent: number) => void;
  saveProgress: (bookId: string, chapterId: string, chapterNumber: number, progressPercent: number) => void;
  toggleLibrary: (book: Book) => void;
  isInLibrary: (bookId: string) => boolean;
  isBookUnlocked: (book: Book) => boolean;
  toggleFollowAuthor: (authorId: string) => void;
  isAuthorFollowed: (authorId: string) => boolean;
  addReview: (bookId: string, rating: number, comment: string) => void;
  submitReport: (targetType: 'book' | 'review' | 'author', targetId: string, targetTitle: string, reason: string, details?: string) => void;
  setReadingPreferences: (prefs: Partial<ReadingPreferences>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => void;

  // Author actions
  registerAuthor: (name: string, bio: string, location: string, copyrightAgreed: boolean) => Promise<boolean>;
  updateAuthorProfile: (authorId: string, updates: Partial<AuthorProfile>) => void;
  getAuthorForUser: (userId: string) => AuthorProfile | undefined;
  createBook: (bookData: Partial<Book>, initialChapters?: Partial<Chapter>[]) => Promise<string>;
  updateBook: (bookId: string, updates: Partial<Book>) => void;
  deleteBook: (bookId: string) => void;
  submitBookForReview: (bookId: string) => void;
  addChapter: (bookId: string, chapterData: Partial<Chapter>) => void;
  updateChapter: (bookId: string, chapterId: string, updates: Partial<Chapter>) => void;
  deleteChapter: (bookId: string, chapterId: string) => void;
  requestWithdrawal: (authorId: string, tokensRequested: number, payoutMethod: Withdrawal['payoutMethod'], payoutDetails: string) => Promise<{ success: boolean; message: string }>;

  // Admin actions
  adminApproveBook: (bookId: string) => void;
  adminRejectBook: (bookId: string, reason: string) => void;
  adminRemoveBook: (bookId: string) => void;
  adminRestoreBook: (bookId: string) => void;
  adminToggleFeaturedBook: (bookId: string) => void;
  adminApproveAuthor: (authorId: string) => void;
  adminRejectAuthor: (authorId: string) => void;
  adminSuspendAuthor: (authorId: string) => void;
  adminAddGenre: (genre: Omit<GenreItem, 'id'>) => void;
  adminUpdateGenre: (genreId: string, updates: Partial<GenreItem>) => void;
  adminDeleteGenre: (genreId: string) => void;
  adminAddTokenPackage: (pkg: Omit<TokenPackage, 'id'>) => void;
  adminUpdateTokenPackage: (pkgId: string, updates: Partial<TokenPackage>) => void;
  adminDeleteTokenPackage: (pkgId: string) => void;
  adminUpdateSettings: (updates: Partial<PlatformSettings>) => void;
  adminUpdateAdSlot: (slotId: string, updates: Partial<AdSlotConfig>) => void;
  adminProcessReport: (reportId: string, newStatus: Report['status']) => void;
  adminProcessWithdrawal: (withdrawalId: string, newStatus: Withdrawal['status'], reason?: string) => void;
  adminUpdateUser: (uid: string, updates: Partial<UserProfile>) => void;
  adminSuspendUser: (uid: string) => void;
  adminRestoreUser: (uid: string) => void;
  deleteReview: (bookId: string, reviewId: string) => void;
  broadcastNotification: (title: string, message: string, targetRole?: 'all' | 'author' | 'reader') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const currentUserId = user?.uid || 'guest';

  // State with LocalStorage persistence
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('litvault_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [authors, setAuthors] = useState<AuthorProfile[]>(() => {
    const saved = localStorage.getItem('litvault_authors');
    return saved ? JSON.parse(saved) : INITIAL_AUTHORS;
  });

  const [chaptersMap, setChaptersMap] = useState<Record<string, Chapter[]>>(() => {
    const saved = localStorage.getItem('litvault_chapters');
    return saved ? JSON.parse(saved) : INITIAL_CHAPTERS;
  });

  const [genres, setGenres] = useState<GenreItem[]>(() => {
    const saved = localStorage.getItem('litvault_genres');
    return saved ? JSON.parse(saved) : INITIAL_GENRES;
  });

  const [tokenPackages, setTokenPackages] = useState<TokenPackage[]>(() => {
    const saved = localStorage.getItem('litvault_token_packages');
    return saved ? JSON.parse(saved) : INITIAL_TOKEN_PACKAGES;
  });

  const [settings, setSettings] = useState<PlatformSettings>(() => {
    const saved = localStorage.getItem('litvault_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [adSlots, setAdSlots] = useState<AdSlotConfig[]>(() => {
    const saved = localStorage.getItem('litvault_ad_slots');
    return saved ? JSON.parse(saved) : INITIAL_AD_SLOTS;
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('litvault_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // User-specific states
  const [wallet, setWallet] = useState<Wallet>(() => {
    const saved = localStorage.getItem(`litvault_wallet_${currentUserId}`);
    return saved
      ? JSON.parse(saved)
      : {
          userId: currentUserId,
          tokenBalance: 45, // Starter LitTokens for immediate interactive testing!
          totalPurchased: 45,
          totalSpent: 0,
          updatedAt: new Date().toISOString(),
        };
  });

  const [library, setLibrary] = useState<LibraryItem[]>(() => {
    const saved = localStorage.getItem(`litvault_library_${currentUserId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem(`litvault_bookmarks_${currentUserId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [readingProgress, setReadingProgress] = useState<Record<string, ReadingProgress>>(() => {
    const saved = localStorage.getItem(`litvault_progress_${currentUserId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [unlockedBooks, setUnlockedBooks] = useState<string[]>(() => {
    const saved = localStorage.getItem(`litvault_unlocked_${currentUserId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [followedAuthors, setFollowedAuthors] = useState<string[]>(() => {
    const saved = localStorage.getItem(`litvault_follows_${currentUserId}`);
    return saved ? JSON.parse(saved) : ['author-chinelo'];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('litvault_transactions');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'tx-init-101',
            userId: currentUserId,
            userEmail: user?.email,
            packageId: 'pack-starter',
            packageName: 'Welcome Reader Bonus',
            paymentReference: 'REF_INIT_GIFT_45',
            amountCents: 0,
            currency: 'USD',
            tokensPurchased: 45,
            paymentProvider: 'Stripe',
            status: 'completed',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ];
  });

  const [reviews, setReviews] = useState<Record<string, Review[]>>(() => {
    const saved = localStorage.getItem('litvault_reviews');
    return saved
      ? JSON.parse(saved)
      : {
          'book-echoes-savanna': [
            {
              id: 'rev-1',
              bookId: 'book-echoes-savanna',
              userId: 'user-amara',
              userName: 'Amara Vance',
              userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
              rating: 5,
              comment: 'A spellbinding novel! The depiction of sisterhood and the clash between colonial legality and ancestral land roots was so moving.',
              createdAt: '2025-02-12T10:00:00Z',
            },
            {
              id: 'rev-2',
              bookId: 'book-echoes-savanna',
              userId: 'user-kola',
              userName: 'Kolawole Adeleke',
              rating: 5,
              comment: 'Magnificent dialogue and rich sensory prose. The descriptions of the Harmattan dust and market life transport you right there.',
              createdAt: '2025-02-18T14:20:00Z',
            },
          ],
          'book-shadows-gold-coast': [
            {
              id: 'rev-3',
              bookId: 'book-shadows-gold-coast',
              userId: 'user-binta',
              userName: 'Binta Diallo',
              rating: 5,
              comment: 'High octane historical thriller! The Jamestown lighthouse opening hooked me completely. Best 15 tokens I spent this week.',
              createdAt: '2025-02-28T16:45:00Z',
            },
          ],
        };
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem('litvault_reports');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'rep-sample-1',
            reporterId: 'user-amara',
            reporterEmail: 'amara.reader@litvault.com',
            targetType: 'review',
            targetId: 'rev-spam-0',
            targetTitle: 'Off-topic comment on Cape Quantum',
            reason: 'Promotional spam link in review comments',
            details: 'Comment contained unsolicited telegram links.',
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
        ];
  });

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() => {
    const saved = localStorage.getItem('litvault_withdrawals');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'wd-sample-1',
            authorId: 'author-chinelo',
            authorName: 'Chinelo Okonkwo',
            tokensRequested: 500,
            amountCents: 2500, // $25.00
            currency: 'USD',
            payoutMethod: 'Bank Transfer',
            payoutDetails: 'Standard Chartered Bank Nigeria - Acct ending in 4102',
            status: 'completed',
            createdAt: '2025-03-01T09:00:00Z',
          },
          {
            id: 'wd-sample-2',
            authorId: 'author-kwame',
            authorName: 'Kwame Mensah',
            tokensRequested: 800,
            amountCents: 4000, // $40.00
            currency: 'USD',
            payoutMethod: 'Mobile Money',
            payoutDetails: 'MTN MoMo Ghana - +233 24 555 0192',
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
        ];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('litvault_audit_logs');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'log-1',
            adminId: 'admin-oluranti-id',
            adminEmail: 'olurantiprofile@gmail.com',
            action: 'Approved Book Submission',
            details: 'Approved "Shadows of the Gold Coast" for international distribution.',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: 'log-2',
            adminId: 'admin-oluranti-id',
            adminEmail: 'olurantiprofile@gmail.com',
            action: 'Updated Author Revenue Share',
            details: 'Confirmed global creator rev-share benchmark at 70% author / 30% platform.',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
        ];
  });

  const [readingPrefs, setReadingPrefs] = useState<ReadingPreferences>(() => {
    const saved = localStorage.getItem('litvault_reading_prefs');
    return saved
      ? JSON.parse(saved)
      : {
          theme: 'light',
          fontSize: 'base',
          lineHeight: 'relaxed',
          maxWidth: 'medium',
          fontFace: 'serif',
        };
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('litvault_notifications');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'notif-1',
            userId: 'author-chinelo',
            title: 'Book Submission Approved',
            message: 'Your manuscript "Echoes of the Savanna" has been approved by the LitVault Editorial Review Board for global distribution.',
            type: 'approval',
            read: false,
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
          {
            id: 'notif-2',
            userId: 'author-chinelo',
            title: 'New Reader Review Received',
            message: 'Amara Vance rated "Echoes of the Savanna" 5 stars: "A spellbinding novel! The clash between colonial legality and ancestral land roots was so moving."',
            type: 'review',
            read: false,
            createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
          },
          {
            id: 'notif-3',
            userId: 'author-chinelo',
            title: 'Creator Royalties Credited',
            message: '14 LitTokens ($0.70 USD) deposited into your Withdrawable Vault from reader unlock of Chapter 3.',
            type: 'unlock',
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'notif-4',
            userId: 'author-chinelo',
            title: 'Withdrawal Payout Completed',
            message: 'Your payout of $25.00 USD (500 LitTokens) has been processed to Standard Chartered Bank Nigeria.',
            type: 'payout',
            read: true,
            createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
          },
        ];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('litvault_notifications', JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem('litvault_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('litvault_authors', JSON.stringify(authors));
  }, [authors]);

  useEffect(() => {
    localStorage.setItem('litvault_chapters', JSON.stringify(chaptersMap));
  }, [chaptersMap]);

  useEffect(() => {
    localStorage.setItem('litvault_genres', JSON.stringify(genres));
  }, [genres]);

  useEffect(() => {
    localStorage.setItem('litvault_token_packages', JSON.stringify(tokenPackages));
  }, [tokenPackages]);

  useEffect(() => {
    localStorage.setItem('litvault_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('litvault_ad_slots', JSON.stringify(adSlots));
  }, [adSlots]);

  useEffect(() => {
    localStorage.setItem('litvault_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem(`litvault_wallet_${user.uid}`, JSON.stringify(wallet));
    }
  }, [wallet, user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem(`litvault_library_${user.uid}`, JSON.stringify(library));
    }
  }, [library, user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem(`litvault_bookmarks_${user.uid}`, JSON.stringify(bookmarks));
    }
  }, [bookmarks, user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem(`litvault_progress_${user.uid}`, JSON.stringify(readingProgress));
    }
  }, [readingProgress, user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem(`litvault_unlocked_${user.uid}`, JSON.stringify(unlockedBooks));
    }
  }, [unlockedBooks, user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem(`litvault_follows_${user.uid}`, JSON.stringify(followedAuthors));
    }
  }, [followedAuthors, user?.uid]);

  useEffect(() => {
    localStorage.setItem('litvault_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('litvault_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('litvault_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('litvault_withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem('litvault_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('litvault_reading_prefs', JSON.stringify(readingPrefs));
  }, [readingPrefs]);

  // Reader helpers
  const isBookUnlocked = (book: Book): boolean => {
    if (!book.isPremium || book.tokenPrice === 0) return true;
    if (unlockedBooks.includes(book.id)) return true;
    if (user?.uid && (book.authorId === user.uid || authors.find(a => a.id === book.authorId)?.userId === user.uid)) return true;
    return false;
  };

  const isInLibrary = (bookId: string) => library.some(item => item.bookId === bookId);

  const toggleLibrary = (book: Book) => {
    setLibrary(prev => {
      const exists = prev.some(item => item.bookId === book.id);
      if (exists) {
        return prev.filter(item => item.bookId !== book.id);
      } else {
        const newItem: LibraryItem = {
          id: `lib-${Date.now()}`,
          userId: currentUserId,
          bookId: book.id,
          bookTitle: book.title,
          authorName: book.authorName,
          coverImage: book.coverImage,
          isPremium: book.isPremium,
          tokenPrice: book.tokenPrice,
          genre: book.genre,
          savedAt: new Date().toISOString(),
        };
        return [newItem, ...prev];
      }
    });
  };

  const toggleFollowAuthor = (authorId: string) => {
    setFollowedAuthors(prev =>
      prev.includes(authorId) ? prev.filter(id => id !== authorId) : [...prev, authorId]
    );
  };

  const isAuthorFollowed = (authorId: string) => followedAuthors.includes(authorId);

  const purchaseTokens = async (packageId: string, provider: Transaction['paymentProvider']): Promise<boolean> => {
    const pkg = tokenPackages.find(p => p.id === packageId && p.active);
    if (!pkg) return false;

    // Validate non-negative financial integers
    const totalTokensAdded = validateFinancialInteger(pkg.tokens + (pkg.bonusTokens || 0), 1, 1000000);
    const amountCents = validateFinancialInteger(pkg.priceCents, 0, 10000000);
    if (!totalTokensAdded || amountCents === null) {
      console.error('Invalid financial parameters in token package:', packageId);
      return false;
    }

    // Update wallet
    setWallet(prev => ({
      ...prev,
      tokenBalance: prev.tokenBalance + totalTokensAdded,
      totalPurchased: prev.totalPurchased + totalTokensAdded,
      updatedAt: new Date().toISOString(),
    }));

    // Record immutable transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      userId: currentUserId,
      userEmail: user?.email,
      packageId: pkg.id,
      packageName: pkg.name,
      paymentReference: `LIT_${provider.toUpperCase()}_${Date.now()}`,
      amountCents,
      currency: pkg.currency,
      tokensPurchased: totalTokensAdded,
      paymentProvider: provider,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);
    return true;
  };

  const unlockBook = async (bookId: string): Promise<{ success: boolean; message: string }> => {
    const book = books.find(b => b.id === bookId);
    if (!book) return { success: false, message: 'Book not found.' };

    if (!book.isPremium || book.tokenPrice === 0) {
      return { success: true, message: 'This book is already free to read.' };
    }

    if (unlockedBooks.includes(bookId)) {
      return { success: true, message: 'You have already unlocked this work.' };
    }

    // Validate token price as strictly non-negative integer
    const tokensSpent = validateFinancialInteger(book.tokenPrice, 1, 100000);
    if (!tokensSpent) {
      return { success: false, message: 'Invalid book token price.' };
    }

    if (wallet.tokenBalance < tokensSpent) {
      return {
        success: false,
        message: `Insufficient LitTokens. You have ${wallet.tokenBalance} tokens, but this book requires ${tokensSpent} LitTokens.`,
      };
    }

    // Integer financial calculation: Author revenue share vs Platform share
    const authorRevenuePercent = Math.min(100, Math.max(0, settings.authorRevenueSharePercent || 70));
    const authorShare = Math.floor((tokensSpent * authorRevenuePercent) / 100);
    const platformShare = tokensSpent - authorShare;

    // Deduct from wallet atomically
    setWallet(prev => ({
      ...prev,
      tokenBalance: Math.max(0, prev.tokenBalance - tokensSpent),
      totalSpent: prev.totalSpent + tokensSpent,
      updatedAt: new Date().toISOString(),
    }));

    // Add to unlocked list
    setUnlockedBooks(prev => [...prev, bookId]);

    // Credit author earnings safely
    setAuthors(prev =>
      prev.map(author => {
        if (author.id === book.authorId) {
          return {
            ...author,
            balanceTokens: author.balanceTokens + authorShare,
            totalEarningsTokens: author.totalEarningsTokens + authorShare,
            totalReaders: author.totalReaders + 1,
          };
        }
        return author;
      })
    );

    // Record BookUnlock ledger item
    const unlockRecord: BookUnlock = {
      id: `unlock-${Date.now()}`,
      userId: currentUserId,
      bookId: book.id,
      bookTitle: book.title,
      authorId: book.authorId,
      tokensSpent,
      authorShare,
      platformShare,
      createdAt: new Date().toISOString(),
    };
    // Save to localStorage
    const savedUnlocks = JSON.parse(localStorage.getItem('litvault_book_unlocks') || '[]');
    localStorage.setItem('litvault_book_unlocks', JSON.stringify([unlockRecord, ...savedUnlocks]));

    return { success: true, message: `Successfully unlocked "${book.title}" for ${tokensSpent} LitTokens!` };
  };

  const saveBookmark = (bookId: string, chapterId: string, progressPercent: number) => {
    const book = books.find(b => b.id === bookId);
    const chapters = chaptersMap[bookId] || [];
    const chapter = chapters.find(c => c.id === chapterId);

    const newBookmark: Bookmark = {
      id: `bm-${bookId}-${chapterId}`,
      userId: currentUserId,
      bookId,
      bookTitle: book?.title || 'Unknown Work',
      chapterId,
      chapterTitle: chapter?.title || 'Chapter',
      coverImage: book?.coverImage,
      progressPercent,
      updatedAt: new Date().toISOString(),
    };

    setBookmarks(prev => {
      const filtered = prev.filter(b => !(b.bookId === bookId && b.chapterId === chapterId));
      return [newBookmark, ...filtered];
    });
  };

  const saveProgress = (bookId: string, chapterId: string, chapterNumber: number, progressPercent: number) => {
    const record: ReadingProgress = {
      id: `prog-${bookId}`,
      userId: currentUserId,
      bookId,
      chapterId,
      chapterNumber,
      progressPercent,
      lastReadAt: new Date().toISOString(),
    };

    setReadingProgress(prev => ({
      ...prev,
      [bookId]: record,
    }));

    // Increment read counter on book once read progresses
    setBooks(prev =>
      prev.map(b => (b.id === bookId ? { ...b, readsCount: b.readsCount + 1 } : b))
    );
  };

  const addReview = (bookId: string, rating: number, comment: string) => {
    const validatedRating = validateFinancialInteger(Math.round(rating), 1, 5) || 5;
    const cleanComment = sanitizeTextInput(comment, 2000);
    if (!cleanComment) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      bookId,
      userId: currentUserId,
      userName: sanitizeTextInput(user?.displayName || 'Reader', 80),
      userPhoto: user?.photoURL,
      rating: validatedRating,
      comment: cleanComment,
      createdAt: new Date().toISOString(),
    };

    setReviews(prev => {
      const current = prev[bookId] || [];
      const updated = [newReview, ...current];
      // update average rating on book
      const avgRating = Number((updated.reduce((acc, r) => acc + r.rating, 0) / updated.length).toFixed(1));
      setBooks(bList =>
        bList.map(b => (b.id === bookId ? { ...b, rating: avgRating, reviewCount: updated.length } : b))
      );
      return { ...prev, [bookId]: updated };
    });
  };

  const submitReport = (
    targetType: 'book' | 'review' | 'author',
    targetId: string,
    targetTitle: string,
    reason: string,
    details?: string
  ) => {
    const newReport: Report = {
      id: `rep-${Date.now()}`,
      reporterId: currentUserId,
      reporterEmail: user?.email,
      targetType,
      targetId,
      targetTitle: sanitizeTextInput(targetTitle, 150),
      reason: sanitizeTextInput(reason, 150),
      details: details ? sanitizeTextInput(details, 2000) : undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setReports(prev => [newReport, ...prev]);
  };

  const setReadingPreferences = (prefs: Partial<ReadingPreferences>) => {
    setReadingPrefs(prev => ({ ...prev, ...prefs }));
  };

  // Author functions
  const registerAuthor = async (
    name: string,
    bio: string,
    location: string,
    copyrightAgreed: boolean
  ): Promise<boolean> => {
    if (!user) return false;
    const authorId = `author-${user.uid}`;
    const newAuthor: AuthorProfile = {
      id: authorId,
      userId: user.uid,
      name,
      bio,
      location,
      photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      status: settings.requireAuthorApproval ? 'pending' : 'approved',
      balanceTokens: 0,
      totalEarningsTokens: 0,
      totalReaders: 0,
      totalReads: 0,
      rating: 5.0,
      copyrightAgreed,
      createdAt: new Date().toISOString(),
    };

    setAuthors(prev => [...prev.filter(a => a.userId !== user.uid), newAuthor]);
    return true;
  };

  const updateAuthorProfile = (authorId: string, updates: Partial<AuthorProfile>) => {
    setAuthors(prev =>
      prev.map(a => (a.id === authorId ? { ...a, ...updates } : a))
    );
  };

  const getAuthorForUser = (userId: string) => {
    return authors.find(a => a.userId === userId);
  };

  const createBook = async (
    bookData: Partial<Book>,
    initialChapters?: Partial<Chapter>[]
  ): Promise<string> => {
    const bookId = `book-${Date.now()}`;
    const author = authors.find(a => a.userId === user?.uid) || authors[0];

    // Authors can choose 'draft' to continue editing privately, or submit for approval
    const initialStatus: BookStatus = bookData.status === 'draft'
      ? 'draft'
      : settings.requireBookApproval
      ? 'pending_review'
      : 'published';

    const safeTitle = sanitizeTextInput(bookData.title || 'Untitled Book', 150);
    const safeDescription = sanitizeTextInput(bookData.description || '', 4000);
    const safeSynopsis = sanitizeTextInput(bookData.synopsis || bookData.description || '', 1000);
    const safeTokenPrice = bookData.isPremium
      ? (validateFinancialInteger(bookData.tokenPrice, 1, 100) || 15)
      : 0;

    const newBook: Book = {
      id: bookId,
      title: safeTitle,
      authorId: author.id,
      authorName: author.name,
      authorPhoto: author.photoURL,
      coverImage: bookData.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      description: safeDescription,
      synopsis: safeSynopsis,
      genre: bookData.genre || 'African Literature',
      categories: bookData.categories || [bookData.genre || 'African Literature'],
      tags: bookData.tags || ['Literature', 'New Release'],
      language: bookData.language || 'English',
      ageRating: bookData.ageRating || 'All Ages',
      isPremium: Boolean(bookData.isPremium),
      tokenPrice: safeTokenPrice,
      status: initialStatus,
      readsCount: 0,
      rating: 5.0,
      reviewCount: 0,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBooks(prev => [newBook, ...prev]);

    // Chapters
    const chaptersToSave: Chapter[] = (initialChapters && initialChapters.length > 0)
      ? initialChapters.map((c, idx) => ({
          id: `chap-${bookId}-${idx + 1}`,
          bookId,
          chapterNumber: idx + 1,
          title: sanitizeTextInput(c.title || `Chapter ${idx + 1}`, 150),
          content: sanitizeTextInput(c.content || '', 500000),
          isPremium: Boolean(c.isPremium),
          tokenPrice: validateFinancialInteger(c.tokenPrice, 0, 100) || 0,
          status: c.status || 'published',
          createdAt: new Date().toISOString(),
        }))
      : [
          {
            id: `chap-${bookId}-1`,
            bookId,
            chapterNumber: 1,
            title: 'Chapter 1: Opening Lines',
            content: 'The journey begins in the quiet hours before dawn...',
            isPremium: false,
            tokenPrice: 0,
            status: 'published',
            createdAt: new Date().toISOString(),
          },
        ];

    setChaptersMap(prev => ({
      ...prev,
      [bookId]: chaptersToSave,
    }));

    return bookId;
  };

  const updateBook = (bookId: string, updates: Partial<Book>) => {
    setBooks(prev =>
      prev.map(b => {
        if (b.id !== bookId) return b;
        const isAuthorOwner = Boolean(
          user?.uid && (
            b.authorId === user.uid ||
            b.authorId === `author-${user.uid}` ||
            authors.find(a => a.id === b.authorId)?.userId === user.uid
          )
        );
        if (!isAdmin && !isAuthorOwner) {
          console.warn('IDOR violation: unauthorized attempt to modify book', bookId);
          return b;
        }
        // Protect privileged fields from author tampering
        const safeUpdates = { ...updates };
        if (!isAdmin) {
          delete safeUpdates.featured;
          delete safeUpdates.readsCount;
          delete safeUpdates.rating;
          delete safeUpdates.reviewCount;
          if (safeUpdates.status && safeUpdates.status !== 'draft' && safeUpdates.status !== 'pending_review') {
            safeUpdates.status = b.status; // Prevent author from approving their own book
          }
        }
        if (safeUpdates.title) safeUpdates.title = sanitizeTextInput(safeUpdates.title, 150);
        if (safeUpdates.synopsis) safeUpdates.synopsis = sanitizeTextInput(safeUpdates.synopsis, 1000);
        if (safeUpdates.description) safeUpdates.description = sanitizeTextInput(safeUpdates.description, 4000);
        return { ...b, ...safeUpdates, updatedAt: new Date().toISOString() };
      })
    );
  };

  const deleteBook = (bookId: string) => {
    const targetBook = books.find(b => b.id === bookId);
    if (!targetBook) return;
    const isAuthorOwner = Boolean(
      user?.uid && (
        targetBook.authorId === user.uid ||
        targetBook.authorId === `author-${user.uid}` ||
        authors.find(a => a.id === targetBook.authorId)?.userId === user.uid
      )
    );
    if (!isAdmin && (!isAuthorOwner || targetBook.status !== 'draft')) {
      console.warn('IDOR / Authorization violation: cannot delete book', bookId);
      return;
    }
    setBooks(prev => prev.filter(b => b.id !== bookId));
    setChaptersMap(prev => {
      const copy = { ...prev };
      delete copy[bookId];
      return copy;
    });
  };

  const submitBookForReview = (bookId: string) => {
    setBooks(prev =>
      prev.map(b => {
        if (b.id !== bookId) return b;
        const isAuthorOwner = Boolean(
          user?.uid && (
            b.authorId === user.uid ||
            b.authorId === `author-${user.uid}` ||
            authors.find(a => a.id === b.authorId)?.userId === user.uid
          )
        );
        if (!isAdmin && !isAuthorOwner) return b;
        return { ...b, status: 'pending_review', updatedAt: new Date().toISOString() };
      })
    );
  };

  const addChapter = (bookId: string, chapterData: Partial<Chapter>) => {
    const parentBook = books.find(b => b.id === bookId);
    if (!parentBook) return;
    const isAuthorOwner = Boolean(
      user?.uid && (
        parentBook.authorId === user.uid ||
        parentBook.authorId === `author-${user.uid}` ||
        authors.find(a => a.id === parentBook.authorId)?.userId === user.uid
      )
    );
    if (!isAdmin && (!isAuthorOwner || parentBook.status === 'suspended')) {
      console.warn('Authorization violation: cannot add chapter to book', bookId);
      return;
    }
    const existing = chaptersMap[bookId] || [];
    const nextNum = existing.length + 1;
    const newChap: Chapter = {
      id: `chap-${bookId}-${Date.now()}`,
      bookId,
      chapterNumber: nextNum,
      title: sanitizeTextInput(chapterData.title || `Chapter ${nextNum}`, 150),
      content: sanitizeTextInput(chapterData.content || '', 500000),
      isPremium: Boolean(chapterData.isPremium),
      tokenPrice: validateFinancialInteger(chapterData.tokenPrice, 0, 100) || 0,
      status: chapterData.status || 'published',
      createdAt: new Date().toISOString(),
    };

    setChaptersMap(prev => ({
      ...prev,
      [bookId]: [...existing, newChap],
    }));
  };

  const updateChapter = (bookId: string, chapterId: string, updates: Partial<Chapter>) => {
    const parentBook = books.find(b => b.id === bookId);
    if (!parentBook) return;
    const isAuthorOwner = Boolean(
      user?.uid && (
        parentBook.authorId === user.uid ||
        parentBook.authorId === `author-${user.uid}` ||
        authors.find(a => a.id === parentBook.authorId)?.userId === user.uid
      )
    );
    if (!isAdmin && (!isAuthorOwner || parentBook.status === 'suspended')) {
      console.warn('Authorization violation: cannot edit chapter in book', bookId);
      return;
    }
    setChaptersMap(prev => {
      const existing = prev[bookId] || [];
      return {
        ...prev,
        [bookId]: existing.map(c => {
          if (c.id !== chapterId) return c;
          const safe = { ...updates };
          if (safe.title) safe.title = sanitizeTextInput(safe.title, 150);
          if (safe.content) safe.content = sanitizeTextInput(safe.content, 500000);
          if (safe.tokenPrice !== undefined) safe.tokenPrice = validateFinancialInteger(safe.tokenPrice, 0, 100) || 0;
          return { ...c, ...safe };
        }),
      };
    });
  };

  const deleteChapter = (bookId: string, chapterId: string) => {
    const parentBook = books.find(b => b.id === bookId);
    if (!parentBook) return;
    const isAuthorOwner = Boolean(
      user?.uid && (
        parentBook.authorId === user.uid ||
        parentBook.authorId === `author-${user.uid}` ||
        authors.find(a => a.id === parentBook.authorId)?.userId === user.uid
      )
    );
    if (!isAdmin && (!isAuthorOwner || parentBook.status === 'suspended')) {
      console.warn('Authorization violation: cannot delete chapter in book', bookId);
      return;
    }
    setChaptersMap(prev => {
      const existing = prev[bookId] || [];
      return {
        ...prev,
        [bookId]: existing.filter(c => c.id !== chapterId),
      };
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (n: Omit<Notification, 'id' | 'createdAt'>) => {
    const newN: Notification = {
      ...n,
      title: sanitizeTextInput(n.title, 120),
      message: sanitizeTextInput(n.message, 500),
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newN, ...prev]);
  };

  const requestWithdrawal = async (
    authorId: string,
    tokensRequested: number,
    payoutMethod: Withdrawal['payoutMethod'],
    payoutDetails: string
  ): Promise<{ success: boolean; message: string }> => {
    const author = authors.find(a => a.id === authorId);
    if (!author) return { success: false, message: 'Author profile not found.' };

    // Strict IDOR Protection: Author profile must belong to the logged-in user
    if (!isAdmin && author.userId !== user?.uid) {
      return {
        success: false,
        message: 'Security authorization failure: You can only request payouts for your own creator profile.',
      };
    }

    const minTokens = settings.minWithdrawalTokens || 10;
    const validatedTokens = validateFinancialInteger(tokensRequested, minTokens, author.balanceTokens);
    if (!validatedTokens) {
      return {
        success: false,
        message: `Invalid withdrawal amount. Minimum required is ${minTokens} LitTokens (your available balance: ${author.balanceTokens} LitTokens).`,
      };
    }

    // Convert tokens to integer cents (e.g. 1 token = 5 cents = $0.05)
    const tokenCentsRate = validateFinancialInteger(settings.tokenValueCents, 1, 1000) || 5;
    const amountCents = validatedTokens * tokenCentsRate;

    // Deduct author balance atomically
    setAuthors(prev =>
      prev.map(a =>
        a.id === authorId ? { ...a, balanceTokens: a.balanceTokens - validatedTokens } : a
      )
    );

    const newWd: Withdrawal = {
      id: `wd-${Date.now()}`,
      authorId,
      authorName: author.name,
      authorEmail: user?.email,
      tokensRequested: validatedTokens,
      amountCents,
      currency: 'USD',
      payoutMethod,
      payoutDetails: sanitizeTextInput(payoutDetails, 500),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setWithdrawals(prev => [newWd, ...prev]);
    return {
      success: true,
      message: `Withdrawal request for ${validatedTokens} LitTokens ($${(amountCents / 100).toFixed(2)}) submitted for administrator processing!`,
    };
  };

  // Admin actions
  const logAdminAction = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      adminId: user?.uid || 'admin',
      adminEmail: user?.email || 'admin@litvault.com',
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const adminApproveBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    setBooks(prev => prev.map(b => (b.id === bookId ? { ...b, status: 'published' } : b)));
    logAdminAction('Approved Book', `Approved book "${book?.title || bookId}" for global publication.`);
  };

  const adminRejectBook = (bookId: string, reason: string) => {
    const book = books.find(b => b.id === bookId);
    setBooks(prev =>
      prev.map(b => (b.id === bookId ? { ...b, status: 'rejected', rejectionReason: reason } : b))
    );
    logAdminAction('Rejected Book', `Rejected book "${book?.title || bookId}". Reason: ${reason}`);
  };

  const adminRemoveBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    setBooks(prev => prev.map(b => (b.id === bookId ? { ...b, status: 'suspended' } : b)));
    logAdminAction('Suspended Book', `Suspended "${book?.title || bookId}" from active catalog.`);
  };

  const adminRestoreBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    setBooks(prev => prev.map(b => (b.id === bookId ? { ...b, status: 'published' } : b)));
    logAdminAction('Restored Book', `Restored book "${book?.title || bookId}" to active catalog.`);
  };

  const adminToggleFeaturedBook = (bookId: string) => {
    setBooks(prev =>
      prev.map(b => {
        if (b.id === bookId) {
          const nextFeatured = !b.featured;
          logAdminAction('Toggled Featured Book', `Set "${b.title}" featured=${nextFeatured}`);
          return { ...b, featured: nextFeatured };
        }
        return b;
      })
    );
  };

  const adminApproveAuthor = (authorId: string) => {
    const author = authors.find(a => a.id === authorId);
    setAuthors(prev => prev.map(a => (a.id === authorId ? { ...a, status: 'approved' } : a)));
    logAdminAction('Approved Author', `Approved creator profile for "${author?.name || authorId}".`);
  };

  const adminRejectAuthor = (authorId: string) => {
    const author = authors.find(a => a.id === authorId);
    setAuthors(prev => prev.map(a => (a.id === authorId ? { ...a, status: 'rejected' } : a)));
    logAdminAction('Rejected Author', `Rejected author application for "${author?.name || authorId}".`);
  };

  const adminSuspendAuthor = (authorId: string) => {
    const author = authors.find(a => a.id === authorId);
    setAuthors(prev => prev.map(a => (a.id === authorId ? { ...a, status: 'suspended' } : a)));
    logAdminAction('Suspended Author', `Suspended author privileges for "${author?.name || authorId}".`);
  };

  const adminAddGenre = (genre: Omit<GenreItem, 'id'>) => {
    const id = genre.slug || genre.name.toLowerCase().replace(/\s+/g, '-');
    const newG: GenreItem = { ...genre, id };
    setGenres(prev => [...prev, newG]);
    logAdminAction('Added Genre', `Added literary category/genre "${genre.name}".`);
  };

  const adminUpdateGenre = (genreId: string, updates: Partial<GenreItem>) => {
    setGenres(prev => prev.map(g => (g.id === genreId ? { ...g, ...updates } : g)));
    logAdminAction('Updated Genre', `Updated genre ID "${genreId}".`);
  };

  const adminDeleteGenre = (genreId: string) => {
    setGenres(prev => prev.filter(g => g.id !== genreId));
    logAdminAction('Deleted Genre', `Deleted genre ID "${genreId}".`);
  };

  const adminAddTokenPackage = (pkg: Omit<TokenPackage, 'id'>) => {
    const id = `pack-${Date.now()}`;
    const newPkg: TokenPackage = { ...pkg, id };
    setTokenPackages(prev => [...prev, newPkg]);
    logAdminAction('Created Token Package', `Created LitToken bundle "${pkg.name}" (${pkg.tokens} tokens).`);
  };

  const adminUpdateTokenPackage = (pkgId: string, updates: Partial<TokenPackage>) => {
    setTokenPackages(prev => prev.map(p => (p.id === pkgId ? { ...p, ...updates } : p)));
    logAdminAction('Updated Token Package', `Updated token package "${pkgId}".`);
  };

  const adminUpdateSettings = (updates: Partial<PlatformSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    logAdminAction('Updated Platform Settings', `Adjusted settings: ${Object.keys(updates).join(', ')}.`);
  };

  const adminUpdateAdSlot = (slotId: string, updates: Partial<AdSlotConfig>) => {
    setAdSlots(prev => prev.map(s => (s.id === slotId ? { ...s, ...updates } : s)));
    logAdminAction('Configured Ad Slot', `Updated slot "${slotId}" (enabled: ${updates.enabled ?? 'unchanged'}).`);
  };

  const adminProcessReport = (reportId: string, newStatus: Report['status']) => {
    setReports(prev => prev.map(r => (r.id === reportId ? { ...r, status: newStatus } : r)));
    logAdminAction('Processed Moderation Report', `Marked report "${reportId}" as ${newStatus}.`);
  };

  const adminProcessWithdrawal = (withdrawalId: string, newStatus: Withdrawal['status'], reason?: string) => {
    setWithdrawals(prev =>
      prev.map(w =>
        w.id === withdrawalId ? { ...w, status: newStatus, rejectionReason: reason } : w
      )
    );
    logAdminAction('Processed Withdrawal', `Marked payout "${withdrawalId}" as ${newStatus}.`);
  };

  const adminDeleteTokenPackage = (pkgId: string) => {
    setTokenPackages(prev => prev.filter(p => p.id !== pkgId));
    logAdminAction('Deleted Token Package', `Removed token bundle "${pkgId}".`);
  };

  const adminUpdateUser = (uid: string, updates: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => (u.uid === uid ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u)));
    logAdminAction('Updated User', `Updated profile/role for user ${uid}.`);
  };

  const adminSuspendUser = (uid: string) => {
    setUsers(prev => prev.map(u => (u.uid === uid ? { ...u, status: 'suspended', updatedAt: new Date().toISOString() } : u)));
    logAdminAction('Suspended User', `Suspended account privileges for user ID "${uid}".`);
  };

  const adminRestoreUser = (uid: string) => {
    setUsers(prev => prev.map(u => (u.uid === uid ? { ...u, status: 'active', updatedAt: new Date().toISOString() } : u)));
    logAdminAction('Restored User', `Restored account privileges for user ID "${uid}".`);
  };

  const deleteReview = (bookId: string, reviewId: string) => {
    setReviews(prev => {
      const list = prev[bookId] || [];
      const updated = list.filter(r => r.id !== reviewId);
      const avgRating = updated.length > 0
        ? Number((updated.reduce((acc, r) => acc + r.rating, 0) / updated.length).toFixed(1))
        : 5.0;
      setBooks(bList =>
        bList.map(b => (b.id === bookId ? { ...b, rating: avgRating, reviewCount: updated.length } : b))
      );
      return { ...prev, [bookId]: updated };
    });
    logAdminAction('Deleted Review', `Removed review "${reviewId}" from book "${bookId}".`);
  };

  const broadcastNotification = (title: string, message: string, targetRole: 'all' | 'author' | 'reader' = 'all') => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: targetRole === 'all' ? 'global' : targetRole,
      title,
      message,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
    logAdminAction('Broadcasted Notification', `Sent "${title}" to ${targetRole} users.`);
  };

  return (
    <AppContext.Provider
      value={{
        books,
        authors,
        chaptersMap,
        genres,
        tokenPackages,
        settings,
        adSlots,
        wallet,
        library,
        bookmarks,
        readingProgress,
        unlockedBooks,
        transactions,
        reviews,
        reports,
        withdrawals,
        auditLogs,
        readingPrefs,
        followedAuthors,
        notifications,
        users,

        purchaseTokens,
        unlockBook,
        saveBookmark,
        saveProgress,
        toggleLibrary,
        isInLibrary,
        isBookUnlocked,
        toggleFollowAuthor,
        isAuthorFollowed,
        addReview,
        submitReport,
        setReadingPreferences,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,

        registerAuthor,
        updateAuthorProfile,
        getAuthorForUser,
        createBook,
        updateBook,
        deleteBook,
        submitBookForReview,
        addChapter,
        updateChapter,
        deleteChapter,
        requestWithdrawal,

        adminApproveBook,
        adminRejectBook,
        adminRemoveBook,
        adminRestoreBook,
        adminToggleFeaturedBook,
        adminApproveAuthor,
        adminRejectAuthor,
        adminSuspendAuthor,
        adminAddGenre,
        adminUpdateGenre,
        adminDeleteGenre,
        adminAddTokenPackage,
        adminUpdateTokenPackage,
        adminDeleteTokenPackage,
        adminUpdateSettings,
        adminUpdateAdSlot,
        adminProcessReport,
        adminProcessWithdrawal,
        adminUpdateUser,
        adminSuspendUser,
        adminRestoreUser,
        deleteReview,
        broadcastNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
