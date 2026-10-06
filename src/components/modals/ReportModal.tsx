import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  targetType: 'book' | 'review' | 'author';
  targetId: string;
  targetTitle: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  targetType,
  targetId,
  targetTitle,
  onClose,
}) => {
  const { submitReport } = useApp();
  const [reason, setReason] = useState('Copyright Infringement / Plagiarism');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(targetType, targetId, targetTitle, reason, details);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-semibold text-base text-stone-900">
              Submit Moderation Report
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="py-6 text-center animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-base font-bold text-stone-800">Report Received</h4>
              <p className="mt-1 text-xs text-stone-500">
                LitVault administrators will review this item in accordance with our Content & Copyright Policies.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <span className="text-xs text-stone-500">Reporting item:</span>
                <p className="font-semibold text-sm text-stone-800 truncate">
                  {targetTitle} ({targetType})
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Reason for Report
                </label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Copyright Infringement / Plagiarism">Copyright Infringement / Plagiarism (DMCA)</option>
                  <option value="Inappropriate / Explicit Content">Inappropriate / Unlabeled Graphic Content</option>
                  <option value="Hate Speech or Harassment">Hate Speech or Harassment</option>
                  <option value="Spam or Misleading Information">Spam or Misleading Metadata</option>
                  <option value="Unauthorized Distribution">Unauthorized Distribution</option>
                  <option value="Other Policy Violation">Other Policy Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Supporting Details & Context
                </label>
                <textarea
                  required
                  rows={4}
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Please specify chapter, timestamps, or original source URL for copyright claims..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
