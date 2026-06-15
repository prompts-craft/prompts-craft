import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Check, X } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/requests")({
  component: RequestsPage,
});

type Req = {
  id: string;
  user_id: string;
  email: string;
  reason: string | null;
  status: string;
  created_at: string;
};

function RequestsPage() {
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Req[];
    },
  });

  const decide = useMutation({
    mutationFn: async ({ req, approve }: { req: Req; approve: boolean }) => {
      if (approve) {
        const { error: roleErr } = await supabase
          .from("user_roles")
          .insert({ user_id: req.user_id, role: "admin" });
        if (roleErr && !roleErr.message.includes("duplicate")) throw roleErr;
      }
      // delete prior row so the (user_id,status) unique constraint allows future requests
      const { error: delErr } = await supabase
        .from("admin_requests")
        .delete()
        .eq("id", req.id);
      if (delErr) throw delErr;

      if (!approve) {
        const { error: insErr } = await supabase
          .from("admin_requests")
          .insert({
            user_id: req.user_id,
            email: req.email,
            reason: req.reason,
            status: "rejected",
          });
        if (insErr) throw insErr;
      }
    },
    onSuccess: (_d, vars) => {
      toast.success(vars.approve ? "Admin approved" : "Request rejected");
      qc.invalidateQueries({ queryKey: ["admin", "requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data ?? [];
  const pending = rows.filter((r) => r.status === "pending");
  const history = rows.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> Admin Requests
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Approve or reject users who want admin access.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Pending ({pending.length})
        </h2>
        <div className="space-y-3">
          {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {!isLoading && pending.length === 0 && (
            <div className="rounded-lg border border-border bg-card/40 p-4 text-sm text-muted-foreground">
              No pending requests.
            </div>
          )}
          {pending.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-border bg-card/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium text-sm">{r.email}</div>
                {r.reason && (
                  <div className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                    {r.reason}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  disabled={decide.isPending}
                  onClick={() => decide.mutate({ req: r, approve: true })}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 text-xs hover:bg-emerald-500/25"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  disabled={decide.isPending}
                  onClick={() => decide.mutate({ req: r, approve: false })}
                  className="inline-flex items-center gap-1 rounded-md bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-1.5 text-xs hover:bg-red-500/20"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {history.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            History
          </h2>
          <div className="rounded-lg border border-border bg-card/40 divide-y divide-border">
            {history.map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm truncate">{r.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground capitalize">{r.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
