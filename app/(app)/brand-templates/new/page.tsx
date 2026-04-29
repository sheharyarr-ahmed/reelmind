import Link from "next/link";
import { BrandTemplateForm } from "../brand-template-form";

export default function NewBrandTemplatePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/brand-templates"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to templates
        </Link>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          New brand template
        </h2>
      </div>
      <BrandTemplateForm mode={{ kind: "create" }} />
    </div>
  );
}
