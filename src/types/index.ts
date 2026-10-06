export type UserRole = 'reader' | 'author' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  status?: 'active' | 'suspended';
  tokenBalance?: number;
  createdAt: string;
  updatedAt?: string;
  bio?: string;
}

export interface AuthorProfile {
  id: string;
  userId: string;
  name: string;
  bio: string;
  location?: string;
  photoURL?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  balanceTokens: number;
  totalEarningsTokens: number;
  totalReaders: number;
  totalReads: number;
  rating: number;
  copyrightAgreed: boolean;
  website?: string;
  twitter?: string;
  createdAt: string;
}

export type BookStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected' | 'suspended';

export interface Book {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  coverImage: string;
  description: string;
  synopsis?: string;
  genre: string;
  categories: string[];
  tags: string[];
  language: string;
  ageRating: string; // e.g. 'All Ages', '13+', '18+'
  isPremium: boolean;
  tokenPrice: number; // e.g. 15 LitTokens
  status: BookStatus;
  readsCount: number;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  content: string;
  isPremium: boolean;
  tokenPrice?: number;
  status: 'draft' | 'published';
  createdAt: string;
}

export interface Wallet {
  userId: string;
  tokenBalance: number;
  totalPurchased: number;
  totalSpent: number;
  updatedAt: string;
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  bonusTokens?: number;
  priceCents: number; // in cents e.g. 499 = $4.99
  currency: string; // 'USD', 'NGN', 'GBP', 'EUR', 'KES', 'GHS'
  popular?: boolean;
  active: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail?: string;
  packageId: string;
  packageName: string;
  paymentReference: string;
  amountCents: number;
  currency: string;
  tokensPurchased: number;
  paymentProvider: 'Stripe' | 'Paystack' | 'Flutterwave' | 'PayPal' | 'MockGateway';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface BookUnlock {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  chapterId?: string;
  authorId: string;
  tokensSpent: number;
  authorShare: number;
  platformShare: number;
  createdAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  chapterId: string;
  chapterTitle: string;
  coverImage?: string;
  progressPercent: number;
  updatedAt: string;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  chapterNumber: number;
  progressPercent: number;
  lastReadAt: string;
}

export interface LibraryItem {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  authorName: string;
  coverImage: string;
  isPremium: boolean;
  tokenPrice: number;
  genre: string;
  savedAt: string;
}

export interface Follow {
  id: string;
  userId: string;
  authorId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterEmail?: string;
  targetType: 'book' | 'review' | 'author';
  targetId: string;
  targetTitle: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  tokensRequested: number;
  amountCents: number;
  currency: string;
  payoutMethod: 'Bank Transfer' | 'Paystack' | 'PayPal' | 'Mobile Money';
  payoutDetails: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

export interface GenreItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  iconName?: string;
}

export interface AdSlotConfig {
  id: string;
  slotName: string;
  position: 'header' | 'reading_break' | 'sidebar' | 'footer';
  enabled: boolean;
  title: string;
  clientPublisherId: string;
  adUnitId: string;
  placeholderNote: string;
}

export interface PlatformSettings {
  id: string;
  authorRevenueSharePercent: number;
  platformRevenueSharePercent: number;
  tokenValueCents: number; // 1 token = e.g. 5 cents
  requireAuthorApproval: boolean;
  requireBookApproval: boolean;
  minWithdrawalTokens?: number;
  announcement?: string;
  announcementActive?: boolean;
  heroHeadline?: string;
  heroSubheadline?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'approval' | 'rejection' | 'review' | 'unlock' | 'payout' | 'system';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ReadingPreferences {
  theme: 'light' | 'sepia' | 'dark' | 'night';
  fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  maxWidth: 'narrow' | 'medium' | 'wide';
  fontFace: 'serif' | 'sans';
}
