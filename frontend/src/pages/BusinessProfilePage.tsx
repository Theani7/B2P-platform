import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useBusinessProfile, useUpsertBusinessProfile, uploadLogo } from "../features/profile";
import { useBusinessProfileCompletion } from "../features/profile-completion";
import { ProfileCompletionWidget, Avatar } from "../components/ui";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Building2, Globe, MapPin, Briefcase,
  Upload, Save, AlertTriangle, RefreshCw, BadgeCheck
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
  const { data: profile, isLoading: profileLoading } = useBusinessProfile();
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: completionData, isLoading: completionLoading } = useBusinessProfileCompletion();

  const {
    register,
    handleSubmit,
    reset,
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
    if (profile) {
      reset(profile);
    }
  }, [profile, reset]);

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
      await uploadLogo(file);
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
        <div className="h-32 bg-gradient-to-r from-signal-blue to-signal-blue/80 relative">
          <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>
        </div>
        <div className="px-8 pb-6 pt-0 flex flex-col sm:flex-row items-center sm:items-end gap-6 relative z-10 -mt-12">
          <div className="relative">
            {logoUploading ? (
              <div className="w-24 h-24 rounded-full bg-sky-wash border-4 border-white flex items-center justify-center shadow-product-card">
                <div className="w-6 h-6 border-2 border-signal-blue border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-product-card flex items-center justify-center overflow-hidden">
                <Avatar initials={profile?.company_name?.[0] || 'C'} src={profile?.logo_url} size="lg" colorIndex={0} />
              </div>
            )}
            <button
              type="button"
              onClick={onCameraClick}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-slate-custom/10 rounded-full flex items-center justify-center text-graphite hover:text-signal-blue hover:bg-sky-wash transition-colors shadow-product-card-sm"
            >
              <Upload size={14} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="flex-1 text-center sm:text-left pt-2 sm:pt-0 pb-2">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-heading-lg text-graphite">{profile?.company_name || "Your Company"}</h2>
              <div className="w-5 h-5 rounded-full bg-emerald-status flex items-center justify-center shadow-product-card-sm" title="Verified Business">
                <BadgeCheck size={12} className="text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-ash mt-1">{profile?.industry || "Industry not set"}</p>
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
                      <input
                        {...register("industry")}
                        className="w-full pl-11 pr-4 h-12 px-3 py-2 border border-slate-custom/20 rounded-inputs bg-white text-midnight-ink placeholder-fog focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 text-sm"
                        placeholder="Technology, Fashion..."
                      />
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
    </div>
  );
}
