import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CampaignStatus, CampaignVisibility } from "../features/campaigns/types";
import { Input, Select, Textarea, Button } from "./ui";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import { usePlatformSettings } from "../features/settings/api";

const schema = z
  .object({
    title: z.string().min(1, "Title is required").max(255, "Title too long"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    category: z.string().min(1, "Category is required"),
    budget: z.coerce.number().positive("Budget must be greater than 0"),
    location: z.string().min(1, "Location is required"),
    target_audience: z.string().optional(),
    requirements: z.string().optional(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    visibility: z.nativeEnum(CampaignVisibility),
    status: z.nativeEnum(CampaignStatus).optional(),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      return new Date(data.end_date) >= new Date(data.start_date);
    },
    { message: "End date must be on or after start date", path: ["end_date"] },
  );

export type CampaignFormValues = z.infer<typeof schema>;

interface CampaignFormProps {
  defaultValues?: Partial<CampaignFormValues>;
  onSubmit: (data: CampaignFormValues) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

const visibilityOptions = [
  { value: CampaignVisibility.PUBLIC, label: "Public - Visible to all promoters" },
  { value: CampaignVisibility.PRIVATE, label: "Private - Invite only" },
];

const statusOptions = [
  { value: CampaignStatus.DRAFT, label: "Save as Draft" },
  { value: CampaignStatus.OPEN, label: "Publish (Open for applications)" },
];

export default function CampaignForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: CampaignFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const methods = useForm<CampaignFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      visibility: CampaignVisibility.PUBLIC,
      status: CampaignStatus.DRAFT,
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const { markClean } = useUnsavedChanges(methods);

  const { data: settingsData } = usePlatformSettings();
  const categorySetting = settingsData?.items.find((s) => s.setting_key === "campaign_categories");
  const categoryOptions = categorySetting 
    ? categorySetting.setting_value.split(",").map(c => ({ value: c.trim(), label: c.trim() }))
    : [{ value: "OTHER", label: "Other" }];

  const handleFormSubmit = (data: CampaignFormValues) => {
    markClean();
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      
      {/* 1. Basic Details */}
      <div className="bg-linen-canvas/50 border border-slate-custom/10 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-graphite mb-5 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-signal-blue text-white flex items-center justify-center text-xs">1</span>
          Basic Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <Input
              label="Campaign Title"
              error={errors.title?.message}
              {...register("title")}
              placeholder="e.g. Summer Kathmandu Streetwear Launch"
              className="bg-white"
            />
          </div>
          <div>
            <Select
              label="Category"
              error={errors.category?.message}
              options={[
                { value: "", label: "Select a category" },
                ...categoryOptions
              ]}
              {...register("category")}
              className="bg-white"
            />
          </div>
          <div>
            <Input
              label="Location"
              error={errors.location?.message}
              {...register("location")}
              placeholder="e.g. Kathmandu, Nepal or Remote"
              className="bg-white"
            />
          </div>
        </div>
      </div>

      {/* 2. Campaign Brief & Requirements */}
      <div className="bg-linen-canvas/50 border border-slate-custom/10 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-graphite mb-5 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-signal-blue text-white flex items-center justify-center text-xs">2</span>
          Campaign Brief & Requirements
        </h3>
        <div className="space-y-5">
          <Textarea
            label="Campaign Description"
            error={errors.description?.message}
            {...register("description")}
            rows={4}
            placeholder="Explain the campaign goals, deliverables, and why promoters should join..."
            className="bg-white"
          />
          <Input
            label="Target Audience"
            error={errors.target_audience?.message}
            {...register("target_audience")}
            placeholder="e.g. Gen Z, College students, Tech enthusiasts..."
            className="bg-white"
          />
          <Textarea
            label="Specific Requirements"
            error={errors.requirements?.message}
            {...register("requirements")}
            rows={3}
            placeholder="e.g. Must have 10k+ followers, 2 Instagram Reels, 1 TikTok post..."
            className="bg-white"
          />
        </div>
      </div>

      {/* 3. Logistics & Timeline */}
      <div className="bg-linen-canvas/50 border border-slate-custom/10 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-graphite mb-5 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-signal-blue text-white flex items-center justify-center text-xs">3</span>
          Logistics & Timeline
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <Input
              label="Budget (Rs.)"
              type="number"
              step="1"
              error={errors.budget?.message}
              {...register("budget")}
              placeholder="1000"
              className="bg-white"
            />
          </div>
          <div>
            <Input
              label="Start Date"
              type="date"
              min={today}
              error={errors.start_date?.message}
              {...register("start_date")}
              className="bg-white"
            />
          </div>
          <div>
            <Input
              label="End Date"
              type="date"
              error={errors.end_date?.message}
              {...register("end_date")}
              className="bg-white"
            />
          </div>
        </div>
      </div>

      {/* 4. Settings */}
      <div className="bg-linen-canvas/50 border border-slate-custom/10 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-graphite mb-5 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-signal-blue text-white flex items-center justify-center text-xs">4</span>
          Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Select
              label="Visibility"
              error={errors.visibility?.message}
              options={visibilityOptions}
              {...register("visibility")}
              className="bg-white"
            />
          </div>
          <div>
            <Select
              label="Status"
              error={errors.status?.message}
              options={statusOptions}
              {...register("status")}
              className="bg-white"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 pb-2">
        <Button
          type="submit"
          variant="primary-filled"
          className="w-full sm:w-auto px-10 h-12 rounded-inputs text-sm font-bold shadow-sm"
          loading={isSubmitting}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
