import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useBusinessProfile, useUpsertBusinessProfile, uploadLogo } from "../features/profile";
import { useBusinessProfileCompletion } from "../features/profile-completion";
import { ProfileCompletionWidget } from "../components/ui";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Building2, Globe, MapPin, Briefcase, Image as ImageIcon,
  Upload, ShieldCheck, Bell, CreditCard, Trash2, Save,
  CheckCircle2, AlertTriangle, RefreshCw, BadgeCheck
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

const NAV_ITEMS = [
  { id: "general", label: "Company Information", icon: Building2 },
  { id: "online", label: "Online Presence", icon: Globe },
  { id: "about", label: "Description", icon: Briefcase },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
];

export default function BusinessProfilePage() {
  const qc = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useBusinessProfile();
  const [activeTab, setActiveTab] = useState("general");
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, getValues, formState: { errors, isDirty, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_name: "",
      industry: "",
      description: "",
      location: "",
      website: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        company_name: profile.company_name || "",
        industry: profile.industry || "",
        description: profile.description || "",
        location: profile.location || "",
        website: profile.website || "",
      });
    }
  }, [profile, reset]);

  const upsertProfile = useUpsertBusinessProfile();
  const methods = { register, handleSubmit, reset, getValues, formState: { errors, isDirty, isSubmitting } };
  const { markClean } = useUnsavedChanges(methods as any);

  const handleLogoUpload = async (file: File) => {
    if (!file) return;
    setLogoUploading(true);
    try {
      const url = await uploadLogo(file);
      const currentValues = getValues();
      upsertProfile.mutate(
        { ...currentValues, logo_url: url },
        {
          onSuccess: () => {
            notifySuccess("Logo uploaded successfully.");
            qc.invalidateQueries({ queryKey: ["business-profile"] });
          },
          onError: () => notifyError("Failed to update logo."),
        }
      );
    } catch {
      notifyError("Failed to upload logo.");
    } finally {
      setLogoUploading(false);
    }
  };

  const onLogoClick = () => fileInputRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLogoUpload(file);
  };
  const { data: completionData, isLoading: completionLoading } = useBusinessProfileCompletion();

  const onSubmit = (data: FormValues) => {
    upsertProfile.mutate(data, {
      onSuccess: () => {
        markClean();
        notifySuccess("Profile saved successfully.");
        qc.invalidateQueries({ queryKey: ["business-profile"] });
        reset(data);
      },
      onError: () => notifyError("Failed to save profile."),
    });
  };

  if (profileLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-heading-lg text-midnight-ink">Business Profile</h1>
          <p className="text-body text-steel mt-2">Manage your company information and public presence.</p>
        </div>
        <div className="flex flex-col items-end gap-2 w-full md:w-72">
        </div>
      </div>

      <div className="bg-white border border-slate-custom/10 rounded-cards-lg shadow-product-card flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="flex-1 text-center md:text-left z-10">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h2 className="text-heading text-graphite">{profile?.company_name || "Your Company"}</h2>
            <div className="w-5 h-5 rounded-full bg-emerald-status flex items-center justify-center" title="Verified Business">
              <BadgeCheck size={12} className="text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-signal-blue mt-1">{profile?.industry || "Industry not set"}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-72 flex-shrink-0">
          <div className="sticky top-8 bg-white border border-slate-custom/10 rounded-cards shadow-product-card p-3">
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-button text-sm font-medium transition-all ${
                      isActive
                        ? item.id === 'danger' ? "bg-coral-alert/10 text-coral-alert" : "bg-sky-wash text-signal-blue"
                        : "text-graphite hover:bg-sky-wash hover:text-signal-blue"
                    }`}
                  >
                    <Icon size={18} className={isActive ? (item.id === 'danger' ? "text-coral-alert" : "text-signal-blue") : "text-ash"} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-6">
            <ProfileCompletionWidget data={completionData} isLoading={completionLoading} />
          </div>
        </div>

        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {activeTab === 'general' && (
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
            )}

            {activeTab === 'online' && (
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
            )}

            {activeTab === 'about' && (
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
            )}

            {['notifications', 'security', 'billing', 'danger'].includes(activeTab) && (
              <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden flex flex-col items-center justify-center p-16 text-center">
                <div className="w-16 h-16 bg-sky-wash rounded-full flex items-center justify-center text-signal-blue mb-4 border border-slate-custom/10">
                  {activeTab === 'notifications' && <Bell size={32} />}
                  {activeTab === 'security' && <ShieldCheck size={32} />}
                  {activeTab === 'billing' && <CreditCard size={32} />}
                  {activeTab === 'danger' && <Trash2 size={32} />}
                </div>
                <h2 className="text-heading text-graphite mb-2 capitalize">{activeTab === 'danger' ? 'Danger Zone' : activeTab} settings</h2>
                <p className="text-sm text-ash max-w-sm">
                  This feature is currently under development. We're working hard to bring it to you soon!
                </p>
              </div>
            )}

          </form>
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
