import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { notifySuccess, notifyError } from "../hooks/useToast";
import {
  User, Images, Upload, BadgeCheck, Globe, Lock, Shield, Bell, Palette, Link as LinkIcon,
  BarChart3, Briefcase, Camera, Save, Settings, AlertCircle, Eye
} from "lucide-react";

import { useForm } from "react-hook-form";
import { usePromoterProfile, useUpsertPromoterProfile } from "../features/profile/api";

export default function PromoterSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const { data: profile, isLoading } = usePromoterProfile();
  const updateProfile = useUpsertPromoterProfile();

  const {
    register,
    handleSubmit,
    formState: { isDirty, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      headline: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        headline: profile.headline || "",
        bio: profile.bio || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: any) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        notifySuccess("Profile updated successfully");
        reset(data); // reset to new values to clear isDirty
      },
      onError: () => notifyError("Failed to update profile"),
    });
  };



  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-32">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm ring-1 ring-gray-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Settings size={28} className="text-primary-600"/> Settings
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-xl">Manage your creator profile, account and preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/profile`}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 h-11 px-5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Eye size={16} /> Preview Public Profile
          </Link>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || isSubmitting}
            className={`inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
              isDirty && !isSubmitting ? "bg-primary-600 text-white hover:bg-primary-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Save size={16} /> {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT SETTINGS NAVIGATION */}
        <div className="w-full lg:w-[320px] flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-4 sticky top-24">
            
            <div className="px-3 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Account Settings</div>
            <nav className="space-y-1 mb-6">
              {[
                { id: "profile", label: "Profile Information", icon: User },
                { id: "portfolio", label: "Portfolio", icon: Images },
                { id: "social", label: "Social Accounts", icon: Globe },
                { id: "categories", label: "Creator Categories", icon: Briefcase },
                { id: "analytics", label: "Audience & Analytics", icon: BarChart3 },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === item.id 
                    ? "bg-primary-50 text-primary-700" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon size={18} className={activeTab === item.id ? "text-primary-600" : "text-gray-400"} />
                  {item.label}
                  {activeTab === item.id && (
                    <motion.div layoutId="activeTabIndicator" className="w-1 h-5 bg-primary-600 rounded-full ml-auto" />
                  )}
                </button>
              ))}
            </nav>

            <div className="px-3 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Preferences</div>
            <nav className="space-y-1 mb-6">
              {[
                { id: "notifications", label: "Notification Preferences", icon: Bell },
                { id: "privacy", label: "Privacy", icon: Shield },
                { id: "security", label: "Security", icon: Lock },
                { id: "appearance", label: "Appearance", icon: Palette },
                { id: "connections", label: "Connected Accounts", icon: LinkIcon },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === item.id 
                    ? "bg-primary-50 text-primary-700" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon size={18} className={activeTab === item.id ? "text-primary-600" : "text-gray-400"} />
                  {item.label}
                  {activeTab === item.id && (
                    <motion.div layoutId="activeTabIndicator" className="w-1 h-5 bg-primary-600 rounded-full ml-auto" />
                  )}
                </button>
              ))}
            </nav>

            <div className="border-t border-gray-100 pt-4">
              <button onClick={() => setActiveTab("danger")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all">
                <AlertCircle size={18} className="text-red-500" />
                Danger Zone
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT RESPONSIVE CONTENT */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Profile Summary Card */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
                  <div className="h-32 bg-gray-100 relative">
                    <img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=320&fit=crop" alt="Cover" className="w-full h-full object-cover" />
                    <button className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-lg shadow-sm hover:bg-white text-gray-700 text-xs font-bold flex items-center gap-2">
                      <Camera size={14}/> Change Cover
                    </button>
                  </div>
                  <div className="p-8 pt-0 flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12 relative z-10">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 shadow-md flex items-center justify-center overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://i.pravatar.cc/150?img=47')" }}>
                      </div>
                      <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                        <Upload size={20}/>
                      </button>
                    </div>
                    <div className="flex-1 text-center sm:text-left pt-14 sm:pt-0">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2">
                        {user?.full_name || 'Creator Name'} <BadgeCheck size={20} className="text-blue-500"/>
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">@{profile?.username || "creator"} • {profile?.niche || "Niche not set"}</p>
                    </div>
                    <div className="w-full sm:w-auto p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Profile Status</p>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${profile ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {profile ? 'Created' : 'Not setup'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Information Form */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h3>
                  {isLoading ? (
                    <div className="h-40 flex items-center justify-center text-gray-400">Loading...</div>
                  ) : (
                    <form className="grid grid-cols-1 sm:grid-cols-2 gap-6" onSubmit={handleSubmit(onSubmit)}>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">First Name</label>
                        <input type="text" disabled className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm" value={user?.full_name?.split(' ')[0] || ""} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Last Name</label>
                        <input type="text" disabled className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm" value={user?.full_name?.split(' ')[1] || ""} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Email Address</label>
                        <input type="email" disabled className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm" value={user?.email || ""} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Username</label>
                        <input type="text" disabled className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm" value={profile?.username || ""} />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-bold text-gray-700">Creator Headline</label>
                        <input type="text" {...register("headline")} placeholder="e.g. Tech Reviewer & Gadget Enthusiast" className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-bold text-gray-700">Bio</label>
                        <textarea {...register("bio")} rows={4} placeholder="Tell brands about yourself..." className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"></textarea>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "social" && (
              <motion.div
                key="social"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">Social Accounts</h3>
                <p className="text-sm text-gray-500 mb-8">Connect your social media accounts to showcase your audience to brands.</p>
                
                <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Globe size={32} className="text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-900">Social Accounts</p>
                  <p className="text-xs text-gray-500 mt-1">Social account connection is coming soon.</p>
                </div>
              </motion.div>
            )}

            {/* Placeholder for other tabs to show it's functional */}
            {["portfolio", "categories", "analytics", "notifications", "privacy", "security", "appearance", "connections"].includes(activeTab) && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8 h-[600px] flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6"><Settings size={32}/></div>
                <h3 className="text-xl font-bold text-gray-900 capitalize mb-2">{activeTab.replace('-', ' ')} Settings</h3>
                <p className="text-sm text-gray-500 max-w-sm">This section is currently unavailable.</p>
              </motion.div>
            )}

            {activeTab === "danger" && (
              <motion.div
                key="danger"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-2xl shadow-sm ring-1 ring-red-200 p-8"
              >
                <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-600 mb-8">Irreversible and destructive actions for your account.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/50">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Deactivate Account</h4>
                      <p className="text-xs text-gray-600 mt-1">Temporarily hide your profile and campaigns.</p>
                    </div>
                    <button className="h-9 px-4 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors">Deactivate</button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
                    <div>
                      <h4 className="text-sm font-bold text-red-900">Delete Account</h4>
                      <p className="text-xs text-red-700/80 mt-1">Permanently delete your account and all data.</p>
                    </div>
                    <button className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors">Delete Account</button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* STICKY SAVE BAR */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between ring-1 ring-white/10 backdrop-blur-xl bg-gray-900/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                  <Save size={20}/>
                </div>
                <div>
                  <h4 className="text-sm font-bold">Unsaved changes</h4>
                  <p className="text-xs text-gray-400">Please save your profile changes.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => profile && reset(profile)} className="h-10 px-4 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                  Discard
                </button>
                <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="h-10 px-6 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-500 transition-colors shadow-lg disabled:opacity-50">
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
