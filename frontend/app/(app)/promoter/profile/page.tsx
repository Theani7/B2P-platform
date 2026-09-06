"use client";

export const dynamic = "force-dynamic";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { Role } from "@/lib/roles";
import { RequireAuth } from "@/components/common/RequireAuth";
import { notifySuccess, notifyError, notifyApiError } from "@/lib/notify";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  usePromoterProfile,
  useCreatePromoterProfile,
  useUpdatePromoterProfile,
  useMyVerificationRequests,
  type PromoterProfileInput,
} from "@/features/profile/api";
import { useUpload } from "@/features/upload/api";
import { useFollowStatus } from "@/features/follows/api";
import { useQueryClient } from "@tanstack/react-query";
import { useProfileCompletion } from "@/features/profile-completion/api";
import api from "@/lib/apiClient";
import { ProfileCompletionWidget } from "@/components/profile/ProfileCompletionWidget";
import { Spinner } from "@/components/ui/Spinner";
import { ShareDialog } from "@/components/sharing/ShareDialog";
import { Avatar } from "@/components/ui/Avatar";
import AIGenerateButton from "@/components/ui/AIGenerateButton";
import {
  BadgeCheck, Save, Trophy, AlertTriangle, MapPin, Briefcase, Upload, RefreshCw, Share, Clock
} from "lucide-react";
import { usePublicSettings } from "@/features/settings/api";

const schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name is too long"),
  username: z.string().min(3, "Username too short").regex(/^[a-zA-Z0-9_-]+$/, "Username may only contain letters, numbers, underscores, and hyphens"),
  headline: z.string().optional(),
  bio: z.string().optional(),
  niches: z.array(z.string()).min(1, "Pick at least one niche").max(3),
  location: z.string().optional(),
  yearsExperience: z.number({ invalid_type_error: "Must be a number" }).min(0, "Cannot be negative").max(100, "Invalid years of experience").optional(),
});

type FormValues = z.infer<typeof schema>;

function formatCompactNumber(number: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(number);
}

