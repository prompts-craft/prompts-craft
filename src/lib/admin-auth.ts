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

    async function check() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        if (!cancelled) setState({ status: "anonymous" });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const isAdmin = (roles ?? []).some((r) => r.role === "admin");
      if (cancelled) return;
      setState(
        isAdmin
          ? { status: "admin", userId: user.id, email: user.email ?? null }
          : { status: "not-admin", email: user.email ?? null },
      );
    }

    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => {
      cancelled = true;
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
