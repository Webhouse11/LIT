import React from 'react';
import { useApp } from '../context/AppContext';
import { Megaphone, ExternalLink, ShieldCheck } from 'lucide-react';

interface AdSlotProps {
  position: 'header' | 'reading_break' | 'sidebar' | 'footer';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ position, className = '' }) => {
  const { adSlots } = useApp();
  const config = adSlots.find(slot => slot.position === position);

  if (!config || !config.enabled) {
    return null;
  }

  return (
    <div
      className={`relative my-6 rounded-xl border border-stone-200/80 bg-gradient-to-r from-stone-50 via-amber-50/20 to-stone-50 p-4 shadow-sm transition-all ${className}`}
    >
      <div className="flex items-center justify-between pb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-200/60">
        <span className="flex items-center gap-1.5">
          <Megaphone className="w-3.5 h-3.5 text-amber-600" />
          Sponsored Editorial Space
        </span>
        <span className="flex items-center gap-1 text-[10px] text-stone-400">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          LitVault Partner Network
        </span>
      </div>

      <div className="py-4 text-center">
        <h4 className="font-serif text-stone-800 text-sm md:text-base font-medium">
          {config.title}
        </h4>
        <p className="mt-1 text-xs text-stone-500 max-w-md mx-auto">
          {config.placeholderNote}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-100/70 text-amber-900 border border-amber-200/50">
            Publisher: {config.clientPublisherId}
          </span>
          <span className="text-[11px] text-stone-400 font-mono">
            Slot: {config.adUnitId}
          </span>
        </div>
      </div>
    </div>
  );
};