function PromoterProfileInner() {
  const { user, refreshUser } = useAuth();
  const { data: profile, isLoading } = usePromoterProfile();
  const createProfile = useCreatePromoterProfile();
  const updateProfile = useUpdatePromoterProfile();
  const uploadAvatarMutation = useUpload("avatar");
  
  const { data: completionData, isLoading: completionLoading } = useProfileCompletion();
  const { data: followStatus } = useFollowStatus(user?.id ?? "");
  const realFollowers = followStatus?.followersCount ?? profile?.followersCount ?? 0;
  const { data: myVerificationRequests } = useMyVerificationRequests();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  useEffect(() => {
    if (myVerificationRequests?.some((r) => r.status === "PENDING")) {
      setPendingVerification(true);
    }
  }, [myVerificationRequests]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data: settingsData } = usePublicSettings();
  const nicheSetting = settingsData?.find((s) => s.settingKey === "promoter_niches");
  const NICHE_OPTIONS = nicheSetting 
    ? nicheSetting.settingValue.split(",").map((n: string) => ({ value: n.trim(), label: n.trim().replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) }))
    : [{ value: "OTHER", label: "Other" }];

  const hasProfile = !!profile;

  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty, isSubmitting, errors },
    reset,
    getValues,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: profile?.fullName || user?.fullName || "",
      username: profile?.username || user?.username || "",
      headline: profile?.headline || "",
      bio: profile?.bio || "",
      niches: profile?.niches?.length ? profile.niches : profile?.niche ? [profile.niche] : [],
      location: profile?.location || "",
      yearsExperience: profile?.yearsExperience || 0,
    },
  });

  const headline = watch("headline");
  const niches = watch("niches") ?? [];
  const location = watch("location");
  const yearsExperience = watch("yearsExperience");

  const hasEnoughDetails = !!((niches?.length ?? 0) > 0 && location);
  const disableGenerateReason = "Please fill out your Niches and Location in the Creator Details section before generating!";

  const aiContext = [
    (niches?.length ?? 0) > 0 && `Niches: ${niches.join(", ")}`,
    location && `Location: ${location}`,
    (profile?.followersCount ?? 0) > 0 && `Followers: ${profile?.followersCount}`,
    (profile?.engagementRate ?? 0) > 0 && `Engagement Rate: ${profile?.engagementRate}%`,
    (yearsExperience ?? 0) > 0 && `Years Experience: ${yearsExperience}`,
  ].filter(Boolean).join("\n");

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || user?.fullName || "",
        username: profile.username || user?.username || "",
        headline: profile.headline || "",
        bio: profile.bio || "",
        niches: profile.niches?.length ? profile.niches : profile.niche ? [profile.niche] : [],
        location: profile.location || "",
        yearsExperience: profile.yearsExperience || 0,
      });
    }
  }, [profile, reset, user]);

  const onSubmit = (data: FormValues) => {
    const payload: PromoterProfileInput = {
      ...data,
      niche: data.niches[0],
      yearsExperience: data.yearsExperience ? Number(data.yearsExperience) : undefined,
    };
    
    const mutation = hasProfile ? updateProfile : createProfile;
    mutation.mutate(payload, {
      onSuccess: () => {
        notifySuccess("Profile saved successfully");
        reset(data);
        refreshUser();
      },
      onError: () => notifyError("Failed to save profile"),
    });
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    setAvatarUploading(true);
    try {
      const res = await uploadAvatarMutation.mutateAsync(file);
      const values = getValues();
      const payload: PromoterProfileInput = { ...values, niche: values.niches[0], avatarUrl: res.url };
      const mutation = hasProfile ? updateProfile : createProfile;
      await mutation.mutateAsync(payload);
      refreshUser();
      notifySuccess("Avatar updated successfully");
    } catch {
      notifyError("Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onCameraClick = () => fileInputRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAvatarUpload(file);
  };

  const requestVerification = async () => {
    setVerifying(true);
    try {
      await api.post("/promoter/verification-request");
      notifySuccess("Verification request submitted!");
      setPendingVerification(true);
    } catch (err: any) {
      notifyApiError(err, "Failed to submit request");
    } finally {
      setVerifying(false);
    }
  };

  const isComplete = completionData?.completion === 100;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-32">
      {!hasProfile && (
        <div className="bg-amber-tag/10 border border-amber-tag/20 rounded-inputs p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-tag/10 flex items-center justify-center text-amber-tag shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-graphite">Profile Setup Required</h3>
              <p className="text-sm text-steel mt-0.5">Please complete and save your promoter profile to unlock all features.</p>
            </div>
          </div>
        </div>
      )}

      {/* SIGNATURE HERO BANNER */}
      <div className="relative overflow-hidden rounded-cards-lg border border-steel/10 bg-white p-8 shadow-product-card">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 120% at 100% 0%, rgba(182,203,253,0.5) 0%, rgba(240,244,254,0) 60%)" }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar with photo upload trigger */}
            <div className="relative group w-fit shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white overflow-hidden shadow-md bg-sky-wash flex items-center justify-center">
                {avatarUploading ? (
                  <Spinner />
                ) : (
                  <Avatar
                    src={profile?.avatarUrl}
                    initials={(user?.fullName?.[0] ?? "P").toUpperCase()}
                    size="lg"
                    className="w-full h-full text-3xl"
                    colorIndex={2}
                  />
                )}
              </div>
              <button
                type="button"
                onClick={onCameraClick}
                disabled={avatarUploading}
                title="Change avatar"
                className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-steel/20 rounded-full flex items-center justify-center text-graphite hover:text-signal-blue hover:bg-sky-wash transition-all shadow-sm disabled:opacity-50 opacity-0 group-hover:opacity-100"
              >
                <Upload size={13} />
              </button>
              <input type="file" ref={fileInputRef} onChange={onFileChange} accept="image/*" className="hidden" />
            </div>

            {/* Creator Identity */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-signal-blue font-mono uppercase tracking-wider">
                  Creator Profile
                </span>
                {profile?.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-status bg-emerald-status/10 px-2 py-0.5 rounded-pill border border-emerald-status/20">
                    <BadgeCheck size={12} /> Verified
                  </span>
                )}
              </div>

              {/* Full Name - Live Bound */}
              <h1 className="mt-1 truncate font-display text-2xl sm:text-3xl font-bold tracking-tight text-midnight-ink">
                {watch("fullName") || user?.fullName || "Creator Name"}
              </h1>

              {/* Headline */}
              <p className="text-xs sm:text-sm font-medium text-signal-blue mt-0.5">
                {headline || "Your awesome headline"}
              </p>

              {/* Badges / Metrics */}
              <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs font-medium text-ash">
                {(niches?.length ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 bg-sky-wash text-signal-blue px-2.5 py-0.5 rounded-pill font-semibold text-[11px] border border-signal-blue/20">
                    <Briefcase size={12} /> {NICHE_OPTIONS.find((o: any) => o.value === niches[0])?.label || niches[0]}
                    {niches.length > 1 && <span className="font-bold">+{niches.length - 1}</span>}
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1 bg-linen-canvas text-graphite px-2.5 py-0.5 rounded-pill text-[11px] border border-steel/15">
                    <MapPin size={12} className="text-ash" /> {location}
                  </span>
                )}
                <span className="text-[11px] text-ash">
                  <strong className="text-graphite font-semibold">{formatCompactNumber(realFollowers)}</strong> Followers
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-pill border border-steel/15 bg-white text-graphite hover:bg-sky-wash hover:border-signal-blue/30 hover:text-signal-blue text-xs font-semibold shadow-sm transition-all"
            >
              <Share size={14} /> Share
            </button>

            {pendingVerification || profile?.verified ? (
              <div className="inline-flex items-center gap-1.5 h-10 px-4 rounded-pill bg-emerald-status/10 text-emerald-status border border-emerald-status/20 text-xs font-semibold">
                <BadgeCheck size={14} /> {profile?.verified ? "Verified" : "Pending"}
              </div>
            ) : isComplete ? (
              <button
                type="button"
                onClick={requestVerification}
                disabled={verifying}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-pill bg-signal-blue/10 text-signal-blue text-xs font-semibold hover:bg-signal-blue/20 transition-all border border-signal-blue/20"
              >
                <Trophy size={14} /> Request Verification
              </button>
            ) : null}

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

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        <div className="flex-1 min-w-0 space-y-8">
          <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* General Info */}
            <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-custom/10 bg-linen-canvas/50">
                <h3 className="text-heading text-graphite">General Information</h3>
                <p className="text-sm text-ash mt-1">Basic details about you and your brand.</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-graphite">Full Name <span className="text-coral-alert">*</span></label>
                    <input
                      type="text"
                      {...register("fullName")}
                      placeholder="Your full name"
                      className={`w-full h-11 px-4 rounded-inputs border ${
                        errors.fullName
                          ? 'border-coral-alert focus:ring-coral-alert/10'
                          : 'border-slate-custom/20 focus:border-signal-blue focus:ring-signal-blue/10'
                      } focus:outline-none focus:ring-[3px] text-sm text-graphite`}
                    />
                    {errors.fullName && <p className="text-xs text-coral-alert">{errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-graphite">Username <span className="text-coral-alert">*</span></label>
                    <input type="text" {...register("username")} className={`w-full h-11 px-4 rounded-inputs border ${errors.username ? 'border-coral-alert focus:ring-coral-alert/10' : 'border-slate-custom/20 focus:border-signal-blue focus:ring-signal-blue/10'} focus:outline-none focus:ring-[3px] text-sm`} />
                    {errors.username && <p className="text-xs text-coral-alert">{errors.username.message}</p>}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-sm font-medium text-graphite">Creator Headline</label>
                      <AIGenerateButton 
                        title={user?.fullName || "Promoter"}
                        currentText={headline || ""}
                        contextData={aiContext}
                        disableGenerate={!hasEnoughDetails}
                        disableGenerateReason={disableGenerateReason}
                        contextType="creator headline"
                        onUpdate={(val) => setValue("headline", val, { shouldDirty: true })}
                      />
                    </div>
                    <input type="text" {...register("headline")} placeholder="e.g. Food & Travel Creator" className="w-full h-11 px-4 rounded-inputs border border-slate-custom/20 focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 text-sm" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-sm font-medium text-graphite">Bio</label>
                      <AIGenerateButton 
                        title={user?.fullName || "Promoter"}
                        currentText={watch("bio") || ""}
                        contextData={aiContext}
                        disableGenerate={!hasEnoughDetails}
                        disableGenerateReason={disableGenerateReason}
                        contextType="bio"
                        onUpdate={(val) => setValue("bio", val, { shouldDirty: true })}
                      />
                    </div>
                    <textarea {...register("bio")} rows={4} placeholder="Tell brands about yourself..." className="w-full p-4 rounded-inputs border border-slate-custom/20 focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 text-sm resize-none"></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Details */}
            <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-custom/10 bg-linen-canvas/50">
                <h3 className="text-heading text-graphite">Creator Details</h3>
                <p className="text-sm text-ash mt-1">Provide metrics and data for potential brand partners.</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-graphite">Niches <span className="text-coral-alert">*</span></label>
                    <p className="text-xs text-ash">Pick up to 3</p>
                    <div className="flex flex-wrap gap-2">
                      {NICHE_OPTIONS.map((opt: any) => {
                        const checked = niches.includes(opt.value);
                        const disabled = !checked && niches.length >= 3;
                        return (
                          <label
                            key={opt.value}
                            className={`inline-flex cursor-pointer items-center gap-2 rounded-button border px-3 py-1.5 text-sm font-medium transition-colors ${checked ? "border-signal-blue bg-sky-wash text-signal-blue" : "border-slate-custom/20 bg-white text-graphite"} ${disabled ? "cursor-not-allowed opacity-40" : "hover:border-signal-blue"}`}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-[#145aff]"
                              checked={checked}
                              disabled={disabled}
                              onChange={() => {
                                const next = checked
                                  ? niches.filter((n: string) => n !== opt.value)
                                  : [...niches, opt.value];
                                setValue("niches", next, { shouldDirty: true, shouldValidate: true });
                              }}
                            />
                            {opt.label}
                          </label>
                        );
                      })}
                    </div>
                    {errors.niches && <p className="text-xs text-coral-alert">{errors.niches.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-graphite">Location</label>
                    <input type="text" {...register("location")} placeholder="e.g. Kathmandu" className="w-full h-11 px-4 rounded-inputs border border-slate-custom/20 focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-graphite">Years of Experience</label>
                    <input type="number" {...register("yearsExperience", { valueAsNumber: true })} min="0" placeholder="e.g. 3" className="w-full h-11 px-4 rounded-inputs border border-slate-custom/20 focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 text-sm" />
                    {errors.yearsExperience && <p className="text-xs text-coral-alert">{errors.yearsExperience.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          </form>

          {hasProfile && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-heading-sm text-graphite mb-1">Portfolio</h3>
                  <p className="text-sm text-ash">Manage your past work and case studies.</p>
                </div>
                <Link href="/promoter/portfolio" className="px-4 py-2 bg-sky-wash text-signal-blue text-sm font-medium rounded-button hover:bg-sky-wash/80 transition-colors">
                  Manage Portfolio
                </Link>
              </div>
              <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-heading-sm text-graphite mb-1">Social Links</h3>
                  <p className="text-sm text-ash">Connect your channels to boost discoverability.</p>
                </div>
                <Link href="/promoter/social" className="px-4 py-2 bg-sky-wash text-signal-blue text-sm font-medium rounded-button hover:bg-sky-wash/80 transition-colors">
                  Manage Socials
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <ProfileCompletionWidget />

          <div className="bg-sky-wash/50 border border-slate-custom/10 rounded-cards p-6">
            <h4 className="text-sm font-semibold text-signal-blue flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-amber-tag" /> Tips for Discovery
            </h4>
            <ul className="space-y-3 text-sm text-ash font-medium">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-signal-blue mt-1.5 shrink-0" />
                <span>Add at least <strong>3 portfolio items</strong> to increase your chances of being hired.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-signal-blue mt-1.5 shrink-0" />
                <span>Link your <strong>primary social accounts</strong> so brands can verify your audience.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Floating Save Bar */}
      {isDirty && (
        <div className="animate-fade-slide-up fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <div className="bg-white border border-slate-custom/10 rounded-cards-lg p-4 shadow-feature-section flex items-center justify-between ring-1 ring-slate-custom/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-tag/10 flex items-center justify-center text-amber-tag">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-graphite">Unsaved changes</h4>
                <p className="text-xs text-ash mt-0.5">Please save your profile changes.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => profile && reset({
                  username: profile.username || user?.fullName || "",
                  headline: profile.headline || "",
                  bio: profile.bio || "",
                  niches: profile.niches?.length ? profile.niches : profile.niche ? [profile.niche] : [],
                  location: profile.location || "",
                  yearsExperience: profile.yearsExperience || 0,
                })}
                className="h-10 px-4 rounded-button text-sm font-medium text-ash hover:text-graphite hover:bg-sky-wash transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="h-10 px-6 rounded-button hero-blue-fade text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}

export default function PromoterProfilePage() {
  return (
    <RequireAuth role={Role.PROMOTER}>
      <PromoterProfileInner />
    </RequireAuth>
  );
}
