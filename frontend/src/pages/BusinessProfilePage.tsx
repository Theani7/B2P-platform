import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useBusinessProfile, useUpsertBusinessProfile } from "../features/profile/api";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { notifySuccess, notifyError } from "../hooks/useToast";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Building2,
  Globe,
  MapPin,
  FileText,
  Tag,
  Save,
} from "lucide-react";

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

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_name: profile?.company_name || "",
      industry: profile?.industry || "",
      description: profile?.description || "",
      location: profile?.location || "",
      website: profile?.website || "",
    },
  });

  const mutation = useUpsertBusinessProfile();

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data, {
      onSuccess: () => {
        notifySuccess("Profile saved successfully");
        qc.invalidateQueries({ queryKey: ["business-profile"] });
      },
      onError: () => notifyError("Failed to save profile"),
    });
  };

  if (profileLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-purple via-brand-indigo to-brand-purple-900 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white shadow-lg ring-1 ring-white/20">
            <Building2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-medium text-white">Business Profile</h1>
            <p className="text-sm text-white/70 mt-0.5">Manage your company information and public presence</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sections Nav */}
        <div className="space-y-3">
          <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-brand-purple-50 text-brand-purple font-medium text-sm">
              <Building2 size={18} />
              Company Info
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 text-sm">
              <Globe size={18} />
              Online Presence
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 text-sm">
              <FileText size={18} />
              Description
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-brand-purple-50/50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-purple-50 flex items-center justify-center">
                  <Building2 size={16} className="text-brand-purple" />
                </div>
                <h2 className="text-sm font-medium text-gray-900">Company Information</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Company Name */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building2 size={14} className="text-brand-purple" />
                  Company Name
                </Label>
                <div className="relative">
                  <Input
                    {...register("company_name")}
                    placeholder="Acme Inc."
                    className="pl-4"
                  />
                </div>
                {errors.company_name && (
                  <p className="text-xs text-brand-coral mt-1">{errors.company_name.message}</p>
                )}
              </div>

              {/* Industry */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Tag size={14} className="text-brand-purple" />
                  Industry
                </Label>
                <Input
                  {...register("industry")}
                  placeholder="Technology, Healthcare, Finance..."
                />
                {errors.industry && (
                  <p className="text-xs text-brand-coral mt-1">{errors.industry.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin size={14} className="text-brand-purple" />
                  Location
                </Label>
                <Input
                  {...register("location")}
                  placeholder="San Francisco, CA"
                />
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Globe size={14} className="text-brand-purple" />
                  Website
                </Label>
                <Input
                  {...register("website")}
                  type="url"
                  placeholder="https://acme.com"
                />
                {errors.website && (
                  <p className="text-xs text-brand-coral mt-1">{errors.website.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText size={14} className="text-brand-purple" />
                  Description
                </Label>
                <Textarea
                  {...register("description")}
                  rows={5}
                  placeholder="Tell promoters about your company, mission, and what kind of collaborations you're looking for..."
                  className="resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end pt-2 border-t border-gray-100">
                <Button
                  variant="cta"
                  loading={mutation.isPending}
                  type="submit"
                  className="flex items-center gap-2"
                >
                  <Save size={16} />
                  {mutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
