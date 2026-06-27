import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CampaignStatus, CampaignVisibility } from "../features/campaigns/types";
import { Input, Select, Textarea, Button } from "./ui";

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
  { value: CampaignVisibility.PUBLIC, label: "Public" },
  { value: CampaignVisibility.PRIVATE, label: "Private" },
];

const statusOptions = [
  { value: CampaignStatus.DRAFT, label: "Draft" },
  { value: CampaignStatus.OPEN, label: "Open for applications" },
];

export default function CampaignForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: CampaignFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      visibility: CampaignVisibility.PUBLIC,
      status: CampaignStatus.DRAFT,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Input
            label="Title"
            error={errors.title?.message}
            {...register("title")}
            placeholder="e.g. Summer Kathmandu Streetwear Launch"
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Description"
            error={errors.description?.message}
            {...register("description")}
            rows={4}
            placeholder="Explain the campaign goals, deliverables, and details..."
          />
        </div>

        <div>
          <Input
            label="Category"
            error={errors.category?.message}
            {...register("category")}
            placeholder="Fashion, Tech, Food..."
          />
        </div>

        <div>
          <Input
            label="Budget (Rs.)"
            type="number"
            step="1"
            error={errors.budget?.message}
            {...register("budget")}
            placeholder="1000"
          />
        </div>

        <div>
          <Input
            label="Location"
            error={errors.location?.message}
            {...register("location")}
            placeholder="Kathmandu, Nepal or Remote"
          />
        </div>

        <div>
          <Input
            label="Target Audience"
            error={errors.target_audience?.message}
            {...register("target_audience")}
            placeholder="Gen Z, College students, Tech enthusiasts..."
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Requirements"
            error={errors.requirements?.message}
            {...register("requirements")}
            rows={3}
            placeholder="Specific deliverables, posting frequency, hashtags..."
          />
        </div>

        <div>
          <Input
            label="Start Date"
            type="date"
            min={today}
            error={errors.start_date?.message}
            {...register("start_date")}
          />
        </div>

        <div>
          <Input
            label="End Date"
            type="date"
            error={errors.end_date?.message}
            {...register("end_date")}
          />
        </div>

        <div>
          <Select
            label="Visibility"
            error={errors.visibility?.message}
            options={visibilityOptions}
            {...register("visibility")}
          />
        </div>

        <div>
          <Select
            label="Status"
            error={errors.status?.message}
            options={statusOptions}
            {...register("status")}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button
          type="submit"
          variant="cta"
          loading={isSubmitting}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
