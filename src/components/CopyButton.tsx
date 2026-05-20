import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy } from "lucide-react";
import { incrementPromptCopyCount } from "@/lib/prompt-copy.functions";

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
  const incrementCopyCount = useServerFn(incrementPromptCopyCount);

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
      incrementCopyCount({ data: { slug } }).catch(() => {});
    }
  };

  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 active:scale-[0.98] select-none";
  const sizes = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const variants =
    variant === "ghost"
      ? "border border-border bg-card/60 hover:border-accent/50 hover:bg-card text-foreground"
      : "bg-foreground text-background hover:bg-foreground/90 shadow-elevated";
  const success = copied
    ? "!bg-emerald-500/15 !text-emerald-400 !border-emerald-500/40 !shadow-none"
    : "";
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
