export type Category = {
  slug: string;
  name: string;
  description: string;
  emoji: string;
};

export const categories: Category[] = [
  { slug: "teachers", name: "Teachers", description: "Lesson plans, rubrics, and classroom helpers.", emoji: "🎓" },
  { slug: "students", name: "Students", description: "Study aids, essay helpers, and exam prep.", emoji: "📚" },
  { slug: "freelancers", name: "Freelancers", description: "Proposals, client emails, and pricing.", emoji: "💼" },
  { slug: "marketing", name: "Marketing", description: "Ad copy, social posts, and campaigns.", emoji: "📣" },
  { slug: "developers", name: "Developers", description: "Code reviews, debugging, and docs.", emoji: "💻" },
  { slug: "upscaling", name: "Image Upscaling", description: "Sharpen and upscale photos to 4K and beyond.", emoji: "🔍" },
  { slug: "background-removal", name: "Background Removal", description: "Clean cutouts for products, portraits, and assets.", emoji: "✂️" },
  { slug: "creative-images", name: "Creative Images", description: "Generate stunning AI artwork and concept visuals.", emoji: "🎨" },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
