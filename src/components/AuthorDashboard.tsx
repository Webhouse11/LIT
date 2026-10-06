import React, { useState, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Book, Chapter, Withdrawal, Notification, BookStatus } from '../types';
import {
  validateImageFile,
  sanitizeUrl,
  sanitizeTwitterHandle,
  sanitizeTextInput,
  MAX_COVER_IMAGE_SIZE_BYTES,
  MAX_AVATAR_IMAGE_SIZE_BYTES,
} from '../lib/security';
import {
  BookOpen,
  Plus,
  Coins,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Eye,
  Edit3,
  Send,
  Sparkles,
  Star,
  MessageSquare,
  Bell,
  Upload,
  Trash2,
  Filter,
  Search,
  Globe,
  Twitter,
  MapPin,
  ExternalLink,
  RefreshCw,
  X,
  Lock,
  Check,
  Award,
  Layers,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
];

interface AuthorDashboardProps {
  onOpenBookDetail: (book: Book) => void;
  onOpenLegal: (tab: string) => void;
}

export const AuthorDashboard: React.FC<AuthorDashboardProps> = ({
  onOpenBookDetail,
  onOpenLegal,
}) => {
  const { user } = useAuth();
  const {
    authors,
    books,
    chaptersMap,
    genres,
    settings,
    withdrawals,
    reviews,
    notifications,
    createBook,
    updateBook,
    deleteBook,
    addChapter,
    updateChapter,
    deleteChapter,
    submitBookForReview,
    requestWithdrawal,
    registerAuthor,
    updateAuthorProfile,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  // Find author profile - match by logged-in user ID, or fallback to the primary author in demo
  const authorProfile = authors.find(a => a.userId === user?.uid) || authors[0];

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'works' | 'analytics' | 'reviews' | 'payouts' | 'notifications' | 'profile' | 'registration'
  >(authorProfile ? 'works' : 'registration');

  // Filter & Search states for works
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Book Dialog state
  const [showNewBookModal, setShowNewBookModal] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [bookGenre, setBookGenre] = useState(genres[0]?.name || 'African Literature');
  const [bookSynopsis, setBookSynopsis] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  const [bookLanguage, setBookLanguage] = useState('English');
  const [bookAgeRating, setBookAgeRating] = useState('16+');
  const [bookTags, setBookTags] = useState('Literature, Contemporary');
  const [bookCover, setBookCover] = useState(PRESET_COVERS[0]);
  const [isPremium, setIsPremium] = useState(true);
  const [tokenPrice, setTokenPrice] = useState(15);
  const [chapter1Title, setChapter1Title] = useState('Chapter 1: The Departure');
  const [chapter1Content, setChapter1Content] = useState('');
  const [copyrightAgreed, setCopyrightAgreed] = useState(false);
  const [isSubmittingBook, setIsSubmittingBook] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Book Dialog state
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editSynopsis, setEditSynopsis] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCover, setEditCover] = useState('');
  const [editIsPremium, setEditIsPremium] = useState(false);
  const [editTokenPrice, setEditTokenPrice] = useState(15);

  // Manage Chapters Modal state
  const [managingBookChapters, setManagingBookChapters] = useState<Book | null>(null);
  const [showAddChapterForm, setShowAddChapterForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterContent, setNewChapterContent] = useState('');
  const [newChapterPremium, setNewChapterPremium] = useState(true);
  const [newChapterStatus, setNewChapterStatus] = useState<'published' | 'draft'>('published');

  // Author Profile edit form state
  const [editName, setEditName] = useState(authorProfile?.name || '');
  const [editBio, setEditBio] = useState(authorProfile?.bio || '');
  const [editLocation, setEditLocation] = useState(authorProfile?.location || 'Lagos, Nigeria');
  const [editPhotoURL, setEditPhotoURL] = useState(authorProfile?.photoURL || PRESET_AVATARS[0]);
  const [editWebsite, setEditWebsite] = useState(authorProfile?.website || '');
  const [editTwitter, setEditTwitter] = useState(authorProfile?.twitter || '');
  const [profileSuccessMessage, setProfileSuccessMessage] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Reviews Tab state
  const [reviewBookFilter, setReviewBookFilter] = useState<string>('all');

  // Withdrawal state
  const [withdrawalTokens, setWithdrawalTokens] = useState<number>(100);
  const [payoutMethod, setPayoutMethod] = useState<Withdrawal['payoutMethod']>('Bank Transfer');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [payoutFeedback, setPayoutFeedback] = useState<string | null>(null);

  // Author registration form state if not registered yet
  const [regName, setRegName] = useState(user?.displayName || '');
  const [regBio, setRegBio] = useState('');
  const [regLocation, setRegLocation] = useState('Lagos, Nigeria');
  const [regCopyright, setRegCopyright] = useState(false);

  // Filter books belonging to author
  const myBooks = useMemo(() => {
    if (!authorProfile) return [];
    return books.filter(
      b => b.authorId === authorProfile.id || b.authorName === authorProfile.name || b.authorName === user?.displayName
    );
  }, [books, authorProfile, user]);

  // Filtered books by status and search
  const filteredBooks = useMemo(() => {
    return myBooks.filter(book => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && book.status === 'published') ||
        (statusFilter === 'pending' && book.status === 'pending_review') ||
        (statusFilter === 'draft' && book.status === 'draft') ||
        (statusFilter === 'rejected' && book.status === 'rejected');

      const matchesSearch =
        !searchQuery.trim() ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.genre.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [myBooks, statusFilter, searchQuery]);

  // Aggregate author reviews across all their books
  const allAuthorReviews = useMemo(() => {
    const list: Array<{ book: Book; review: any }> = [];
    myBooks.forEach(b => {
      const bookReviews = reviews[b.id] || [];
      bookReviews.forEach(r => {
        list.push({ book: b, review: r });
      });
    });
    return list;
  }, [myBooks, reviews]);

  const filteredAuthorReviews = useMemo(() => {
    if (reviewBookFilter === 'all') return allAuthorReviews;
    return allAuthorReviews.filter(item => item.book.id === reviewBookFilter);
  }, [allAuthorReviews, reviewBookFilter]);

  // Filter notifications for this author
  const authorNotifications = useMemo(() => {
    if (!authorProfile) return [];
    return notifications.filter(
      n => n.userId === authorProfile.id || n.userId === authorProfile.userId || n.userId === user?.uid
    );
  }, [notifications, authorProfile, user]);

  const unreadNotifCount = authorNotifications.filter(n => !n.read).length;

  const authorWithdrawals = withdrawals.filter(w => w.authorId === authorProfile?.id);

  // Calculated metrics
  const totalBalanceTokens = authorProfile?.balanceTokens || 0;
  const totalEarningsTokens = authorProfile?.totalEarningsTokens || 0;
  const usdAvailable = ((totalBalanceTokens * settings.tokenValueCents) / 100).toFixed(2);
  const usdLifetime = ((totalEarningsTokens * settings.tokenValueCents) / 100).toFixed(2);

  const totalReads = myBooks.reduce((acc, b) => acc + (b.readsCount || 0), 0);
  const totalReaders = authorProfile?.totalReaders || Math.round(totalReads * 0.45);
  const avgRating = myBooks.length > 0
    ? (myBooks.reduce((acc, b) => acc + (b.rating || 5.0), 0) / myBooks.length).toFixed(1)
    : '5.0';

  // Handle Cover File Upload with strict validation (MIME, size, extension)
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file, { maxSize: MAX_COVER_IMAGE_SIZE_BYTES });
    if (!validation.valid) {
      setFileError(validation.error || 'Invalid cover file.');
      return;
    }
    setFileError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setBookCover(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Edit Cover File Upload
  const handleEditCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file, { maxSize: MAX_COVER_IMAGE_SIZE_BYTES });
    if (!validation.valid) {
      setFileError(validation.error || 'Invalid cover file.');
      return;
    }
    setFileError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setEditCover(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Avatar File Upload
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file, { maxSize: MAX_AVATAR_IMAGE_SIZE_BYTES });
    if (!validation.valid) {
      setFileError(validation.error || 'Invalid avatar photo.');
      return;
    }
    setFileError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setEditPhotoURL(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Author Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regCopyright) return;
    await registerAuthor(regName, regBio, regLocation, regCopyright);
    setActiveTab('works');
  };

  // Handle Create Book (as Draft or for Review)
  const handleCreateBook = async (e: React.FormEvent, isDraftAction = false) => {
    e.preventDefault();
    if (!copyrightAgreed || !bookTitle.trim()) return;

    setIsSubmittingBook(true);
    try {
      const tagsArray = bookTags.split(',').map(t => t.trim()).filter(Boolean);
      await createBook(
        {
          title: bookTitle.trim(),
          genre: bookGenre,
          coverImage: bookCover,
          synopsis: bookSynopsis.trim(),
          description: bookDescription.trim() || bookSynopsis.trim(),
          language: bookLanguage,
          ageRating: bookAgeRating,
          tags: tagsArray.length > 0 ? tagsArray : ['Literature'],
          isPremium,
          tokenPrice: isPremium ? Number(tokenPrice) : 0,
          status: isDraftAction ? 'draft' : 'pending_review',
        },
        [
          {
            title: chapter1Title.trim() || 'Chapter 1: The Departure',
            content: chapter1Content.trim() || 'The morning light broke over the red earth...',
            isPremium: false,
            status: 'published',
          },
        ]
      );
      setShowNewBookModal(false);
      // Reset form
      setBookTitle('');
      setBookSynopsis('');
      setBookDescription('');
      setChapter1Content('');
      setCopyrightAgreed(false);
    } finally {
      setIsSubmittingBook(false);
    }
  };

  // Open Edit Book Modal
  const handleOpenEditBook = (book: Book) => {
    setEditingBook(book);
    setEditTitle(book.title);
    setEditGenre(book.genre);
    setEditSynopsis(book.synopsis || book.description);
    setEditDescription(book.description);
    setEditCover(book.coverImage);
    setEditIsPremium(book.isPremium);
    setEditTokenPrice(book.tokenPrice || 15);
  };

  // Save Book Edit
  const handleSaveBookEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    updateBook(editingBook.id, {
      title: editTitle.trim(),
      genre: editGenre,
      synopsis: editSynopsis.trim(),
      description: editDescription.trim(),
      coverImage: editCover,
      isPremium: editIsPremium,
      tokenPrice: editIsPremium ? Number(editTokenPrice) : 0,
    });

    setEditingBook(null);
  };

  // Open Chapters Management
  const handleOpenChapters = (book: Book) => {
    setManagingBookChapters(book);
    setShowAddChapterForm(false);
    setEditingChapter(null);
  };

  // Add Chapter to Book
  const handleAddChapterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingBookChapters || !newChapterTitle.trim()) return;

    addChapter(managingBookChapters.id, {
      title: newChapterTitle.trim(),
      content: newChapterContent.trim(),
      isPremium: newChapterPremium,
      status: newChapterStatus,
    });

    setNewChapterTitle('');
    setNewChapterContent('');
    setShowAddChapterForm(false);
  };

  // Save Chapter Edit
  const handleSaveChapterEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingBookChapters || !editingChapter) return;

    updateChapter(managingBookChapters.id, editingChapter.id, {
      title: editingChapter.title,
      content: editingChapter.content,
      isPremium: editingChapter.isPremium,
      status: editingChapter.status,
    });

    setEditingChapter(null);
  };

  // Delete Chapter
  const handleDeleteChapter = (chapterId: string) => {
    if (!managingBookChapters) return;
    if (window.confirm('Are you sure you want to delete this chapter? This cannot be undone.')) {
      deleteChapter(managingBookChapters.id, chapterId);
    }
  };

  // Save Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorProfile) return;

    const cleanWebsite = editWebsite.trim() ? (sanitizeUrl(editWebsite) || '') : '';
    const cleanTwitter = editTwitter.trim() ? (sanitizeTwitterHandle(editTwitter) || '') : '';

    updateAuthorProfile(authorProfile.id, {
      name: sanitizeTextInput(editName, 100),
      bio: sanitizeTextInput(editBio, 2000),
      location: sanitizeTextInput(editLocation, 100),
      photoURL: editPhotoURL,
      website: cleanWebsite,
      twitter: cleanTwitter,
    });

    setProfileSuccessMessage('Author profile details saved successfully!');
    setTimeout(() => setProfileSuccessMessage(null), 3500);
  };

  // Submit Withdrawal Request
  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorProfile) return;
    const res = await requestWithdrawal(
      authorProfile.id,
      Number(withdrawalTokens),
      payoutMethod,
      payoutDetails
    );
    setPayoutFeedback(res.message);
    setTimeout(() => setPayoutFeedback(null), 4000);
  };

  // Registration view for unregistered users
  if (!authorProfile && activeTab === 'registration') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-700">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl font-bold text-stone-900">
            LitVault Author Studio Registration
          </h2>
          <p className="mt-2 text-xs text-stone-500 max-w-md mx-auto">
            Publish your novels, short fiction, or poetry to thousands of readers and earn direct revenue with fair creator royalties.
          </p>

          <form onSubmit={handleRegister} className="mt-8 text-left space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Author / Pen Name
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={e => setRegName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Location / City
              </label>
              <input
                type="text"
                required
                value={regLocation}
                onChange={e => setRegLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Author Biography & Background
              </label>
              <textarea
                required
                rows={3}
                value={regBio}
                onChange={e => setRegBio(e.target.value)}
                placeholder="Tell readers about your writing voice, genres, and literary credentials..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
              />
            </div>

            {/* Copyright Agreement */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={regCopyright}
                  onChange={e => setRegCopyright(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs text-amber-950 leading-relaxed">
                  I certify and warrant that all literary works submitted to LitVault are my original creations, and I hold full publishing rights. I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegal('agreement')}
                    className="font-bold underline text-amber-800"
                  >
                    Author Publishing Agreement
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegal('copyright')}
                    className="font-bold underline text-amber-800"
                  >
                    Copyright Policy
                  </button>
                  .
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!regCopyright}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              Complete Author Registration
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top Banner & Creator Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <img
                src={authorProfile?.photoURL || PRESET_AVATARS[0]}
                alt={authorProfile?.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/20 shadow-xs"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-600 text-white p-1 rounded-full text-[10px] shadow-xs">
                <Award className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                  Verified Creator Studio
                </span>
                {authorProfile?.status === 'approved' && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/60">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Creator
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900">
                {authorProfile?.name}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5 line-clamp-1 max-w-xl">
                {authorProfile?.bio || 'Author, novelist and storyteller on LitVault.'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-stone-500">
                {authorProfile?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400" /> {authorProfile.location}
                  </span>
                )}
                {authorProfile?.twitter && (
                  <span className="flex items-center gap-1 text-sky-700 font-medium">
                    <Twitter className="w-3 h-3" /> {authorProfile.twitter}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            <button
              onClick={() => setActiveTab('profile')}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-stone-500" />
              Edit Profile
            </button>
            <button
              onClick={() => setShowNewBookModal(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Upload New Book
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Withdrawable Vault</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-700">
            {totalBalanceTokens} <span className="text-xs font-normal text-stone-500">Tokens</span>
          </div>
          <div className="text-xs text-stone-400 mt-1">
            ≈ ${usdAvailable} USD available
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lifetime Royalties</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-stone-900">
            {totalEarningsTokens} <span className="text-xs font-normal text-stone-500">Tokens</span>
          </div>
          <div className="text-xs text-stone-400 mt-1">
            ≈ ${usdLifetime} USD earned
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Readers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-stone-900">
            {totalReaders.toLocaleString()}
          </div>
          <div className="text-xs text-stone-400 mt-1">
            Audience reached
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Reads</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-stone-900">
            {totalReads.toLocaleString()}
          </div>
          <div className="text-xs text-stone-400 mt-1">
            Chapter reads
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Creator Rev-Share</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-stone-900">
            {settings.authorRevenueSharePercent}%
          </div>
          <div className="text-xs text-stone-400 mt-1">
            Direct creator payout rate
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-stone-200 mb-8 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'works', label: `My Books (${myBooks.length})`, icon: BookOpen },
          { id: 'analytics', label: 'Analytics & Readership', icon: TrendingUp },
          { id: 'reviews', label: `Reviews (${allAuthorReviews.length})`, icon: MessageSquare },
          { id: 'payouts', label: 'Royalties & Payouts', icon: DollarSign },
          {
            id: 'notifications',
            label: `Notifications ${unreadNotifCount > 0 ? `(${unreadNotifCount})` : ''}`,
            icon: Bell,
            badge: unreadNotifCount > 0,
          },
          { id: 'profile', label: 'Author Profile', icon: UserCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Works Management */}
      {activeTab === 'works' && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Works' },
                { id: 'published', label: 'Published' },
                { id: 'pending', label: 'In Review' },
                { id: 'draft', label: 'Drafts' },
                { id: 'rejected', label: 'Needs Revision' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === f.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
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
                placeholder="Search your titles..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-stone-50 focus:bg-white"
              />
            </div>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold text-stone-800">
                {myBooks.length === 0 ? "You haven't uploaded any books yet" : 'No books matching filter'}
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Ready to share your story with readers worldwide? Upload your manuscript and set your pricing.
              </p>
              <button
                onClick={() => setShowNewBookModal(true)}
                className="mt-5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Upload First Book
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map(book => {
                const bookChapters = chaptersMap[book.id] || [];
                return (
                  <div
                    key={book.id}
                    className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex gap-4 mb-4">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-20 h-28 object-cover rounded-xl shadow-xs border border-stone-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          {/* Status Badge */}
                          <div className="flex items-center gap-2 mb-1">
                            {book.status === 'published' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Published
                              </span>
                            )}
                            {book.status === 'pending_review' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Under Review
                              </span>
                            )}
                            {book.status === 'draft' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600">
                                Draft
                              </span>
                            )}
                            {book.status === 'rejected' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Rejected
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-sm text-stone-900 truncate">
                            {book.title}
                          </h3>
                          <span className="text-[11px] text-amber-800 font-semibold block">
                            {book.genre}
                          </span>
                          <span className="text-xs text-stone-500 font-mono block mt-1">
                            {book.isPremium ? `${book.tokenPrice} LitTokens` : 'Free Read'}
                          </span>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400">
                            <span>★ {book.rating.toFixed(1)}</span>
                            <span>•</span>
                            <span>{book.readsCount} reads</span>
                          </div>
                        </div>
                      </div>

                      {/* Chapters count & manage button */}
                      <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 mb-3 text-xs flex items-center justify-between">
                        <span className="text-stone-600 font-medium">
                          {bookChapters.length} Chapters Published
                        </span>
                        <button
                          onClick={() => handleOpenChapters(book)}
                          className="text-amber-700 font-bold hover:text-amber-800 text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5" /> Manage Chapters
                        </button>
                      </div>

                      {book.rejectionReason && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] mb-3 leading-relaxed">
                          <strong>Admin Editorial Feedback:</strong> {book.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenBookDetail(book)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 flex items-center gap-1 cursor-pointer"
                          title="Preview public reader page"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                        <button
                          onClick={() => handleOpenEditBook(book)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 flex items-center gap-1 cursor-pointer"
                          title="Edit title, synopsis, or pricing"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </div>

                      {/* Submit for review button for drafts or rejected books */}
                      {(book.status === 'draft' || book.status === 'rejected') && (
                        <button
                          onClick={() => submitBookForReview(book.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> Submit for Review
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Reader Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Overall Readership Satisfaction
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-stone-900">★ {avgRating}</span>
                <span className="text-xs text-stone-500">/ 5.0 rating score</span>
              </div>
              <div className="mt-4 space-y-1.5">
                {[
                  { star: '5 Stars', pct: '85%' },
                  { star: '4 Stars', pct: '12%' },
                  { star: '3 Stars', pct: '3%' },
                  { star: '2 Stars', pct: '0%' },
                  { star: '1 Star', pct: '0%' },
                ].map(r => (
                  <div key={r.star} className="flex items-center gap-2 text-xs">
                    <span className="w-14 text-stone-500">{r.star}</span>
                    <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: r.pct }} />
                    </div>
                    <span className="w-8 text-right font-mono text-stone-400">{r.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Completion & Retention Rate
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-stone-900">78.4%</span>
                <span className="text-xs text-emerald-600 font-semibold">+6.2% this month</span>
              </div>
              <p className="text-xs text-stone-500 mt-2">
                Readers who start Chapter 1 proceed through subsequent chapters to complete your manuscripts.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900">
                <strong>Editorial Insight:</strong> Books with cliffhanger endings in chapter 2 have a 92% token unlock conversion rate on LitVault.
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Top Performing Genre
              </h4>
              <div className="text-3xl font-extrabold text-stone-900">
                {myBooks[0]?.genre || 'African Literature'}
              </div>
              <p className="text-xs text-stone-500 mt-2">
                Your highest engagement comes from readers interested in historical narratives, contemporary drama and family sagas.
              </p>
            </div>
          </div>

          {/* Book-by-Book Analytics Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
            <h3 className="font-display text-lg font-bold text-stone-900 mb-1">
              Title Performance Breakdown
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Individual book telemetry including reader counts, total reads, and revenue generation.
            </p>

            <div className="space-y-4">
              {myBooks.map(b => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-12 h-16 object-cover rounded-lg shadow-xs shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">{b.title}</h4>
                      <span className="text-xs text-stone-500">{b.genre}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-center sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Reads</span>
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        {b.readsCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-center sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Rating</span>
                      <span className="font-bold text-amber-600 text-sm">
                        ★ {b.rating.toFixed(1)} ({b.reviewCount})
                      </span>
                    </div>
                    <div className="text-center sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Pricing</span>
                      <span className="font-mono font-bold text-stone-800 text-sm">
                        {b.isPremium ? `${b.tokenPrice} Tokens` : 'Free'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Reader Reviews */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900">
                Reader Reviews & Feedback
              </h3>
              <p className="text-xs text-stone-500">
                Browse direct feedback, ratings, and commentary left by your readers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500">Filter by Book:</label>
              <select
                value={reviewBookFilter}
                onChange={e => setReviewBookFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="all">All My Books ({allAuthorReviews.length})</option>
                {myBooks.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredAuthorReviews.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              No reader reviews recorded for the selected filter yet.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredAuthorReviews.map(({ book, review }) => (
                <div key={review.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          review.userPhoto ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={review.userName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                          {review.userName}
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Verified Reader
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400">
                          on <em>{book.title}</em> • {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex text-amber-500 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-stone-700 font-editorial leading-relaxed pl-11">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Royalties & Withdrawals */}
      {activeTab === 'payouts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Request Withdrawal form */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
            <h3 className="font-display text-lg font-bold text-stone-900 mb-1">
              Request Royalty Withdrawal
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Convert your earned LitTokens to direct fiat payouts. Minimum withdrawal: 50 LitTokens ($2.50 USD).
            </p>

            {payoutFeedback && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {payoutFeedback}
              </div>
            )}

            <form onSubmit={handleWithdrawalRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  LitTokens to Withdraw
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    max={totalBalanceTokens}
                    required
                    value={withdrawalTokens}
                    onChange={e => setWithdrawalTokens(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <div className="absolute right-3 top-2.5 text-xs text-stone-400">
                    Tokens (Max: {totalBalanceTokens})
                  </div>
                </div>
                <span className="text-[11px] text-amber-800 font-medium mt-1 block">
                  Est. Payout Value: ${((withdrawalTokens * settings.tokenValueCents) / 100).toFixed(2)} USD
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Payout Method
                </label>
                <select
                  value={payoutMethod}
                  onChange={e => setPayoutMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Bank Transfer">Bank Wire / ACH / NGN / GHS Bank Account</option>
                  <option value="Paystack">Paystack Payout (Direct African Bank)</option>
                  <option value="Mobile Money">Mobile Money (MTN / M-Pesa / Vodafone)</option>
                  <option value="PayPal">PayPal International</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Account Details / Mobile Number
                </label>
                <textarea
                  required
                  rows={3}
                  value={payoutDetails}
                  onChange={e => setPayoutDetails(e.target.value)}
                  placeholder="e.g. Bank Name, Account Number, Account Name, Swift/Routing or Mobile Money phone number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={totalBalanceTokens < 50 || withdrawalTokens > totalBalanceTokens}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                Submit Withdrawal Request
              </button>
            </form>
          </div>

          {/* Withdrawal History Table */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
            <h3 className="font-display text-lg font-bold text-stone-900 mb-1">
              Withdrawal History & Audits
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Review processing statuses of your creator payouts. All payouts are secured and recorded immutably.
            </p>

            {authorWithdrawals.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                No withdrawal records found.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {authorWithdrawals.map(wd => (
                  <div key={wd.id} className="py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-stone-800">
                        ${(wd.amountCents / 100).toFixed(2)} USD ({wd.tokensRequested} Tokens)
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {wd.payoutMethod} • {new Date(wd.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      {wd.status === 'completed' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Completed
                        </span>
                      )}
                      {wd.status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Pending Approval
                        </span>
                      )}
                      {wd.status === 'rejected' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          Declined
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Creator Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900">
                Creator Studio Notifications
              </h3>
              <p className="text-xs text-stone-500">
                Editorial updates, reader feedback alerts, and royalty payout statuses.
              </p>
            </div>
            {authorNotifications.length > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-amber-700 font-bold hover:text-amber-800 cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {authorNotifications.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              No notifications at this time.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {authorNotifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`py-4 flex items-start gap-3 cursor-pointer transition-all ${
                    !n.read ? 'bg-amber-50/40 -mx-4 px-4 rounded-xl' : ''
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      n.type === 'approval'
                        ? 'bg-emerald-100 text-emerald-700'
                        : n.type === 'rejection'
                        ? 'bg-rose-100 text-rose-700'
                        : n.type === 'review'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {n.type === 'approval' && <CheckCircle2 className="w-4 h-4" />}
                    {n.type === 'rejection' && <AlertCircle className="w-4 h-4" />}
                    {n.type === 'review' && <Star className="w-4 h-4" />}
                    {n.type === 'unlock' && <Coins className="w-4 h-4" />}
                    {n.type === 'payout' && <DollarSign className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs text-stone-900">{n.title}</h4>
                      <span className="text-[10px] text-stone-400">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Author Profile & Bio */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs max-w-2xl mx-auto">
          <h3 className="font-display text-lg font-bold text-stone-900 mb-1">
            Author Profile & Literary Bio
          </h3>
          <p className="text-xs text-stone-500 mb-6">
            Configure your pen name, biographical introduction, photo, and social links displayed across LitVault.
          </p>

          {profileSuccessMessage && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {profileSuccessMessage}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Author Pen Name
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Profile Avatar Selection & Upload */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Author Avatar / Photograph
              </label>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={editPhotoURL}
                  alt="Avatar Preview"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-600 shrink-0"
                />
                <div className="flex flex-wrap gap-2">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setEditPhotoURL(url)}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${
                        editPhotoURL === url ? 'border-amber-600 ring-2 ring-amber-500/30' : 'border-stone-200'
                      }`}
                    >
                      <img src={url} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Or enter custom image URL"
                  value={editPhotoURL}
                  onChange={e => setEditPhotoURL(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Photo
                </button>
              </div>
              {fileError && (
                <p className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {fileError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Location (City / Country)
              </label>
              <input
                type="text"
                value={editLocation}
                onChange={e => setEditLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Author Biography & Credentials
              </label>
              <textarea
                rows={4}
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                placeholder="Share your literary background, awards, and artistic vision with your readers..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none font-editorial"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Website / Portfolio
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editWebsite}
                  onChange={e => setEditWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Twitter / X Handle
                </label>
                <input
                  type="text"
                  placeholder="@author_handle"
                  value={editTwitter}
                  onChange={e => setEditTwitter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* MODAL: Upload / Create New Book */}
      {showNewBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-display text-lg font-bold text-stone-900">
                  Upload & Publish Literary Work
                </h3>
                <p className="text-xs text-stone-500">
                  Publish a new novel, anthology, or collection on LitVault
                </p>
              </div>
              <button
                onClick={() => setShowNewBookModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chronicles of the Calabar Coast"
                  value={bookTitle}
                  onChange={e => setBookTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Genre / Category
                  </label>
                  <select
                    value={bookGenre}
                    onChange={e => setBookGenre(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {genres.filter(g => g.active).map(g => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Language
                  </label>
                  <select
                    value={bookLanguage}
                    onChange={e => setBookLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="French">French</option>
                    <option value="Swahili">Swahili</option>
                    <option value="Yoruba">Yoruba</option>
                    <option value="Igbo">Igbo</option>
                    <option value="Hausa">Hausa</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Age Rating
                  </label>
                  <select
                    value={bookAgeRating}
                    onChange={e => setBookAgeRating(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="All Ages">All Ages</option>
                    <option value="13+">13+ Young Adult</option>
                    <option value="16+">16+ Mature</option>
                    <option value="18+">18+ Adults</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Keywords & Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lagos, Sisterhood, Heritage, Colonial Era"
                  value={bookTags}
                  onChange={e => setBookTags(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Pricing Model */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pricing Model
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPremium(false)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                      !isPremium ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    Free Read (Open Access)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPremium(true)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                      isPremium ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    Premium Tokens (Monetized)
                  </button>
                </div>
              </div>

              {isPremium && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Token Unlock Price (LitTokens)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={tokenPrice}
                    onChange={e => setTokenPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-stone-500 mt-0.5 block">
                    Recommended: 10 - 25 LitTokens (approx. ${( (tokenPrice * settings.tokenValueCents) / 100).toFixed(2)} USD). You receive {settings.authorRevenueSharePercent}% of each unlock.
                  </span>
                </div>
              )}

              {/* Cover Artwork & Upload */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Book Cover Artwork
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-2">
                  {PRESET_COVERS.map((url, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setBookCover(url)}
                      className={`relative aspect-[2/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        bookCover === url ? 'border-amber-600 ring-2 ring-amber-500/30' : 'border-stone-200'
                      }`}
                    >
                      <img src={url} alt="Cover" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Or enter custom cover image URL"
                    value={bookCover}
                    onChange={e => setBookCover(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload File
                  </button>
                </div>
                {fileError && (
                  <p className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {fileError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Synopsis / Hook (Front Blurb) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={bookSynopsis}
                  onChange={e => setBookSynopsis(e.target.value)}
                  placeholder="A one-to-two sentence compelling blurb for catalog discovery..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none font-editorial"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Description & Story Background
                </label>
                <textarea
                  rows={3}
                  value={bookDescription}
                  onChange={e => setBookDescription(e.target.value)}
                  placeholder="Detailed narrative summary and background of the work..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none font-editorial"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Opening Chapter Title & Manuscript Content *
                </label>
                <input
                  type="text"
                  required
                  value={chapter1Title}
                  onChange={e => setChapter1Title(e.target.value)}
                  placeholder="Chapter 1 Title"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs mb-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <textarea
                  required
                  rows={5}
                  value={chapter1Content}
                  onChange={e => setChapter1Content(e.target.value)}
                  placeholder="Type or paste the opening chapter text here..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-editorial"
                />
              </div>

              {/* Copyright Warranty */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-xl">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={copyrightAgreed}
                    onChange={e => setCopyrightAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs text-amber-950 leading-relaxed">
                    <ShieldCheck className="w-4 h-4 inline-block mr-1 text-emerald-700" />
                    <strong>Mandatory Copyright Warranty:</strong> I confirm that I am the author and sole copyright holder of this literary manuscript. I understand that plagiarized or infringing works will result in immediate suspension and forfeiture of royalties.
                  </span>
                </label>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewBookModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingBook || !copyrightAgreed || !bookTitle.trim()}
                  onClick={e => handleCreateBook(e, true)}
                  className="px-4 py-2.5 rounded-xl border border-amber-600 text-amber-900 bg-amber-50 hover:bg-amber-100 font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={isSubmittingBook || !copyrightAgreed || !bookTitle.trim()}
                  onClick={e => handleCreateBook(e, false)}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingBook ? 'Publishing...' : 'Submit for Admin Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Book Details */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-stone-900">
                  Edit "{editingBook.title}"
                </h3>
                <p className="text-xs text-stone-500">
                  Update synopsis, cover artwork, and token pricing
                </p>
              </div>
              <button
                onClick={() => setEditingBook(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBookEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Book Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Genre
                </label>
                <select
                  value={editGenre}
                  onChange={e => setEditGenre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {genres.map(g => (
                    <option key={g.id} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cover input */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Cover Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editCover}
                    onChange={e => setEditCover(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <label className="px-3 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" /> Upload
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleEditCoverFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {fileError && (
                  <p className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {fileError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Synopsis (Front Hook)
                </label>
                <textarea
                  rows={2}
                  value={editSynopsis}
                  onChange={e => setEditSynopsis(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none font-editorial"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pricing Model
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditIsPremium(false)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                      !editIsPremium ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    Free Read
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIsPremium(true)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                      editIsPremium ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    Premium Tokens
                  </button>
                </div>
              </div>

              {editIsPremium && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Token Unlock Price
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={editTokenPrice}
                    onChange={e => setEditTokenPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Manage Chapters */}
      {managingBookChapters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-display text-base font-bold text-stone-900">
                  Chapters: "{managingBookChapters.title}"
                </h3>
                <p className="text-xs text-stone-500">
                  {(chaptersMap[managingBookChapters.id] || []).length} total chapters uploaded
                </p>
              </div>
              <button
                onClick={() => setManagingBookChapters(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Actions row */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">Chapter List</span>
                {!showAddChapterForm && !editingChapter && (
                  <button
                    onClick={() => setShowAddChapterForm(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Chapter
                  </button>
                )}
              </div>

              {/* Add Chapter Form */}
              {showAddChapterForm && (
                <form onSubmit={handleAddChapterSubmit} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <h4 className="font-bold text-xs text-stone-900">Add New Installment</h4>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Chapter Title (e.g. Chapter 4: The Harmattan Wind)"
                      value={newChapterTitle}
                      onChange={e => setNewChapterTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <textarea
                      required
                      rows={6}
                      placeholder="Type or paste chapter manuscript prose..."
                      value={newChapterContent}
                      onChange={e => setNewChapterContent(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-editorial focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newChapterPremium}
                        onChange={e => setNewChapterPremium(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Require Tokens to Unlock</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddChapterForm(false)}
                        className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Publish Chapter
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Edit Chapter Form */}
              {editingChapter && (
                <form onSubmit={handleSaveChapterEdit} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <h4 className="font-bold text-xs text-stone-900">Edit Chapter {editingChapter.chapterNumber}</h4>
                  <div>
                    <input
                      type="text"
                      required
                      value={editingChapter.title}
                      onChange={e => setEditingChapter({ ...editingChapter, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <textarea
                      required
                      rows={6}
                      value={editingChapter.content}
                      onChange={e => setEditingChapter({ ...editingChapter, content: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-editorial focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingChapter.isPremium}
                        onChange={e => setEditingChapter({ ...editingChapter, isPremium: e.target.checked })}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Require Tokens to Unlock</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingChapter(null)}
                        className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Save Chapter
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Existing Chapters List */}
              <div className="divide-y divide-stone-100">
                {(chaptersMap[managingBookChapters.id] || []).map((ch, idx) => (
                  <div key={ch.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-stone-900">
                        {idx + 1}. {ch.title}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        {ch.content.split(/\s+/).length} words • {ch.isPremium ? 'Premium (Locked)' : 'Free Chapter'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingChapter(ch)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 cursor-pointer"
                        title="Edit chapter content"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(ch.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                        title="Delete chapter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
