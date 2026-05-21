import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PromptForm, type PromptFormValues } from "@/components/admin/PromptForm";
import { deleteAdminPrompt, updateAdminPrompt } from "@/lib/admin-prompts.functions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/prompts/$id")({
  component: EditPromptPage,
});

function EditPromptPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const updatePrompt = useServerFn(updateAdminPrompt);
  const deletePrompt = useServerFn(deleteAdminPrompt);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "prompt", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (error || !data) {
    return (
      <div className="text-sm text-muted-foreground">
        Prompt not found.{" "}
        <Link to="/admin/prompts" className="underline">
          Back
        </Link>
      </div>
    );
  }

  const initial: PromptFormValues = {
    title: data.title,
    slug: data.slug,
    category: data.category,
    description: data.description ?? "",
    prompt: data.prompt,
    example: data.example ?? "",
    tags: (data.tags ?? []).join(", "),
    image_url: data.image_url ?? "",
    trending: data.trending,
    featured: (data as { featured?: boolean }).featured ?? false,
  };

  async function handleSubmit(values: PromptFormValues) {
    setSubmitting(true);
    const tags = values.tags.split(",").map((t) => t.trim()).filter(Boolean);
    try {
      await updatePrompt({
        data: {
          id,
          values: {
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
        },
      });
      toast.success("Prompt updated");
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["prompts"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update prompt");
    } finally {
      setSubmitting(false);
      return;
    }
  }

  async function doDelete() {
    setDeleting(true);
    try {
      await deletePrompt({ data: { id } });
      toast.success("Prompt deleted");
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["prompts"] });
      navigate({ to: "/admin/prompts" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete prompt");
    } finally {
      setDeleting(false);
      return;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link
            to="/admin/prompts"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All prompts
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-2">Edit prompt</h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">/{data.slug}</p>
        </div>
        <button
          onClick={() => setConfirmDelete(true)}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      <PromptForm
        initial={initial}
        submitting={submitting}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this prompt?</AlertDialogTitle>
            <AlertDialogDescription>
              "{data.title}" will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={doDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
