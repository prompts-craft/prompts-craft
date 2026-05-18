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
];

export type Prompt = {
  slug: string;
  title: string;
  description: string;
  category: string; // slug
  prompt: string;
  example: string;
  tags: string[];
  trending?: boolean;
};

export const prompts: Prompt[] = [
  {
    slug: "lesson-plan-generator",
    title: "Lesson Plan Generator",
    description: "Generate a structured 45-minute lesson plan on any topic.",
    category: "teachers",
    prompt: "Act as an experienced {grade-level} teacher. Create a detailed 45-minute lesson plan on {topic}. Include: learning objectives, materials needed, a warm-up activity (5 min), main instruction (20 min), guided practice (10 min), assessment (10 min), and homework. Make it engaging and age-appropriate.",
    example: "Topic: Photosynthesis (Grade 7)\n\nObjectives: Students will explain the process of photosynthesis and identify its key inputs/outputs...\n\nWarm-up: Show a time-lapse video of a plant growing toward sunlight...",
    tags: ["education", "planning", "classroom"],
    trending: true,
  },
  {
    slug: "rubric-builder",
    title: "Grading Rubric Builder",
    description: "Create a clear 4-point rubric for any assignment.",
    category: "teachers",
    prompt: "Create a 4-point grading rubric for a {assignment-type} on {topic} for {grade-level} students. Include criteria for content, organization, evidence, and mechanics. Use clear, student-friendly language for each level (Exemplary, Proficient, Developing, Beginning).",
    example: "Assignment: Persuasive essay on climate policy...\n\nContent (4): Argument is original, nuanced, and supported by multiple credible sources...",
    tags: ["education", "assessment"],
  },
  {
    slug: "essay-outline",
    title: "Essay Outline Builder",
    description: "Turn any topic into a clean 5-paragraph essay outline.",
    category: "students",
    prompt: "Create a detailed 5-paragraph essay outline on: {topic}. Include a strong thesis statement, three body paragraphs with topic sentences and supporting points, and a conclusion. Suggest 3 credible sources I could cite.",
    example: "Topic: The impact of social media on teen mental health.\n\nThesis: While social media offers connection, its design exploits adolescent psychology in ways that harm mental health...",
    tags: ["writing", "study"],
    trending: true,
  },
  {
    slug: "study-summary",
    title: "Textbook Chapter Summarizer",
    description: "Condense dense reading into clean study notes.",
    category: "students",
    prompt: "Summarize the following text into structured study notes. Include: 1) A 3-sentence overview, 2) Key terms with definitions, 3) Main concepts as bullet points, 4) 5 likely exam questions. Text: {paste-text}",
    example: "Overview: This chapter introduces supply and demand as the core mechanism of market economies...\n\nKey Terms:\n- Elasticity: ...",
    tags: ["study", "notes"],
  },
  {
    slug: "client-proposal",
    title: "Freelance Project Proposal",
    description: "Write a confident, scoped proposal in minutes.",
    category: "freelancers",
    prompt: "Write a professional project proposal for a {service-type} project. Client: {client-name}. Project scope: {scope}. Budget range: {budget}. Timeline: {timeline}. Include: brief intro, understanding of their goals, deliverables, timeline with milestones, pricing, and next steps. Keep it under 500 words and confident, not pushy.",
    example: "Hi Sarah,\n\nThanks for sharing the brief for Acme's website redesign. Based on our call, I understand you need...",
    tags: ["business", "writing"],
    trending: true,
  },
  {
    slug: "rate-increase-email",
    title: "Rate Increase Email",
    description: "Tell existing clients about new pricing without losing them.",
    category: "freelancers",
    prompt: "Write a polite but firm email to an existing client announcing a {percentage}% rate increase effective {date}. Acknowledge our history together, briefly justify the increase (experience, demand, costs), and reaffirm commitment to quality. Keep it under 200 words.",
    example: "Subject: A small update on my rates for 2026\n\nHi [Name], I've loved working with you over the past two years...",
    tags: ["business", "email"],
  },
  {
    slug: "ad-copy-variations",
    title: "Ad Copy Variations",
    description: "Generate 10 high-converting ad headlines for any product.",
    category: "marketing",
    prompt: "Generate 10 short ad headlines (under 40 characters) for {product}. Target audience: {audience}. Highlight: {key-benefit}. Mix emotional, curiosity-driven, and direct-benefit angles. Then rank them by predicted CTR and explain why.",
    example: "1. 'Sleep deeper in 7 nights — guaranteed' (emotional)\n2. 'The mattress doctors actually recommend' (authority)...",
    tags: ["copywriting", "ads"],
    trending: true,
  },
  {
    slug: "social-content-calendar",
    title: "30-Day Content Calendar",
    description: "Plan a full month of social posts in one shot.",
    category: "marketing",
    prompt: "Build a 30-day social media content calendar for {brand} on {platform}. Audience: {audience}. Goals: {goals}. Include a mix of educational, entertaining, promotional, and community posts. For each day provide: post type, hook, body, CTA, and a hashtag set.",
    example: "Day 1 — Educational\nHook: '3 mistakes killing your morning routine'\nBody: ...",
    tags: ["social-media", "planning"],
  },
  {
    slug: "code-review",
    title: "Senior Code Reviewer",
    description: "Get a thorough review of any code snippet.",
    category: "developers",
    prompt: "Act as a senior {language} engineer. Review the following code for: correctness, performance, readability, security, and idiomatic style. Suggest concrete improvements with example refactors. Be direct but constructive.\n\nCode:\n{paste-code}",
    example: "Overall: The function works but has 3 issues.\n\n1. Off-by-one in the loop on line 8 — use `i < arr.length`...",
    tags: ["code", "review"],
    trending: true,
  },
  {
    slug: "debug-helper",
    title: "Bug Hunter",
    description: "Diagnose a stubborn bug from an error message.",
    category: "developers",
    prompt: "I'm hitting this error in a {language}/{framework} project:\n\n{error-message}\n\nRelevant code:\n{code}\n\nWhat I've tried: {attempts}\n\nWalk me through the most likely causes ranked by probability, the test I should run to confirm each, and a fix.",
    example: "Most likely cause (80%): You're awaiting a non-Promise. The library returns a stream, not a promise...",
    tags: ["debugging", "code"],
  },
  {
    slug: "api-docs",
    title: "API Documentation Writer",
    description: "Turn a function signature into clean API docs.",
    category: "developers",
    prompt: "Write clear API documentation for the following function/endpoint. Include: description, parameters (with types and defaults), return value, errors thrown, and 2 usage examples. Use markdown.\n\nCode:\n{paste-code}",
    example: "### `fetchUser(id, options?)`\n\nRetrieves a user by ID...\n\n**Parameters**\n- `id` (string, required)...",
    tags: ["docs", "code"],
  },
];

export const getPrompt = (slug: string) => prompts.find((p) => p.slug === slug);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getPromptsByCategory = (slug: string) => prompts.filter((p) => p.category === slug);
export const getRelated = (p: Prompt, n = 3) =>
  prompts.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, n);
