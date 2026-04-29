"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { deleteBrandTemplate } from "./actions";

type Template = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  logoUrl: string | null;
};

export function BrandTemplateCard({ template }: { template: Template }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteBrandTemplate(template.id);
      toast.success("Brand template deleted");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <CardTitle>{template.name}</CardTitle>
        {template.logoUrl && (
          <img
            src={template.logoUrl}
            alt={`${template.name} logo`}
            className="h-10 w-10 rounded object-contain"
          />
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Swatch color={template.primaryColor} label="Primary" />
          <Swatch color={template.secondaryColor} label="Secondary" />
          <Swatch color={template.accentColor} label="Accent" />
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            Heading:{" "}
            <span style={{ fontFamily: template.headingFont }}>
              {template.headingFont}
            </span>
          </p>
          <p>
            Body:{" "}
            <span style={{ fontFamily: template.bodyFont }}>
              {template.bodyFont}
            </span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/brand-templates/${template.id}/edit`}>Edit</Link>
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete brand template</DialogTitle>
              <DialogDescription>
                Permanently delete <strong>{template.name}</strong>. Projects
                using this template will lose its reference. This cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="h-8 w-8 rounded border"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
