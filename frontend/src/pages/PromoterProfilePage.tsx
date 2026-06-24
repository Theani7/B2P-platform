import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { notifySuccess, notifyError } from "@/hooks/useToast";

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
    <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-4">
      <div><Label>Username</Label><Input {...register("username")} /></div>
      <div><Label>Headline</Label><Input {...register("headline")} /></div>
      <div><Label>Bio</Label><Textarea {...register("bio")} /></div>
      <div><Label>Niche</Label><select {...register("niche")} className="w-full rounded border p-2">
        {["LIFESTYLE", "TECH", "FASHION", "FOOD", "TRAVEL", "FITNESS", "GAMING", "BUSINESS", "OTHER"].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
      <div><Label>Location</Label><Input {...register("location")} /></div>
      <Button disabled={mutation.isLoading} type="submit">{mutation.isLoading ? "Saving..." : "Save Profile"}</Button>
    </form>
  );
}