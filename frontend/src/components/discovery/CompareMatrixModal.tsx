import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatCompactNumber } from "../../utils/number";
import { 
  X, CheckCircle2, TrendingUp, Users, Star, MapPin, Briefcase, Award, Zap, ShieldCheck 
} from "lucide-react";
import { Avatar } from "../ui";

interface CompareMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoters: any[];
}

export default function CompareMatrixModal({ isOpen, onClose, promoters }: CompareMatrixModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || promoters.length < 2) return null;

  // Rule-based Comparison Engine
  const rules = [
    {
      id: "followers",
      label: "Audience Size",
      icon: Users,
      getValue: (p: any) => p.followers_count || 0,
      format: (val: number) => formatCompactNumber(val),
      isBetter: (a: number, b: number) => a > b,
      insight: "Higher reach for brand awareness.",
    },
    {
      id: "engagement",
      label: "Engagement Rate",
      icon: TrendingUp,
      getValue: (p: any) => p.engagement_rate || 0,
      format: (val: number) => `${val.toFixed(1)}%`,
      isBetter: (a: number, b: number) => a > b,
      insight: "Better conversion potential and active audience.",
    },
    {
      id: "rating",
      label: "Client Rating",
      icon: Star,
      getValue: (p: any) => 4.9, // Hardcoded for now based on current UI
      format: (val: number) => val.toFixed(1),
      isBetter: (a: number, b: number) => a > b,
      insight: "Indicates reliability and quality of work.",
    },
    {
      id: "collabs",
      label: "Past Collabs",
      icon: Briefcase,
      getValue: (p: any) => 12, // Hardcoded for now
      format: (val: number) => val.toString(),
      isBetter: (a: number, b: number) => a > b,
      insight: "More experience with brand campaigns.",
    }
  ];

  const getWinners = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return [];
    
    let bestValue = rule.getValue(promoters[0]);
    for (let i = 1; i < promoters.length; i++) {
      const val = rule.getValue(promoters[i]);
      if (rule.isBetter(val, bestValue)) {
        bestValue = val;
      }
    }
    
    return promoters.filter(p => rule.getValue(p) === bestValue).map(p => p.id);
  };

  const generateAIInsight = () => {
    if (promoters.length !== 2) return "Select exactly two promoters for a head-to-head AI analysis.";
    
    const [p1, p2] = promoters;
    const p1Followers = p1.followers_count || 0;
    const p2Followers = p2.followers_count || 0;
    const p1Eng = p1.engagement_rate || 0;
    const p2Eng = p2.engagement_rate || 0;

    if (p1Followers > p2Followers * 2 && p1Eng < p2Eng) {
      return (
        <span className="text-sm text-gray-700 leading-relaxed">
          <strong className="text-gray-900">{p1.username}</strong> offers massive reach, ideal for top-of-funnel brand awareness. However, <strong className="text-gray-900">{p2.username}</strong> has significantly higher engagement, making them the better choice for direct conversions and click-through campaigns.
        </span>
      );
    } else if (p1Eng > p2Eng * 1.5 && p1Followers < p2Followers) {
      return (
        <span className="text-sm text-gray-700 leading-relaxed">
          <strong className="text-gray-900">{p1.username}</strong> commands an incredibly loyal audience with a high engagement rate. While <strong className="text-gray-900">{p2.username}</strong> has more followers, {p1.username} is likely to drive more meaningful interactions per dollar spent.
        </span>
      );
    } else {
      const leader = (p1Followers * p1Eng) > (p2Followers * p2Eng) ? p1 : p2;
      return (
        <span className="text-sm text-gray-700 leading-relaxed">
          Based on the combined metrics of reach and interaction quality, <strong className="text-primary-700">{leader.username}</strong> is the mathematically stronger candidate for standard promotional campaigns.
        </span>
      );
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-linen-canvas/50">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Zap size={20} className="text-amber-500 fill-amber-500" />
                Advanced Comparison
              </h2>
              <p className="text-sm text-gray-500 mt-1">Rule-based analysis of {promoters.length} selected profiles.</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-white">
            
            {/* AI Insight Banner */}
            {promoters.length === 2 && (
              <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-100 flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center shadow-sm">
                  <Zap size={20} className="text-white fill-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary-900 mb-1">AI Campaign Recommendation</h4>
                  {generateAIInsight()}
                </div>
              </div>
            )}

            <div className="overflow-x-auto pb-4">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 border-b-2 border-gray-100 w-1/4"></th>
                    {promoters.map(p => (
                      <th key={p.id} className="p-4 border-b-2 border-gray-100 w-1/4 align-bottom">
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-3">
                            {p.avatar_url ? (
                              <img src={p.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-50 shadow-sm" />
                            ) : (
                              <Avatar initials={p.username?.[0]?.toUpperCase() ?? "?"} size="lg" colorIndex={p.id?.charCodeAt(0) || 0} />
                            )}
                            {p.verified && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center ring-2 ring-white">
                                <ShieldCheck size={14} className="text-white" />
                              </div>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{p.username}</h3>
                          <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                            <MapPin size={12} /> {p.location || "Global"}
                          </p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Categorical Row */}
                  <tr>
                    <td className="p-4 border-b border-gray-100 bg-linen-canvas/50 rounded-l-xl">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Briefcase size={16} className="text-gray-400" />
                        Primary Niche
                      </div>
                    </td>
                    {promoters.map(p => (
                      <td key={p.id} className="p-4 border-b border-gray-100 text-center">
                        <span className="inline-flex px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider">
                          {p.niche || "General"}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Dynamic Rules Rows */}
                  {rules.map((rule, idx) => {
                    const winners = getWinners(rule.id);
                    return (
                      <tr key={rule.id}>
                        <td className={`p-4 border-b border-gray-100 bg-linen-canvas/50 ${idx === rules.length - 1 ? 'rounded-bl-xl' : ''}`}>
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <rule.icon size={16} className="text-gray-400" />
                            {rule.label}
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1 ml-6">{rule.insight}</p>
                        </td>
                        {promoters.map(p => {
                          const isWinner = winners.includes(p.id);
                          return (
                            <td key={p.id} className="p-4 border-b border-gray-100 text-center">
                              <div className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                                isWinner ? "bg-emerald-50 border border-emerald-200" : ""
                              }`}>
                                {isWinner && <Award size={16} className="text-emerald-500" />}
                                <span className={`text-base ${isWinner ? "font-bold text-emerald-700" : "font-semibold text-gray-900"}`}>
                                  {rule.format(rule.getValue(p))}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors">
              Close Comparison
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
