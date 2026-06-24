import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CampaignStatus, CampaignVisibility } from "../features/campaigns/types";

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

export default function CampaignForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: CampaignFormProps) {
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
          <label className="block text-sm font-medium text-text">Title</label>
          <input
            {...register("title")}
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-danger">{errors.title.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text">Description</label>
          <textarea
            {...register("description")}
            rows={4}
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-danger">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text">Category</label>
          <input
            {...register("category")}
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
          {errors.category && (
            <p className="mt-1 text-sm text-danger">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text">Budget</label>
          <input
            {...register("budget")}
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
          {errors.budget && (
            <p className="mt-1 text-sm text-danger">{errors.budget.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text">Location</label>
          <input
            {...register("location")}
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-danger">{errors.location.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text">Target Audience</label>
          <input
            {...register("target_audience")}
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text">Requirements</label>
          <textarea
            {...register("requirements")}
            rows={3}
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text">Start Date</label>
          <input
            {...register("start_date")}
            type="date"
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
          {errors.start_date && (
            <p className="mt-1 text-sm text-danger">{errors.start_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text">End Date</label>
          <input
            {...register("end_date")}
            type="date"
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
          {errors.end_date && (
            <p className="mt-1 text-sm text-danger">{errors.end_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text">Visibility</label>
          <select
            {...register("visibility")}
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          >
            <option value={CampaignVisibility.PUBLIC}>Public</option>
            <option value={CampaignVisibility.PRIVATE}>Private</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text">Status</label>
          <select
            {...register("status")}
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          >
            <option value={CampaignStatus.DRAFT}>Draft</option>
            <option value={CampaignStatus.OPEN}>Open</option>
            <option value={CampaignStatus.ACTIVE}>Active</option>
            <option value={CampaignStatus.COMPLETED}>Completed</option>
            <option value={CampaignStatus.CANCELLED}>Cancelled</option>
            <option value={CampaignStatus.ARCHIVED}>Archived</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
