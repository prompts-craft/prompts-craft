import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminAuthState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "not-admin"; email: string | null }
  | { status: "admin"; userId: string; email: string | null };

export function useAdminAuth(): AdminAuthState & { refresh: () => void } {
  const [state, setState] = useState<AdminAuthState>({ status: "loading" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let resolved = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled && !resolved) {
        resolved = true;
        setState({ status: "anonymous" });
      }
    }, 8000);

    function finish(next: AdminAuthState) {
      if (cancelled) return;
      resolved = true;
      window.clearTimeout(timeout);
      setState(next);
    }

    async function check(
      userFromEvent?: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] | null,
    ) {
      const user = userFromEvent ?? (await supabase.auth.getUser()).data.user;
      if (!user) {
        finish({ status: "anonymous" });
        return;
      }
      const { data: role, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) console.error("Admin role check failed", error);
      finish(
        role?.role === "admin"
          ? { status: "admin", userId: user.id, email: user.email ?? null }
          : { status: "not-admin", email: user.email ?? null },
      );
    }

    check().catch((error) => {
      console.error("Admin auth check failed", error);
      finish({ status: "anonymous" });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        check(session?.user ?? null).catch((error) => {
          console.error("Admin auth refresh failed", error);
          finish({ status: "anonymous" });
        });
      }, 0);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, [tick]);

  return { ...state, refresh: () => setTick((t) => t + 1) };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
