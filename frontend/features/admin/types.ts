export interface AdminVerificationRequest {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requester_name: string;
  requester_type: "BUSINESS" | "PROMOTER";
  submitted_at: string;
  requester_headline?: string | null;
  admin_notes?: string | null;
  reviewed_at?: string | null;
  document_url?: string | null;
  document_name?: string | null;
  documentUrl?: string | null;
  documentName?: string | null;
  profile_data?: {
    niche?: string | null;
    followers_count?: number | null;
    engagement_rate?: number | null;
    website?: string | null;
    company_size?: string | null;
    location?: string | null;
  } | null;
}

export type VerificationRequest = AdminVerificationRequest;
