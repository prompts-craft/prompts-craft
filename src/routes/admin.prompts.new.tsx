import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PromptForm, emptyPromptForm, type PromptFormValues } from "@/components/admin/PromptForm";
import { createAdminPrompt } from "@/lib/admin-prompts.functions";

export const Route = createFileRoute("/admin/prompts/new")({
  component: NewPromptPage,
});

function NewPromptPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const createPrompt = useServerFn(createAdminPrompt);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: PromptFormValues) {
    setSubmitting(true);
    const tags = values.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      const data = await createPrompt({
        data: {
        title: values.title.trim(),
        slug: values.slug.trim(),
        category: values.category,
        description: values.description.trim() || null,
        prompt: values.prompt,
        example: values.example.trim() || null,
        tags,
        image_url: values.image_url.trim() || null,
        trending: values.trending,
        featured: values.featured,
        },
      });
      toast.success("Prompt created");
      qc.invalidateQueries({ queryKey: ["admin"] });
      navigate({ to: "/admin/prompts/$id", params: { id: data.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create prompt");
    } finally {
      setSubmitting(false);
      return;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/prompts"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All prompts
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">New prompt</h1>
      </div>
      <PromptForm
        initial={emptyPromptForm}
        submitting={submitting}
        submitLabel="Create prompt"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
