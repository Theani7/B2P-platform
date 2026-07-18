import { useState } from "react";
import { useDeliverables, useSubmitDeliverable, useReviewDeliverable } from "../api";
import { DeliverableStatus } from "../types";
import { Upload, CheckCircle2, XCircle, FileVideo, Loader2, Send, ExternalLink, Clock, MessageSquare, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const getStatusConfig = (status: DeliverableStatus) => {
    switch(status) {
      case DeliverableStatus.APPROVED: 
        return { color: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", icon: CheckCircle2, label: "Approved" };
      case DeliverableStatus.REVISION_REQUESTED: 
        return { color: "bg-amber-50 text-amber-700 ring-amber-600/20", icon: AlertCircle, label: "Revision Requested" };
      case DeliverableStatus.IN_REVIEW: 
        return { color: "bg-sky-50 text-signal-blue ring-signal-blue/20", icon: Clock, label: "In Review" };
      default: 
        return { color: "bg-gray-50 text-gray-700 ring-gray-600/20", icon: FileVideo, label: status };
    }
  };

  if (isLoading) return (
    <div className="p-8 flex justify-center items-center h-48 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100">
      <Loader2 className="w-8 h-8 animate-spin text-signal-blue opacity-50" />
    </div>
  );

  return (
    <div className="space-y-4 mt-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FileVideo className="w-4 h-4 text-signal-blue" /> 
            Content Deliverables
          </h3>
          
          {role === "promoter" && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 bg-gray-900 text-white px-3 h-8 rounded-lg text-xs font-semibold hover:bg-signal-blue transition-colors shadow-sm shrink-0"
            >
              <Upload className="w-3.5 h-3.5" /> 
              Upload Draft
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {role === "promoter" 
            ? "Submit your content drafts for brand approval." 
            : "Review and provide feedback on content drafts."}
        </p>
      </div>

      {/* UPLOAD FORM (PROMOTER ONLY) */}
      <AnimatePresence>
        {showForm && role === "promoter" && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-base font-bold text-gray-900">Submit New Draft</h4>
                <button type="button" onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                  <XCircle size={18} />
                </button>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/20 outline-none transition-all" placeholder="e.g. Instagram Reel Draft 1" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Content Link (Drive, Frame.io)</label>
                  <input type="url" required value={contentUrl} onChange={e => setContentUrl(e.target.value)} className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/20 outline-none transition-all" placeholder="https://..." />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Notes (Optional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/20 outline-none transition-all resize-none min-h-[80px]" placeholder="Add any context or questions..." />
              </div>
              
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={submitDeliverable.isPending} className="flex items-center gap-2 bg-signal-blue text-white px-8 h-11 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm">
                  {submitDeliverable.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
                  Submit Deliverable
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELIVERABLES LIST */}
      {(!deliverables || deliverables.length === 0) ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm text-gray-300">
            <FileVideo size={28} />
          </div>
          <h4 className="text-base font-bold text-gray-900 mb-1">No drafts submitted</h4>
          <p className="text-sm text-gray-500 max-w-sm text-center">
            {role === "promoter" 
              ? "You haven't submitted any content deliverables yet. Click 'Upload Draft' to get started." 
              : "The promoter hasn't submitted any content for review yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {deliverables.map((d) => {
            const conf = getStatusConfig(d.status);
            const StatusIcon = conf.icon;
            
            return (
              <motion.div 
                key={d.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-gray-900 truncate pr-4">{d.title}</h4>
                    <span className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                      Submitted on {new Date(d.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset whitespace-nowrap shrink-0 ${conf.color}`}>
                    <StatusIcon size={14} /> {conf.label}
                  </span>
                </div>
                
                {/* Content Link */}
                <a 
                  href={d.content_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium text-gray-700 hover:bg-sky-50 hover:border-signal-blue/30 hover:text-signal-blue transition-colors mb-4"
                >
                  <span className="flex items-center gap-2 truncate">
                    <ExternalLink size={16} className="shrink-0" />
                    <span className="truncate">{d.content_url}</span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Open</span>
                </a>

                {/* Description */}
                {d.description && (
                  <div className="mb-4">
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Promoter Notes</h5>
                    <p className="text-sm text-gray-700 leading-relaxed bg-white border border-gray-100 p-3 rounded-xl">
                      {d.description}
                    </p>
                  </div>
                )}
                
                {/* Feedback block */}
                {d.feedback && (
                  <div className="mt-auto p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-2 text-amber-800">
                      <MessageSquare size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Business Feedback</span>
                    </div>
                    <p className="text-sm text-amber-900 leading-relaxed italic">{d.feedback}</p>
                  </div>
                )}

                {/* Review Actions (Business Only) */}
                {role === "business" && d.status === DeliverableStatus.IN_REVIEW && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <AnimatePresence mode="wait">
                      {reviewingId === d.id ? (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                          <textarea
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                            placeholder="Add your feedback or required changes here..."
                            className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl focus:border-signal-blue focus:ring-4 focus:ring-signal-blue/10 outline-none transition-all resize-none min-h-[100px]"
                          />
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button onClick={() => handleReview(d.id, DeliverableStatus.APPROVED)} disabled={reviewDeliverable.isPending} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-10 font-bold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50">
                              <CheckCircle2 size={16} /> Approve
                            </button>
                            <button onClick={() => handleReview(d.id, DeliverableStatus.REVISION_REQUESTED)} disabled={reviewDeliverable.isPending || !feedback.trim()} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white h-10 font-bold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50">
                              <AlertCircle size={16} /> Request Changes
                            </button>
                            <button onClick={() => setReviewingId(null)} className="w-full flex items-center justify-center h-10 text-sm font-semibold text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => setReviewingId(d.id)} 
                          className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-signal-blue/10 text-signal-blue text-sm font-bold hover:bg-signal-blue hover:text-white transition-colors"
                        >
                          <CheckCircle2 size={16} /> Evaluate Draft
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
