import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useBusinessProfile, useUpsertBusinessProfile } from "../features/profile/api";
import { useAuth } from "../providers/AuthProvider";
import { notifySuccess, notifyError } from "../hooks/useToast";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Building2, Globe, MapPin, Briefcase, Image as ImageIcon,
  Upload, ShieldCheck, Bell, Lock, CreditCard, Trash2, Save,
  CheckCircle2, AlertCircle, RefreshCw, BadgeCheck
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
  { id: "brand", label: "Brand & Logo", icon: ImageIcon },
  { id: "online", label: "Online Presence", icon: Globe },
  { id: "about", label: "Description", icon: Briefcase },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
];

export default function BusinessProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useBusinessProfile();
  const [activeTab, setActiveTab] = useState("general");

  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm<FormValues>({
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

  const mutation = useUpsertBusinessProfile();

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data, {
      onSuccess: () => {
        notifySuccess("Profile updated successfully.");
        qc.invalidateQueries({ queryKey: ["business-profile"] });
        reset(data); // reset to new clean state
      },
      onError: () => notifyError("Failed to save profile."),
    });
  };

  if (profileLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  );

  // Calculate mock profile completion
  const requiredFields = ['company_name', 'industry', 'location', 'website', 'description'];
  const filledFields = requiredFields.filter(f => profile?.[f as keyof typeof profile]);
  const completionPercentage = Math.round((filledFields.length / requiredFields.length) * 100) || 20;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-32">
      {/* Top Header & Progress */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Business Profile</h1>
          <p className="text-sm text-gray-500 mt-1.5">Manage your company information and public presence.</p>
        </div>
        <div className="flex flex-col items-end gap-2 w-full md:w-72">
          <div className="flex items-center justify-between w-full text-sm font-semibold">
            <span className="text-gray-700">Profile Completion</span>
            <span className="text-primary-600">{completionPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${completionPercentage === 100 ? 'bg-emerald-500' : 'bg-primary-500'}`} 
            />
          </div>
          {completionPercentage < 100 && (
            <p className="text-xs text-gray-500 mt-1">Complete your profile to attract more promoters.</p>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl p-6 ring-1 ring-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative group/avatar cursor-pointer">
          {profile?.logo_url ? (
            <img src={profile.logo_url} alt="Logo" className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-md" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 group-hover/avatar:bg-gray-100 group-hover/avatar:border-primary-300 transition-colors shadow-sm">
              <ImageIcon size={24} className="mb-1" />
              <span className="text-[10px] font-medium">Upload Logo</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gray-900/60 rounded-2xl opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
            <Upload size={20} className="text-white" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h2 className="text-2xl font-bold text-gray-900">{profile?.company_name || "Your Company"}</h2>
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center" title="Verified Business">
              <BadgeCheck size={12} className="text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-primary-600 mt-1">{profile?.industry || "Industry not set"}</p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {profile?.location || "Location not set"}</span>
            <span className="flex items-center gap-1.5"><Globe size={14} /> {profile?.website ? "Website connected" : "No website"}</span>
          </div>
        </div>

        <div className="z-10 w-full md:w-auto">
          <button className="w-full md:w-auto px-5 h-10 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
            View Public Profile
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="lg:w-[280px] flex-shrink-0">
          <div className="sticky top-8 bg-white rounded-2xl ring-1 ring-gray-200 p-3 shadow-sm">
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? item.id === 'danger' ? "bg-red-50 text-red-700" : "bg-primary-50 text-primary-700" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={18} className={isActive ? (item.id === 'danger' ? "text-red-500" : "text-primary-600") : "text-gray-400"} />
                    {item.label}
                    {isActive && (
                      <motion.div layoutId="activeNav" className={`ml-auto w-1.5 h-1.5 rounded-full ${item.id === 'danger' ? 'bg-red-500' : 'bg-primary-600'}`} />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Profile Checklist Widget */}
          <div className="mt-6 bg-white rounded-2xl ring-1 ring-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Setup Checklist</h3>
            <div className="space-y-3">
              {[
                { key: 'company_name', label: 'Company Name' },
                { key: 'logo_url', label: 'Company Logo' },
                { key: 'description', label: 'Description' },
                { key: 'website', label: 'Website' },
                { key: 'industry', label: 'Industry' },
              ].map(item => {
                const isDone = !!profile?.[item.key as keyof typeof profile];
                return (
                  <div key={item.key} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${isDone ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-50 border-gray-200'}`}>
                      {isDone && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <span className={`text-sm ${isDone ? 'text-gray-900' : 'text-gray-500'}`}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Company Info Card */}
            <div className={`bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm overflow-hidden transition-opacity ${activeTab === 'general' ? 'opacity-100 block' : 'opacity-60 hidden lg:block'}`}>
              <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">Company Information</h2>
                <p className="text-sm text-gray-500 mt-1">Basic details about your business.</p>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Company Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building2 size={18} className="text-gray-400" />
                      </div>
                      <input
                        {...register("company_name")}
                        className="w-full pl-11 pr-4 h-12 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none"
                        placeholder="Acme Inc."
                      />
                    </div>
                    {errors.company_name && <p className="text-xs text-red-500">{errors.company_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Industry</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Briefcase size={18} className="text-gray-400" />
                      </div>
                      <input
                        {...register("industry")}
                        className="w-full pl-11 pr-4 h-12 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none"
                        placeholder="Technology, Fashion..."
                      />
                    </div>
                    {errors.industry && <p className="text-xs text-red-500">{errors.industry.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Headquarters Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <MapPin size={18} className="text-gray-400" />
                    </div>
                    <input
                      {...register("location")}
                      className="w-full pl-11 pr-4 h-12 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none"
                      placeholder="San Francisco, CA"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Online Presence Card */}
            <div className={`bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm overflow-hidden transition-opacity ${activeTab === 'online' ? 'opacity-100 block' : 'opacity-60 hidden lg:block'}`}>
              <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">Online Presence</h2>
                <p className="text-sm text-gray-500 mt-1">Links to your website and social profiles.</p>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Company Website</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Globe size={18} className="text-gray-400" />
                    </div>
                    <input
                      {...register("website")}
                      type="url"
                      className="w-full pl-11 pr-4 h-12 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none"
                      placeholder="https://acme.com"
                    />
                  </div>
                  {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className={`bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm overflow-hidden transition-opacity ${activeTab === 'about' ? 'opacity-100 block' : 'opacity-60 hidden lg:block'}`}>
              <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">About Company</h2>
                <p className="text-sm text-gray-500 mt-1">Tell promoters what your brand is all about.</p>
              </div>
              <div className="p-8 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-gray-900">Company Description</label>
                  </div>
                  <textarea
                    {...register("description")}
                    rows={6}
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none resize-none leading-relaxed"
                    placeholder="Describe your company mission, values, and what kind of influencers you're looking to partner with. Markdown is supported."
                  />
                  <p className="text-xs text-gray-400 text-right">Make it compelling to attract better talent.</p>
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between ring-1 ring-white/10 backdrop-blur-lg bg-gray-900/95">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Unsaved changes</p>
                  <p className="text-xs text-gray-400">Please save your profile to apply changes.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => reset()}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-50"
                >
                  Discard
                </button>
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="px-6 h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
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
