"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Portal } from "@/components/ui/Portal";
import api from "@/lib/apiClient";
import { notifySuccess, notifyError, notifyApiError } from "@/lib/notify";
import {
  UploadCloud,
  FileText,
  Trash2,
  X,
  BadgeCheck,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

export interface VerificationRequestModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  role: "PROMOTER" | "BUSINESS";
  onSuccess: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VerificationRequestModal({
  open,
  isOpen,
  onClose,
  role,
  onSuccess,
}: VerificationRequestModalProps) {
  const visible = open ?? isOpen ?? false;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!visible) {
      setSelectedFile(null);
      setIsDragging(false);
      setIsSubmitting(false);
      setSubmittingStep(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [visible]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && visible && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, isSubmitting, onClose]);

  const validateAndSetFile = useCallback((file: File) => {
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      notifyError("Only PDF documents are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      notifyError("File size exceeds 10MB limit.");
      return;
    }

    setSelectedFile(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSubmitting) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isSubmitting) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let documentUrl: string | null = null;
      let documentName: string | null = null;

      if (selectedFile) {
        setSubmittingStep("Uploading document...");
        const formData = new FormData();
        formData.append("file", selectedFile, selectedFile.name);

        const uploadRes: any = await api.post("/upload/document", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        documentUrl = uploadRes?.data?.url || uploadRes?.url || null;
        documentName = selectedFile.name;
      }

      setSubmittingStep("Submitting request...");
      const endpoint =
        role === "PROMOTER"
          ? "/promoter/verification-request"
          : "/business/verification-request";

      await api.post(endpoint, {
        documentUrl: documentUrl || null,
        documentName: documentName || null,
      });

      notifySuccess("Verification request submitted!");
      onSuccess();
      onClose();
    } catch (err: any) {
      notifyApiError(err, "Failed to submit verification request");
    } finally {
      setIsSubmitting(false);
      setSubmittingStep(null);
    }
  };

  if (!visible) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/60 backdrop-blur-sm p-4 animate-fade-in"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="verification-modal-title"
          className="bg-linen-canvas border border-slate-custom/10 rounded-cards-lg p-6 sm:p-8 shadow-xl max-w-lg w-full relative flex flex-col transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="absolute top-6 right-6 p-1.5 text-steel hover:text-graphite rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex items-start gap-3.5 pr-8">
            <div className="w-10 h-10 rounded-full bg-signal-blue/10 text-signal-blue flex items-center justify-center shrink-0 mt-0.5">
              <BadgeCheck size={22} />
            </div>
            <div>
              <h2
                id="verification-modal-title"
                className="text-xl font-bold text-graphite tracking-tight"
              >
                Request Verification
              </h2>
              <p className="text-sm font-medium text-ash mt-1.5 leading-relaxed">
                Submit your profile for official verification. You can optionally
                attach supporting PDF documents (Citizenship, PAN/VAT, or
                Registration Certificate) to expedite the review process.
              </p>
            </div>
          </div>

          {/* Drag and drop / file selector area */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-custom uppercase tracking-wider">
                Supporting Document
              </label>
              <span className="text-xs font-medium text-steel">
                Optional • PDF max 10MB
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />

            {!selectedFile ? (
              <div
                onClick={() => {
                  if (!isSubmitting) fileInputRef.current?.click();
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-cards p-6 sm:p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 ${
                  isDragging
                    ? "border-signal-blue bg-sky-wash"
                    : "border-steel/20 hover:border-signal-blue/50 hover:bg-white bg-white/70"
                } ${isSubmitting ? "pointer-events-none opacity-60" : ""}`}
              >
                <div className="w-12 h-12 rounded-full bg-signal-blue/10 text-signal-blue flex items-center justify-center mb-3">
                  <UploadCloud size={24} />
                </div>
                <p className="text-sm font-semibold text-graphite">
                  Click to select or drag & drop PDF
                </p>
                <p className="text-xs text-ash mt-1">
                  Citizenship, PAN/VAT, or Company Registration (.pdf)
                </p>
              </div>
            ) : (
              <div className="border border-slate-custom/15 rounded-cards p-4 bg-white flex items-center justify-between gap-3 shadow-product-card-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-inputs bg-signal-blue/10 text-signal-blue flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-graphite truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-ash mt-0.5">
                      {formatFileSize(selectedFile.size)} • PDF document
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={isSubmitting}
                  title="Remove document"
                  aria-label="Remove document"
                  className="p-2 text-steel hover:text-coral-alert rounded-full hover:bg-red-50 transition-colors shrink-0 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <div className="mt-3 flex items-start gap-2 text-xs text-steel">
              <AlertCircle size={14} className="shrink-0 mt-0.5 text-signal-blue" />
              <span>
                Document attachment is optional. You can submit without a
                document now and our team will still review your profile.
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-custom/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 h-10 rounded-buttons border border-steel/20 text-slate-custom hover:bg-slate-100 font-medium text-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 h-10 rounded-buttons bg-signal-blue hover:bg-signal-blue/90 text-white font-medium text-sm transition-all shadow-product-card flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{submittingStep || "Submitting..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

export default VerificationRequestModal;
