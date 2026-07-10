"use client";

import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { ReviewsView } from "@/components/reviews/ReviewsView";

export default function PromoterReviewsPage() {
  return (
    <RequireAuth role={Role.PROMOTER}>
      <ReviewsView />
    </RequireAuth>
  );
}
