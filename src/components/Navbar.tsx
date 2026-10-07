import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Coins,
  Menu,
  X,
  LogOut,
  ChevronDown,
  User,
  BookOpen,
  Feather,
  Shield,
  Bookmark,
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenTokenStore: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenTokenStore,
  onOpenAuth,
}) => {
  const { user, role, isAdmin, signOut, switchDemoRole } = useAuth();
  const { wallet, settings } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const handleNavClick = (view: string, params?: any) => {
    setMobileMenuOpen(false);
    setAccountDropdownOpen(false);
    onNavigate(view, params);

    // If param has a target element on homepage, scroll smoothly to it
    if (params?.scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(params.scrollTo);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 80);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      {/* Optional Platform Announcement Banner */}
      {settings.announcement && (settings.announcementActive ?? true) && (
        <div className="bg-stone-900 text-stone-200 py-1.5 px-4 text-center text-[11px] font-medium tracking-wide flex items-center justify-center gap-2 border-b border-stone-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>{settings.announcement}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: LitVault Brand Logo */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left group cursor-pointer flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg"
            >
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-display font-black text-lg shadow-xs group-hover:bg-amber-950 transition-colors">
                L
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-xl sm:text-2xl text-stone-900 tracking-tight group-hover:text-amber-800 transition-colors leading-none">
                  LitVault
                </span>
                <span className="text-[10px] uppercase font-sans tracking-widest text-stone-600 font-semibold mt-0.5">
                  Read · Discover · Publish
                </span>
              </div>
            </button>
          </div>

          {/* Center: Primary Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-xs xl:text-sm font-medium text-stone-600">
            <button
              onClick={() => handleNavClick('home')}
              className={`py-1 transition-colors relative cursor-pointer ${
                currentView === 'home'
                  ? 'text-stone-900 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-stone-900'
                  : 'hover:text-stone-900'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('discover')}
              className={`py-1 transition-colors relative cursor-pointer ${
                currentView === 'discover'
                  ? 'text-stone-900 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-stone-900'
                  : 'hover:text-stone-900'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => handleNavClick('home', { scrollTo: 'genres-section' })}
              className="py-1 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Genres
            </button>
            <button
              onClick={() => handleNavClick('home', { scrollTo: 'authors-section' })}
              className="py-1 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Authors
            </button>
            <button
              onClick={() => handleNavClick('home', { scrollTo: 'free-reads-section' })}
              className="py-1 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Free Reads
            </button>
            <button
              onClick={() => handleNavClick('home', { scrollTo: 'premium-section' })}
              className="py-1 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Premium
            </button>
            <button
              onClick={() => handleNavClick('legal', { tab: 'about' })}
              className={`py-1 transition-colors relative cursor-pointer ${
                currentView === 'legal'
                  ? 'text-stone-900 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-stone-900'
                  : 'hover:text-stone-900'
              }`}
            >
              About
            </button>
          </nav>

          {/* Right: Actions / Auth CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              // Logged-in controls: Token balance + Account dropdown
              <div className="flex items-center gap-3">
                {/* LitToken Balance Pill */}
                <button
                  onClick={onOpenTokenStore}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/80 text-amber-900 text-xs font-semibold font-mono transition-all cursor-pointer shadow-2xs"
                  title="LitTokens Reading Balance"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-700" />
                  <span>{wallet.tokenBalance} Tokens</span>
                </button>

                {/* My Library Shortcut */}
                <button
                  onClick={() => handleNavClick('library')}
                  className={`p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer ${
                    currentView === 'library' ? 'bg-stone-100 text-stone-900' : ''
                  }`}
                  title="My Library"
                >
                  <Bookmark className="w-4 h-4" />
                </button>

                {/* Account / Persona Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 text-xs text-stone-800 transition-all cursor-pointer bg-white shadow-2xs"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-[10px]">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold max-w-[100px] truncate">{user.displayName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  </button>

                  {accountDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200/90 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-2.5 pb-2.5 mb-2 border-b border-stone-100">
                        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                          Signed in as ({user.role})
                        </span>
                        <span className="text-xs font-bold text-stone-900 block truncate">
                          {user.displayName}
                        </span>
                        <span className="text-[11px] text-stone-500 font-mono block truncate">
                          {user.email}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <button
                          onClick={() => handleNavClick('dashboard')}
                          className="w-full text-left px-2.5 py-2 rounded-xl text-stone-900 font-semibold bg-amber-50/60 hover:bg-amber-100/70 flex items-center gap-2 cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4 text-amber-700" />
                          <span>Reader Dashboard</span>
                        </button>
                        <button
                          onClick={() => handleNavClick('library')}
                          className="w-full text-left px-2.5 py-2 rounded-xl text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Bookmark className="w-4 h-4 text-stone-500" />
                          <span>My Personal Library</span>
                        </button>
                        <button
                          onClick={() => handleNavClick('wallet')}
                          className="w-full text-left px-2.5 py-2 rounded-xl text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Coins className="w-4 h-4 text-amber-600" />
                          <span>LitToken Vault & Ledger</span>
                        </button>
                        <button
                          onClick={() => handleNavClick('author')}
                          className="w-full text-left px-2.5 py-2 rounded-xl text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Feather className="w-4 h-4 text-amber-800" />
                          <span>Author Studio</span>
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleNavClick('admin')}
                            className="w-full text-left px-2.5 py-2 rounded-xl text-stone-900 font-semibold bg-amber-50/80 hover:bg-amber-100/80 flex items-center gap-2 cursor-pointer"
                          >
                            <Shield className="w-4 h-4 text-amber-700" />
                            <span>Administrator Dashboard</span>
                          </button>
                        )}
                      </div>

                      {/* Demo Persona Switcher */}
                      <div className="pt-2 mt-2 border-t border-stone-100">
                        <span className="text-[10px] uppercase font-bold text-stone-400 px-2 block mb-1.5">
                          Switch Role Mode
                        </span>
                        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                          {(['reader', 'author', 'admin'] as UserRole[]).map(r => (
                            <button
                              key={r}
                              onClick={() => {
                                switchDemoRole(r);
                                setAccountDropdownOpen(false);
                                if (r === 'admin') onNavigate('admin');
                                else if (r === 'author') onNavigate('author');
                                else onNavigate('home');
                              }}
                              className={`py-1 rounded-lg font-medium text-center capitalize cursor-pointer transition-colors ${
                                role === r
                                  ? 'bg-stone-900 text-white font-bold'
                                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-stone-100">
                        <button
                          onClick={() => {
                            signOut();
                            setAccountDropdownOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-xs font-semibold cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Unauthenticated visitor view: Clean Sign In + Prominent Sign Up CTA
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Bar: Token Balance (if logged in) + Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            {user && (
              <button
                onClick={onOpenTokenStore}
                className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono font-bold flex items-center gap-1"
                aria-label="View token balance"
              >
                <Coins className="w-3.5 h-3.5 text-amber-700" />
                <span>{wallet.tokenBalance}</span>
              </button>
            )}

            {!user && (
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-bold shadow-xs cursor-pointer mr-1"
              >
                Sign Up
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:bg-stone-100 rounded-xl cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white/98 backdrop-blur-md px-5 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
          {/* Main Links */}
          <nav className="flex flex-col space-y-1 text-sm font-medium text-stone-800">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-left py-2.5 px-3 rounded-xl transition-colors ${
                currentView === 'home' ? 'bg-stone-100 font-bold text-stone-950' : 'hover:bg-stone-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('discover')}
              className={`text-left py-2.5 px-3 rounded-xl transition-colors ${
                currentView === 'discover' ? 'bg-stone-100 font-bold text-stone-950' : 'hover:bg-stone-50'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => handleNavClick('home', { scrollTo: 'genres-section' })}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors"
            >
              Genres
            </button>
            <button
              onClick={() => handleNavClick('home', { scrollTo: 'authors-section' })}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors"
            >
              Authors
            </button>
            <button
              onClick={() => handleNavClick('home', { scrollTo: 'free-reads-section' })}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors"
            >
              Free Reads
            </button>
            <button
              onClick={() => handleNavClick('home', { scrollTo: 'premium-section' })}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors"
            >
              Premium
            </button>
            <button
              onClick={() => handleNavClick('legal', { tab: 'about' })}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors"
            >
              About LitVault
            </button>
          </nav>

          {/* User Links if logged in */}
          {user ? (
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <div className="px-3 py-1 flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>Account: {user.displayName}</span>
                <span className="capitalize font-bold text-stone-700 font-mono">({user.role})</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="p-2.5 rounded-xl border border-stone-900 bg-stone-900 font-bold text-white flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavClick('library')}
                  className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 font-semibold text-stone-800 flex items-center justify-center gap-2"
                >
                  <Bookmark className="w-3.5 h-3.5 text-stone-600" />
                  Library
                </button>
              </div>
              <button
                onClick={() => handleNavClick('author')}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Feather className="w-3.5 h-3.5 text-amber-800" />
                Author Studio
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className="w-full py-2.5 px-3 rounded-xl bg-stone-900 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Administrator Dashboard
                </button>
              )}
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 text-center"
              >
                Sign Out
              </button>
            </div>
          ) : (
            // Mobile Auth CTAs
            <div className="pt-3 border-t border-stone-100 space-y-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('signup');
                }}
                className="w-full py-3 rounded-xl bg-stone-900 text-white font-bold text-xs shadow-md text-center"
              >
                Create Your Free Account
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('signin');
                }}
                className="w-full py-2.5 rounded-xl border border-stone-300 text-stone-800 font-semibold text-xs text-center"
              >
                Already have an account? Sign In
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
