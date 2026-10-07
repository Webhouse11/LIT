import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { DiscoverPage } from './components/DiscoverPage';
import { BookDetailPage } from './components/BookDetailPage';
import { ReaderView } from './components/ReaderView';
import { AuthorDashboard } from './components/AuthorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthorProfilePage } from './components/AuthorProfilePage';
import { LibraryPage } from './components/LibraryPage';
import { ReaderDashboard } from './components/ReaderDashboard';
import { WalletPage } from './components/WalletPage';
import { LegalPages } from './components/LegalPages';
import { TokenStoreModal } from './components/modals/TokenStoreModal';
import { UnlockModal } from './components/modals/UnlockModal';
import { ReportModal } from './components/modals/ReportModal';
import { ReviewModal } from './components/modals/ReviewModal';
import { AuthModal } from './components/modals/AuthModal';
import { AuthPage } from './components/AuthPage';
import { Book } from './types';

function MainApp() {
  const { books } = useApp();

  // Navigation & View State
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | undefined>(undefined);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [selectedGenreParam, setSelectedGenreParam] = useState<string | undefined>(undefined);
  const [legalTab, setLegalTab] = useState<string>('copyright');

  // Global Modals State
  const [isTokenStoreOpen, setIsTokenStoreOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [bookToUnlock, setBookToUnlock] = useState<Book | null>(null);

  // Moderation Report modal
  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    targetType: 'book' | 'review' | 'author';
    targetId: string;
    targetTitle: string;
  }>({
    isOpen: false,
    targetType: 'book',
    targetId: '',
    targetTitle: '',
  });

  // Review modal
  const [reviewModalData, setReviewModalData] = useState<{
    isOpen: boolean;
    bookId: string;
    bookTitle: string;
  }>({
    isOpen: false,
    bookId: '',
    bookTitle: '',
  });

  // Authentication Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signup') => {
    handleNavigate(mode);
  };

  const handleNavigate = (view: string, params?: any) => {
    if (params?.genre) {
      setSelectedGenreParam(params.genre);
    } else {
      setSelectedGenreParam(undefined);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setCurrentView('book-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRead = (chapterId?: string) => {
    if (!selectedBook) return;
    setSelectedChapterId(chapterId);
    setCurrentView('reader');
  };

  const handleSelectAuthor = (authorId: string) => {
    setSelectedAuthorId(authorId);
    setCurrentView('author-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenUnlock = (book: Book) => {
    setBookToUnlock(book);
    setIsUnlockModalOpen(true);
  };

  const handleOpenReport = (type: 'book' | 'review' | 'author', id: string, title: string) => {
    setReportModalData({
      isOpen: true,
      targetType: type,
      targetId: id,
      targetTitle: title,
    });
  };

  const handleOpenReview = (bookId: string, bookTitle: string) => {
    setReviewModalData({
      isOpen: true,
      bookId,
      bookTitle,
    });
  };

  const handleOpenLegal = (tab: string) => {
    setLegalTab(tab);
    setCurrentView('legal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in distraction-free reader mode, don't show the outer Navbar
  if (currentView === 'reader' && selectedBook) {
    return (
      <>
        <ReaderView
          book={selectedBook}
          initialChapterId={selectedChapterId}
          onBack={() => setCurrentView('book-detail')}
          onOpenUnlockModal={() => handleOpenUnlock(selectedBook)}
        />
        <UnlockModal
          isOpen={isUnlockModalOpen}
          book={bookToUnlock}
          onClose={() => setIsUnlockModalOpen(false)}
          onOpenTokenStore={() => setIsTokenStoreOpen(true)}
          onSuccessRead={() => {
            // Already inside reader view
          }}
        />
        <TokenStoreModal
          isOpen={isTokenStoreOpen}
          onClose={() => setIsTokenStoreOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900 selection:bg-amber-200">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenTokenStore={() => setIsTokenStoreOpen(true)}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onExplore={() => handleNavigate('discover')}
            onPublish={() => handleNavigate('author')}
            onSelectBook={handleSelectBook}
            onSelectAuthor={handleSelectAuthor}
            onSelectGenre={genre => handleNavigate('discover', { genre })}
            onOpenLegal={handleOpenLegal}
            onOpenAuth={handleOpenAuth}
            onOpenReport={(type, id, title) => handleOpenReport(type, id, title)}
            onContinueReading={(book, chapterId) => {
              setSelectedBook(book);
              setSelectedChapterId(chapterId);
              setCurrentView('reader');
            }}
          />
        )}

        {currentView === 'discover' && (
          <DiscoverPage
            onSelectBook={handleSelectBook}
            initialGenre={selectedGenreParam}
          />
        )}

        {currentView === 'book-detail' && selectedBook && (
          <BookDetailPage
            book={selectedBook}
            onRead={handleRead}
            onOpenUnlockModal={() => handleOpenUnlock(selectedBook)}
            onOpenReportModal={() =>
              handleOpenReport('book', selectedBook.id, selectedBook.title)
            }
            onOpenReviewModal={() =>
              handleOpenReview(selectedBook.id, selectedBook.title)
            }
            onSelectAuthor={handleSelectAuthor}
            onSelectBook={handleSelectBook}
            onBack={() => handleNavigate('discover')}
          />
        )}

        {currentView === 'author' && (
          <AuthorDashboard
            onOpenBookDetail={handleSelectBook}
            onOpenLegal={handleOpenLegal}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard onPreviewBook={handleSelectBook} />
        )}

        {currentView === 'author-profile' && selectedAuthorId && (
          <AuthorProfilePage
            authorId={selectedAuthorId}
            onSelectBook={handleSelectBook}
            onBack={() => handleNavigate('home')}
          />
        )}

        {currentView === 'dashboard' && (
          <ReaderDashboard
            onSelectBook={handleSelectBook}
            onReadChapter={(book, chapterId) => {
              setSelectedBook(book);
              setSelectedChapterId(chapterId);
              setCurrentView('reader');
            }}
            onSelectAuthor={handleSelectAuthor}
            onExplore={genre => handleNavigate('discover', { genre })}
            onOpenTokenStore={() => setIsTokenStoreOpen(true)}
            initialTab="dashboard"
          />
        )}

        {currentView === 'library' && (
          <ReaderDashboard
            onSelectBook={handleSelectBook}
            onReadChapter={(book, chapterId) => {
              setSelectedBook(book);
              setSelectedChapterId(chapterId);
              setCurrentView('reader');
            }}
            onSelectAuthor={handleSelectAuthor}
            onExplore={genre => handleNavigate('discover', { genre })}
            onOpenTokenStore={() => setIsTokenStoreOpen(true)}
            initialTab="library"
          />
        )}

        {currentView === 'wallet' && (
          <WalletPage onOpenTokenStore={() => setIsTokenStoreOpen(true)} />
        )}

        {currentView === 'legal' && (
          <LegalPages
            initialTab={legalTab}
            onBack={() => handleNavigate('home')}
            onOpenReportModal={() =>
              handleOpenReport('book', 'dmca-claim', 'Copyright Infringement Notice')
            }
          />
        )}

        {(currentView === 'signin' || currentView === 'signup') && (
          <AuthPage
            initialMode={currentView === 'signin' ? 'signin' : 'signup'}
            onNavigate={handleNavigate}
            onOpenLegal={handleOpenLegal}
          />
        )}
      </main>

      {/* Global Modals */}
      <TokenStoreModal
        isOpen={isTokenStoreOpen}
        onClose={() => setIsTokenStoreOpen(false)}
      />

      <UnlockModal
        isOpen={isUnlockModalOpen}
        book={bookToUnlock}
        onClose={() => setIsUnlockModalOpen(false)}
        onOpenTokenStore={() => setIsTokenStoreOpen(true)}
        onSuccessRead={() => {
          if (bookToUnlock) {
            setSelectedBook(bookToUnlock);
            setCurrentView('reader');
          }
        }}
      />

      <ReportModal
        isOpen={reportModalData.isOpen}
        targetType={reportModalData.targetType}
        targetId={reportModalData.targetId}
        targetTitle={reportModalData.targetTitle}
        onClose={() =>
          setReportModalData(prev => ({ ...prev, isOpen: false }))
        }
      />

      <ReviewModal
        isOpen={reviewModalData.isOpen}
        bookId={reviewModalData.bookId}
        bookTitle={reviewModalData.bookTitle}
        onClose={() =>
          setReviewModalData(prev => ({ ...prev, isOpen: false }))
        }
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </AuthProvider>
  );
}
