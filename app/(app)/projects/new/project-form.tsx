"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { createProject } from "../actions";

const formSchema = z.object({
  brandTemplateId: z.string().uuid("Pick a brand template"),
  script: z.string().min(20, "Script must be at least 20 characters").max(5000),
});

type FormValues = z.infer<typeof formSchema>;

type TemplateOption = {
  id: string;
  name: string;
  primaryColor: string;
};

export function ProjectForm({ templates }: { templates: TemplateOption[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandTemplateId: templates[0]?.id ?? "",
      script: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const result = await createProject(values);
    if (!result.ok) {
      toast.error(result.error);
      setSubmitting(false);
      return;
    }
    toast.success("Project queued — director planning scenes...");
    router.push(`/projects/${result.projectId}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>Brand template</Label>
        <Controller
          control={control}
          name="brandTemplateId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-sm border"
                        style={{ backgroundColor: t.primaryColor }}
                      />
                      {t.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.brandTemplateId && (
          <p className="text-xs text-destructive">
            {errors.brandTemplateId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="script">Script</Label>
        <Textarea
          id="script"
          rows={10}
          placeholder="Paste 50-300 words. The director will split this into 3-12 scenes."
          {...register("script")}
        />
        {errors.script && (
          <p className="text-xs text-destructive">{errors.script.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Aspect ratios</Label>
        <div className="rounded-md border p-3 text-sm text-muted-foreground">
          All projects render in 16:9, 9:16, and 1:1. Per-aspect selection
          coming post-MVP.
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/projects")}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit project"}
        </Button>
      </div>
    </form>
  );
}
