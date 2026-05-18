import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type CopyButtonProps = {
  text: string;
  label?: string;
  slug?: string;
  size?: "sm" | "md";
  variant?: "primary" | "ghost";
  fullWidth?: boolean;
  stopPropagation?: boolean;
};

async function copyToClipboard(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({
  text,
  label = "Copy prompt",
  slug,
  size = "md",
  variant = "primary",
  fullWidth,
  stopPropagation,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    const ok = await copyToClipboard(text);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    if (slug) {
      // fire-and-forget; we don't want to block the UX
      supabase.rpc("increment_prompt_copies", { prompt_slug: slug }).then(() => {});
    }
  };

  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all active:scale-[0.98] select-none";
  const sizes = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const variants =
    variant === "ghost"
      ? "border border-border bg-card hover:border-accent/60 hover:bg-muted/60 text-foreground"
      : "bg-primary text-primary-foreground hover:opacity-90 shadow-sm";
  const success = copied ? "!bg-emerald-500 !text-white !border-emerald-500" : "";
  const w = fullWidth ? "w-full" : "";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-live="polite"
      className={`${base} ${sizes} ${variants} ${success} ${w}`}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copied!" : label}
    </button>
  );
}
