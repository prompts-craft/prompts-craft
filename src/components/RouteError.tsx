import { Link } from "@tanstack/react-router";

export function RouteError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Couldn't load this page</h1>
      <p className="text-sm text-muted-foreground mt-2">
        {error?.message ?? "Something went wrong while fetching data."}
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
        >
          Try again
        </button>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/60 transition"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
