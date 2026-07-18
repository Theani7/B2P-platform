"use client";

import { useState } from "react";
import api from "@/lib/apiClient";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AIGenerateButton({
  title,
  currentText,
  contextData,
  onUpdate,
  contextType,
  refineOnly,
  disableGenerate,
  disableGenerateReason,
}: {
  title: string;
  currentText: string;
  contextData?: string;
  onUpdate: (text: string) => void;
  contextType: "description" | "requirements" | "target audience" | "bio" | "creator headline";
  refineOnly?: boolean;
  disableGenerate?: boolean;
  disableGenerateReason?: string;
}) {
  const [isLoadingGen, setIsLoadingGen] = useState(false);
  const [isLoadingRefine, setIsLoadingRefine] = useState(false);

  const callAI = async (mode: "generate" | "refine") => {
    if (!title.trim()) {
      toast.error("Please enter a campaign title first!");
      return;
    }
    
    if (mode === "refine" && (!currentText || !currentText.trim())) {
      toast.error("There is nothing to refine! Try generating or typing something first.");
      return;
    }

    const setLoad = mode === "generate" ? setIsLoadingGen : setIsLoadingRefine;
    setLoad(true);

    const extraContext = contextData ? `\n\nAdditional Campaign Details to incorporate:\n${contextData}` : "";
    let prompt = "";
    if (mode === "generate") {
      const lengthHint = contextType === "description" ? "2-3 paragraphs" : contextType === "requirements" ? "3-5 bullet points" : contextType === "bio" ? "1 short paragraph" : "1 punchy sentence";
      const subject = (contextType === "bio" || contextType === "creator headline") 
          ? `creator/influencer named ${title}` 
          : `campaign titled: "${title}"`;
          
      prompt = `Write an engaging and professional ${contextType} for a ${subject}. Ensure it is around ${lengthHint}. Just output the text.${extraContext}`;
    } else {
      const subject = (contextType === "bio" || contextType === "creator headline") 
          ? `creator/influencer named ${title}` 
          : `campaign titled "${title}"`;
          
      prompt = `Refine and improve the following ${contextType} for a ${subject}. Make it professional, fix any grammar issues, and improve the flow. Do not add conversational filler, just return the refined text.${extraContext}\n\nCurrent text:\n"${currentText}"`;
    }

    try {
      const response: any = await api.post("/ai/generate/campaign", { prompt });

      if (response.success) {
        onUpdate(response.data.text);
        toast.success(mode === "generate" ? "Generated magically! ✨" : "Refined successfully! ✨");
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${mode}. Make sure your Groq API key is set.`);
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!refineOnly && (
        <button
          onClick={() => {
            if (disableGenerate) {
              toast.error(disableGenerateReason || "Cannot generate right now.");
              return;
            }
            callAI("generate");
          }}
          disabled={isLoadingGen || isLoadingRefine}
          type="button"
          title={`Generate ${contextType} with AI`}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-pill transition-colors ${
            disableGenerate 
              ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
              : "text-signal-blue bg-signal-blue/10 hover:bg-signal-blue/20 disabled:opacity-50"
          }`}
        >
          {isLoadingGen ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {isLoadingGen ? "Wait..." : "Generate"}
        </button>
      )}

      <button
        onClick={() => callAI("refine")}
        disabled={isLoadingGen || isLoadingRefine || !currentText?.trim()}
        type="button"
        title={`Refine ${contextType} with AI`}
        className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1.5 rounded-pill hover:bg-purple-100 transition-colors disabled:opacity-50"
      >
        {isLoadingRefine ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
        {isLoadingRefine ? "Wait..." : "Refine"}
      </button>
    </div>
  );
}
