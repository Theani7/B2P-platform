import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePromoterProfile, useUpsertPromoterProfile } from "../features/profile/api";
import { Button, Input, Label, Textarea, Select, Card } from "../components/ui";
import { Sparkles, Save } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { notifySuccess, notifyError } from "../hooks/useToast";

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
  const { data: profile, isLoading: profileLoading } = usePromoterProfile();
  const mutation = useUpsertPromoterProfile();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: profile?.username || "",
      headline: profile?.headline || "",
      bio: profile?.bio || "",
      niche: (profile?.niche as FormValues["niche"]) || "OTHER",
      location: profile?.location || "",
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data, {
      onSuccess: () => notifySuccess("Profile saved successfully"),
      onError: () => notifyError("Failed to save profile"),
    });
  };

  if (profileLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="rounded-2xl bg-brand-teal p-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white">
            <Sparkles size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-medium text-white">Promoter Profile</h1>
            <p className="text-sm text-white/70 mt-0.5">Manage your public profile and discoverability</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card padding="lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <Label>Username</Label>
              <Input {...register("username")} />
              {errors.username && <p className="text-xs text-brand-coral mt-1">{errors.username.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Headline</Label>
              <Input {...register("headline")} placeholder="e.g. Food & Travel Creator" />
            </div>
            <div className="space-y-1">
              <Label>Bio</Label>
              <Textarea {...register("bio")} rows={4} placeholder="Tell businesses about yourself..." />
            </div>
            <div className="space-y-1">
              <Label>Niche</Label>
              <Select {...register("niche")} options={NICHE_OPTIONS} placeholder="Select your niche" />
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Input {...register("location")} placeholder="e.g. Kathmandu" />
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button variant="cta" loading={mutation.isPending} type="submit" className="flex items-center gap-2">
                <Save size={16} />
                {mutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}