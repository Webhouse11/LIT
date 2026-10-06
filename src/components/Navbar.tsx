import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Coins,
  Bookmark,
  Shield,
  Feather,
  Menu,
  X,
  LogIn,
  LogOut,
  ChevronDown,
  Compass,
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenTokenStore: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenTokenStore,
}) => {
  const { user, role, isAdmin, signInWithGoogle, signOut, switchDemoRole } = useAuth();
  const { wallet, settings } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleRoleSwitch = (targetRole: UserRole) => {
    switchDemoRole(targetRole);
    setRoleDropdownOpen(false);
    if (targetRole === 'admin') {
      onNavigate('admin');
    } else if (targetRole === 'author') {
      onNavigate('author');
    } else {
      onNavigate('home');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200/70 transition-colors">
      {settings.announcement && (settings.announcementActive ?? true) && (
        <div className="bg-stone-900 text-stone-200 py-1.5 px-4 text-center text-[11px] font-medium tracking-wide flex items-center justify-center gap-2 border-b border-stone-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>{settings.announcement}</span>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Zone 1: Brand Wordmark (Single text element in display face, no pill clutter) */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-left group cursor-pointer"
            >
              <span className="font-display font-bold text-2xl sm:text-3xl text-stone-900 tracking-tight hover:text-amber-800 transition-colors">
                LitVault
              </span>
            </button>
          </div>

          {/* Zone 2: 4-6 clean text navigation links with subtle hover underlines */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <button
              onClick={() => onNavigate('discover')}
              className={`py-1 transition-colors relative cursor-pointer ${
                currentView === 'discover'
                  ? 'text-stone-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-stone-900'
                  : 'hover:text-stone-900'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => onNavigate('discover', { genre: 'African Literature' })}
              className="py-1 hover:text-stone-900 transition-colors cursor-pointer"
            >
              African Literature
            </button>
            <button
              onClick={() => onNavigate('library')}
              className={`py-1 transition-colors relative cursor-pointer ${
                currentView === 'library'
                  ? 'text-stone-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-stone-900'
                  : 'hover:text-stone-900'
              }`}
            >
              My Library
            </button>
            <button
              onClick={() => onNavigate('wallet')}
              className={`py-1 transition-colors relative cursor-pointer ${
                currentView === 'wallet'
                  ? 'text-stone-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-stone-900'
                  : 'hover:text-stone-900'
              }`}
            >
              Vault Ledger
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Token balance & Role Studio) */}
          <div className="hidden md:flex items-center gap-3.5">
            {/* LitToken Balance Button */}
            <button
              onClick={onOpenTokenStore}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-300/80 bg-amber-50/60 hover:bg-amber-100/70 text-amber-900 text-xs font-semibold font-mono transition-all cursor-pointer shadow-2xs"
              title="LitTokens Reading Balance"
            >
              <Coins className="w-3.5 h-3.5 text-amber-700" />
              <span>{wallet.tokenBalance} Tokens</span>
            </button>

            {/* Author Studio or Admin button */}
            <button
              onClick={() => onNavigate('author')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'author'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Author Studio
            </button>

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-stone-900 text-white'
                    : 'text-amber-800 bg-amber-100/50 hover:bg-amber-100'
                }`}
              >
                Admin
              </button>
            )}

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 text-xs text-stone-700 transition-all cursor-pointer bg-white"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium capitalize">{role}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200/90 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 pb-2 mb-2 border-b border-stone-100">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                      Current User
                    </span>
                    <span className="text-xs font-bold text-stone-900 block truncate">
                      {user?.displayName}
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono block truncate">
                      {user?.email}
                    </span>
                  </div>

                  <div className="mb-2">
                    <span className="text-[10px] uppercase font-bold text-stone-400 px-2 block mb-1">
                      Quick Persona Switch
                    </span>
                    <button
                      onClick={() => handleRoleSwitch('reader')}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                        role === 'reader' ? 'bg-amber-50 text-amber-900 font-semibold' : 'hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span>Reader (Amara)</span>
                      {role === 'reader' && <span className="text-[10px] text-amber-700 font-bold">Active</span>}
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('author')}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                        role === 'author' ? 'bg-amber-50 text-amber-900 font-semibold' : 'hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span>Author (Chinelo)</span>
                      {role === 'author' && <span className="text-[10px] text-amber-700 font-bold">Active</span>}
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                        role === 'admin' ? 'bg-amber-50 text-amber-900 font-semibold' : 'hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span>Administrator (Oluranti)</span>
                      {role === 'admin' && <span className="text-[10px] text-amber-700 font-bold">Active</span>}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-stone-100 space-y-1 text-xs">
                    <button
                      onClick={() => {
                        signInWithGoogle();
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded text-stone-600 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Google Authentication
                    </button>
                    <button
                      onClick={() => {
                        signOut();
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenTokenStore}
              className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono font-bold flex items-center gap-1"
            >
              <Coins className="w-3.5 h-3.5 text-amber-700" />
              <span>{wallet.tokenBalance}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:bg-stone-100 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white p-4 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-stone-800">
            <button
              onClick={() => {
                onNavigate('discover');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-2 hover:bg-stone-50 rounded"
            >
              Discover Books
            </button>
            <button
              onClick={() => {
                onNavigate('discover', { genre: 'African Literature' });
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-2 hover:bg-stone-50 rounded"
            >
              African Literature
            </button>
            <button
              onClick={() => {
                onNavigate('library');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-2 hover:bg-stone-50 rounded"
            >
              My Library
            </button>
            <button
              onClick={() => {
                onNavigate('wallet');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-2 hover:bg-stone-50 rounded"
            >
              Vault Ledger
            </button>
            <button
              onClick={() => {
                onNavigate('author');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-2 hover:bg-stone-50 rounded font-semibold text-amber-800"
            >
              Author Studio
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 px-2 bg-stone-900 text-white rounded font-semibold"
              >
                Administrator Dashboard
              </button>
            )}
          </nav>

          <div className="pt-3 border-t border-stone-100">
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-2">
              Persona Switcher
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => {
                  handleRoleSwitch('reader');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 rounded font-medium ${
                  role === 'reader' ? 'bg-amber-700 text-white font-bold' : 'bg-stone-100 text-stone-700'
                }`}
              >
                Reader
              </button>
              <button
                onClick={() => {
                  handleRoleSwitch('author');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 rounded font-medium ${
                  role === 'author' ? 'bg-amber-700 text-white font-bold' : 'bg-stone-100 text-stone-700'
                }`}
              >
                Author
              </button>
              <button
                onClick={() => {
                  handleRoleSwitch('admin');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 rounded font-medium ${
                  role === 'admin' ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 text-stone-700'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
