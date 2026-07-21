"use client";

import { useState, useRef, useEffect } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import api from "@/lib/apiClient";
import { ProfileCompletionWidget } from "@/components/profile/ProfileCompletionWidget";
import { SocialEditor } from "@/components/social/SocialEditor";
import { useBusinessProfile, useCreateBusinessProfile, useUpdateBusinessProfile } from "@/features/profile/api";
import { useMySocialLinks, useDeleteSocialLink } from "@/features/social/api";
import { useUpload } from "@/features/upload/api";
import { useProfileCompletion } from "@/features/profile-completion/api";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Building2, Globe, MapPin, Briefcase, Upload, Save, AlertTriangle, RefreshCw, BadgeCheck, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const { user } = useAuth();
  const router = useRouter();
  
  const { data: profile, isLoading } = useBusinessProfile();
  const { data: completion, isLoading: completionLoading } = useProfileCompletion();
  const { data: links } = useMySocialLinks();
  
  const createMutation = useCreateBusinessProfile();
  const updateMutation = useUpdateBusinessProfile();
  const logoUpload = useUpload("logo");
  const deleteLink = useDeleteSocialLink();
  
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [verifying, setVerifying] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [editingSocial, setEditingSocial] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
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
    } catch (err: any) {
      notifyError(err?.response?.data?.message ?? "Failed to update profile");
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
    } catch (err: any) {
      notifyError(err?.response?.data?.message ?? "Failed to upload logo");
    } finally {
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  };

  const requestVerification = async () => {
    setVerifying(true);
    try {
      await api.post("/business/verification-request");
      notifySuccess("Verification request submitted!");
      setPendingVerification(true);
    } catch (err: any) {
      notifyError(err?.response?.data?.message ?? "Failed to submit request");
    } finally {
      setVerifying(false);
    }
  };

  if (isLoading) return <Spinner />;

  const isComplete = completion?.completion === 100;
  const verified = profile?.verified;

  return (
    <RequireAuth role={Role.BUSINESS}>
      <div className="max-w-[1200px] mx-auto space-y-8 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-heading-lg text-midnight-ink">Business Profile</h1>
            <p className="text-body text-steel mt-2">Manage your company information and public presence.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-sky-wash rounded-button text-signal-blue font-semibold text-sm">
              <span>{completion?.completion ?? 0}% Complete</span>
            </div>
            {pendingVerification || verified ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-button bg-emerald-status/10 text-emerald-status border border-emerald-status/20 text-sm font-medium">
                <BadgeCheck size={16} /> {verified ? "Verified Business" : "Verification Pending"}
              </div>
            ) : isComplete ? (
              <button
                onClick={requestVerification}
                disabled={verifying}
                className="flex items-center gap-2 px-4 py-2 rounded-button bg-signal-blue/10 text-signal-blue text-sm font-medium hover:bg-signal-blue/20 transition-colors"
              >
                <BadgeCheck size={16} /> Request Verification
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-button bg-amber-tag/10 text-amber-tag border border-amber-tag/20 text-sm font-medium">
                <Clock size={16} /> Complete profile to verify
              </div>
            )}
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={!isDirty || isSubmitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-button text-sm font-medium transition-all shadow-feature-section ${
                isDirty && !isSubmitting
                  ? "hero-blue-fade text-white hover:opacity-90 hover:scale-[1.02]"
                  : "bg-slate-custom/5 text-steel cursor-not-allowed"
              }`}
            >
              {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-custom/10 rounded-cards-lg shadow-product-card flex flex-col relative overflow-hidden">
          <div className="h-32 sm:h-40 bg-gradient-to-r from-signal-blue to-signal-blue/80 relative">
            <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>
            {verified && (
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-button flex items-center gap-1.5 text-xs font-semibold text-white shadow-product-card-sm">
                <BadgeCheck size={16} /> Verified Business
              </div>
            )}
          </div>
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6">
              <div className="relative shrink-0 -mt-12 sm:-mt-16 z-10">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white shadow-sm flex items-center justify-center overflow-hidden">
                  {logoUpload.isPending ? (
                    <Spinner />
                  ) : profile?.logoUrl ? (
                    <img src={profile.logoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Avatar initials={profile?.companyName?.[0] || "C"} size="xl" colorIndex={0} />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-8 h-8 bg-white border border-slate-custom/10 rounded-full flex items-center justify-center text-graphite hover:text-signal-blue hover:bg-sky-wash transition-colors shadow-product-card-sm"
                >
                  <Upload size={14} />
                </button>
                <input type="file" ref={fileRef} onChange={onLogo} accept="image/*" className="hidden" />
              </div>
              <div className="flex-1 text-center sm:text-left sm:pb-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-graphite tracking-tight">
                  {profile?.companyName || "Your Company"}
                </h2>
                <p className="text-sm sm:text-base font-medium text-ash mt-1">{profile?.industry || "Industry not set"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-8">
          <div className="flex-1 min-w-0 space-y-8">
            <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-custom/10 bg-linen-canvas/50">
                  <h2 className="text-heading text-graphite">Company Information</h2>
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

              <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-custom/10 bg-linen-canvas/50">
                  <h2 className="text-heading text-graphite">Online Presence</h2>
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

              <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-custom/10 bg-linen-canvas/50">
                  <h2 className="text-heading text-graphite">About Company</h2>
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

            <Card>
              <div className="px-6 py-5 border-b border-slate-custom/10 bg-linen-canvas/50">
                <h2 className="text-heading text-graphite">Company Socials</h2>
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
            </Card>

          </div>

          <div className="lg:w-80 flex-shrink-0 space-y-6">
            <ProfileCompletionWidget />
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
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
                  className="px-6 h-10 hero-blue-fade text-white rounded-button text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </RequireAuth>
  );
}
