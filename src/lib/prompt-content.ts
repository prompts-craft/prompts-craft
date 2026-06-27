import type { Prompt } from "@/lib/prompts-api";

export type PromptDetails = {
  bestModels: string[];
  aspectRatio: string;
  style: string;
  quality: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
};

export type FaqItem = { q: string; a: string };

const IMAGE_CATEGORIES = new Set([
  "upscaling",
  "background-removal",
  "creative-images",
]);

function isImagePrompt(p: Prompt): boolean {
  return IMAGE_CATEGORIES.has(p.category);
}

function categoryLabel(slug: string): string {
  const map: Record<string, string> = {
    teachers: "Teachers & Educators",
    students: "Students",
    freelancers: "Freelancers",
    marketing: "Marketers",
    developers: "Developers",
    upscaling: "Image Upscaling",
    "background-removal": "Background Removal",
    "creative-images": "Creative AI Art",
  };
  return map[slug] ?? slug;
}

export function getPromptDetails(p: Prompt): PromptDetails {
  if (isImagePrompt(p)) {
    const ratio =
      p.category === "background-removal"
        ? "1:1 or source ratio"
        : p.category === "upscaling"
          ? "Match source (1:1, 3:2, 16:9)"
          : "1:1, 3:2, or 16:9";
    return {
      bestModels: ["Midjourney v6", "Flux 1.1 Pro", "GPT-4o Image", "Stable Diffusion XL"],
      aspectRatio: ratio,
      style:
        p.category === "creative-images"
          ? "Cinematic, photorealistic"
          : p.category === "upscaling"
            ? "High-detail, sharp"
            : "Clean, isolated subject",
      quality: "Ultra HD / 4K",
      difficulty:
        p.tags.length > 4 ? "Advanced" : p.tags.length > 2 ? "Intermediate" : "Beginner",
    };
  }
  return {
    bestModels: ["GPT-4o", "Claude 3.5 Sonnet", "Gemini 1.5 Pro", "Llama 3.1 70B"],
    aspectRatio: "N/A (text output)",
    style: "Professional, structured",
    quality: "Production-ready",
    difficulty:
      p.prompt.length > 800 ? "Advanced" : p.prompt.length > 300 ? "Intermediate" : "Beginner",
  };
}

export function getHowToUse(p: Prompt): string[] {
  const audience = categoryLabel(p.category);
  const image = isImagePrompt(p);
  return [
    `${p.title} is a ready-to-use AI ${image ? "image" : "text"} prompt designed for ${audience.toLowerCase()} who want consistent, high-quality results without spending hours on trial and error. ${p.description ?? "It captures the structure, tone, and detail an AI model needs to produce useful output on the first try."}`,
    `Use this prompt whenever you need ${image ? "polished visuals" : "reliable written output"} for ${audience.toLowerCase()} workflows — typical moments include client work, content production, classroom prep, and rapid iteration on ideas. Copy the full prompt, paste it into your preferred AI tool, and replace any bracketed placeholders with your own specifics (topic, brand, subject, or constraints).`,
    `For best results, give the model a clear context line before pasting, keep your replacements concrete (numbers, names, examples), and ${image ? "regenerate 2–3 variations to pick the strongest composition" : "ask a short follow-up to refine tone or length"}. Pair it with the customization tips below to adapt it to your exact use case.`,
  ];
}

export function getExampleOutputSummary(p: Prompt): string {
  if (isImagePrompt(p)) {
    return `Expect a sharp, well-composed image with clean subject framing, balanced lighting, and ${p.tags.slice(0, 2).join(", ") || "style-consistent"} details suitable for direct use in social posts, thumbnails, or product mockups.`;
  }
  return `Expect a structured, ready-to-use response covering ${p.tags.slice(0, 3).join(", ") || "the core requirements"} in a clear format you can paste straight into your workflow with only light edits.`;
}

export function getCustomizationTips(p: Prompt): string[] {
  const image = isImagePrompt(p);
  const topic = p.tags[0] ?? p.category;
  const base = image
    ? [
        `Swap the subject for your own — replace the main noun with your product, character, or scene.`,
        `Change the lighting (golden hour, studio softbox, neon night) to shift the mood.`,
        `Add a specific camera or lens reference (e.g. "shot on 35mm, f/1.8") for a photo feel.`,
        `Lock the aspect ratio to match your platform (9:16 for Reels, 16:9 for YouTube).`,
        `Add or remove a style modifier like "cinematic", "minimalist", or "editorial".`,
        `Specify a color palette in hex or named colors to match your brand.`,
        `Append "no text, no watermark" to keep outputs clean.`,
        `Use negative prompts (e.g. "no blur, no extra fingers") if your model supports them.`,
      ]
    : [
        `Replace placeholders with your actual ${topic} details for sharper, on-brand output.`,
        `Set a target length ("respond in ~150 words" or "in 5 bullet points").`,
        `Specify the audience reading level (beginner, expert, executive).`,
        `Ask for the output in a specific format — table, JSON, Markdown, email.`,
        `Add a tone instruction: friendly, formal, witty, persuasive.`,
        `Chain a follow-up: "now rewrite for LinkedIn" or "make it 30% shorter".`,
        `Constrain with examples — paste 1–2 samples of the style you want to match.`,
        `Add a "do not" list to block common mistakes (no emojis, no fluff, no disclaimers).`,
      ];
  return base.slice(0, 8);
}

export function getFaqs(p: Prompt): FaqItem[] {
  const image = isImagePrompt(p);
  return [
    {
      q: `What is the "${p.title}" prompt used for?`,
      a:
        p.description ??
        `It's a structured AI prompt that helps ${categoryLabel(p.category).toLowerCase()} get consistent, high-quality ${image ? "image" : "text"} results in seconds.`,
    },
    {
      q: `Which AI models work best with this prompt?`,
      a: `It works across all major models, but you'll get the strongest results from ${getPromptDetails(p).bestModels.slice(0, 3).join(", ")}.`,
    },
    {
      q: `Is this prompt free to use?`,
      a: `Yes. Every prompt on PromptCraft is free, requires no signup, and can be copied with one click for personal or commercial projects.`,
    },
    {
      q: image ? `Can I use the generated image commercially?` : `Can I edit the prompt?`,
      a: image
        ? `Commercial rights depend on the AI image tool you use. Most paid tiers (Midjourney, Flux Pro, GPT-4o Image) grant commercial usage — check the model's current terms.`
        : `Absolutely. Treat it as a starting template — swap in your topic, audience, and tone. See the customization tips above for proven tweaks.`,
    },
    {
      q: `Why is my output different from the example?`,
      a: `AI models are non-deterministic — the same prompt produces variations each run. Regenerate 2–3 times and pick the strongest result, or refine with a short follow-up instruction.`,
    },
  ];
}

export function getSeoKeywords(p: Prompt): string[] {
  return Array.from(
    new Set([
      p.title.toLowerCase(),
      `${p.title.toLowerCase()} prompt`,
      `ai prompt for ${p.category}`,
      `${p.category} ai prompt`,
      "free ai prompt",
      "chatgpt prompt",
      ...p.tags,
    ]),
  );
}
