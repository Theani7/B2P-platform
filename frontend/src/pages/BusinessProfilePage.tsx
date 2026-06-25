import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { notifySuccess, notifyError } from "@/hooks/useToast";
import { TopBar } from "@/components/layout/TopBar";

const schema = z.object({
  company_name: z.string().min(1, "Company name required"),
  industry: z.string().min(1, "Industry required"),
  description: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
});

type FormValues = z.infer<typeof schema>;

interface BusinessProfilePageProps {
  initialData?: Partial<FormValues>;
}

export default function BusinessProfilePage({ initialData }: BusinessProfilePageProps) {
  const { register, handleSubmit } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initialData });
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: FormValues) => fetch("/api/v1/business/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { notifySuccess("Profile saved"); qc.invalidateQueries({ queryKey: ["business-profile"] }); },
    onError: () => notifyError("Failed to save profile"),
  });

  return (
    <div>
      <TopBar pageTitle="Business Profile" />
      <Card padding="lg">
        <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-5">
          <div className="space-y-1">
            <Label>Company Name</Label>
            <Input {...register("company_name")} />
          </div>
          <div className="space-y-1">
            <Label>Industry</Label>
            <Input {...register("industry")} />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea {...register("description")} rows={4} />
          </div>
          <div className="space-y-1">
            <Label>Location</Label>
            <Input {...register("location")} />
          </div>
          <div className="space-y-1">
            <Label>Website</Label>
            <Input {...register("website")} type="url" />
          </div>
          <Button variant="cta" disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </Card>
    </div>
  );
}