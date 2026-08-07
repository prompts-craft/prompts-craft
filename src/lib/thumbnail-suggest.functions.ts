import { createServerFn } from "@tanstack/react-start";

export type ThumbnailIdea = {
  concept: string;
  niche: string;
  text_overlay: string;
  prompt: string;
};

export const suggestThumbnails = createServerFn({ method: "POST" })
  .inputValidator((input: { title: string; niche?: string }) => {
    const title = String(input?.title ?? "").trim();
    if (title.length < 3) throw new Error("Please enter a longer video title.");
    if (title.length > 200) throw new Error("Title must be under 200 characters.");
    const niche = String(input?.niche ?? "").trim().slice(0, 60);
    return { title, niche };
  })
  .handler(async ({ data }): Promise<{ niche: string; ideas: ThumbnailIdea[] }> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured.");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const { streamText } = await import("ai");

    const gateway = createLovableAiGatewayProvider(key);

    const system = [
      "You are a YouTube thumbnail art director and AI image prompt engineer.",
      "Given a video title, infer the niche and return 3 distinct, click-worthy thumbnail concepts.",
      "Each image prompt must be a single detailed paragraph ready to paste into an AI image generator",
      "(Midjourney / DALL-E / Nano Banana): describe subject, expression, composition (16:9, subject left,",
      "text space right), lighting, color palette, background, and style. Do NOT mention brand logos.",
      "Keep text_overlay to at most 5 punchy words in caps.",
      'Respond with ONLY raw JSON, no markdown fences: {"niche":"...","ideas":[{"concept":"...","niche":"...","text_overlay":"...","prompt":"..."}]}',
    ].join(" ");

    const result = streamText({
      model: gateway("google/gemini-3-flash-preview"),
      system,
      prompt: `Video title: "${data.title}"${data.niche ? `\nCreator niche: ${data.niche}` : ""}`,
    });

    const raw = await result.text;
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("Could not generate suggestions. Try again.");

    let parsed: { niche?: string; ideas?: ThumbnailIdea[] };
    try {
      parsed = JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      throw new Error("Could not generate suggestions. Try again.");
    }

    const ideas = (parsed.ideas ?? [])
      .filter((i) => i && typeof i.prompt === "string" && i.prompt.trim())
      .slice(0, 3)
      .map((i) => ({
        concept: String(i.concept ?? "Thumbnail concept").slice(0, 120),
        niche: String(i.niche ?? parsed.niche ?? data.niche ?? "").slice(0, 60),
        text_overlay: String(i.text_overlay ?? "").slice(0, 60),
        prompt: String(i.prompt).slice(0, 2000),
      }));

    if (!ideas.length) throw new Error("No suggestions generated. Try a different title.");
    return { niche: String(parsed.niche ?? data.niche ?? "").slice(0, 60), ideas };
  });
