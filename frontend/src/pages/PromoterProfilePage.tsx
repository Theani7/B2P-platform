import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Input, Label, Textarea, Select } from "@/components/ui";
import { notifySuccess, notifyError } from "@/hooks/useToast";
import { TopBar } from "@/components/layout/TopBar";

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

export default function PromoterProfilePage({ initialData }: { initialData?: Partial<FormValues> }) {
  const { register, handleSubmit } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initialData });
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: FormValues) => fetch("/api/v1/promoter/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { notifySuccess("Profile saved"); qc.invalidateQueries({ queryKey: ["promoter-profile"] }); },
    onError: () => notifyError("Failed to save profile"),
  });

  return (
    <div>
      <TopBar pageTitle="Promoter Profile" />
      <Card padding="lg">
        <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-5">
          <div className="space-y-1">
            <Label>Username</Label>
            <Input {...register("username")} />
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
          <Button variant="cta" disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </Card>
    </div>
  );
}