"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { notifySuccess, notifyError } from "@/lib/notify";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useAdminReviews, useDeleteReview } from "@/features/admin/api";
import { Star } from "lucide-react";

function ReviewsInner() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isFetching } = useAdminReviews({ page, limit: 15, search: search || undefined });
  const del = useDeleteReview();
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  return (
    <>
      <PageHeader title="Reviews" subtitle="Moderate user reviews." />
      <Card className="mb-5">
        <Input placeholder="Search comment" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </Card>

      {isFetching && !data ? <Spinner /> : null}

      <div className="space-y-2">
        {(data?.items ?? []).map((r) => (
          <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-body font-medium text-midnight-ink">
                  {r.reviewerUsername} → {r.revieweeUsername}
                </span>
                <Badge tone="amber"><span className="flex items-center gap-0.5">{r.rating} <Star size={12} className="fill-current" /></span></Badge>
              </div>
              <p className="text-caption text-slate-custom">{r.comment || "(no comment)"}</p>
            </div>
            <Button variant="danger" onClick={() => setReviewToDelete(r.id)}>
              Delete
            </Button>
          </Card>
        ))}
        {data && data.items.length === 0 && <Card><p className="text-body text-slate-custom">No reviews found.</p></Card>}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <span className="text-caption text-steel">Page {data?.page ?? page} of {data?.pages ?? 1}</span>
        <Button variant="ghost" disabled={page >= (data?.pages ?? 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>

      <ConfirmModal
        isOpen={!!reviewToDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete Review"
        isDanger={true}
        onCancel={() => setReviewToDelete(null)}
        onConfirm={() => {
          if (reviewToDelete) {
            del.mutate(reviewToDelete, { 
              onSuccess: () => notifySuccess("Deleted"), 
              onError: (e: any) => notifyError(e?.response?.data?.message ?? "Failed") 
            });
          }
          setReviewToDelete(null);
        }}
      />
    </>
  );
}

export default function AdminReviewsPage() {
  return (
    <RequireAuth role={Role.ADMIN}>
      <ReviewsInner />
    </RequireAuth>
  );
}
