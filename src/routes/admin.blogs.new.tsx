import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { BlogForm, emptyBlogForm, type BlogFormValues } from "@/components/admin/BlogForm";
import { createAdminBlog } from "@/lib/admin-blogs.functions";

export const Route = createFileRoute("/admin/blogs/new")({
  component: NewBlogPage,
});

function NewBlogPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const createBlog = useServerFn(createAdminBlog);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: BlogFormValues) {
    setSubmitting(true);
    const tags = values.tags.split(",").map((t) => t.trim()).filter(Boolean);
    try {
      const res = await createBlog({
        data: {
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
      });
      toast.success(values.status === "published" ? "Blog published" : "Draft saved");
      qc.invalidateQueries({ queryKey: ["admin", "blogs"] });
      qc.invalidateQueries({ queryKey: ["blogs"] });
      navigate({ to: "/admin/blogs/$id", params: { id: res.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save blog");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/blogs" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> All blogs
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">New blog</h1>
      </div>
      <BlogForm
        initial={emptyBlogForm}
        submitting={submitting}
        submitLabel="Publish"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
