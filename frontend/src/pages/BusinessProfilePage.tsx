import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { notifySuccess, notifyError } from "@/hooks/useToast";

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
    <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-4">
      <div><Label>Company Name</Label><Input {...register("company_name")} /></div>
      <div><Label>Industry</Label><Input {...register("industry")} /></div>
      <div><Label>Description</Label><Textarea {...register("description")} /></div>
      <div><Label>Location</Label><Input {...register("location")} /></div>
      <div><Label>Website</Label><Input {...register("website")} type="url" /></div>
      <Button disabled={mutation.isLoading} type="submit">{mutation.isLoading ? "Saving..." : "Save Profile"}</Button>
    </form>
  );
}