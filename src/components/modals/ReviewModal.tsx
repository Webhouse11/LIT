import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Star, X, CheckCircle2 } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  bookId: string;
  bookTitle: string;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  bookId,
  bookTitle,
  onClose,
}) => {
  const { addReview } = useApp();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addReview(bookId, rating, comment.trim());
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-stone-900">
              Review & Rate
            </h3>
            <p className="text-xs text-stone-500 truncate max-w-xs">{bookTitle}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="py-6 text-center animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-base font-bold text-stone-800 font-display">Review Published</h4>
              <p className="mt-1 text-xs text-stone-500">
                Thank you for contributing to the LitVault reader community!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2 text-center">
                  Select Your Rating
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-7 h-7 ${active ? 'fill-amber-400 text-amber-500' : 'text-stone-300'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Literary Review
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Share your thoughts on the prose, character arcs, worldbuilding, and themes..."
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
                  className="px-5 py-2 text-xs rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors shadow-xs"
                >
                  Publish Review
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
