import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { usePromoterProfile, useUpsertPromoterProfile, useUploadAvatar } from "../features/profile";
import { usePromoterProfileCompletion } from "../features/profile-completion";
import { ProfileCompletionWidget } from "../components/ui";
import { PortfolioSettings } from "../components/portfolio/PortfolioSettings";
import { SocialSettings } from "../components/social/SocialSettings";
import { Avatar } from "../components/ui";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  BadgeCheck, Save, Eye, Trophy, AlertTriangle, MapPin, Briefcase, Camera, Upload, RefreshCw
} from "lucide-react";

const NICHE_OPTIONS = [
  { value: "LIFESTYLE", label: "Lifestyle" },
  { value: "TECH", label: "Tech" },
  { value: "FASHION", label: "Fashion" },
  { value: "FOOD", label: "Food" },
  { value: "TRAVEL", label: "Travel" },
  { value: "FITNESS", label: "Fitness" },
  { value: "GAMING", label: "Gaming" },
  { value: "BUSINESS", label: "Business" },
  { value: "OTHER", label: "Other" },
];

const schema = z.object({
  username: z.string().min(3, "Username too short"),
  headline: z.string().optional(),
  bio: z.string().optional(),
  niche: z.enum(["LIFESTYLE", "TECH", "FASHION", "FOOD", "TRAVEL", "FITNESS", "GAMING", "BUSINESS", "OTHER"]),
  location: z.string().optional(),
  followers_count: z.number({ invalid_type_error: "Must be a number" }).min(0, "Cannot be negative").optional(),
  engagement_rate: z.number({ invalid_type_error: "Must be a number" }).min(0, "Cannot be negative").max(100, "Cannot exceed 100").optional(),
});

type FormValues = z.infer<typeof schema>;

