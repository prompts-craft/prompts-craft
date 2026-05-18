export type BlogSection = {
  heading: string;
  body: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  categorySlug?: string; // matches prompts category for related lookup
  date: string;
  readingTime: string;
  keywords: string[];
  gradient: string; // tailwind classes for the featured image block
  intro: string;
  sections: BlogSection[];
  relatedPromptCategory?: string;
  cta: { title: string; body: string; href: string; label: string };
};

export const blogPosts: BlogPost[] = [
  {
    slug: "best-ai-prompts-for-teachers",
    title: "The Best AI Prompts for Teachers in 2026",
    description:
      "A practical set of AI prompts teachers can copy today — for lesson plans, rubrics, differentiation, parent emails, and feedback.",
    category: "Teaching",
    categorySlug: "teachers",
    date: "May 16, 2026",
    readingTime: "7 min read",
    keywords: [
      "best AI prompts for teachers",
      "ChatGPT for teachers",
      "AI lesson plan prompts",
      "AI in education",
    ],
    gradient: "from-indigo-500/30 via-purple-500/20 to-pink-500/30",
    intro:
      "If you teach, AI can give you back hours every week — but only if your prompts are specific. Vague prompts produce vague worksheets. This guide collects the prompt patterns that consistently work in real classrooms, from K-12 to higher ed.",
    sections: [
      {
        heading: "Why most teacher prompts fail",
        body: [
          "The default move is to ask ChatGPT for 'a lesson plan on fractions.' What comes back is generic, unaligned to your standards, and written at the wrong reading level.",
          "Good teacher prompts always specify four things: grade level, learning objective, time available, and the standard or framework you're aligning to. Add those and output quality jumps immediately.",
        ],
      },
      {
        heading: "Lesson planning prompts",
        body: [
          "Use a scaffold: role, audience, objective, constraints, output format. For example: 'Act as a 7th-grade science teacher. Build a 45-minute lesson on photosynthesis aligned to NGSS MS-LS1-6. Include a warm-up, direct instruction outline, a 10-minute lab, and an exit ticket.'",
          "Ask for the lesson as a table with timing in the left column. It forces structure and makes the plan usable without rewriting.",
        ],
      },
      {
        heading: "Differentiation and IEP support",
        body: [
          "Generate three versions of the same worksheet at different reading levels in one prompt. Ask for the same questions, simplified vocabulary, and a sentence-frame version for ELL students.",
          "For IEP accommodations, describe the accommodation in plain language and ask the model to rewrite the assessment to honor it without lowering rigor.",
        ],
      },
      {
        heading: "Feedback and grading",
        body: [
          "Paste a student response and a rubric. Ask for rubric-scored feedback that names the specific evidence behind each score. The model is faster than you at the first pass; you stay in charge of the final mark.",
          "For longer essays, ask for two strengths, two areas for growth, and one concrete revision the student can make in fifteen minutes.",
        ],
      },
      {
        heading: "Parent and admin communication",
        body: [
          "Draft parent emails in a warm but professional tone, then ask the model to translate them into the home languages of your families. Always re-read translations before sending.",
          "For tough conversations, ask the model to surface three things the parent might be feeling, then draft the email to address each.",
        ],
      },
    ],
    relatedPromptCategory: "teachers",
    cta: {
      title: "Browse teacher prompts",
      body: "Copy-ready prompts for lesson plans, feedback, and parent emails.",
      href: "/categories/teachers",
      label: "See teacher prompts",
    },
  },
  {
    slug: "chatgpt-prompts-for-students",
    title: "ChatGPT Prompts for Students That Actually Help You Learn",
    description:
      "Stop using ChatGPT as a cheat sheet. These prompts turn it into a study partner, essay coach, and exam prep tool — without doing the work for you.",
    category: "Studying",
    categorySlug: "students",
    date: "May 12, 2026",
    readingTime: "6 min read",
    keywords: [
      "ChatGPT prompts for students",
      "AI study prompts",
      "AI for college students",
      "best ChatGPT prompts for studying",
    ],
    gradient: "from-emerald-500/30 via-teal-500/20 to-cyan-500/30",
    intro:
      "Used right, ChatGPT is the best 1-on-1 tutor most students will ever have. Used wrong, it's an autocomplete machine that writes your essay for you and teaches you nothing. The difference is the prompt.",
    sections: [
      {
        heading: "The Socratic study prompt",
        body: [
          "Instead of 'explain mitochondria,' try: 'Act as a Socratic tutor for an undergrad biology student. Ask me one question at a time about mitochondria. Wait for my answer before moving on. Correct me only when I'm wrong.'",
          "This single change moves you from passive reading to active recall, the strongest study technique we have research for.",
        ],
      },
      {
        heading: "Essay coaching, not essay writing",
        body: [
          "Give the model your draft and your assignment prompt. Ask for three questions it would ask before grading, not a rewrite. Answer those questions in your next draft.",
          "For thesis statements: paste your current thesis and ask 'what's the strongest counter-argument to this?' Then defend against it in your essay.",
        ],
      },
      {
        heading: "Exam prep that mirrors the real test",
        body: [
          "Paste a past exam or syllabus. Ask the model to generate 20 practice questions in the same style and difficulty. Then ask for an answer key with brief explanations.",
          "For STEM exams, ask for problems just one step harder than the textbook. That's the band where most exam questions actually live.",
        ],
      },
      {
        heading: "Reading and note-taking",
        body: [
          "Paste a dense article and ask for a one-sentence summary, three key claims, and the strongest objection to the paper's thesis. You'll remember more than from a generic summary.",
          "For lecture notes, ask the model to convert your bullet points into a one-page concept map in markdown.",
        ],
      },
    ],
    relatedPromptCategory: "students",
    cta: {
      title: "More student prompts",
      body: "Study aids, essay coaching, and exam prep prompts you can copy now.",
      href: "/categories/students",
      label: "See student prompts",
    },
  },
  {
    slug: "ai-prompts-for-freelancers",
    title: "AI Prompts for Freelancers: Win Clients, Save Hours",
    description:
      "Proposals, cold outreach, scope-creep replies, and pricing prompts that freelancers actually use to close more work in less time.",
    category: "Freelancing",
    categorySlug: "freelancers",
    date: "May 8, 2026",
    readingTime: "8 min read",
    keywords: [
      "AI prompts for freelancers",
      "ChatGPT for freelancers",
      "AI proposal writing",
      "freelance productivity AI",
    ],
    gradient: "from-orange-500/30 via-amber-500/20 to-rose-500/30",
    intro:
      "Freelancing is mostly admin disguised as creative work. AI is unusually good at the admin half — proposals, follow-ups, scope conversations, invoices — if you prompt it like a senior freelancer would, not like a generic assistant.",
    sections: [
      {
        heading: "Proposals that win on clarity, not length",
        body: [
          "Paste the client brief and your past proposal as context. Ask for a proposal under 400 words with a problem statement, three deliverables, a timeline, and a single price. Brevity reads as confidence.",
          "Always include a 'what success looks like' sentence. Ask the model to write it from the client's perspective.",
        ],
      },
      {
        heading: "Cold outreach without the cringe",
        body: [
          "Don't ask for a cold email. Ask for a one-sentence observation about the prospect's business and one question. That's the entire first message.",
          "For follow-ups, prompt: 'Write a follow-up that adds value without asking for anything. Maximum 60 words.' This converts twice as well as a bump.",
        ],
      },
      {
        heading: "Handling scope creep",
        body: [
          "Describe the new request and the original scope. Ask for a reply that acknowledges the request, names it as out-of-scope, offers a small fixed price to add it, and keeps the relationship warm.",
          "The model is much better than us at this conversation because it isn't anxious.",
        ],
      },
      {
        heading: "Pricing and discovery calls",
        body: [
          "Before a discovery call, paste what you know about the client and ask the model for ten questions to qualify the project — budget, timeline, decision-maker, success metric, and risk.",
          "For pricing, describe the project and your hourly target. Ask for three packaged options (basic, recommended, premium) with concrete deliverables in each.",
        ],
      },
      {
        heading: "Invoices, contracts, and the boring stuff",
        body: [
          "Ask the model to draft a late-payment reminder that stays professional and includes a one-line consequence. Tone matters more than threats.",
          "For contracts, never sign AI output — but a 'find five risks in this contract from a freelancer's perspective' prompt is a great pre-lawyer pass.",
        ],
      },
    ],
    relatedPromptCategory: "freelancers",
    cta: {
      title: "Freelancer prompt library",
      body: "Proposals, outreach, pricing, and client communication prompts — free to copy.",
      href: "/categories/freelancers",
      label: "See freelancer prompts",
    },
  },
  {
    slug: "best-ai-tools-for-productivity",
    title: "The Best AI Tools for Productivity (and the Prompts That Make Them Worth It)",
    description:
      "A short, opinionated guide to the AI tools that actually save time in 2026 — plus the prompt patterns that get the most out of each one.",
    category: "Productivity",
    date: "May 4, 2026",
    readingTime: "9 min read",
    keywords: [
      "best AI tools for productivity",
      "AI productivity prompts",
      "AI workflow tools",
      "ChatGPT productivity",
    ],
    gradient: "from-sky-500/30 via-blue-500/20 to-violet-500/30",
    intro:
      "Most 'best AI tools' lists are sponsored slop. Here's the short version: a handful of tools matter, and the prompt patterns matter more than the tool. The same prompt scaffolds work across ChatGPT, Claude, and Gemini.",
    sections: [
      {
        heading: "The three tools worth your time",
        body: [
          "A frontier chat model (ChatGPT, Claude, or Gemini) for reasoning and writing. Pick one and learn it deeply rather than juggling three.",
          "A transcription tool (Whisper-based or built-in) so every meeting becomes searchable text. Half of productivity is just having a record.",
          "An AI-native editor for code or docs (Cursor, Linear's AI, or similar). The compounding gains come from tools that live where you already work.",
        ],
      },
      {
        heading: "The weekly review prompt",
        body: [
          "Every Friday, paste your calendar and notes from the week. Ask: 'What did I actually ship? What did I avoid? What is the single most important thing for next week?'",
          "This one prompt has replaced an entire productivity system for a lot of people.",
        ],
      },
      {
        heading: "Inbox triage in five minutes",
        body: [
          "Paste a batch of email subjects and senders. Ask the model to sort them into reply-now, reply-this-week, archive, and unsubscribe, with a one-line reason for each.",
          "You stay in control of the actual replies; the model just removes the decision tax.",
        ],
      },
      {
        heading: "Meeting prep and follow-up",
        body: [
          "Before any meeting longer than 30 minutes, give the model the agenda and ask for three risks, three decisions you'll need to make, and one question that will save time.",
          "After the meeting, paste the transcript and ask for action items grouped by owner. This is where transcription pays for itself.",
        ],
      },
      {
        heading: "The compounding habit",
        body: [
          "Save every prompt that works in one file. Within a month you'll have a personal prompt library that's worth more than any tool subscription.",
          "That's basically what this site is — except built for everyone.",
        ],
      },
    ],
    cta: {
      title: "Explore the full prompt library",
      body: "Curated prompts across teaching, studying, freelancing, marketing, and development.",
      href: "/",
      label: "Browse all prompts",
    },
  },
];

export const getBlogPost = (slug: string) => blogPosts.find((p) => p.slug === slug);
