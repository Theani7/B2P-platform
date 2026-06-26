import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { notifySuccess, notifyError } from "../hooks/useToast";
import {
  User, Images, Upload, BadgeCheck, Globe, Lock, Shield, Bell, Palette, Link as LinkIcon,
  BarChart3, Briefcase, Camera, Save, Settings, AlertCircle, Eye, Trophy, AlertTriangle, MapPin
} from "lucide-react";

import { useForm, useWatch } from "react-hook-form";
import { usePromoterProfile, useUpsertPromoterProfile } from "../features/profile/api";
import { usePromoterProfileCompletion } from "../features/profile-completion";
import { ProfileCompletionWidget } from "../components/ui";
import { PortfolioSettings } from "../components/portfolio/PortfolioSettings";
import { SocialSettings } from "../components/social/SocialSettings";
import { Avatar } from "../components/ui";

export default function PromoterSettingsPage() {
  const { user } = useAuth();

  const { data: profile, isLoading } = usePromoterProfile();
  const updateProfile = useUpsertPromoterProfile();
  const { data: completionData, isLoading: completionLoading } = usePromoterProfileCompletion();

  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      headline: "",
      bio: "",
      niche: "",
      location: "",
      experience_years: 0,
    },
  });

  // Watch form fields for live preview
  const headline = useWatch({ control, name: "headline" });
  const niche = useWatch({ control, name: "niche" });
  const location = useWatch({ control, name: "location" });

  useEffect(() => {
    if (profile) {
      reset({
        headline: profile.headline || "",
        bio: profile.bio || "",
        niche: profile.niche || "",
        location: profile.location || "",
        experience_years: profile.experience_years || 0,
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

  const isComplete = completionData?.percentage === 100;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-32">
      
      {/* COMPACT TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Promoter Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your public profile and improve your discoverability.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg text-primary-700 font-semibold text-sm">
            <span>{completionData?.percentage || 0}% Complete</span>
          </div>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || isSubmitting}
            className={`inline-flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold transition-colors shadow-sm ${
              isDirty && !isSubmitting ? "bg-primary-600 text-white hover:bg-primary-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Save size={16} /> {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* COMPACT PROFILE SETUP ALERT */}
      {!isComplete && !completionLoading && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Your profile is incomplete</h3>
              <p className="text-sm text-amber-700 mt-0.5">Complete your profile to unlock all features and improve your visibility to brands.</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="w-32 bg-amber-200 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${completionData?.percentage || 0}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* TWO-COLUMN DESKTOP LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN (70%) - CONTINUOUS SCROLL FORM */}
        <div className="flex-1 min-w-0 space-y-8">
          
          {/* GENERAL INFORMATION CARD */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">General Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            </div>
          </div>

          {/* CREATOR DETAILS CARD */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Creator Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Primary Niche</label>
                <select {...register("niche")} className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white">
                  <option value="">Select a niche...</option>
                  <option value="Technology">Technology</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Lifestyle">Lifestyle</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Location</label>
                <input type="text" {...register("location")} placeholder="e.g. Kathmandu, Nepal" className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Experience (Years)</label>
                <input type="number" {...register("experience_years", { valueAsNumber: true })} min="0" max="50" className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" />
              </div>
            </div>
          </div>

          {/* PORTFOLIO & SOCIAL COMPONENTS (Self-contained cards) */}
          <PortfolioSettings />
          <SocialSettings />

        </div>

        {/* RIGHT COLUMN (30%) - STICKY SIDEBAR */}
        <div className="w-full lg:w-[360px] flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            
            {/* LIVE PROFILE PREVIEW */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary-600 to-primary-400 relative">
                {profile?.verified && (
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-white">
                    <BadgeCheck size={14} /> Verified
                  </div>
                )}
              </div>
              <div className="p-6 pt-0 flex flex-col items-center text-center -mt-12 relative z-10">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center overflow-hidden">
                    <Avatar initials={user?.full_name?.[0] || 'U'} size="lg" colorIndex={1} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {user?.full_name || 'Creator Name'}
                </h3>
                <p className="text-sm font-medium text-primary-600 mt-1">
                  {headline || 'Your awesome headline'}
                </p>
                <div className="flex items-center justify-center gap-3 mt-3 text-xs text-gray-500">
                  {niche && (
                    <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md font-bold">
                      <Briefcase size={12} /> {niche}
                    </span>
                  )}
                  {location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {location}
                    </span>
                  )}
                </div>

                <div className="w-full grid grid-cols-2 gap-2 mt-6 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{profile?.followers_count ? (profile.followers_count / 1000).toFixed(1) + 'k' : '---'}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{profile?.engagement_rate ? profile.engagement_rate + '%' : '---'}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Engagement</div>
                  </div>
                </div>

                <Link 
                  to={`/promoters/${profile?.username}`}
                  className="mt-6 w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={16} /> View Public Profile
                </Link>
              </div>
            </div>

            {/* PROFILE COMPLETION WIDGET */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
               <ProfileCompletionWidget data={completionData} isLoading={completionLoading} />
            </div>

            {/* QUICK TIPS */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-blue-600" /> Tips for Discovery
              </h4>
              <ul className="space-y-2 text-sm text-blue-800/80">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  Add at least 3 portfolio items to increase your chances of being hired.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  Link your primary social accounts so brands can verify your audience.
                </li>
              </ul>
            </div>

          </div>
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
