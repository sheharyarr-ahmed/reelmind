"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { FONT_WHITELIST } from "@/src/lib/fonts";
import { createClient } from "@/src/lib/supabase/client";
import {
  createBrandTemplate,
  updateBrandTemplate,
  getLogoUploadUrl,
} from "./actions";

const HEX = /^#[0-9a-fA-F]{6}$/;

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  primaryColor: z.string().regex(HEX, "Hex color like #1a2b3c"),
  secondaryColor: z.string().regex(HEX, "Hex color like #1a2b3c"),
  accentColor: z.string().regex(HEX, "Hex color like #1a2b3c"),
  headingFont: z.enum(FONT_WHITELIST as unknown as [string, ...string[]]),
  bodyFont: z.enum(FONT_WHITELIST as unknown as [string, ...string[]]),
  logoUrl: z.string().url().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

type Mode =
  | { kind: "create" }
  | { kind: "edit"; id: string; defaults: FormValues };

const DEFAULTS: FormValues = {
  name: "",
  primaryColor: "#0F172A",
  secondaryColor: "#64748B",
  accentColor: "#3B82F6",
  headingFont: "Inter",
  bodyFont: "Inter",
  logoUrl: null,
};

export function BrandTemplateForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const tempTemplateId = useState(() => crypto.randomUUID())[0];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: mode.kind === "edit" ? mode.defaults : DEFAULTS,
  });

  const logoUrl = watch("logoUrl");

  async function handleLogoChange(file: File | null) {
    if (!file) {
      setValue("logoUrl", null, { shouldValidate: true });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const templateId =
        mode.kind === "edit" ? mode.id : tempTemplateId;
      const { signedUrl, publicUrl } = await getLogoUploadUrl(
        templateId,
        ext,
      );

      const upload = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!upload.ok) {
        throw new Error(`Upload failed: ${upload.status}`);
      }

      setValue("logoUrl", publicUrl, { shouldValidate: true });
      toast.success("Logo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      if (mode.kind === "create") {
        await createBrandTemplate(values);
        toast.success("Brand template created");
      } else {
        await updateBrandTemplate(mode.id, values);
        toast.success("Brand template updated");
      }
      router.push("/brand-templates");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Acme Co." {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <ColorField
          label="Primary"
          register={register("primaryColor")}
          watched={watch("primaryColor")}
          error={errors.primaryColor?.message}
        />
        <ColorField
          label="Secondary"
          register={register("secondaryColor")}
          watched={watch("secondaryColor")}
          error={errors.secondaryColor?.message}
        />
        <ColorField
          label="Accent"
          register={register("accentColor")}
          watched={watch("accentColor")}
          error={errors.accentColor?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FontField
          label="Heading font"
          name="headingFont"
          control={control}
          error={errors.headingFont?.message}
        />
        <FontField
          label="Body font"
          name="bodyFont"
          control={control}
          error={errors.bodyFont?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo</Label>
        {logoUrl && (
          <div className="flex items-center gap-3 rounded-md border p-3">
            <img
              src={logoUrl}
              alt="Logo preview"
              className="h-12 w-12 rounded object-contain"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleLogoChange(null)}
            >
              Remove
            </Button>
          </div>
        )}
        <Input
          id="logo"
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          disabled={uploading}
          onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
        />
        {uploading && (
          <p className="text-xs text-muted-foreground">Uploading...</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/brand-templates")}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || uploading}>
          {submitting
            ? "Saving..."
            : mode.kind === "create"
              ? "Create template"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function ColorField({
  label,
  register,
  watched,
  error,
}: {
  label: string;
  register: ReturnType<typeof useForm<FormValues>>["register"] extends (
    name: infer K,
  ) => infer R
    ? R
    : never;
  watched: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div
          className="h-9 w-9 shrink-0 rounded-md border"
          style={{ backgroundColor: HEX.test(watched) ? watched : undefined }}
        />
        <Input className="font-mono text-xs" {...register} />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function FontField({
  label,
  name,
  control,
  error,
}: {
  label: string;
  name: "headingFont" | "bodyFont";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_WHITELIST.map((font) => (
                <SelectItem key={font} value={font}>
                  <span style={{ fontFamily: font }}>{font}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
