import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BlogForm, type BlogFormValues } from "@/components/admin/BlogForm";
import { deleteAdminBlog, updateAdminBlog } from "@/lib/admin-blogs.functions";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/blogs/$id")({
  component: EditBlogPage,
});

function EditBlogPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const updateBlog = useServerFn(updateAdminBlog);
  const deleteBlog = useServerFn(deleteAdminBlog);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "blog", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("blogs").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (error || !data) {
    return (
      <div className="text-sm text-muted-foreground">
        Blog not found. <Link to="/admin/blogs" className="underline">Back</Link>
      </div>
    );
  }

  const initial: BlogFormValues = {
    title: data.title,
    slug: data.slug,
    description: data.description ?? "",
    meta_title: data.meta_title ?? "",
    meta_description: data.meta_description ?? "",
    featured_image: data.featured_image ?? "",
    content: data.content ?? "",
    category: data.category ?? "",
    tags: (data.tags ?? []).join(", "),
    related_slugs: data.related_slugs ?? [],
    status: (data.status as "draft" | "published") ?? "draft",
  };

  async function handleSubmit(values: BlogFormValues) {
    setSubmitting(true);
    const tags = values.tags.split(",").map((t) => t.trim()).filter(Boolean);
    try {
      await updateBlog({
        data: {
          id,
          values: {
            title: values.title.trim(),
            slug: values.slug.trim(),
            description: values.description.trim() || null,
            meta_title: values.meta_title.trim() || null,
            meta_description: values.meta_description.trim() || null,
            featured_image: values.featured_image.trim() || null,
            content: values.content,
            category: values.category.trim() || null,
            tags,
            related_slugs: values.related_slugs,
            status: values.status,
          },
        },
      });
      toast.success("Blog saved");
      qc.invalidateQueries({ queryKey: ["admin", "blogs"] });
      qc.invalidateQueries({ queryKey: ["admin", "blog", id] });
      qc.invalidateQueries({ queryKey: ["blogs"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save blog");
    } finally {
      setSubmitting(false);
    }
  }

  async function doDelete() {
    setDeleting(true);
    try {
      await deleteBlog({ data: { id } });
      toast.success("Blog deleted");
      qc.invalidateQueries({ queryKey: ["admin", "blogs"] });
      qc.invalidateQueries({ queryKey: ["blogs"] });
      navigate({ to: "/admin/blogs" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link to="/admin/blogs" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5" /> All blogs
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-2">Edit blog</h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">/blog/{data.slug}</p>
        </div>
        <button
          onClick={() => setConfirmDelete(true)}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      <BlogForm
        initial={initial}
        currentId={id}
        submitting={submitting}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this blog?</AlertDialogTitle>
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
