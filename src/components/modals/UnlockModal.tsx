import React, { useState } from 'react';
import { Book } from '../../types';
import { useApp } from '../../context/AppContext';
import { Coins, Lock, CheckCircle2, AlertCircle, X, Sparkles, BookOpen } from 'lucide-react';

interface UnlockModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onOpenTokenStore: () => void;
  onSuccessRead: () => void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  book,
  onClose,
  onOpenTokenStore,
  onSuccessRead,
}) => {
  const { wallet, unlockBook, settings } = useApp();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen || !book) return null;

  const hasEnoughTokens = wallet.tokenBalance >= book.tokenPrice;
  const authorShareTokens = Math.floor((book.tokenPrice * settings.authorRevenueSharePercent) / 100);

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const res = await unlockBook(book.id);
      setFeedback(res);
      if (res.success) {
        setTimeout(() => {
          setFeedback(null);
          onClose();
          onSuccessRead();
        }, 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base md:text-lg font-bold text-stone-900">
                Unlock Premium Literary Work
              </h3>
              <p className="text-xs text-stone-500">
                One-time unlock for permanent unlimited reading
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {feedback ? (
            <div className="py-8 text-center animate-in zoom-in-95 duration-200">
              {feedback.success ? (
                <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-3" />
              ) : (
                <AlertCircle className="w-14 h-14 text-rose-600 mx-auto mb-3" />
              )}
              <h4 className="text-lg font-bold text-stone-800">
                {feedback.success ? 'Work Unlocked!' : 'Unlock Failed'}
              </h4>
              <p className="mt-2 text-sm text-stone-600">
                {feedback.message}
              </p>
            </div>
          ) : (
            <>
              {/* Book snippet */}
              <div className="flex gap-4 p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 mb-5">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-16 h-22 object-cover rounded-lg shadow-sm shrink-0"
                />
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                    {book.genre}
                  </span>
                  <h4 className="font-editorial text-base font-bold text-stone-900 line-clamp-1">
                    {book.title}
                  </h4>
                  <p className="text-xs text-stone-500">
                    by {book.authorName}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 font-mono text-xs font-bold text-amber-700">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Price: {book.tokenPrice} LitTokens</span>
                  </div>
                </div>
              </div>

              {/* Author revenue share banner */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl mb-5 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 leading-relaxed">
                  <strong className="font-semibold">{settings.authorRevenueSharePercent}% Creator Fair Share:</strong>{' '}
                  {authorShareTokens} LitTokens from this unlock go directly to author{' '}
                  <span className="font-semibold">{book.authorName}</span>.
                </p>
              </div>

              {/* Balances */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2 mb-6 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Your Vault Balance:</span>
                  <span className="font-mono font-bold text-stone-900">
                    {wallet.tokenBalance} LitTokens
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Cost to Unlock:</span>
                  <span className="font-mono font-bold text-rose-700">
                    -{book.tokenPrice} LitTokens
                  </span>
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between font-medium">
                  <span>Remaining Balance:</span>
                  <span
                    className={`font-mono font-bold ${
                      hasEnoughTokens ? 'text-stone-900' : 'text-rose-600'
                    }`}
                  >
                    {wallet.tokenBalance - book.tokenPrice} LitTokens
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              {hasEnoughTokens ? (
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    onClick={handleUnlock}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Unlocking...' : `Confirm Unlock (${book.tokenPrice} Tokens)`}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      You need {book.tokenPrice - wallet.tokenBalance} more LitTokens to unlock this work.
                    </span>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-50"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTokenStore();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md flex items-center gap-2"
                    >
                      <Coins className="w-4 h-4" />
                      Acquire LitTokens
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
