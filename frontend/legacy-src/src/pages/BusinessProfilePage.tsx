import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useBusinessProfile, useUpsertBusinessProfile, uploadLogo, useRequestBusinessVerification } from "../features/profile";
import { useBusinessProfileCompletion } from "../features/profile-completion";
import { ProfileCompletionWidget, Avatar } from "../components/ui";
import { SocialSettings } from "../components/social/SocialSettings";
import { VerificationModal } from "../components/profile/VerificationModal";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { useCurrentUser } from "../features/auth/api";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import { usePlatformSettings } from "../features/settings/api";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Building2, Globe, MapPin, Briefcase,
  Upload, Save, AlertTriangle, RefreshCw, BadgeCheck, Clock, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const schema = z.object({
  company_name: z.string().min(1, "Company name required"),
  industry: z.string().min(1, "Industry required"),
  description: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function BusinessProfilePage() {
  const qc = useQueryClient();
  const { data: user } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useBusinessProfile();
  const requestVerification = useRequestBusinessVerification();
  const [logoUploading, setLogoUploading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: completionData, isLoading: completionLoading } = useBusinessProfileCompletion();

  const { data: settingsData } = usePlatformSettings();
  const industrySetting = settingsData?.items.find((s) => s.setting_key === "industries");
  const industryOptions = industrySetting 
    ? industrySetting.setting_value.split(",").map(i => i.trim())
    : ["Technology", "Fashion", "Food", "Other"];

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: profile || {
      company_name: "",
      industry: "",
      description: "",
      location: "",
      website: "",
    },
  });

  // Keep form in sync when profile loads
  useEffect(() => {
    if (profile && !isDirty) {
      reset(profile);
    }
  }, [profile, reset, isDirty]);

  useUnsavedChanges(isDirty);

  const upsertProfile = useUpsertBusinessProfile();

  const onSubmit = async (data: FormValues) => {
    try {
      await upsertProfile.mutateAsync(data);
      notifySuccess("Profile updated successfully");
      reset(data);
      qc.invalidateQueries({ queryKey: ["business-profile-completion"] });
    } catch (err: any) {
      notifyError(err.message || "Failed to update profile");
    }
  };

  const onCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notifyError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notifyError("Image size should be less than 5MB");
      return;
    }

    try {
      setLogoUploading(true);
      const url = await uploadLogo(file);
      const currentValues = getValues();
      await upsertProfile.mutateAsync({ ...currentValues, logo_url: url });
      await qc.invalidateQueries({ queryKey: ["business-profile"] });
      await qc.invalidateQueries({ queryKey: ["business-profile-completion"] });
      notifySuccess("Logo updated successfully");
    } catch (err: any) {
      notifyError(err.message || "Failed to upload logo");
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const isComplete = completionData?.percentage === 100;

  const handleRequestVerification = () => {
    requestVerification.mutate(undefined, {
      onSuccess: () => {
        notifySuccess("Verification request submitted!");
        setShowVerificationModal(false);
        qc.invalidateQueries({ queryKey: ["business-profile"] });
      },
      onError: (err: any) => notifyError(err?.response?.data?.detail || "Failed to submit request"),
    });
  };

  if (profileLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-heading-lg text-midnight-ink">Business Profile</h1>
          <p className="text-body text-steel mt-2">Manage your company information and public presence.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-sky-wash rounded-button text-signal-blue font-semibold text-sm">
            <span>{completionData?.percentage || 0}% Complete</span>
          </div>
          {profile?.has_pending_verification ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-button bg-amber-50 text-amber-600 border border-amber-200 text-sm font-medium">
              <Clock size={16} /> Verification Pending
            </div>
          ) : isComplete && !profile?.verified && (
            <button
              onClick={() => setShowVerificationModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-button bg-signal-blue/10 text-signal-blue text-sm font-medium hover:bg-signal-blue/20 transition-colors"
            >
              <BadgeCheck size={16} /> Request Verification
            </button>
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
          {profile?.verified && (
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-button flex items-center gap-1.5 text-xs font-semibold text-white shadow-product-card-sm">
              <BadgeCheck size={16} /> Verified Business
            </div>
          )}
        </div>
        
        <div className="px-6 sm:px-8 pb-6 sm:pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6">
            {/* Avatar container with negative margin */}
            <div className="relative shrink-0 -mt-12 sm:-mt-16 z-10">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white shadow-sm flex items-center justify-center">
                {logoUploading ? (
                  <div className="w-6 h-6 border-2 border-signal-blue border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Avatar initials={profile?.company_name?.[0] || 'C'} src={profile?.logo_url} size="xl" colorIndex={0} />
                )}
              </div>
              <button
                type="button"
                onClick={onCameraClick}
                className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-8 h-8 bg-white border border-slate-custom/10 rounded-full flex items-center justify-center text-graphite hover:text-signal-blue hover:bg-sky-wash transition-colors shadow-product-card-sm"
              >
                <Upload size={14} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            {/* Text details */}
            <div className="flex-1 text-center sm:text-left sm:pb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-graphite tracking-tight">{profile?.company_name || "Your Company"}</h2>
              </div>
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
                        {...register("company_name")}
                        className="w-full pl-11 pr-4 h-12 px-3 py-2 border border-slate-custom/20 rounded-inputs bg-white text-midnight-ink placeholder-fog focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 text-sm"
                        placeholder="Acme Inc."
                      />
                    </div>
                    {errors.company_name && <p className="text-xs text-coral-alert">{errors.company_name.message}</p>}
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
                          <option key={ind} value={ind}>{ind.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
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

          {user?.has_profile && (
            <div className="space-y-8 mt-8">
              <SocialSettings 
                title="Company Socials" 
                description="Connect your brand's social media accounts for promoters to check out."
              />
            </div>
          )}
        </div>
        
        <div className="lg:w-80 flex-shrink-0 space-y-6">
          <ProfileCompletionWidget data={completionData} isLoading={completionLoading} />
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

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSubmit={handleRequestVerification}
        isPending={requestVerification.isPending}
        title="Review Business Verification"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-ash uppercase tracking-wider block mb-1">Company Name</span>
              <span className="text-sm font-bold text-midnight-ink">{profile?.company_name}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-ash uppercase tracking-wider block mb-1">Industry</span>
              <span className="text-sm font-medium text-graphite">{profile?.industry}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-ash uppercase tracking-wider block mb-1">Location</span>
              <span className="text-sm font-medium text-graphite">{profile?.location || "Not provided"}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-ash uppercase tracking-wider block mb-1">Website</span>
              <span className="text-sm font-medium text-signal-blue">{profile?.website || "Not provided"}</span>
            </div>
          </div>
          {profile?.description && (
            <div>
              <span className="text-xs font-bold text-ash uppercase tracking-wider block mb-1">Description</span>
              <p className="text-sm text-graphite line-clamp-3">{profile.description}</p>
            </div>
          )}
        </div>
      </VerificationModal>
    </div>
  );
}
