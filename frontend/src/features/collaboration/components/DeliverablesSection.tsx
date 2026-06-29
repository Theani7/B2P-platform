import { useState } from "react";
import { useDeliverables, useSubmitDeliverable, useReviewDeliverable } from "../api";
import { DeliverableStatus } from "../types";
import { Upload, CheckCircle, XCircle, FileText, Loader2, Send } from "lucide-react";

interface DeliverablesSectionProps {
  collaborationId: string;
  role: "business" | "promoter";
}

export default function DeliverablesSection({ collaborationId, role }: DeliverablesSectionProps) {
  const { data: deliverables, isLoading } = useDeliverables(role, collaborationId);
  const submitDeliverable = useSubmitDeliverable(collaborationId);
  const reviewDeliverable = useReviewDeliverable(collaborationId);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentUrl, setContentUrl] = useState("");

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !contentUrl) return;
    submitDeliverable.mutate(
      { title, description, content_url: contentUrl },
      { onSuccess: () => {
          setShowForm(false);
          setTitle("");
          setDescription("");
          setContentUrl("");
        }
      }
    );
  };

  const handleReview = (id: string, status: DeliverableStatus) => {
    reviewDeliverable.mutate(
      { deliverableId: id, data: { status, feedback } },
      { onSuccess: () => {
          setReviewingId(null);
          setFeedback("");
        }
      }
    );
  };

  const getStatusBadge = (status: DeliverableStatus) => {
    switch(status) {
      case DeliverableStatus.APPROVED: return <span className="inline-flex items-center px-1.5 py-0.5 rounded-badges text-xs font-medium bg-emerald-status/10 text-emerald-status">Approved</span>;
      case DeliverableStatus.REVISION_REQUESTED: return <span className="inline-flex items-center px-1.5 py-0.5 rounded-badges text-xs font-medium bg-amber-tag/10 text-amber-tag">Revision Requested</span>;
      case DeliverableStatus.IN_REVIEW: return <span className="inline-flex items-center px-1.5 py-0.5 rounded-badges text-xs font-medium bg-signal-blue/10 text-signal-blue">In Review</span>;
      default: return <span className="inline-flex items-center px-1.5 py-0.5 rounded-badges text-xs font-medium bg-slate-custom/10 text-slate-custom">{status}</span>;
    }
  };

  if (isLoading) return <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-signal-blue" /></div>;

  return (
    <div className="bg-linen-canvas rounded-cards p-4 mt-4 border border-slate-custom/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-graphite flex items-center gap-2">
          <FileText className="w-4 h-4" /> Content Deliverables
        </h3>
        {role === "promoter" && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-xs font-medium hero-blue-fade text-white px-3 py-1.5 rounded-button hover:opacity-90 transition-opacity"
          >
            <Upload className="w-3 h-3" /> Upload Draft
          </button>
        )}
      </div>

      {showForm && role === "promoter" && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-cards shadow-product-card mb-4 border border-slate-custom/10 space-y-3">
          <h4 className="text-sm font-medium text-graphite">Submit New Draft</h4>
          <div>
            <label className="text-xs font-medium text-graphite block mb-1">Title</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full text-sm border border-slate-custom/20 rounded-inputs shadow-sm focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 py-1.5" placeholder="e.g. Instagram Reel Draft 1" />
          </div>
          <div>
            <label className="text-xs font-medium text-graphite block mb-1">Link to Content (Google Drive, Frame.io, etc.)</label>
            <input type="url" required value={contentUrl} onChange={e => setContentUrl(e.target.value)} className="w-full text-sm border border-slate-custom/20 rounded-inputs shadow-sm focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 py-1.5" placeholder="https://..." />
          </div>
          <div>
            <label className="text-xs font-medium text-graphite block mb-1">Notes (Optional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full text-sm border border-slate-custom/20 rounded-inputs shadow-sm focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 py-1.5 h-16" placeholder="Any context for the business..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="text-xs font-medium text-ash hover:text-graphite px-3 py-1.5 transition-colors">Cancel</button>
            <button type="submit" disabled={submitDeliverable.isPending} className="flex items-center gap-1 text-xs font-medium hero-blue-fade text-white px-3 py-1.5 rounded-button hover:opacity-90 transition-opacity disabled:opacity-50">
              {submitDeliverable.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Submit
            </button>
          </div>
        </form>
      )}

      {(!deliverables || deliverables.length === 0) ? (
        <div className="text-center py-6 text-sm text-ash bg-white rounded-cards border border-dashed border-slate-custom/10">
          No deliverables submitted yet.
        </div>
      ) : (
        <div className="space-y-3">
          {deliverables.map((d) => (
            <div key={d.id} className="bg-white p-4 rounded-cards border border-slate-custom/10 shadow-product-card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-graphite">{d.title}</h4>
                    {getStatusBadge(d.status)}
                  </div>
                  <a href={d.content_url} target="_blank" rel="noopener noreferrer" className="text-xs text-signal-blue hover:underline mb-2 inline-block">
                    View Content Draft &rarr;
                  </a>
                  {d.description && <p className="text-xs text-ash bg-linen-canvas p-2 rounded-cards mb-2">{d.description}</p>}
                  {d.feedback && (
                    <div className="mt-2 p-2 bg-amber-tag/10 border border-amber-tag/20 rounded-cards">
                      <span className="text-[10px] font-bold text-amber-tag uppercase tracking-wider mb-1 block">Business Feedback</span>
                      <p className="text-xs text-amber-tag">{d.feedback}</p>
                    </div>
                  )}
                </div>
              </div>

              {role === "business" && d.status === DeliverableStatus.IN_REVIEW && (
                <div className="mt-4 pt-3 border-t border-slate-custom/10">
                  {reviewingId === d.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        placeholder="Add feedback for revisions..."
                        className="w-full text-sm border border-slate-custom/20 rounded-inputs focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 py-1.5 h-16"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleReview(d.id, DeliverableStatus.APPROVED)} className="flex-1 flex items-center justify-center gap-1 bg-emerald-status hover:bg-emerald-status/90 text-white text-xs font-medium py-1.5 rounded-button transition-colors">
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                        <button onClick={() => handleReview(d.id, DeliverableStatus.REVISION_REQUESTED)} className="flex-1 flex items-center justify-center gap-1 bg-amber-tag hover:bg-amber-tag/90 text-white text-xs font-medium py-1.5 rounded-button transition-colors">
                          <XCircle className="w-3 h-3" /> Request Revision
                        </button>
                        <button onClick={() => setReviewingId(null)} className="text-xs text-ash hover:text-graphite px-2 transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setReviewingId(d.id)} className="text-xs font-medium text-signal-blue hover:underline w-full text-center bg-signal-blue/10 hover:bg-signal-blue/20 py-1.5 rounded-button transition-colors">
                      Review this Draft
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
