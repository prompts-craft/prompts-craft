import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LayoutDashboard, ListChecks, Plus, LogOut, Sparkles, Layers, Activity, UserPlus } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — PromptStack" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminShell,
});

function AdminShell() {
  const auth = useAdminAuth();

  if (auth.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  if (auth.status === "anonymous") {
    return <LoginPanel />;
  }

  if (auth.status === "not-admin") {
    return <RequestAccessPanel email={auth.email} userId={auth.userId} />;
  }

  return <AdminLayout email={auth.email} isSuperAdmin={auth.isSuperAdmin} />;
}

function AdminLayout({ email, isSuperAdmin }: { email: string | null; isSuperAdmin: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [navOpen, setNavOpen] = useState(false);

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/prompts", label: "All Prompts", icon: ListChecks },
    { to: "/admin/prompts/new", label: "New Prompt", icon: Plus },
    { to: "/admin/categories", label: "Categories", icon: Layers },
    ...(isSuperAdmin
      ? [
          { to: "/admin/activity", label: "Activity Log", icon: Activity },
          { to: "/admin/requests", label: "Admin Requests", icon: UserPlus },
        ]
      : []),
  ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border/60 bg-card/40 backdrop-blur transform transition-transform md:translate-x-0 md:static md:block ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center px-5 border-b border-border/60">
          <Link to="/admin" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/40">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
            </span>
            <span>Admin</span>
          </Link>
        </div>
        <nav className="p-3 space-y-1 text-sm">
          {navItems.map((item) => {
            const active = isActive(item.to, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setNavOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition ${
                  active
                    ? "bg-accent/15 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-3 border-t border-border/60">
          <div className="px-2 py-1 text-xs text-muted-foreground truncate">{email}</div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {navOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/60"
          onClick={() => setNavOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-14 flex items-center justify-between px-4 border-b border-border/60">
          <button
            onClick={() => setNavOpen(true)}
            className="rounded-md border border-border px-3 py-1.5 text-sm"
          >
            Menu
          </button>
          <span className="text-sm font-medium">Admin</span>
          <Link to="/" className="text-sm text-muted-foreground">
            View site
          </Link>
        </header>
        <main className="flex-1 p-5 sm:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}

function LoginPanel() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        setInfo(
          "Account created. Check your email to confirm, then ask the site owner to grant admin access.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card/60 backdrop-blur p-6 shadow-elevated">
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/40">
            <Sparkles className="w-4 h-4 text-accent-foreground" />
          </span>
          <h1 className="text-lg font-semibold tracking-tight">Admin sign in</h1>
        </div>
        <form onSubmit={submit} className="space-y-3">
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
          {error && <div className="text-xs text-destructive">{error}</div>}
          {info && <div className="text-xs text-emerald-400">{info}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setInfo(null);
          }}
          className="mt-4 text-xs text-muted-foreground hover:text-foreground w-full text-center"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
        <p className="mt-6 text-[11px] text-muted-foreground text-center leading-relaxed">
          Admin access must be granted to your account before you can manage content.
        </p>
      </div>
    </div>
  );
}

function RequestAccessPanel({ email, userId }: { email: string | null; userId: string }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "approved" | "rejected">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("admin_requests")
      .select("status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.status === "pending") setStatus("pending");
        else if (data?.status === "rejected") setStatus("rejected");
      });
  }, [userId]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("admin_requests")
      .insert({ user_id: userId, email: email ?? "", reason, status: "pending" });
    setLoading(false);
    if (error) setError(error.message);
    else setStatus("pending");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="w-full max-w-md rounded-xl border border-border bg-card/60 p-6">
        <h1 className="text-xl font-semibold">Request admin access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as {email}. This account doesn't have admin access yet.
        </p>

        {status === "pending" ? (
          <p className="mt-6 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Your request is pending review. You'll get access once a super admin approves it.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3 text-left">
            {status === "rejected" && (
              <div className="text-xs text-destructive">
                Your previous request was rejected. You can submit a new one.
              </div>
            )}
            <label className="block text-xs text-muted-foreground">
              Why do you want admin access?
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Briefly explain your role and why you need access…"
              />
            </label>
            {error && <div className="text-xs text-destructive">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Submit request"}
            </button>
          </form>
        )}

        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-muted"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
