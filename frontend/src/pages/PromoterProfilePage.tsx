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
import {
  BadgeCheck, Save, Eye, Trophy, AlertTriangle, MapPin, Briefcase, Camera
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
      username: profile?.username || "",
      headline: profile?.headline || "",
      bio: profile?.bio || "",
      niche: (profile?.niche as FormValues["niche"]) || "OTHER",
      location: profile?.location || "",
    },
  });

  const methods = { register, handleSubmit, control, formState: { isDirty, isSubmitting, errors }, reset, getValues };
  const { markClean } = useUnsavedChanges(methods as any);

  const headline = useWatch({ control, name: "headline" });
  const niche = useWatch({ control, name: "niche" });
  const location = useWatch({ control, name: "location" });

  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username || "",
        headline: profile.headline || "",
        bio: profile.bio || "",
        niche: (profile.niche as FormValues["niche"]) || "OTHER",
        location: profile.location || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: FormValues) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        markClean();
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
    } catch {
      // error handled by mutation
    } finally {
      setAvatarUploading(false);
    }
  };

  const onCameraClick = () => fileInputRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAvatarUpload(file);
  };

  const isComplete = completionData?.percentage === 100;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-custom/10">
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
className={`inline-flex items-center gap-2 h-10 px-5 rounded-button text-sm font-medium transition-colors ${
               isDirty && !isSubmitting ? "hero-blue-fade text-white hover:opacity-90" : "bg-slate-custom/10 text-steel cursor-not-allowed"
             }`}
          >
            <Save size={16} /> {isSubmitting ? "Saving..." : "Save Changes"}
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

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0 space-y-8">
          <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card p-6">
              <h3 className="text-heading text-graphite mb-6">General Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-graphite">First Name</label>
                  <input type="text" disabled className="w-full h-11 px-4 rounded-inputs border border-slate-custom/10 bg-linen-canvas text-steel text-sm" value={user?.full_name?.split(' ')[0] || ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-graphite">Last Name</label>
                  <input type="text" disabled className="w-full h-11 px-4 rounded-inputs border border-slate-custom/10 bg-linen-canvas text-steel text-sm" value={user?.full_name?.split(' ')[1] || ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-graphite">Username <span className="text-coral-alert">*</span></label>
                  <input type="text" {...register("username")} className={`w-full h-11 px-4 rounded-inputs border ${errors.username ? 'border-coral-alert' : 'border-slate-custom/20'} focus:ring-[3px] focus:ring-signal-blue/10 text-sm`} />
                  {errors.username && <p className="text-xs text-coral-alert">{errors.username.message}</p>}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-graphite">Creator Headline</label>
                  <input type="text" {...register("headline")} placeholder="e.g. Food & Travel Creator" className="w-full h-11 px-4 rounded-inputs border border-slate-custom/20 focus:ring-[3px] focus:ring-signal-blue/10 text-sm" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-graphite">Bio</label>
                  <textarea {...register("bio")} rows={4} placeholder="Tell brands about yourself..." className="w-full p-4 rounded-inputs border border-slate-custom/20 focus:ring-[3px] focus:ring-signal-blue/10 text-sm resize-none"></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card p-6">
              <h3 className="text-heading text-graphite mb-6">Creator Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-graphite">Primary Niche <span className="text-coral-alert">*</span></label>
                  <select {...register("niche")} className="w-full h-11 px-4 rounded-inputs border border-slate-custom/20 focus:ring-[3px] focus:ring-signal-blue/10 text-sm bg-white">
                    {NICHE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-graphite">Location</label>
                  <input type="text" {...register("location")} placeholder="e.g. Kathmandu" className="w-full h-11 px-4 rounded-inputs border border-slate-custom/20 focus:ring-[3px] focus:ring-signal-blue/10 text-sm" />
                </div>
              </div>
            </div>
          </form>

          {user?.has_profile && (
            <>
              <PortfolioSettings />
              <SocialSettings />
            </>
          )}
        </div>

        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-signal-blue to-signal-blue/80 relative">
                {profile?.verified && (
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-button flex items-center gap-1 text-xs font-medium text-white">
                    <BadgeCheck size={14} /> Verified
                  </div>
                )}
              </div>
              <div className="p-6 pt-0 flex flex-col items-center text-center -mt-12 relative z-10">
                <div className="relative mb-3">
                  {avatarUploading ? (
                    <div className="w-20 h-20 rounded-full bg-sky-wash border-2 border-dashed border-slate-custom/20 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-signal-blue border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-product-card flex items-center justify-center overflow-hidden">
                      <Avatar initials={user?.full_name?.[0] || 'U'} src={profile?.avatar_url} size="lg" colorIndex={1} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={onCameraClick}
                    disabled={avatarUploading}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center border border-slate-custom/20 hover:bg-sky-wash transition-colors text-steel disabled:opacity-50"
                  >
                    <Camera size={14} />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                </div>
                <h3 className="text-heading text-graphite">
                  {user?.full_name || 'Creator Name'}
                </h3>
                <p className="text-sm font-medium text-signal-blue mt-1">
                  {headline || 'Your awesome headline'}
                </p>
                <div className="flex items-center justify-center gap-3 mt-3 text-xs text-steel">
                  {niche && (
                    <span className="inline-flex items-center gap-1 bg-sky-wash px-2 py-1 rounded-button font-medium text-graphite">
                      <Briefcase size={12} /> {NICHE_OPTIONS.find(o => o.value === niche)?.label || niche}
                    </span>
                  )}
                  {location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {location}
                    </span>
                  )}
                </div>

                <div className="w-full grid grid-cols-2 gap-2 mt-6 pt-6 border-t border-slate-custom/10">
                  <div className="text-center">
                    <div className="text-heading text-graphite">{profile?.followers_count ? (profile.followers_count / 1000).toFixed(1) + 'k' : '---'}</div>
                    <div className="text-caption text-ash font-medium uppercase tracking-wider">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-heading text-graphite">{profile?.engagement_rate ? profile.engagement_rate + '%' : '---'}</div>
                    <div className="text-caption text-ash font-medium uppercase tracking-wider">Engagement</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden">
              <ProfileCompletionWidget data={completionData} isLoading={completionLoading} />
            </div>

            <div className="bg-sky-wash/50 border border-slate-custom/10 rounded-cards p-5">
              <h4 className="text-sm font-medium text-graphite flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-amber-tag" /> Tips for Discovery
              </h4>
              <ul className="space-y-2 text-sm text-ash">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-signal-blue mt-2 shrink-0" />
                  Add at least 3 portfolio items to increase your chances of being hired.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-signal-blue mt-2 shrink-0" />
                  Link your primary social accounts so brands can verify your audience.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

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
                <div className="w-10 h-10 rounded-full bg-signal-blue/10 flex items-center justify-center text-signal-blue">
                  <Save size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-graphite">Unsaved changes</h4>
                  <p className="text-xs text-ash">Please save your profile changes.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => profile && reset(profile)} className="h-10 px-4 rounded-button text-sm font-medium text-ash hover:text-graphite hover:bg-sky-wash transition-colors">
                  Discard
                </button>
                <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="h-10 px-6 rounded-button hero-blue-fade text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
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
