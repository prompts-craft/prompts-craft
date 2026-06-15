import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/activity")({
  component: ActivityPage,
});

const actionColor: Record<string, string> = {
  created: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  updated: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  deleted: "bg-red-500/15 text-red-300 border-red-500/30",
};

function ActivityPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Activity className="w-5 h-5" /> Activity Log
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every change made by an admin — newest first.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card/40 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
          <div className="col-span-3">Admin</div>
          <div className="col-span-2">Action</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-3">Item</div>
          <div className="col-span-2">When</div>
        </div>
        {isLoading && <div className="p-4 text-sm text-muted-foreground">Loading…</div>}
        {!isLoading && rows.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">No activity recorded yet.</div>
        )}
        <div className="divide-y divide-border">
          {rows.map((r) => (
            <div
              key={r.id}
              className="md:grid md:grid-cols-12 gap-3 px-4 py-3 text-sm flex flex-col"
            >
              <div className="col-span-3 truncate">{r.actor_email ?? "—"}</div>
              <div className="col-span-2">
                <span
                  className={`inline-block rounded-full border px-2 py-0.5 text-xs ${
                    actionColor[r.action] ?? "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {r.action}
                </span>
              </div>
              <div className="col-span-2 text-muted-foreground">{r.entity_type}</div>
              <div className="col-span-3 truncate">{r.entity_label ?? r.entity_id ?? "—"}</div>
              <div className="col-span-2 text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
