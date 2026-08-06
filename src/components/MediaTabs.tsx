import { Link } from "@tanstack/react-router";
import { ImageIcon, Video } from "lucide-react";

export function MediaTabs({ active }: { active: "image" | "video" }) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition";
  const on = "border-accent bg-accent-soft text-accent shadow-glow-soft";
  const off = "border-border text-muted-foreground hover:text-foreground hover:border-accent/50";
  return (
    <div className="flex items-center gap-2">
      <Link to="/" className={`${base} ${active === "image" ? on : off}`}>
        <ImageIcon className="w-4 h-4" /> Image
      </Link>
      <Link to="/video" className={`${base} ${active === "video" ? on : off}`}>
        <Video className="w-4 h-4" /> Video
      </Link>
    </div>
  );
}
