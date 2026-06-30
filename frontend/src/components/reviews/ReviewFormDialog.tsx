import { useState } from "react";
import RatingStars from "./RatingStars";

interface ReviewFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { rating: number; comment?: string }) => void;
  initialRating?: number;
  initialComment?: string;
  title?: string;
}

export default function ReviewFormDialog({
  open,
  onClose,
  onSubmit,
  initialRating = 0,
  initialComment = "",
  title = "Write a Review",
}: ReviewFormDialogProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) return;
    onSubmit({ rating, comment: comment || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="mt-2 flex items-center space-x-2">
              <RatingStars rating={rating} interactive size="lg" onChange={setRating} />
              <span className="ml-2 text-sm text-gray-500">{rating > 0 ? `${rating}/5` : "Select"}</span>
            </div>
            {rating < 1 && <p className="mt-1 text-xs text-coral-alert">Please select a rating</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Comment <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={4}
              className="mt-1 w-full rounded border p-2 text-sm"
              placeholder="Share your experience..."
            />
            <p className="mt-1 text-right text-xs text-gray-400">{comment.length}/1000</p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating < 1}
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
