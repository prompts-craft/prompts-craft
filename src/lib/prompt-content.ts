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

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pick<T>(arr: T[], seed: string, salt = ""): T {
  return arr[hash(seed + salt) % arr.length]!;
}

export function getPromptDetails(p: Prompt): PromptDetails {
  if (isImagePrompt(p) || p.media_type === "image") {
    const ratio =
      p.category === "background-removal"
        ? "1:1 or source ratio"
        : p.category === "upscaling"
          ? "Match source (1:1, 3:2, 16:9)"
          : "1:1, 3:2, or 16:9";
    return {
      bestModels: ["Nano Banana Pro (Gemini 3 Image)", "Midjourney v7", "Flux.2 Pro", "GPT Image 1.5"],
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
  if (p.media_type === "video") {
    return {
      bestModels: ["Veo 3.1", "Sora 2", "Runway Gen-4", "Kling 2.5"],
      aspectRatio: "16:9 or 9:16",
      style: "Cinematic motion",
      quality: "1080p–4K, 5–10s clips",
      difficulty:
        p.prompt.length > 800 ? "Advanced" : p.prompt.length > 300 ? "Intermediate" : "Beginner",
    };
  }
  return {
    bestModels: ["GPT-5.2", "Claude Sonnet 4.5", "Gemini 3 Pro", "Grok 4.1"],
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
  const image = isImagePrompt(p) || p.media_type === "image";
  const seed = p.slug ?? p.title;
  const models = getPromptDetails(p).bestModels;
  const topic = p.tags[0] ?? categoryLabel(p.category).toLowerCase();
  const audience = categoryLabel(p.category).toLowerCase();

  const purpose = pick(
    [
      `The "${p.title}" prompt gives ${audience} a tested starting point for ${topic}, so the first generation already lands close to what you need.`,
      `It exists to remove guesswork: instead of describing ${topic} from scratch, you paste one structured brief and let the model handle the detail work.`,
      `Use it when you need dependable ${image ? "visuals" : "copy"} around ${topic} without rewriting instructions for every attempt.`,
    ],
    seed,
    "purpose",
  );

  const modelAnswer = pick(
    [
      `In 2026 testing, ${models[0]} produces the cleanest results, with ${models[1]} and ${models[2]} close behind. The wording is model-agnostic, so older versions still work.`,
      `${models[0]} handles this prompt best today; ${models[1]} is the strongest alternative if you already pay for it, and ${models[2]} is a solid free-tier fallback.`,
      `Run it on ${models[0]} first. If the result feels flat, try ${models[1]} or ${models[2]} — each interprets ${topic} slightly differently.`,
    ],
    seed,
    "models",
  );

  const costAnswer = pick(
    [
      `Yes — it's free on PromptCraft, no account needed, and you can reuse it in client or commercial work.`,
      `It costs nothing here. Copy it, adapt it, ship it — personal or commercial use is fine.`,
      `Completely free, no signup wall. You only pay whatever your AI tool charges for generation.`,
    ],
    seed,
    "cost",
  );

  const fourth = image
    ? {
        q: `Can I sell or publish images made with this ${topic} prompt?`,
        a: pick(
          [
            `Usually yes, but rights come from the image tool, not from us. Paid tiers of ${models[0]} and ${models[1]} currently grant commercial use — check their live terms before a paid client delivery.`,
            `Commercial use depends on your generator's licence. ${models[0]} and ${models[1]} allow it on paid plans; free tiers are often personal-use only.`,
          ],
          seed,
          "rights",
        ),
      }
    : {
        q: `How much should I rewrite before using it for ${topic}?`,
        a: pick(
          [
            `Treat it as a template. Replace the bracketed parts with your real names, numbers and constraints — that single edit usually doubles the usefulness of the output.`,
            `Change anything. The structure is what matters; swap the subject, tone and length limits to match your own ${topic} work.`,
          ],
          seed,
          "edit",
        ),
      };

  const variance = pick(
    [
      `AI models sample randomly, so two runs of the same prompt rarely match. Generate three, keep the best, and refine that one with a short follow-up.`,
      `Outputs drift by design. If a run misses, don't rewrite everything — add one clarifying sentence about ${topic} and regenerate.`,
      `Model updates and random sampling both shift results. Locking a seed (where supported) or repeating the run two or three times gets you closest to the example.`,
    ],
    seed,
    "variance",
  );

  return [
    { q: `What is the "${p.title}" prompt used for?`, a: p.description ?? purpose },
    { q: `Which AI model works best for ${topic}?`, a: modelAnswer },
    { q: `Is the ${p.title} prompt free?`, a: costAnswer },
    fourth,
    { q: `Why does my result look different from the example?`, a: variance },

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
