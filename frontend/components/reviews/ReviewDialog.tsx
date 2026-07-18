"use client";

import { useState } from "react";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/Button";
import { RatingStars } from "@/components/reviews/RatingStars";
import { useCreateReview } from "@/features/reviews/api";
import { Portal } from "@/components/ui/Portal";

export function ReviewDialog({
  collaborationId,
  onClose,
}: {
  collaborationId: string;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const create = useCreateReview();

  const submit = () => {
    create.mutate(
      { collaborationId, data: { rating, comment: comment || undefined } },
      {
        onSuccess: () => {
          notifySuccess("Review submitted");
          onClose();
        },
        onError: (e: any) => notifyError(e?.response?.data?.message ?? "Could not submit review"),
      },
    );
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/60 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-modals bg-white p-6 shadow-elevated"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-heading-sm font-semibold text-midnight-ink">Leave a review</h2>
          <div className="mt-4">
            <span className="mb-1 block text-caption font-medium uppercase tracking-wide text-steel">Rating</span>
            <RatingStars value={rating} onChange={setRating} />
          </div>
          <label className="mt-4 block">
            <span className="mb-1 block text-caption font-medium uppercase tracking-wide text-steel">Comment</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={create.isPending}>
              Submit
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
