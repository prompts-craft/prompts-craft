import {
  GraduationCap,
  BookOpen,
  Briefcase,
  Megaphone,
  Code2,
  Sparkles,
  ImageUp,
  Scissors,
  Palette,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  teachers: GraduationCap,
  students: BookOpen,
  freelancers: Briefcase,
  marketing: Megaphone,
  developers: Code2,
  upscaling: ImageUp,
  "background-removal": Scissors,
  "creative-images": Palette,
};

export function CategoryIcon({
  slug,
  className = "w-5 h-5",
}: {
  slug: string;
  className?: string;
}) {
  const Icon = MAP[slug] ?? Sparkles;
  return <Icon className={className} strokeWidth={1.75} />;
}
