import { useState } from "react";

type Props = {
  prompt: string;
};

async function copyText(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
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

export function OpenInAIButtons({ prompt }: Props) {
  const [notice, setNotice] = useState<string | null>(null);

  const openIn = async (target: "chatgpt" | "gemini") => {
    await copyText(prompt);
    setNotice("Prompt copied — paste it into the chat if it isn't prefilled.");
    setTimeout(() => setNotice(null), 3500);

    const encoded = encodeURIComponent(prompt);
    const url =
      target === "chatgpt"
        ? `https://chatgpt.com/?q=${encoded}`
        : `https://gemini.google.com/app`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 active:scale-[0.98] select-none px-4 py-2 text-sm border border-border bg-card/60 hover:border-accent/50 hover:bg-card text-foreground";

  return (
    <div className="mt-6">
      <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
        Try this prompt in
      </h2>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => openIn("chatgpt")} className={base}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          Open in ChatGPT
        </button>
        <button type="button" onClick={() => openIn("gemini")} className={base}>
          <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
          Open in Gemini
        </button>
      </div>
      {notice && (
        <p className="text-xs text-muted-foreground mt-2">{notice}</p>
      )}
    </div>
  );
}
