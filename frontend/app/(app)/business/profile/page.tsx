"use client";

import { useState, useRef, useEffect } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import api from "@/lib/apiClient";
import { ProfileCompletionWidget } from "@/components/profile/ProfileCompletionWidget";
import { SocialEditor } from "@/components/social/SocialEditor";
import { VerificationRequestModal } from "@/components/verification/VerificationRequestModal";
import { useBusinessProfile, useCreateBusinessProfile, useUpdateBusinessProfile, useMyBusinessVerificationRequests } from "@/features/profile/api";
import { useMySocialLinks, useDeleteSocialLink } from "@/features/social/api";
import { useUpload } from "@/features/upload/api";
import { useProfileCompletion } from "@/features/profile-completion/api";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { notifySuccess, notifyError, notifyApiError } from "@/lib/notify";
import { Building2, Globe, MapPin, Briefcase, Upload, Save, AlertTriangle, RefreshCw, BadgeCheck, Clock, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  companyName: z.string().min(1, "Company name required"),
  industry: z.string().min(1, "Industry required"),
  description: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

// Hardcoded for now, could fetch from settings
const industryOptions = ["Technology", "Fashion", "Food", "Other", "Finance", "Healthcare", "E-commerce"];

export default function BusinessProfilePage() {
  const qc = useQueryClient();
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  
  const { data: profile, isLoading } = useBusinessProfile();
  const { data: completion, isLoading: completionLoading } = useProfileCompletion();
  const { data: links } = useMySocialLinks();
  const { data: verificationRequests } = useMyBusinessVerificationRequests();
  
  const createMutation = useCreateBusinessProfile();
  const updateMutation = useUpdateBusinessProfile();
  const logoUpload = useUpload("logo");
  const deleteLink = useDeleteSocialLink();
  
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [editingSocial, setEditingSocial] = useState(false);

  const hasPendingRequest = verificationRequests?.some((r) => r.status === "PENDING") ?? false;
  const isPending = pendingVerification || hasPendingRequest;

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: "",
      industry: "",
      description: "",
      location: "",
      website: "",
    },
  });

  useEffect(() => {
    if (profile && !isDirty) {
      reset({
        companyName: profile.companyName ?? "",
        industry: profile.industry ?? "",
        description: profile.description ?? "",
        location: profile.location ?? "",
        website: profile.website ?? "",
      });
    }
  }, [profile, reset, isDirty]);

  // Hook for unsaved changes warning could go here if we implemented it

  const onSubmit = async (data: FormValues) => {
    try {
      if (profile) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      notifySuccess("Profile updated successfully");
      reset(data);
      refreshUser();
    } catch (err: any) {
      notifyApiError(err, "Failed to update profile");
    }
  };

  const onLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notifyError("Image size should be less than 5MB");
      return;
    }
    try {
      const { url } = await logoUpload.mutateAsync(file);
      const currentValues = getValues();
      if (profile) {
        await updateMutation.mutateAsync({ ...currentValues, logoUrl: url });
      } else {
        await createMutation.mutateAsync({ ...currentValues, logoUrl: url });
      }
      notifySuccess("Logo updated");
      refreshUser();
    } catch (err: any) {
      notifyApiError(err, "Failed to upload logo");
    } finally {
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  };

  if (isLoading) return <Spinner />;

  const isComplete = completion?.completion === 100;
  const verified = profile?.verified;

  return (
    <RequireAuth role={Role.BUSINESS}>
      <div className="max-w-[1200px] mx-auto space-y-8 pb-32">
        {/* SIGNATURE HERO BANNER */}
        <div className="relative overflow-hidden rounded-cards-lg border border-steel/10 bg-white p-8 shadow-product-card">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(60% 120% at 100% 0%, rgba(182,203,253,0.5) 0%, rgba(240,244,254,0) 60%)" }}
          />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Logo with upload trigger */}
              <div className="relative group w-fit shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white overflow-hidden shadow-md bg-sky-wash flex items-center justify-center">
                  {logoUpload.isPending ? (
                    <Spinner />
                  ) : profile?.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.logoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Avatar initials={(watch("companyName")?.[0] || profile?.companyName?.[0] || "C").toUpperCase()} size="lg" colorIndex={0} className="w-full h-full text-3xl" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={logoUpload.isPending}
                  title="Upload company logo"
                  className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-steel/20 rounded-full flex items-center justify-center text-graphite hover:text-signal-blue hover:bg-sky-wash transition-all shadow-sm disabled:opacity-50 opacity-0 group-hover:opacity-100"
                >
                  <Upload size={13} />
                </button>
                <input type="file" ref={fileRef} onChange={onLogo} accept="image/*" className="hidden" />
              </div>

              {/* Company Identity */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-signal-blue font-mono uppercase tracking-wider">
                    Business Profile
                  </span>
                  {verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-status bg-emerald-status/10 px-2 py-0.5 rounded-pill border border-emerald-status/20">
                      <BadgeCheck size={12} /> Verified
                    </span>
                  )}
                </div>

                {/* Company Name - Live Bound */}
                <h1 className="mt-1 truncate font-display text-2xl sm:text-3xl font-bold tracking-tight text-midnight-ink">
                  {watch("companyName") || profile?.companyName || "Your Company"}
                </h1>

                {/* Industry & Location */}
                <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs font-medium text-ash">
                  {(watch("industry") || profile?.industry) && (
                    <span className="inline-flex items-center gap-1 bg-sky-wash text-signal-blue px-2.5 py-0.5 rounded-pill font-semibold text-[11px] border border-signal-blue/20">
                      <Briefcase size={12} /> {watch("industry") || profile?.industry}
                    </span>
                  )}
                  {(watch("location") || profile?.location) && (
                    <span className="inline-flex items-center gap-1 bg-linen-canvas text-graphite px-2.5 py-0.5 rounded-pill text-[11px] border border-steel/15">
                      <MapPin size={12} className="text-ash" /> {watch("location") || profile?.location}
                    </span>
                  )}
                  {(watch("website") || profile?.website) && (
                    <span className="inline-flex items-center gap-1 text-ash text-[11px]">
                      <Globe size={12} className="text-ash" /> {watch("website") || profile?.website}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="hidden sm:inline-flex items-center gap-1.5 h-10 px-4 bg-sky-wash rounded-pill text-signal-blue font-semibold text-xs border border-signal-blue/20">
                <span>{completion?.completion ?? 0}% Complete</span>
              </div>

              {isPending || verified ? (
                <div className="inline-flex items-center gap-1.5 h-10 px-4 rounded-pill bg-emerald-status/10 text-emerald-status border border-emerald-status/20 text-xs font-semibold">
                  <BadgeCheck size={14} /> {verified ? "Verified" : "Pending"}
                </div>
              ) : isComplete ? (
                <button
                  type="button"
                  onClick={() => setIsVerificationModalOpen(true)}
                  disabled={hasPendingRequest}
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-pill bg-signal-blue/10 text-signal-blue text-xs font-semibold hover:bg-signal-blue/20 transition-all border border-signal-blue/20"
                >
                  <BadgeCheck size={14} /> Request Verification
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 h-10 px-4 rounded-pill bg-amber-tag/10 text-amber-tag border border-amber-tag/20 text-xs font-semibold">
                  <Clock size={14} /> Complete to verify
                </div>
              )}

              <button
                type="submit"
                form="profile-form"
                disabled={!isDirty || isSubmitting}
                className={`inline-flex items-center gap-1.5 h-10 px-5 rounded-pill text-xs font-semibold shadow-product-card transition-all ${
                  isDirty && !isSubmitting
                    ? "bg-signal-blue hover:bg-signal-blue/90 text-white hover:shadow-elevated"
                    : "bg-steel/10 text-steel cursor-not-allowed"
                }`}
              >
                {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-8">
          <div className="flex-1 min-w-0 space-y-8">
            <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="bg-white border border-slate-custom/10 rounded-cards-lg shadow-product-card overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-custom/10 bg-gradient-to-r from-sky-wash/70 to-transparent">
                  <h2 className="font-display text-lg font-medium tracking-tight text-graphite">Company Information</h2>
                  <p className="text-sm text-ash mt-1">Basic details about your business.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-graphite">Company Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Building2 size={18} className="text-ash" />
                        </div>
                        <input
                          {...register("companyName")}
                          className="w-full pl-11 pr-4 h-12 px-3 py-2 border border-slate-custom/20 rounded-inputs bg-white text-midnight-ink placeholder-fog focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 text-sm"
                          placeholder="Acme Inc."
                        />
                      </div>
                      {errors.companyName && <p className="text-xs text-coral-alert">{errors.companyName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-graphite">Industry</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Briefcase size={18} className="text-ash" />
                        </div>
                        <select
                          {...register("industry")}
                          className="w-full pl-11 pr-4 h-12 px-3 py-2 border border-slate-custom/20 rounded-inputs bg-white text-midnight-ink appearance-none focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 text-sm"
                        >
                          <option value="">Select an industry</option>
                          {industryOptions.map(ind => (
                            <option key={ind} value={ind}>{ind}</option>
                          ))}
                        </select>
                      </div>
                      {errors.industry && <p className="text-xs text-coral-alert">{errors.industry.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-graphite">Headquarters Location</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <MapPin size={18} className="text-ash" />
                      </div>
                      <input
                        {...register("location")}
                        className="w-full pl-11 pr-4 h-12 px-3 py-2 border border-slate-custom/20 rounded-inputs bg-white text-midnight-ink placeholder-fog focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 text-sm"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-custom/10 rounded-cards-lg shadow-product-card overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-custom/10 bg-gradient-to-r from-sky-wash/70 to-transparent">
                  <h2 className="font-display text-lg font-medium tracking-tight text-graphite">Online Presence</h2>
                  <p className="text-sm text-ash mt-1">Links to your website and social profiles.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-graphite">Company Website</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Globe size={18} className="text-ash" />
                      </div>
                      <input
                        {...register("website")}
                        type="url"
                        className="w-full pl-11 pr-4 h-12 px-3 py-2 border border-slate-custom/20 rounded-inputs bg-white text-midnight-ink placeholder-fog focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 text-sm"
                        placeholder="https://acme.com"
                      />
                    </div>
                    {errors.website && <p className="text-xs text-coral-alert">{errors.website.message}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-custom/10 rounded-cards-lg shadow-product-card overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-custom/10 bg-gradient-to-r from-sky-wash/70 to-transparent">
                  <h2 className="font-display text-lg font-medium tracking-tight text-graphite">About Company</h2>
                  <p className="text-sm text-ash mt-1">Tell promoters what your brand is all about.</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-graphite">Company Description</label>
                    </div>
                    <textarea
                      {...register("description")}
                      rows={6}
                      className="w-full p-4 border border-slate-custom/20 rounded-inputs bg-white text-midnight-ink placeholder-fog focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 text-sm leading-relaxed resize-none"
                      placeholder="Describe your company mission, values, and what kind of influencers you're looking to partner with."
                    />
                  </div>
                </div>
              </div>
            </form>

            <div className="bg-white border border-slate-custom/10 rounded-cards-lg shadow-product-card overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-custom/10 bg-gradient-to-r from-sky-wash/70 to-transparent">
                <h2 className="font-display text-lg font-medium tracking-tight text-graphite">Company Socials</h2>
                <p className="text-sm text-ash mt-1">Connect your brand&apos;s social media accounts for promoters to check out.</p>
              </div>
              <div className="p-6 space-y-4">
                {links && links.length > 0 && (
                  <ul className="space-y-2">
                    {links.map((l) => (
                      <li key={l.id} className="flex items-center justify-between rounded-inputs border border-slate-custom/10 px-3 py-2">
                        <div className="min-w-0 flex items-center gap-2">
                          <p className="text-sm font-medium text-graphite truncate">{l.platform}</p>
                          <p className="text-caption text-steel truncate">({l.url})</p>
                        </div>
                        <button
                          onClick={() => deleteLink.mutate(l.id, { onSuccess: () => notifySuccess("Link removed"), onError: () => notifyError("Failed to remove") })}
                          className="text-coral-alert text-xs font-medium hover:underline"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {editingSocial ? (
                  <SocialEditor onDone={() => setEditingSocial(false)} />
                ) : (
                  <Button variant="subtle" onClick={() => setEditingSocial(true)}>
                    Add social link
                  </Button>
                )}
              </div>
            </div>

          </div>

          <div className="lg:w-80 flex-shrink-0 space-y-6">
            <ProfileCompletionWidget />
          </div>
        </div>
      </div>
      
      {isDirty && (
        <div className="animate-fade-slide-up fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <div className="bg-white border border-slate-custom/10 rounded-cards-lg p-4 shadow-feature-section flex items-center justify-between ring-1 ring-slate-custom/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-tag/10 flex items-center justify-center text-amber-tag">
                <AlertTriangle size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-graphite">Unsaved changes</p>
                <p className="text-xs text-ash">Please save your profile to apply changes.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => reset()}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-ash hover:text-graphite transition-colors disabled:opacity-50"
              >
                Discard
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="px-6 h-10 hero-blue-fade text-white rounded-pill text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-product-card"
              >
                {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <VerificationRequestModal
        open={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        role="BUSINESS"
        onSuccess={() => {
          setPendingVerification(true);
          qc.invalidateQueries({ queryKey: ["my-business-verification-requests"] });
          qc.invalidateQueries({ queryKey: ["business-profile"] });
        }}
      />
    </RequireAuth>
  );
}
