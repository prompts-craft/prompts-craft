import { Star } from "lucide-react";

type Props = {
  value: number;
  max?: number;
  size?: number;
  onChange?: (v: number) => void;
  className?: string;
  ariaLabel?: string;
};

export function StarRating({ value, max = 5, size = 16, onChange, className = "", ariaLabel }: Props) {
  const interactive = typeof onChange === "function";
  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      role={interactive ? "radiogroup" : "img"}
      aria-label={ariaLabel ?? `${value} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const idx = i + 1;
        const filled = idx <= Math.round(value);
        const Icon = (
          <Star
            style={{ width: size, height: size }}
            className={filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}
            strokeWidth={1.5}
          />
        );
        return interactive ? (
          <button
            key={idx}
            type="button"
            role="radio"
            aria-checked={idx === Math.round(value)}
            aria-label={`${idx} star${idx > 1 ? "s" : ""}`}
            onClick={() => onChange?.(idx)}
            className="p-0.5 rounded hover:scale-110 transition-transform"
          >
            {Icon}
          </button>
        ) : (
          <span key={idx}>{Icon}</span>
        );
      })}
    </div>
  );
}
