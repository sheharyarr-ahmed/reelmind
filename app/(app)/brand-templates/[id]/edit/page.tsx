import Link from "next/link";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/src/db";
import { brandTemplates } from "@/src/db/schema";
import { createClient } from "@/src/lib/supabase/server";
import { BrandTemplateForm } from "../../brand-template-form";

export default async function EditBrandTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [template] = await db
    .select()
    .from(brandTemplates)
    .where(
      and(eq(brandTemplates.id, id), eq(brandTemplates.userId, user.id)),
    )
    .limit(1);

  if (!template) notFound();

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
          Edit {template.name}
        </h2>
      </div>
      <BrandTemplateForm
        mode={{
          kind: "edit",
          id: template.id,
          defaults: {
            name: template.name,
            primaryColor: template.primaryColor,
            secondaryColor: template.secondaryColor,
            accentColor: template.accentColor,
            headingFont: template.headingFont,
            bodyFont: template.bodyFont,
            logoUrl: template.logoUrl,
          },
        }}
      />
    </div>
  );
}
