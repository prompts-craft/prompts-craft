import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "blog-images";
// 10-year signed URL — the workspace blocks public buckets, so we sign long.
const SIGNED_EXPIRES_IN = 60 * 60 * 24 * 365 * 10;

export function ImageUploadField({
  value,
  onChange,
  placeholder = "https://…",
  folder = "uploads",
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "31536000", upsert: false });
      if (upErr) throw upErr;
      const { data, error: signErr } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, SIGNED_EXPIRES_IN);
      if (signErr || !data?.signedUrl) throw signErr ?? new Error("Failed to sign URL");
      onChange(data.signedUrl);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input flex-1 min-w-[200px]"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>
      {value && (
        <img
          src={value}
          alt="preview"
          className="max-h-40 rounded-md border border-border object-cover"
        />
      )}
    </div>
  );
}
