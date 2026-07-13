import { useEffect, useMemo, useState, type FormEvent } from "react";
import { MessageSquare, Trash2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StarRating } from "@/components/StarRating";
import { reviewerHashFor } from "@/lib/md5";

type Review = {
  id: string;
  reviewer_hash: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

type SessionUser = { id: string; email: string | null } | null;

export function BlogReviews({ blogId }: { blogId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SessionUser>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const myHash = useMemo(() => (user ? reviewerHashFor(user.id) : null), [user]);
  const existingMine = useMemo(
    () => (myHash ? reviews.find((r) => r.reviewer_hash === myHash) ?? null : null),
    [reviews, myHash],
  );
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingMine) {
      setRating(existingMine.rating);
      setComment(existingMine.comment);
    }
  }, [existingMine]);

  async function loadReviews() {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_reviews")
      .select("id, reviewer_hash, rating, comment, created_at, updated_at")
      .eq("blog_id", blogId)
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    setReviews((data ?? []) as Review[]);
    setLoading(false);
  }

  useEffect(() => {
    loadReviews();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id, email: data.user.email ?? null } : null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId]);

  const avg =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  async function submitReview(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (comment.trim().length < 3) {
      toast.error("Please write at least a few words.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("blog_reviews").upsert(
      {
        blog_id: blogId,
        user_id: user.id,
        rating,
        comment: comment.trim(),
      },
      { onConflict: "blog_id,user_id" },
    );
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(existingMine ? "Review updated" : "Review posted");
    await loadReviews();
  }

  async function deleteReview(id: string) {
    const { error } = await supabase.from("blog_reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Review deleted");
    setComment("");
    setRating(5);
    await loadReviews();
  }

  return (
    <section className="mt-14">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent" /> Reviews
          <span className="text-sm font-normal text-muted-foreground">
            ({reviews.length})
          </span>
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <StarRating value={avg} />
            <span className="tabular-nums">{avg.toFixed(1)} / 5</span>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card/60 backdrop-blur p-5">
        {!user ? (
          authOpen ? (
            <InlineAuth
              onDone={(u) => {
                setUser(u);
                setAuthOpen(false);
              }}
              onCancel={() => setAuthOpen(false)}
            />
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm text-muted-foreground">
                <span className="text-foreground/90 font-medium">Sign in required</span> to leave a
                review.
              </div>
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3.5 py-2 text-sm font-medium hover:bg-primary/90"
              >
                <LogIn className="w-4 h-4" /> Sign in to comment
              </button>
            </div>
          )
        ) : (
          <form onSubmit={submitReview} className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-muted-foreground">Your rating:</span>
              <StarRating value={rating} onChange={setRating} size={22} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share what you thought of this blog…"
              rows={4}
              maxLength={2000}
              className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              required
            />
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-muted-foreground">Posting as a signed-in user</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => supabase.auth.signOut()}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Sign out
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
                >
                  {submitting ? "Saving…" : existingMine ? "Update review" : "Post review"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {loading && <div className="text-sm text-muted-foreground">Loading reviews…</div>}
        {!loading && reviews.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Be the first to review this blog.
          </div>
        )}
        {reviews.map((r) => {
          const isMine = myHash === r.reviewer_hash;
          const shortId = r.reviewer_hash.slice(0, 6);
          const initial = shortId.charAt(0).toUpperCase();
          const nameLabel = `User ${shortId}`;
          const date = new Date(r.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return (
            <article
              key={r.id}
              className="rounded-2xl border border-border bg-card/60 backdrop-blur p-5"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-accent-soft text-accent font-semibold">
                    {initial}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-foreground/90">
                      {nameLabel} {isMine && <span className="text-xs text-accent">(you)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} />
                  {isMine && (
                    <button
                      type="button"
                      onClick={() => deleteReview(r.id)}
                      className="ml-1 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      aria-label="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-3 text-[15px] text-foreground/85 whitespace-pre-wrap leading-relaxed">
                {r.comment}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function InlineAuth({
  onDone,
  onCancel,
}: {
  onDone: (u: SessionUser) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onDone(data.user ? { id: data.user.id, email: data.user.email ?? null } : null);
        toast.success("Signed in");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.href },
        });
        if (error) throw error;
        if (data.session && data.user) {
          onDone({ id: data.user.id, email: data.user.email ?? null });
          toast.success("Account created");
        } else {
          toast.success("Check your email to confirm your account.");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          {mode === "signin" ? "Sign in to comment" : "Create an account"}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block text-xs text-muted-foreground">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-xs text-accent hover:underline"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </div>
    </form>
  );
}
