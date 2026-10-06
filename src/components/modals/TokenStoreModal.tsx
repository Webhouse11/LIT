import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Coins, X, CheckCircle2, ShieldCheck, Sparkles, CreditCard, ArrowRight } from 'lucide-react';
import { Transaction } from '../../types';

interface TokenStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TokenStoreModal: React.FC<TokenStoreModalProps> = ({ isOpen, onClose }) => {
  const { tokenPackages, purchaseTokens, wallet } = useApp();
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    tokenPackages.find(p => p.popular)?.id || tokenPackages[0]?.id || ''
  );
  const [paymentProvider, setPaymentProvider] = useState<Transaction['paymentProvider']>('Stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const activePackages = tokenPackages.filter(p => p.active);
  const selectedPkg = activePackages.find(p => p.id === selectedPackageId);

  const handleBuy = async () => {
    if (!selectedPackageId) return;
    setIsProcessing(true);
    try {
      const ok = await purchaseTokens(selectedPackageId, paymentProvider);
      if (ok) {
        const pkg = activePackages.find(p => p.id === selectedPackageId);
        const total = (pkg?.tokens || 0) + (pkg?.bonusTokens || 0);
        setSuccessMessage(`Success! Added ${total} LitTokens to your reading vault.`);
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 1800);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-amber-700 via-stone-800 to-stone-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-400/30">
              <Coins className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-display text-lg md:text-xl font-bold tracking-wide">
                Acquire LitTokens
              </h3>
              <p className="text-xs text-stone-300">
                Support authors directly and unlock premier literary works
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Bar */}
        <div className="bg-amber-50/70 border-b border-amber-200/60 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900">
          <span className="font-medium">Your current vault balance:</span>
          <span className="flex items-center gap-1.5 font-bold font-mono text-sm bg-white px-2.5 py-0.5 rounded-full border border-amber-300 text-amber-800 shadow-xs">
            <Coins className="w-4 h-4 text-amber-600" />
            {wallet.tokenBalance} LitTokens
          </span>
        </div>

        {/* Content body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {successMessage ? (
            <div className="py-12 text-center animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-stone-800 font-display">
                Transaction Completed!
              </h4>
              <p className="mt-2 text-sm text-stone-600 font-medium">
                {successMessage}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                New Balance: {wallet.tokenBalance} LitTokens
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                {activePackages.map(pkg => {
                  const isSelected = pkg.id === selectedPackageId;
                  const priceFormatted = (pkg.priceCents / 100).toFixed(2);
                  const totalTokens = pkg.tokens + (pkg.bonusTokens || 0);

                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`relative flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/30 shadow-md'
                          : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-stone-50/60'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Best Value
                        </span>
                      )}

                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-stone-900 text-sm">
                          {pkg.name}
                        </span>
                        <span className="font-mono font-bold text-stone-900 text-sm">
                          ${priceFormatted}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1.5 my-1">
                        <span className="text-2xl font-bold font-mono text-amber-700">
                          {pkg.tokens}
                        </span>
                        <span className="text-xs font-medium text-stone-500">
                          tokens
                        </span>
                        {Boolean(pkg.bonusTokens && pkg.bonusTokens > 0) && (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded ml-auto">
                            +{pkg.bonusTokens} Bonus
                          </span>
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                        <span>Total: {totalTokens} LitTokens</span>
                        <span className="text-amber-800 font-medium">
                          {(pkg.priceCents / totalTokens / 100).toFixed(3)}$ / token
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Payment Method Selector */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Select Payment Gateway
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Stripe', 'Paystack', 'Flutterwave', 'PayPal'] as const).map(provider => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => setPaymentProvider(provider)}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium text-center transition-all ${
                        paymentProvider === provider
                          ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-stone-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Bank-grade 256-bit encryption. Zero stored payment credentials.
                </p>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <div>
                  <span className="text-xs text-stone-500">Order Total:</span>
                  <div className="font-mono text-lg font-bold text-stone-900">
                    ${selectedPkg ? (selectedPkg.priceCents / 100).toFixed(2) : '0.00'}{' '}
                    <span className="text-xs font-normal text-stone-400">USD</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing || !selectedPkg}
                    onClick={handleBuy}
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Securing Vault...
                      </span>
                    ) : (
                      <>
                        Pay & Add Tokens
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