export default function PromoterProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = usePromoterProfile();
  const updateProfile = useUpsertPromoterProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const { data: completionData, isLoading: completionLoading } = usePromoterProfileCompletion();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty, isSubmitting, errors },
    reset,
    getValues,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: profile?.username || user?.username || "",
      headline: profile?.headline || "",
      bio: profile?.bio || "",
      niche: (profile?.niche as FormValues["niche"]) || "OTHER",
      location: profile?.location || "",
      followers_count: profile?.followers_count || 0,
      engagement_rate: profile?.engagement_rate || 0,
    },
  });

  const methods = { register, handleSubmit, control, formState: { isDirty, isSubmitting, errors }, reset, getValues };
  useUnsavedChanges(isDirty);

  const headline = useWatch({ control, name: "headline" });
  const niche = useWatch({ control, name: "niche" });
  const location = useWatch({ control, name: "location" });
  const followersCount = useWatch({ control, name: "followers_count" });
  const engagementRate = useWatch({ control, name: "engagement_rate" });

  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username || user?.username || "",
        headline: profile.headline || "",
        bio: profile.bio || "",
        niche: (profile.niche as FormValues["niche"]) || "OTHER",
        location: profile.location || "",
        followers_count: profile.followers_count || 0,
        engagement_rate: profile.engagement_rate || 0,
      });
    }
  }, [profile, reset, user]);

  const onSubmit = (data: FormValues) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        notifySuccess("Profile saved successfully");
        reset(data);
      },
      onError: () => notifyError("Failed to save profile"),
    });
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    setAvatarUploading(true);
    try {
      const url = await uploadAvatarMutation.mutateAsync(file);
      const currentValues = getValues();
      await updateProfile.mutateAsync({ ...currentValues, avatar_url: url });
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

  const isComplete = completionData?.percentage === 100;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-heading-lg text-midnight-ink">Promoter Profile</h1>
          <p className="text-body text-steel mt-2">Manage your public profile and improve your discoverability.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-sky-wash rounded-button text-signal-blue font-semibold text-sm">
            <span>{completionData?.percentage || 0}% Complete</span>
          </div>
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

      {!user?.has_profile && (
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

      {/* Hero Profile Banner */}
      <div className="bg-white border border-slate-custom/10 rounded-cards-lg shadow-product-card flex flex-col relative overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-signal-blue to-signal-blue/80 relative">
          <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>
          {profile?.verified && (
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-button flex items-center gap-1.5 text-xs font-semibold text-white shadow-product-card-sm">
              <BadgeCheck size={16} /> Verified Creator
            </div>
          )}
        </div>
        <div className="px-8 pb-6 pt-0 flex flex-col sm:flex-row items-center sm:items-end gap-6 relative z-10 -mt-12">
          <div className="relative">
            {avatarUploading ? (
              <div className="w-24 h-24 rounded-full bg-sky-wash border-4 border-white flex items-center justify-center shadow-product-card">
                <div className="w-6 h-6 border-2 border-signal-blue border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-product-card flex items-center justify-center overflow-hidden">
                <Avatar initials={user?.full_name?.[0] || 'U'} src={profile?.avatar_url} size="lg" colorIndex={1} />
              </div>
            )}
            <button
              type="button"
              onClick={onCameraClick}
              disabled={avatarUploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-slate-custom/10 rounded-full flex items-center justify-center text-graphite hover:text-signal-blue hover:bg-sky-wash transition-colors shadow-product-card-sm disabled:opacity-50"
            >
              <Upload size={14} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="flex-1 text-center sm:text-left pt-2 sm:pt-0 pb-2">
            <h2 className="text-heading-lg text-graphite">{user?.full_name || 'Creator Name'}</h2>
            <p className="text-sm font-medium text-signal-blue mt-1">{headline || 'Your awesome headline'}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs font-medium text-ash">
              {niche && (
                <span className="inline-flex items-center gap-1.5 bg-sky-wash text-signal-blue px-2.5 py-1 rounded-button">
                  <Briefcase size={12} /> {NICHE_OPTIONS.find(o => o.value === niche)?.label || niche}
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1.5 bg-slate-custom/5 text-graphite px-2.5 py-1 rounded-button border border-slate-custom/10">
                  <MapPin size={12} /> {location}
                </span>
              )}
              <span className="flex items-center gap-1.5 ml-2">
                <strong className="text-graphite">{followersCount ? (followersCount / 1000).toFixed(1) + 'k' : '0'}</strong> Followers
              </span>
              <span className="text-slate-custom/30">•</span>
              <span className="flex items-center gap-1.5">
                <strong className="text-graphite">{engagementRate ? engagementRate + '%' : '0%'}</strong> Engagement
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
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
                    <label className="text-sm font-medium text-graphite">First Name</label>
                    <input type="text" disabled className="w-full h-11 px-4 rounded-inputs border border-slate-custom/10 bg-slate-custom/5 text-steel text-sm cursor-not-allowed" value={user?.full_name?.split(' ')[0] || ""} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-graphite">Last Name</label>
                    <input type="text" disabled className="w-full h-11 px-4 rounded-inputs border border-slate-custom/10 bg-slate-custom/5 text-steel text-sm cursor-not-allowed" value={user?.full_name?.split(' ')[1] || ""} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-graphite">Username <span className="text-coral-alert">*</span></label>
                    <input type="text" {...register("username")} className={`w-full h-11 px-4 rounded-inputs border ${errors.username ? 'border-coral-alert focus:ring-coral-alert/10' : 'border-slate-custom/20 focus:border-signal-blue focus:ring-signal-blue/10'} focus:outline-none focus:ring-[3px] text-sm`} />
                    {errors.username && <p className="text-xs text-coral-alert">{errors.username.message}</p>}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-graphite">Creator Headline</label>
                    <input type="text" {...register("headline")} placeholder="e.g. Food & Travel Creator" className="w-full h-11 px-4 rounded-inputs border border-slate-custom/20 focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 text-sm" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-graphite">Bio</label>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-graphite">Primary Niche <span className="text-coral-alert">*</span></label>
                    <select {...register("niche")} className="w-full h-11 px-4 rounded-inputs border border-slate-custom/20 focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 text-sm bg-white">
                      {NICHE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-graphite">Location</label>
                    <input type="text" {...register("location")} placeholder="e.g. Kathmandu" className="w-full h-11 px-4 rounded-inputs border border-slate-custom/20 focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-graphite">Total Followers</label>
                    <input type="number" {...register("followers_count", { valueAsNumber: true })} min="0" placeholder="e.g. 15000" className="w-full h-11 px-4 rounded-inputs border border-slate-custom/20 focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 text-sm" />
                    {errors.followers_count && <p className="text-xs text-coral-alert">{errors.followers_count.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-graphite">Avg. Engagement Rate (%)</label>
                    <input type="number" step="0.1" {...register("engagement_rate", { valueAsNumber: true })} min="0" max="100" placeholder="e.g. 4.5" className="w-full h-11 px-4 rounded-inputs border border-slate-custom/20 focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 text-sm" />
                    {errors.engagement_rate && <p className="text-xs text-coral-alert">{errors.engagement_rate.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          </form>

          {user?.has_profile && (
            <div className="space-y-8">
              <PortfolioSettings />
              <SocialSettings />
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <ProfileCompletionWidget data={completionData} isLoading={completionLoading} />

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
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
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
                  onClick={() => profile && reset(profile as any)}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
