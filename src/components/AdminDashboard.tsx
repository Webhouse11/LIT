import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Book,
  AuthorProfile,
  TokenPackage,
  GenreItem,
  Report,
  Withdrawal,
  AdSlotConfig,
  UserProfile,
  UserRole,
} from '../types';
import {
  ShieldAlert,
  BookOpen,
  Users,
  Coins,
  DollarSign,
  TrendingUp,
  Tag,
  AlertTriangle,
  Megaphone,
  Sliders,
  History,
  Check,
  X,
  Star,
  Plus,
  Trash2,
  Edit2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  Search,
  Filter,
  Globe,
  ChevronLeft,
  ChevronRight,
  Lock,
  Bell,
  ArrowRight,
  Shield,
  Layers,
  MessageSquare,
  Award,
  UserX,
  UserCheck,
  Send,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardProps {
  onPreviewBook: (book: Book) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onPreviewBook }) => {
  const { user, isAdmin, switchDemoRole } = useAuth();
  const {
    books,
    authors,
    genres,
    tokenPackages,
    settings,
    adSlots,
    transactions,
    reports,
    withdrawals,
    auditLogs,
    reviews,
    users,
    notifications,
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
  } = useApp();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'users'
    | 'authors'
    | 'books'
    | 'reviews'
    | 'reports'
    | 'tokens'
    | 'transactions'
    | 'earnings'
    | 'withdrawals'
    | 'genres'
    | 'homepage'
    | 'ads'
    | 'seo'
    | 'notifications'
    | 'settings'
    | 'audit'
  >('overview');

  // Generic Confirmation Modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    isDestructive: false,
    onConfirm: () => {},
  });

  const triggerConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmLabel = 'Confirm',
    isDestructive = true
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmLabel,
      isDestructive,
      onConfirm,
    });
  };

  // Rejection Modals
  const [rejectBookId, setRejectBookId] = useState<string | null>(null);
  const [rejectBookReason, setRejectBookReason] = useState('');

  const [rejectAuthorId, setRejectAuthorId] = useState<string | null>(null);
  const [rejectAuthorReason, setRejectAuthorReason] = useState('');

  const [rejectWdId, setRejectWdId] = useState<string | null>(null);
  const [rejectWdReason, setRejectWdReason] = useState('');

  // Add/Edit Genre Dialog
  const [showAddGenre, setShowAddGenre] = useState(false);
  const [editingGenre, setEditingGenre] = useState<GenreItem | null>(null);
  const [genreName, setGenreName] = useState('');
  const [genreDesc, setGenreDesc] = useState('');
  const [genreSlug, setGenreSlug] = useState('');

  // Add/Edit Token Pack Dialog
  const [showAddPack, setShowAddPack] = useState(false);
  const [editingPack, setEditingPack] = useState<TokenPackage | null>(null);
  const [packName, setPackName] = useState('');
  const [packTokens, setPackTokens] = useState(100);
  const [packBonus, setPackBonus] = useState(10);
  const [packPriceCents, setPackPriceCents] = useState(499);
  const [packCurrency, setPackCurrency] = useState('USD');
  const [packPopular, setPackPopular] = useState(false);

  // Broadcast Notification Dialog
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'author' | 'reader'>('all');
  const [broadcastToast, setBroadcastToast] = useState(false);

  // Settings & SEO Forms
  const [revShare, setRevShare] = useState(settings.authorRevenueSharePercent);
  const [tokenValCents, setTokenValCents] = useState(settings.tokenValueCents);
  const [minWdTokens, setMinWdTokens] = useState(settings.minWithdrawalTokens || 50);
  const [reqBookApproval, setReqBookApproval] = useState(settings.requireBookApproval);
  const [reqAuthorApproval, setReqAuthorApproval] = useState(settings.requireAuthorApproval);

  // Homepage Settings
  const [heroHeading, setHeroHeading] = useState(settings.heroHeadline || '');
  const [heroSubhead, setHeroSubhead] = useState(settings.heroSubheadline || '');
  const [announcementText, setAnnouncementText] = useState(settings.announcement || '');
  const [announcementActive, setAnnouncementActive] = useState(settings.announcementActive ?? true);

  // SEO Settings
  const [seoTitle, setSeoTitle] = useState(settings.seoTitle || 'LitVault — Read. Discover. Publish.');
  const [seoDesc, setSeoDesc] = useState(
    settings.seoDescription ||
      'LitVault is a modern digital literary platform where readers discover and read novels, short stories, and poetry, while authors publish and monetize their books.'
  );
  const [seoKeywords, setSeoKeywords] = useState(
    settings.seoKeywords || 'African literature, books, reading, authors, novels, poetry, digital publishing, LitTokens'
  );
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Search & Filter states across tabs
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  const [userPage, setUserPage] = useState(1);

  const [bookSearch, setBookSearch] = useState('');
  const [bookStatusFilter, setBookStatusFilter] = useState<string>('all');
  const [bookGenreFilter, setBookGenreFilter] = useState<string>('all');
  const [bookPage, setBookPage] = useState(1);

  const [authorSearch, setAuthorSearch] = useState('');
  const [authorStatusFilter, setAuthorStatusFilter] = useState<string>('all');

  const [txSearch, setTxSearch] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState<string>('all');
  const [txPage, setTxPage] = useState(1);

  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<string>('all');

  // Strict Role-Based Authorization Guard
  if (!isAdmin && user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-10 border border-stone-200 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl font-bold text-stone-900">
            403 — Administrator Access Restricted
          </h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            You are logged in as <strong>{user?.email || 'Guest Reader'}</strong> ({user?.role || 'reader'}).
            Only platform administrators with verified credentials can access the LitVault Control Center.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => switchDemoRole('admin')}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Switch to Super Admin (Demo)
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-all cursor-pointer"
            >
              Back to Safety
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Financial aggregates calculated from real transactions safely (integer cents)
  const totalRevenueCents = transactions.reduce(
    (acc, t) => acc + (t.status === 'completed' ? t.amountCents : 0),
    0
  );
  const totalTokensSold = transactions.reduce(
    (acc, t) => acc + (t.status === 'completed' ? t.tokensPurchased : 0),
    0
  );
  const totalAuthorTokensEarned = authors.reduce((acc, a) => acc + a.totalEarningsTokens, 0);
  const totalReads = books.reduce((acc, b) => acc + b.readsCount, 0);

  const pendingBooks = books.filter(b => b.status === 'pending_review');
  const pendingAuthors = authors.filter(a => a.status === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');
  const pendingWithdrawalsList = withdrawals.filter(w => w.status === 'pending');

  // Aggregated reviews across books
  const allReviewsList = useMemo(() => {
    const list: Array<{ book: Book; review: any }> = [];
    books.forEach(b => {
      const bookReviews = reviews[b.id] || [];
      bookReviews.forEach(r => {
        list.push({ book: b, review: r });
      });
    });
    return list;
  }, [books, reviews]);

  // Filtered Users with pagination
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        !userSearch.trim() ||
        u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase());

      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchesStatus =
        userStatusFilter === 'all' ||
        (userStatusFilter === 'active' && (!u.status || u.status === 'active')) ||
        (userStatusFilter === 'suspended' && u.status === 'suspended');

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  const USERS_PER_PAGE = 8;
  const paginatedUsers = filteredUsers.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);
  const totalUserPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;

  // Filtered Books with pagination
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchesSearch =
        !bookSearch.trim() ||
        b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.authorName.toLowerCase().includes(bookSearch.toLowerCase());

      const matchesStatus = bookStatusFilter === 'all' || b.status === bookStatusFilter;
      const matchesGenre = bookGenreFilter === 'all' || b.genre === bookGenreFilter;

      return matchesSearch && matchesStatus && matchesGenre;
    });
  }, [books, bookSearch, bookStatusFilter, bookGenreFilter]);

  const BOOKS_PER_PAGE = 8;
  const paginatedBooks = filteredBooks.slice((bookPage - 1) * BOOKS_PER_PAGE, bookPage * BOOKS_PER_PAGE);
  const totalBookPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE) || 1;

  // Filtered Authors
  const filteredAuthors = useMemo(() => {
    return authors.filter(a => {
      const matchesSearch =
        !authorSearch.trim() ||
        a.name.toLowerCase().includes(authorSearch.toLowerCase()) ||
        (a.location && a.location.toLowerCase().includes(authorSearch.toLowerCase()));

      const matchesStatus = authorStatusFilter === 'all' || a.status === authorStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [authors, authorSearch, authorStatusFilter]);

  // Filtered Transactions with pagination
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch =
        !txSearch.trim() ||
        t.paymentReference.toLowerCase().includes(txSearch.toLowerCase()) ||
        (t.userEmail && t.userEmail.toLowerCase().includes(txSearch.toLowerCase())) ||
        t.packageName.toLowerCase().includes(txSearch.toLowerCase());

      const matchesStatus = txStatusFilter === 'all' || t.status === txStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, txSearch, txStatusFilter]);

  const TX_PER_PAGE = 10;
  const paginatedTxs = filteredTransactions.slice((txPage - 1) * TX_PER_PAGE, txPage * TX_PER_PAGE);
  const totalTxPages = Math.ceil(filteredTransactions.length / TX_PER_PAGE) || 1;

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    return allReviewsList.filter(({ book, review }) => {
      const matchesSearch =
        !reviewSearch.trim() ||
        review.userName.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        review.comment.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        book.title.toLowerCase().includes(reviewSearch.toLowerCase());

      const matchesRating =
        reviewRatingFilter === 'all' || String(review.rating) === reviewRatingFilter;

      return matchesSearch && matchesRating;
    });
  }, [allReviewsList, reviewSearch, reviewRatingFilter]);

  // Handlers
  const handleSavePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault();
    adminUpdateSettings({
      authorRevenueSharePercent: Number(revShare),
      platformRevenueSharePercent: 100 - Number(revShare),
      tokenValueCents: Number(tokenValCents),
      minWithdrawalTokens: Number(minWdTokens),
      requireBookApproval: reqBookApproval,
      requireAuthorApproval: reqAuthorApproval,
      heroHeadline: heroHeading,
      heroSubheadline: heroSubhead,
      announcement: announcementText,
      announcementActive,
      seoTitle,
      seoDescription: seoDesc,
      seoKeywords,
    });
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    broadcastNotification(broadcastTitle.trim(), broadcastMessage.trim(), broadcastTarget);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setBroadcastToast(true);
    setTimeout(() => setBroadcastToast(false), 3000);
  };

  const handleSaveGenre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genreName.trim()) return;

    if (editingGenre) {
      adminUpdateGenre(editingGenre.id, {
        name: genreName.trim(),
        description: genreDesc.trim(),
        slug: genreSlug.trim() || genreName.trim().toLowerCase().replace(/\s+/g, '-'),
      });
    } else {
      adminAddGenre({
        name: genreName.trim(),
        slug: genreSlug.trim() || genreName.trim().toLowerCase().replace(/\s+/g, '-'),
        description: genreDesc.trim() || `${genreName} literature catalog`,
        active: true,
      });
    }

    setShowAddGenre(false);
    setEditingGenre(null);
    setGenreName('');
    setGenreDesc('');
    setGenreSlug('');
  };

  const handleSavePack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packName.trim()) return;

    if (editingPack) {
      adminUpdateTokenPackage(editingPack.id, {
        name: packName.trim(),
        tokens: Number(packTokens),
        bonusTokens: Number(packBonus),
        priceCents: Number(packPriceCents),
        currency: packCurrency,
        popular: packPopular,
      });
    } else {
      adminAddTokenPackage({
        name: packName.trim(),
        tokens: Number(packTokens),
        bonusTokens: Number(packBonus),
        priceCents: Number(packPriceCents),
        currency: packCurrency,
        popular: packPopular,
        active: true,
      });
    }

    setShowAddPack(false);
    setEditingPack(null);
    setPackName('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-stone-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30 text-amber-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-wide">
                LitVault Control Center
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Logged in as <strong className="text-white">{user?.email}</strong>. Live platform governance & economic controls.
            </p>
          </div>
        </div>

        {/* Real-time Pending Alerts */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {pendingBooks.length > 0 && (
            <button
              onClick={() => setActiveTab('books')}
              className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {pendingBooks.length} Books to Review
            </button>
          )}
          {pendingWithdrawalsList.length > 0 && (
            <button
              onClick={() => setActiveTab('withdrawals')}
              className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-semibold hover:bg-emerald-500/30 transition-all cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5" />
              {pendingWithdrawalsList.length} Payouts Pending
            </button>
          )}
          {pendingReports.length > 0 && (
            <button
              onClick={() => setActiveTab('reports')}
              className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-semibold hover:bg-rose-500/30 transition-all cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {pendingReports.length} Reports Unresolved
            </button>
          )}
          {pendingAuthors.length > 0 && (
            <button
              onClick={() => setActiveTab('authors')}
              className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 font-semibold hover:bg-purple-500/30 transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              {pendingAuthors.length} Creator Applications
            </button>
          )}
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 mb-8 text-xs font-bold scrollbar-none">
        {[
          { id: 'overview', label: 'Platform Metrics', icon: TrendingUp },
          { id: 'users', label: `Users (${users.length})`, icon: Users },
          { id: 'authors', label: `Authors (${authors.length})`, icon: Award },
          { id: 'books', label: `Books Catalog (${books.length})`, icon: BookOpen },
          { id: 'reviews', label: `Reviews (${allReviewsList.length})`, icon: MessageSquare },
          { id: 'reports', label: `Moderation (${pendingReports.length})`, icon: AlertTriangle },
          { id: 'tokens', label: 'Token Packages & RevShare', icon: Coins },
          { id: 'transactions', label: `Transactions (${transactions.length})`, icon: History },
          { id: 'earnings', label: 'Author Earnings', icon: DollarSign },
          { id: 'withdrawals', label: `Payouts (${pendingWithdrawalsList.length})`, icon: DollarSign },
          { id: 'genres', label: `Genres (${genres.length})`, icon: Tag },
          { id: 'homepage', label: 'Homepage & Hero', icon: Sparkles },
          { id: 'ads', label: 'Ad Placements', icon: Megaphone },
          { id: 'seo', label: 'SEO & Metadata', icon: Globe },
          { id: 'notifications', label: 'Broadcast Alerts', icon: Bell },
          { id: 'settings', label: 'Platform Settings', icon: Sliders },
          { id: 'audit', label: 'Audit Trail', icon: History },
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                Platform Revenue
              </div>
              <div className="text-2xl font-mono font-bold text-stone-900">
                ${(totalRevenueCents / 100).toFixed(2)} <span className="text-xs font-normal text-stone-500">USD</span>
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1">
                Real token purchases logged
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                LitTokens Minted & Sold
              </div>
              <div className="text-2xl font-mono font-bold text-amber-700">
                {totalTokensSold.toLocaleString()} <span className="text-xs font-normal text-stone-500">Tokens</span>
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Active virtual currency circulation
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                Author Royalties
              </div>
              <div className="text-2xl font-mono font-bold text-stone-900">
                {totalAuthorTokensEarned.toLocaleString()} <span className="text-xs font-normal text-stone-500">Tokens</span>
              </div>
              <div className="text-xs text-stone-400 mt-1">
                RevShare benchmark: {settings.authorRevenueSharePercent}%
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                Total Reads & Sessions
              </div>
              <div className="text-2xl font-mono font-bold text-stone-900">
                {totalReads.toLocaleString()}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Across {books.length} publications
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Book Submissions Queue */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
                <h3 className="font-display font-bold text-base text-stone-900">
                  Manuscript Review Queue ({pendingBooks.length})
                </h3>
                <button
                  onClick={() => setActiveTab('books')}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                >
                  Manage All →
                </button>
              </div>

              {pendingBooks.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All submitted manuscripts have been reviewed!
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingBooks.map(b => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={b.coverImage} alt={b.title} className="w-8 h-12 object-cover rounded shrink-0" />
                        <div className="truncate">
                          <h4 className="font-bold text-stone-900 truncate">{b.title}</h4>
                          <span className="text-[11px] text-stone-500">{b.authorName} • {b.genre}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => adminApproveBook(b.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setRejectBookId(b.id);
                            setActiveTab('books');
                          }}
                          className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg font-bold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Author Applications Queue */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
                <h3 className="font-display font-bold text-base text-stone-900">
                  Creator Verification Applications ({pendingAuthors.length})
                </h3>
                <button
                  onClick={() => setActiveTab('authors')}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                >
                  Manage All →
                </button>
              </div>

              {pendingAuthors.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  No pending creator applications.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingAuthors.map(a => (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="truncate">
                        <h4 className="font-bold text-stone-900 truncate">{a.name}</h4>
                        <span className="text-[11px] text-stone-500">{a.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => adminApproveAuthor(a.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => adminRejectAuthor(a.id)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">
                User & Member Management
              </h2>
              <p className="text-xs text-stone-500">
                Manage registered readers, authors, and staff permissions. Enforce security and account suspensions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none w-48"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="reader">Readers</option>
                <option value="author">Authors</option>
                <option value="admin">Admins</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={e => setUserStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-y border-stone-100">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Token Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedUsers.map(u => (
                  <tr key={u.uid} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.photoURL ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                          }
                          alt={u.displayName}
                          className="w-8 h-8 rounded-full object-cover border border-stone-200"
                        />
                        <div>
                          <div className="font-bold text-stone-900">{u.displayName}</div>
                          <div className="text-[11px] text-stone-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'author'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                      {u.tokenBalance || 0} Tokens
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'suspended'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.status === 'suspended' ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.status === 'suspended' ? (
                          <button
                            onClick={() =>
                              triggerConfirm(
                                'Restore User Privileges',
                                `Restore normal access for ${u.displayName} (${u.email})?`,
                                () => adminRestoreUser(u.uid),
                                'Restore Account',
                                false
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold cursor-pointer"
                          >
                            Restore
                          </button>
                        ) : (
                          u.role !== 'admin' && (
                            <button
                              onClick={() =>
                                triggerConfirm(
                                  'Suspend User Account',
                                  `Are you sure you want to suspend ${u.displayName} (${u.email})? They will lose access to publishing and reading tokens.`,
                                  () => adminSuspendUser(u.uid)
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold cursor-pointer"
                            >
                              Suspend
                            </button>
                          )
                        )}

                        <select
                          value={u.role}
                          onChange={e =>
                            adminUpdateUser(u.uid, { role: e.target.value as UserRole })
                          }
                          className="px-2 py-1 rounded-lg border border-stone-200 text-[11px] font-semibold bg-white"
                        >
                          <option value="reader">Set Reader</option>
                          <option value="author">Set Author</option>
                          <option value="admin">Set Admin</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
            <span>
              Showing {paginatedUsers.length} of {filteredUsers.length} users
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={userPage <= 1}
                onClick={() => setUserPage(p => p - 1)}
                className="px-3 py-1 rounded-lg border border-stone-200 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span>
                Page {userPage} of {totalUserPages}
              </span>
              <button
                disabled={userPage >= totalUserPages}
                onClick={() => setUserPage(p => p + 1)}
                className="px-3 py-1 rounded-lg border border-stone-200 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. AUTHOR MANAGEMENT TAB */}
      {activeTab === 'authors' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">
                Author & Creator Management
              </h2>
              <p className="text-xs text-stone-500">
                Review verified publishing privileges, creator copyright agreements, and monitor author balances.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search authors..."
                  value={authorSearch}
                  onChange={e => setAuthorSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none w-44"
                />
              </div>

              <select
                value={authorStatusFilter}
                onChange={e => setAuthorStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {filteredAuthors.map(author => (
              <div
                key={author.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={author.photoURL}
                    alt={author.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-stone-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm text-stone-900">{author.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          author.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : author.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {author.status}
                      </span>
                      {author.copyrightAgreed && (
                        <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                          Copyright Warranted
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-1 max-w-lg">{author.bio}</p>
                    <div className="flex items-center gap-4 text-[11px] text-stone-400 mt-1 font-mono">
                      <span>{author.location}</span>
                      <span>•</span>
                      <span>Total Reads: {author.totalReads.toLocaleString()}</span>
                      <span>•</span>
                      <span>Withdrawable: {author.balanceTokens} Tokens</span>
                      <span>•</span>
                      <span>Lifetime: {author.totalEarningsTokens} Tokens</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {author.status === 'pending' && (
                    <>
                      <button
                        onClick={() => adminApproveAuthor(author.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Approve Creator
                      </button>
                      <button
                        onClick={() => {
                          setRejectAuthorId(author.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {author.status === 'approved' && (
                    <button
                      onClick={() =>
                        triggerConfirm(
                          'Suspend Creator Privileges',
                          `Are you sure you want to suspend author "${author.name}"? Their published books will be temporarily delisted.`,
                          () => adminSuspendAuthor(author.id)
                        )
                      }
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                    >
                      Suspend
                    </button>
                  )}
                  {(author.status === 'suspended' || author.status === 'rejected') && (
                    <button
                      onClick={() => adminApproveAuthor(author.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Restore Creator
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Author Rejection Modal */}
          {rejectAuthorId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h4 className="font-bold text-sm text-stone-900 mb-2">
                  Decline Author Application
                </h4>
                <p className="text-xs text-stone-500 mb-3">
                  Please provide administrative feedback explaining why this creator application was not approved.
                </p>
                <textarea
                  rows={3}
                  value={rejectAuthorReason}
                  onChange={e => setRejectAuthorReason(e.target.value)}
                  placeholder="e.g. Identity verification could not be confirmed, incomplete biography..."
                  className="w-full p-2.5 text-xs rounded-xl border border-stone-300 mb-4 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setRejectAuthorId(null)}
                    className="px-3 py-1.5 rounded-lg text-xs border border-stone-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      adminRejectAuthor(rejectAuthorId);
                      setRejectAuthorId(null);
                      setRejectAuthorReason('');
                    }}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Confirm Decline
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. BOOKS CATALOG TAB */}
      {activeTab === 'books' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">
                Book Catalog & Editorial Governance
              </h2>
              <p className="text-xs text-stone-500">
                Review submissions, feature prominent titles, suspend infringing works, or restore catalog status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search titles / authors..."
                  value={bookSearch}
                  onChange={e => setBookSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none w-48"
                />
              </div>

              <select
                value={bookStatusFilter}
                onChange={e => setBookStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="pending_review">Pending Review</option>
                <option value="draft">Drafts</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={bookGenreFilter}
                onChange={e => setBookGenreFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="all">All Genres</option>
                {genres.map(g => (
                  <option key={g.id} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {paginatedBooks.map(book => (
              <div
                key={book.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-12 h-18 object-cover rounded-lg shadow-xs shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                        {book.genre}
                      </span>
                      {book.isPremium ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {book.tokenPrice} LitTokens
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Free
                        </span>
                      )}
                      {book.featured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Featured
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          book.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : book.status === 'pending_review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {book.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-stone-900">{book.title}</h3>
                    <p className="text-xs text-stone-500">
                      by {book.authorName} • {book.readsCount} reads • ★ {book.rating.toFixed(1)} ({book.reviewCount} reviews)
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => onPreviewBook(book)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                  >
                    Preview
                  </button>

                  <button
                    onClick={() => adminToggleFeaturedBook(book.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      book.featured
                        ? 'bg-purple-100 text-purple-900'
                        : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {book.featured ? 'Unfeature' : 'Feature on Hero'}
                  </button>

                  {book.status === 'pending_review' && (
                    <>
                      <button
                        onClick={() => adminApproveBook(book.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectBookId(book.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {book.status === 'published' && (
                    <button
                      onClick={() =>
                        triggerConfirm(
                          'Suspend Book from Distribution',
                          `Are you sure you want to suspend "${book.title}" from reader access? It will be removed from the discovery feed.`,
                          () => adminRemoveBook(book.id)
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold cursor-pointer"
                    >
                      Suspend
                    </button>
                  )}

                  {book.status === 'suspended' && (
                    <button
                      onClick={() => adminRestoreBook(book.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold cursor-pointer"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
            <span>
              Showing {paginatedBooks.length} of {filteredBooks.length} books
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={bookPage <= 1}
                onClick={() => setBookPage(p => p - 1)}
                className="px-3 py-1 rounded-lg border border-stone-200 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span>
                Page {bookPage} of {totalBookPages}
              </span>
              <button
                disabled={bookPage >= totalBookPages}
                onClick={() => setBookPage(p => p + 1)}
                className="px-3 py-1 rounded-lg border border-stone-200 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

          {/* Book Rejection Modal */}
          {rejectBookId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h4 className="font-bold text-sm text-stone-900 mb-2">
                  Provide Editorial Rejection Reason
                </h4>
                <p className="text-xs text-stone-500 mb-3">
                  This explanation will be shared with the author in their dashboard.
                </p>
                <textarea
                  rows={3}
                  value={rejectBookReason}
                  onChange={e => setRejectBookReason(e.target.value)}
                  placeholder="e.g. Incomplete chapter metadata, formatting issues, copyright verification needed..."
                  className="w-full p-2.5 text-xs rounded-xl border border-stone-300 mb-4 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setRejectBookId(null)}
                    className="px-3 py-1.5 rounded-lg text-xs border border-stone-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      adminRejectBook(rejectBookId, rejectBookReason || 'Content does not meet editorial criteria.');
                      setRejectBookId(null);
                      setRejectBookReason('');
                    }}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. REVIEWS MODERATION TAB */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">
                Reader Reviews Moderation
              </h2>
              <p className="text-xs text-stone-500">
                Audit reader ratings and remove offensive, abusive or promotional spam commentary.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={reviewSearch}
                  onChange={e => setReviewSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none w-44"
                />
              </div>

              <select
                value={reviewRatingFilter}
                onChange={e => setReviewRatingFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="all">All Stars</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No reader reviews matching filter.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredReviews.map(({ book, review }) => (
                <div key={review.id} className="py-4 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{review.userName}</span>
                      <span className="text-stone-400">on</span>
                      <span className="font-semibold text-amber-800">{book.title}</span>
                      <div className="flex text-amber-500 ml-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-stone-700 font-editorial leading-relaxed max-w-2xl">
                      "{review.comment}"
                    </p>
                    <span className="text-[10px] text-stone-400 block font-mono">
                      {new Date(review.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      triggerConfirm(
                        'Delete Inappropriate Review',
                        `Are you sure you want to permanently remove this review by "${review.userName}" from "${book.title}"?`,
                        () => deleteReview(book.id, review.id)
                      )
                    }
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. CONTENT MODERATION REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">
                Content Moderation & DMCA Claims
              </h2>
              <p className="text-xs text-stone-500">
                Investigate reader and creator flags for DMCA copyright claims, plagiarism, or community violations.
              </p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No reported content items in queue.
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map(rep => (
                <div
                  key={rep.id}
                  className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">{rep.targetTitle}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-200 text-stone-700">
                        {rep.targetType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rep.status === 'pending'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-rose-700">Reason: {rep.reason}</p>
                    {rep.details && (
                      <p className="text-xs text-stone-600 font-editorial">
                        "{rep.details}"
                      </p>
                    )}
                    <span className="text-[10px] text-stone-400 block font-mono">
                      Reported on {new Date(rep.createdAt).toLocaleString()} by {rep.reporterEmail || 'Reader'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {rep.status === 'pending' && (
                      <>
                        <button
                          onClick={() =>
                            triggerConfirm(
                              'Enforce Content Penalty',
                              `Confirm administrative action taken on reported ${rep.targetType} "${rep.targetTitle}"?`,
                              () => adminProcessReport(rep.id, 'action_taken')
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Take Action (Delist Content)
                        </button>
                        <button
                          onClick={() => adminProcessReport(rep.id, 'dismissed')}
                          className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. TOKEN PACKAGES & REVSHARE TAB */}
      {activeTab === 'tokens' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h2 className="font-display text-xl font-bold text-stone-900">
                  LitToken Bundle Packages
                </h2>
                <p className="text-xs text-stone-500">
                  Configure packages with integer minor units (e.g. 499 = $4.99). Never use floating-point for money.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingPack(null);
                  setPackName('');
                  setPackTokens(100);
                  setPackBonus(10);
                  setPackPriceCents(499);
                  setShowAddPack(true);
                }}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Bundle
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tokenPackages.map(pkg => (
                <div
                  key={pkg.id}
                  className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-stone-900">{pkg.name}</span>
                      <span className="font-mono font-bold text-sm text-amber-700">
                        ${(pkg.priceCents / 100).toFixed(2)}
                      </span>
                    </div>

                    <div className="text-2xl font-bold font-mono text-stone-900 my-2">
                      {pkg.tokens}{' '}
                      <span className="text-xs font-normal text-stone-500">tokens</span>
                    </div>

                    {Boolean(pkg.bonusTokens && pkg.bonusTokens > 0) && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        +{pkg.bonusTokens} Bonus
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
                    <button
                      onClick={() =>
                        adminUpdateTokenPackage(pkg.id, { active: !pkg.active })
                      }
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg cursor-pointer ${
                        pkg.active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {pkg.active ? 'Active' : 'Inactive'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          adminUpdateTokenPackage(pkg.id, { popular: !pkg.popular })
                        }
                        className={`text-xs font-bold px-2 py-1 rounded-lg cursor-pointer ${
                          pkg.popular
                            ? 'text-amber-800 bg-amber-100'
                            : 'text-stone-400 hover:text-stone-700'
                        }`}
                      >
                        {pkg.popular ? 'Best Value ★' : 'Set Value'}
                      </button>

                      <button
                        onClick={() =>
                          triggerConfirm(
                            'Delete Token Package',
                            `Are you sure you want to delete bundle "${pkg.name}"?`,
                            () => adminDeleteTokenPackage(pkg.id)
                          )
                        }
                        className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add/Edit Token Pack Modal */}
          {showAddPack && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="font-display font-bold text-base text-stone-900 mb-4">
                  {editingPack ? 'Edit LitToken Package' : 'Create LitToken Package'}
                </h3>
                <form onSubmit={handleSavePack} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Bundle Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Master Bibliophile"
                      value={packName}
                      onChange={e => setPackName(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        LitTokens Count
                      </label>
                      <input
                        type="number"
                        required
                        value={packTokens}
                        onChange={e => setPackTokens(Number(e.target.value))}
                        className="w-full p-2.5 text-xs rounded-xl border border-stone-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Bonus Tokens
                      </label>
                      <input
                        type="number"
                        value={packBonus}
                        onChange={e => setPackBonus(Number(e.target.value))}
                        className="w-full p-2.5 text-xs rounded-xl border border-stone-300 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Price in Cents (Integer)
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 999 for $9.99"
                        value={packPriceCents}
                        onChange={e => setPackPriceCents(Number(e.target.value))}
                        className="w-full p-2.5 text-xs rounded-xl border border-stone-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Currency
                      </label>
                      <input
                        type="text"
                        required
                        value={packCurrency}
                        onChange={e => setPackCurrency(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-xl border border-stone-300"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPack(false)}
                      className="px-4 py-2 rounded-xl text-xs border border-stone-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Save Bundle
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. TRANSACTIONS & LEDGER TAB */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">
                Financial Transactions Ledger
              </h2>
              <p className="text-xs text-stone-500">
                Audited ledger of LitToken purchases with payment gateway references.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search ref or email..."
                  value={txSearch}
                  onChange={e => setTxSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none w-48"
                />
              </div>

              <select
                value={txStatusFilter}
                onChange={e => setTxStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-y border-stone-100">
                <tr>
                  <th className="py-3 px-4">Payment Reference</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Tokens Credited</th>
                  <th className="py-3 px-4">Fiat Amount</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {paginatedTxs.map(t => (
                  <tr key={t.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">{t.paymentReference}</td>
                    <td className="py-3.5 px-4 font-sans text-stone-700">{t.packageName}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-700">+{t.tokensPurchased} Tokens</td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      ${(t.amountCents / 100).toFixed(2)} {t.currency}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-stone-600">{t.paymentProvider}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize font-sans ${
                          t.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
            <span>
              Showing {paginatedTxs.length} of {filteredTransactions.length} transactions
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={txPage <= 1}
                onClick={() => setTxPage(p => p - 1)}
                className="px-3 py-1 rounded-lg border border-stone-200 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span>
                Page {txPage} of {totalTxPages}
              </span>
              <button
                disabled={txPage >= totalTxPages}
                onClick={() => setTxPage(p => p + 1)}
                className="px-3 py-1 rounded-lg border border-stone-200 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. AUTHOR EARNINGS TAB */}
      {activeTab === 'earnings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">
                Author Royalties & Balances Summary
              </h2>
              <p className="text-xs text-stone-500">
                Platform-wide balances computed from reader book unlocks. Author revenue share: {settings.authorRevenueSharePercent}%.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-y border-stone-100">
                <tr>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Withdrawable Balance</th>
                  <th className="py-3 px-4">Lifetime Tokens</th>
                  <th className="py-3 px-4">Est. USD Value</th>
                  <th className="py-3 px-4">Audience Readers</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {authors.map(a => (
                  <tr key={a.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900">{a.name}</div>
                      <div className="text-[11px] text-stone-400">{a.location}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                      {a.balanceTokens} Tokens
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {a.totalEarningsTokens} Tokens
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      ${((a.balanceTokens * settings.tokenValueCents) / 100).toFixed(2)} USD
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-700">{a.totalReaders.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 capitalize">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. WITHDRAWALS TAB */}
      {activeTab === 'withdrawals' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">
                Creator Payout & Withdrawal Requests
              </h2>
              <p className="text-xs text-stone-500">
                Process creator revenue payouts via Bank Transfer, Paystack, Mobile Money or PayPal.
              </p>
            </div>
          </div>

          {withdrawals.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No withdrawal requests recorded.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {withdrawals.map(wd => (
                <div
                  key={wd.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-stone-900">{wd.authorName}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          wd.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : wd.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {wd.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 font-mono font-bold">
                      Amount: ${(wd.amountCents / 100).toFixed(2)} USD ({wd.tokensRequested} LitTokens)
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Method: <strong>{wd.payoutMethod}</strong> • Destination: {wd.payoutDetails}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {wd.status === 'pending' && (
                      <>
                        <button
                          onClick={() =>
                            triggerConfirm(
                              'Complete Creator Payout',
                              `Confirm execution of payout $${(wd.amountCents / 100).toFixed(2)} USD (${wd.tokensRequested} Tokens) to ${wd.authorName} via ${wd.payoutMethod}?`,
                              () => adminProcessWithdrawal(wd.id, 'completed'),
                              'Approve & Mark Completed',
                              false
                            )
                          }
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Complete Payout
                        </button>
                        <button
                          onClick={() => setRejectWdId(wd.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Decline Payout Modal */}
          {rejectWdId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h4 className="font-bold text-sm text-stone-900 mb-2">
                  Decline Payout Request
                </h4>
                <p className="text-xs text-stone-500 mb-3">
                  Please provide a reason so the author can correct their payment destination details.
                </p>
                <textarea
                  rows={3}
                  value={rejectWdReason}
                  onChange={e => setRejectWdReason(e.target.value)}
                  placeholder="e.g. Account number invalid, routing details mismatch..."
                  className="w-full p-2.5 text-xs rounded-xl border border-stone-300 mb-4 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setRejectWdId(null)}
                    className="px-3 py-1.5 rounded-lg text-xs border border-stone-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      adminProcessWithdrawal(rejectWdId, 'rejected', rejectWdReason || 'Declined by administrator.');
                      setRejectWdId(null);
                      setRejectWdReason('');
                    }}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Confirm Decline
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 11. GENRES & CATEGORIES TAB */}
      {activeTab === 'genres' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">
                Literary Taxonomy & Categories
              </h2>
              <p className="text-xs text-stone-500">
                Add, customize, and manage active genres displayed across the discovery catalog.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingGenre(null);
                setGenreName('');
                setGenreDesc('');
                setGenreSlug('');
                setShowAddGenre(true);
              }}
              className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Genre
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {genres.map(g => (
              <div
                key={g.id}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-stone-900">{g.name}</h4>
                    <button
                      onClick={() => adminUpdateGenre(g.id, { active: !g.active })}
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded cursor-pointer ${
                        g.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {g.active ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">{g.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingGenre(g);
                      setGenreName(g.name);
                      setGenreDesc(g.description);
                      setGenreSlug(g.slug);
                      setShowAddGenre(true);
                    }}
                    className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      triggerConfirm(
                        'Delete Genre Category',
                        `Are you sure you want to delete "${g.name}" from platform taxonomy?`,
                        () => adminDeleteGenre(g.id)
                      )
                    }
                    className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove Genre"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Genre Modal */}
          {showAddGenre && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="font-display font-bold text-base text-stone-900 mb-4">
                  {editingGenre ? 'Edit Genre' : 'Add New Literary Genre'}
                </h3>
                <form onSubmit={handleSaveGenre} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Genre Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Afrofuturism, Magical Realism"
                      value={genreName}
                      onChange={e => setGenreName(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. afrofuturism"
                      value={genreSlug}
                      onChange={e => setGenreSlug(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={genreDesc}
                      onChange={e => setGenreDesc(e.target.value)}
                      placeholder="Brief thematic blurb for readers..."
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-300"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddGenre(false)}
                      className="px-4 py-2 rounded-xl text-xs border border-stone-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Save Genre
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 12. HOMEPAGE & HERO TAB */}
      {activeTab === 'homepage' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs max-w-3xl space-y-6">
          <h2 className="font-display text-xl font-bold text-stone-900 mb-1">
            Homepage Presentation & Hero Content
          </h2>
          <p className="text-xs text-stone-500">
            Control the editorial hero headline, subhead blurb, and featured carousel selection.
          </p>

          {settingsSavedToast && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Homepage configuration saved successfully!
            </div>
          )}

          <form onSubmit={handleSavePlatformSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Hero Headline
              </label>
              <input
                type="text"
                value={heroHeading}
                onChange={e => setHeroHeading(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-300 font-display font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Hero Subheadline & Lead Description
              </label>
              <textarea
                rows={2}
                value={heroSubhead}
                onChange={e => setHeroSubhead(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-300 font-editorial"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Global Header Announcement Ticker
              </label>
              <textarea
                rows={2}
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-300"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="annActive"
                checked={announcementActive}
                onChange={e => setAnnouncementActive(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="annActive" className="text-xs font-semibold text-stone-700 cursor-pointer">
                Display Announcement Banner at Top of Platform
              </label>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              Update Homepage Content
            </button>
          </form>
        </div>
      )}

      {/* 13. AD PLACEMENTS TAB */}
      {activeTab === 'ads' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">
                Monetization & Google AdSense Placements
              </h2>
              <p className="text-xs text-stone-500">
                Configure real publisher IDs, responsive ad slot units, and enable/disable ad display slots.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {adSlots.map(slot => (
              <div
                key={slot.id}
                className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm text-stone-900">{slot.slotName}</h3>
                    <span className="text-[11px] font-mono text-stone-400">({slot.position})</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        slot.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {slot.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">{slot.title}</p>
                  <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                    Unit ID: {slot.adUnitId} • Publisher: {slot.clientPublisherId}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adminUpdateAdSlot(slot.id, { enabled: !slot.enabled })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      slot.enabled
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {slot.enabled ? 'Disable Slot' : 'Enable Slot'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 14. SEO & METADATA TAB */}
      {activeTab === 'seo' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs max-w-3xl space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900 mb-1">
              Search Engine Optimization (SEO) & Social Graph
            </h2>
            <p className="text-xs text-stone-500">
              Configure search crawler metadata, OpenGraph cards for WhatsApp/Twitter sharing, and rich snippets.
            </p>
          </div>

          {settingsSavedToast && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              SEO metadata saved successfully!
            </div>
          )}

          {/* Google Search Live Preview */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              Google Search Result Preview
            </span>
            <div className="text-xs text-stone-600 font-mono truncate">
              https://litvault.app › discover › novels
            </div>
            <div className="text-base text-blue-700 font-medium hover:underline cursor-pointer">
              {seoTitle}
            </div>
            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
              {seoDesc}
            </p>
          </div>

          <form onSubmit={handleSavePlatformSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Meta Title Tag
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={e => setSeoTitle(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Meta Description Tag
              </label>
              <textarea
                rows={3}
                value={seoDesc}
                onChange={e => setSeoDesc(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                SEO Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={seoKeywords}
                onChange={e => setSeoKeywords(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-300"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              Save SEO Configuration
            </button>
          </form>
        </div>
      )}

      {/* 15. BROADCAST NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs max-w-2xl space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900 mb-1">
              Broadcast System Notifications
            </h2>
            <p className="text-xs text-stone-500">
              Transmit official platform alerts, literary awards announcements, and policy updates to your audience.
            </p>
          </div>

          {broadcastToast && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Notification successfully broadcasted to target members!
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Notification Headline
              </label>
              <input
                type="text"
                required
                placeholder="e.g. New LitVault African Fiction Awards Announced"
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Target Recipient Group
              </label>
              <select
                value={broadcastTarget}
                onChange={e => setBroadcastTarget(e.target.value as any)}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-300"
              >
                <option value="all">All Platform Members (Readers & Authors)</option>
                <option value="author">Registered Authors & Creators Only</option>
                <option value="reader">Active Readers Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Message Content
              </label>
              <textarea
                required
                rows={4}
                placeholder="Type your official announcement..."
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-300 resize-none font-editorial"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Broadcast Notification
            </button>
          </form>
        </div>
      )}

      {/* 16. PLATFORM SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs max-w-2xl space-y-6">
          <h2 className="font-display text-xl font-bold text-stone-900 mb-1">
            Global Platform Governance & Policies
          </h2>
          <p className="text-xs text-stone-500 mb-6">
            Configure submission verification workflows, author royalties, and withdrawal limits.
          </p>

          {settingsSavedToast && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Settings updated successfully!
            </div>
          )}

          <form onSubmit={handleSavePlatformSettings} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Author Revenue Share (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="95"
                  required
                  value={revShare}
                  onChange={e => setRevShare(Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl border border-stone-300 font-mono font-bold"
                />
                <span className="text-[11px] text-stone-400 mt-0.5 block">
                  LitVault Platform Share: {100 - Number(revShare)}%
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  1 Token Value in Cents
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={tokenValCents}
                  onChange={e => setTokenValCents(Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl border border-stone-300 font-mono font-bold"
                />
                <span className="text-[11px] text-stone-400 mt-0.5 block">
                  e.g. 5 = $0.05 USD / token
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Minimum Withdrawal Threshold (Tokens)
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                required
                value={minWdTokens}
                onChange={e => setMinWdTokens(Number(e.target.value))}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-300 font-mono font-bold"
              />
              <span className="text-[11px] text-stone-400 mt-0.5 block">
                Approx. ${( (minWdTokens * tokenValCents) / 100).toFixed(2)} USD minimum creator payout
              </span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <span className="text-xs font-bold text-stone-800 block">Editorial Approval Requirements</span>
              <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reqBookApproval}
                  onChange={e => setReqBookApproval(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Require Administrator Approval for New Book Submissions</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reqAuthorApproval}
                  onChange={e => setReqAuthorApproval(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Require Administrator Verification for New Author Registrations</span>
              </label>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              Save Platform Configuration
            </button>
          </form>
        </div>
      )}

      {/* 17. AUDIT TRAIL TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">
                Administrative Audit Logs
              </h2>
              <p className="text-xs text-stone-500">
                Immutable record of administrative decisions, author approvals, and system state transitions.
              </p>
            </div>
          </div>

          <div className="divide-y divide-stone-100 font-mono">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 font-sans">{log.action}</span>
                    <span className="text-[11px] text-stone-400">by {log.adminEmail}</span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5 font-sans">{log.details}</p>
                </div>
                <span className="text-[11px] text-stone-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GLOBAL CONFIRMATION MODAL */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-2xl ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-stone-900">
                {confirmDialog.title}
              </h3>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {confirmDialog.message}
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {confirmDialog.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
