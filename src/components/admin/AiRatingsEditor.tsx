import { useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StarRating } from "@/components/StarRating";

type Row = {
  id: string;
  ai_model: string;
  stars: number;
  is_recommended: boolean;
  notes: string | null;
  sort_order: number;
};

export function AiRatingsEditor({ promptId }: { promptId: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiModel, setAiModel] = useState("");
  const [stars, setStars] = useState(5);
  const [notes, setNotes] = useState("");
  const [recommended, setRecommended] = useState(false);
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("prompt_ai_ratings")
      .select("*")
      .eq("prompt_id", promptId)
      .order("is_recommended", { ascending: false })
      .order("stars", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptId]);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!aiModel.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("prompt_ai_ratings").insert({
      prompt_id: promptId,
      ai_model: aiModel.trim(),
      stars,
      is_recommended: recommended,
      notes: notes.trim() || null,
    });
    setAdding(false);
    if (error) return toast.error(error.message);
    setAiModel("");
    setStars(5);
    setNotes("");
    setRecommended(false);
    toast.success("AI rating added");
    load();
  }

  async function update(id: string, patch: Partial<Row>) {
    const { error } = await supabase.from("prompt_ai_ratings").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("prompt_ai_ratings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  }

  return (
    <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold">AI Model Ratings</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Tag which AI models perform best with this prompt. Recommended models appear first with a
          badge.
        </p>
      </div>

      <form onSubmit={add} className="grid sm:grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
        <label className="block text-xs text-muted-foreground">
          AI model
          <input
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            placeholder="e.g. ChatGPT, Gemini, Midjourney"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            required
          />
        </label>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Stars</div>
          <StarRating value={stars} onChange={setStars} size={22} />
        </div>
        <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={recommended}
            onChange={(e) => setRecommended(e.target.checked)}
          />
          Recommended
        </label>
        <button
          type="submit"
          disabled={adding}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
        <label className="sm:col-span-4 block text-xs text-muted-foreground">
          Notes (optional)
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Short reason — e.g. handles photorealism best"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
      </form>

      <div className="space-y-2">
        {loading ? (
          <div className="text-xs text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-xs text-muted-foreground">No AI ratings yet.</div>
        ) : (
          rows.map((r) => <EditableRow key={r.id} row={r} onSave={update} onDelete={remove} />)
        )}
      </div>
    </div>
  );
}

function EditableRow({
  row,
  onSave,
  onDelete,
}: {
  row: Row;
  onSave: (id: string, patch: Partial<Row>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [stars, setStars] = useState(row.stars);
  const [rec, setRec] = useState(row.is_recommended);
  const [notes, setNotes] = useState(row.notes ?? "");
  const dirty = stars !== row.stars || rec !== row.is_recommended || (notes ?? "") !== (row.notes ?? "");

  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-medium text-sm">{row.ai_model}</span>
        <StarRating value={stars} onChange={setStars} />
        <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <input type="checkbox" checked={rec} onChange={(e) => setRec(e.target.checked)} />
          Recommended
        </label>
        <div className="ml-auto flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={() => onSave(row.id, { stars, is_recommended: rec, notes: notes || null })}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-accent-soft"
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(row.id)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes"
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs"
      />
    </div>
  );
}
