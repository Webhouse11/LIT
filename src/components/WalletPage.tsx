import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Coins,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { BookUnlock } from '../types';

interface WalletPageProps {
  onOpenTokenStore: () => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({ onOpenTokenStore }) => {
  const { user } = useAuth();
  const { wallet, transactions, settings } = useApp();

  const [activeTab, setActiveTab] = useState<'purchases' | 'unlocks'>('purchases');

  // Load book unlocks from storage
  const savedUnlocks: BookUnlock[] = JSON.parse(
    localStorage.getItem('litvault_book_unlocks') || '[]'
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      <div className="mb-8">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-700">
          Digital Literary Ledger
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
          LitToken Vault & Transactions
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Manage your virtual reading currency, track immutable purchase invoices, and review unlocked works.
        </p>
      </div>

      {/* Main Balance Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-10 border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-amber-400">
            <Coins className="w-4 h-4" />
            Available LitTokens Balance
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight">
            {wallet.tokenBalance}{' '}
            <span className="text-base sm:text-lg font-normal text-amber-300 font-sans">
              Tokens
            </span>
          </div>
          <p className="text-xs text-stone-300 max-w-md">
            Tokens never expire. One-time unlock unlocks premium novels permanently with fair {settings.authorRevenueSharePercent}% creator compensation.
          </p>
        </div>

        <button
          onClick={onOpenTokenStore}
          className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer self-stretch md:self-auto justify-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Acquire LitTokens
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="text-[11px] uppercase font-bold text-stone-400 mb-1">
            Lifetime Tokens Minted
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900">
            {wallet.totalPurchased}
          </div>
          <div className="text-xs text-stone-400 mt-1">Acquired from packages</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="text-[11px] uppercase font-bold text-stone-400 mb-1">
            Tokens Invested in Authors
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700">
            {wallet.totalSpent}
          </div>
          <div className="text-xs text-stone-400 mt-1">Unlocked literary works</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="text-[11px] uppercase font-bold text-stone-400 mb-1">
            Fair Revenue Standard
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {settings.authorRevenueSharePercent}%
          </div>
          <div className="text-xs text-stone-400 mt-1">Direct creator revenue</div>
        </div>
      </div>

      {/* Ledger History Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'purchases'
                ? 'bg-stone-900 text-white'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Token Purchase Invoices ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('unlocks')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'unlocks'
                ? 'bg-stone-900 text-white'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Book Unlock Logs ({savedUnlocks.length})
          </button>
        </div>

        {/* 1. Purchase Invoices */}
        {activeTab === 'purchases' && (
          <div>
            {transactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400">
                No token purchase transactions on record.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 text-[11px] uppercase font-bold tracking-wider">
                      <th className="pb-3">Reference / Tx ID</th>
                      <th className="pb-3">Bundle</th>
                      <th className="pb-3">Provider</th>
                      <th className="pb-3">Tokens</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-stone-50/60">
                        <td className="py-3.5 font-mono text-stone-700 font-semibold">
                          {tx.paymentReference}
                        </td>
                        <td className="py-3.5 font-medium text-stone-900">
                          {tx.packageName}
                        </td>
                        <td className="py-3.5 text-stone-500">{tx.paymentProvider}</td>
                        <td className="py-3.5 font-mono font-bold text-amber-700">
                          +{tx.tokensPurchased}
                        </td>
                        <td className="py-3.5 font-mono font-medium text-stone-900">
                          ${(tx.amountCents / 100).toFixed(2)} {tx.currency}
                        </td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-stone-400 font-mono text-[11px]">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 2. Unlocks Ledger */}
        {activeTab === 'unlocks' && (
          <div>
            {savedUnlocks.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400">
                No unlocked works recorded yet. Unlocking premium books logs an immutable ledger record here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 text-[11px] uppercase font-bold tracking-wider">
                      <th className="pb-3">Book Title</th>
                      <th className="pb-3">Tokens Spent</th>
                      <th className="pb-3">Author Share</th>
                      <th className="pb-3">Platform Share</th>
                      <th className="pb-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {savedUnlocks.map(u => (
                      <tr key={u.id} className="hover:bg-stone-50/60">
                        <td className="py-3.5 font-bold text-stone-900">{u.bookTitle}</td>
                        <td className="py-3.5 font-mono font-bold text-rose-700">
                          -{u.tokensSpent} Tokens
                        </td>
                        <td className="py-3.5 font-mono text-emerald-700 font-semibold">
                          +{u.authorShare} Tokens ({settings.authorRevenueSharePercent}%)
                        </td>
                        <td className="py-3.5 font-mono text-stone-500">
                          +{u.platformShare} Tokens
                        </td>
                        <td className="py-3.5 text-stone-400 font-mono text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
