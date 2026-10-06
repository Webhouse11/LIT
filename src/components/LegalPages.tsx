import React, { useState } from 'react';
import { ShieldCheck, FileText, Lock, AlertTriangle, ArrowLeft } from 'lucide-react';

interface LegalPagesProps {
  initialTab?: string;
  onBack: () => void;
  onOpenReportModal: () => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({
  initialTab = 'copyright',
  onBack,
  onOpenReportModal,
}) => {
  const [activeTab, setActiveTab] = useState<'copyright' | 'agreement' | 'terms' | 'privacy' | 'guidelines'>(
    (initialTab as any) || 'copyright'
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to App
      </button>

      {/* Header */}
      <div className="mb-8">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-700">
          Trust, Safety & Governance
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
          LitVault Legal & Policy Center
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          International publishing agreements, DMCA notice compliance, reader privacy, and intellectual property standards.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 mb-8 pb-1 overflow-x-auto text-xs font-bold">
        {[
          { id: 'copyright', label: 'Copyright & DMCA Policy' },
          { id: 'agreement', label: 'Author Publishing Agreement' },
          { id: 'guidelines', label: 'Content Guidelines' },
          { id: 'terms', label: 'Terms of Service' },
          { id: 'privacy', label: 'Privacy Policy' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-xs font-editorial text-sm leading-relaxed text-stone-700 space-y-6">
        {/* 1. COPYRIGHT & DMCA */}
        {activeTab === 'copyright' && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-stone-900 font-sans">
              Copyright Protection & Notice Procedure
            </h2>
            <p>
              LitVault respects the intellectual property rights of writers, translators, and creators worldwide. We strictly prohibit the upload or distribution of plagiarized, scraped, or unauthorized copyrighted materials.
            </p>

            <h3 className="font-display text-base font-bold text-stone-900 font-sans pt-2">
              1. Author Ownership & Non-Exclusive Licensing
            </h3>
            <p>
              Authors retain 100% full copyright ownership over their submitted manuscripts, cover art, and intellectual property. By publishing on LitVault, authors grant the platform a non-exclusive license to host, display, serialize, and monetize their works in accordance with creator revenue share agreements.
            </p>

            <h3 className="font-display text-base font-bold text-stone-900 font-sans pt-2">
              2. Digital Millennium Copyright Act (DMCA) Take-Downs
            </h3>
            <p>
              If you believe your copyrighted literary work has been copied or uploaded without authorization, please submit a formal report immediately. Our legal compliance team acts promptly on verified notices.
            </p>

            <div className="my-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between font-sans">
              <div>
                <h4 className="font-bold text-xs text-amber-900">Found Infringing Content?</h4>
                <p className="text-[11px] text-amber-800">Use our instant moderation tool to notify the LitVault trust team.</p>
              </div>
              <button
                onClick={onOpenReportModal}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
              >
                File Copyright Notice
              </button>
            </div>
          </div>
        )}

        {/* 2. AUTHOR AGREEMENT */}
        {activeTab === 'agreement' && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-stone-900 font-sans">
              Author Publishing & Royalties Agreement
            </h2>
            <p>
              This Agreement governs the relationship between the published Creator and LitVault. By submitting a manuscript to the LitVault Studio, you agree to these publishing covenants:
            </p>

            <h3 className="font-display text-base font-bold text-stone-900 font-sans pt-2">
              1. Warranty of Originality
            </h3>
            <p>
              The Author warrants and represents that they are the sole author and owner of the work, or possess the lawful license to publish it. The work does not infringe any third-party copyright, trademark, privacy, or moral rights.
            </p>

            <h3 className="font-display text-base font-bold text-stone-900 font-sans pt-2">
              2. Token Economics & Revenue Sharing
            </h3>
            <p>
              LitVault operates on a creator-first model. LitTokens redeemed by readers to unlock an author's chapters or books are split between the Author (70% standard benchmark or configured platform rate) and LitVault (30% infrastructure, server costs, and payment gateway fees). Authors may request withdrawals into their designated bank account, Mobile Money wallet, or PayPal account once their balance reaches the minimum threshold.
            </p>

            <h3 className="font-display text-base font-bold text-stone-900 font-sans pt-2">
              3. Right to Unpublish
            </h3>
            <p>
              Authors maintain the right to unpublish, pause, or remove their works from future sales at any time via their Author Studio dashboard. Existing readers who previously unlocked the book retain reading access in their private library.
            </p>
          </div>
        )}

        {/* 3. CONTENT GUIDELINES */}
        {activeTab === 'guidelines' && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-stone-900 font-sans">
              Editorial & Content Guidelines
            </h2>
            <p>
              LitVault fosters a vibrant literary ecosystem spanning literary fiction, folklore, science fiction, poetry, romance, and non-fiction. To protect reader trust, works must adhere to the following community standards:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs font-sans">
              <li><strong>Zero Tolerance for Plagiarism:</strong> Uploading text copied from other books, web serials, or without credit will result in instant account termination.</li>
              <li><strong>Appropriate Age Rating:</strong> Mature themes, violence, or sexual content must be labeled as "18+" or "16+" in book metadata.</li>
              <li><strong>Hate Speech & Harassment:</strong> We do not publish content promoting violence or hatred against protected groups.</li>
              <li><strong>Formatting Quality:</strong> Manuscripts should feature clean paragraphing, chapter titles, and readable spelling.</li>
            </ul>
          </div>
        )}

        {/* 4. TERMS OF SERVICE */}
        {activeTab === 'terms' && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-stone-900 font-sans">
              Terms of Service
            </h2>
            <p>
              Welcome to LitVault. By accessing our web application, purchasing LitTokens, or reading content, you agree to comply with and be bound by these Terms of Service.
            </p>
            <p>
              LitTokens constitute a virtual utility credit within the LitVault platform and do not constitute legal tender, banking deposits, or equity securities. Unlocked books remain accessible in the reader's digital vault for personal, non-commercial reading pleasure.
            </p>
          </div>
        )}

        {/* 5. PRIVACY POLICY */}
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-stone-900 font-sans">
              Reader & Author Privacy Policy
            </h2>
            <p>
              LitVault is committed to safeguarding personal information. We do not sell user data to advertising brokers.
            </p>
            <p>
              We collect authentication identifiers (via Firebase Authentication), user reading progress, bookmarks, and purchase references strictly to operate your personal vault and synchronize chapter states across your devices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
