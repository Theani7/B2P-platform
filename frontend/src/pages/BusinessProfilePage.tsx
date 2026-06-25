import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useBusinessProfile, useUpsertBusinessProfile } from "../features/profile/api";
import { useAuth } from "../providers/AuthProvider";
import { Button, Input, Label, Textarea, PageHeader } from "@/components/ui";
import { notifySuccess, notifyError } from "../hooks/useToast";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Building2,
  Globe,
  MapPin,
  FileText,
  Tag,
  Save,
  Info,
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
  const { user } = useAuth();
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
      <PageHeader
        title="Business Profile"
        description="Manage your company information and public presence"
      />

      {/* Profile Setup Warning Banner */}
      {!user?.has_profile && (
        <div className="bg-brand-amber-50 border border-brand-amber/20 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-amber-500/10 flex items-center justify-center text-brand-amber flex-shrink-0">
            <Info size={16} />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-amber-900">Profile Setup Required</p>
            <p className="text-xs text-brand-amber-900/70 mt-0.5">
              Please complete and save your company profile to unlock all sections, including the dashboard, campaigns, and collaborations.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sections Nav */}
        <div className="space-y-3">
          <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-1">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-purple-50 text-brand-purple-900 font-medium text-sm">
              <Building2 size={16} />
              Company Info
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 text-sm cursor-pointer">
              <Globe size={16} />
              Online Presence
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 text-sm cursor-pointer">
              <FileText size={16} />
              Description
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-brand-purple" />
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
