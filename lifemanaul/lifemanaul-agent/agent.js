#!/usr/bin/env node
/**
 * Life Manual — Automated Content Agent
 *
 * Runs on a schedule (e.g. every Sunday via cron or GitHub Actions).
 * 1. Searches Google Trends NZ + Reddit NZ for hot topics
 * 2. Matches topics to Life Manual life stages
 * 3. Writes a full MDX article using Claude with web search
 * 4. Commits the article directly to your GitHub repo
 * 5. Vercel auto-deploys on commit
 *
 * Setup:
 *   npm install
 *   cp .env.example .env   (fill in your keys)
 *   node agent.js          (or set up cron / GitHub Actions)
 */

import Anthropic from "@anthropic-ai/sdk";
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

// ─── Config ──────────────────────────────────────────────────────────────────

const GITHUB_OWNER = process.env.GITHUB_OWNER; // e.g. BM1101
const GITHUB_REPO  = process.env.GITHUB_REPO;  // e.g. lifemanual.co.nz-
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const GUIDES_PATH  = "lifemanaul/content/guides"; // path inside repo

// Life Manual stage mapping — used to assign articles to the right stage
const STAGE_MAP = [
  { stageId: "early-teens",    keywords: ["puberty","teenagers","teen","school","bullying","anxiety teenager","sleep teenager"] },
  { stageId: "mid-teens",      keywords: ["learner licence","bank account teenager","kiwisaver teen","first job","part time job nz"] },
  { stageId: "young-adult",    keywords: ["flatting","renting nz","first job","tax return nz","flatmate","kiwisaver","investing nz"] },
  { stageId: "establishing",   keywords: ["mortgage nz","house deposit","first home","kiwisaver","de facto","will nz","pay rise"] },
  { stageId: "mid-life",       keywords: ["retirement nz","over 40","midlife","health check","cholesterol","blood pressure","kiwisaver 40"] },
  { stageId: "pre-retirement", keywords: ["nz super","retirement planning","downsizing","aged care nz","65","pension nz"] },
];

// ─── Anthropic client ─────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

// ─── GitHub client ────────────────────────────────────────────────────────────

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// ─── Step 1: Research trending topics ────────────────────────────────────────

async function researchTrendingTopics() {
  console.log("🔍 Researching trending NZ topics...");

  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [{
      role: "user",
      content: `Search for the following and return a JSON array of the top 5 most relevant topic ideas for a New Zealand life skills website called Life Manual.

Life Manual covers practical guides for NZ people at different life stages: early teens (11-13), mid teens (14-17), young adults (18-24), establishing yourself (25-35), mid life (40-49), and pre-retirement (50-65).

Please search for:
1. Google Trends NZ top searches this week related to personal finance, health, legal rights, or life skills
2. Top posts from Reddit r/newzealand and r/PersonalFinanceNZ this week
3. Any major NZ news about housing, tax, KiwiSaver, health, or employment

Return a JSON array like this (no markdown, just raw JSON):
[
  {
    "topic": "How to handle a rent increase in NZ",
    "stageId": "young-adult",
    "categoryId": "independent-living",
    "whyRelevant": "Rents have risen significantly and many young NZers are getting notices",
    "searchVolumePotential": "high"
  }
]

Return exactly 5 topics, each with a clear NZ angle.`
    }]
  });

  // Extract text from response
  const text = response.content
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("");

  try {
    // Find JSON array in the response
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array found in response");
    const topics = JSON.parse(match[0]);
    console.log(`✅ Found ${topics.length} trending topics`);
    return topics;
  } catch (e) {
    console.error("Failed to parse topics:", e.message);
    console.log("Raw response:", text);
    return [];
  }
}

// ─── Step 2: Write the article ─────────────────────────────────────────────

async function writeArticle(topic) {
  console.log(`✍️  Writing article: "${topic.topic}"...`);

  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [{
      role: "user",
      content: `You are writing a high-quality article for Life Manual (lifemanual.co.nz), a New Zealand life skills website.

Topic: ${topic.topic}
Life stage: ${topic.stageId}
Category: ${topic.categoryId}
Why relevant now: ${topic.whyRelevant}

Search for current, accurate NZ-specific information on this topic before writing.

Write a complete MDX article following this exact format:

---
title: [Article title]
description: [One sentence description, under 160 characters]
stageId: ${topic.stageId}
categoryId: ${topic.categoryId}
lastUpdated: "${new Date().toISOString().split("T")[0]}"
keyTakeaways:
  - [Key takeaway 1]
  - [Key takeaway 2]
  - [Key takeaway 3]
  - [Key takeaway 4]
relatedSlugs:
  - [related-article-slug-1]
  - [related-article-slug-2]
---

[Full article content in Markdown]

Requirements:
- 600 to 900 words of content
- Plain English — no jargon
- NZ-specific details (NZ law, NZ organisations, NZ dollar amounts)
- Practical and actionable — tell people exactly what to do
- Use ## for section headings
- Use bullet points where appropriate
- Do NOT use curly braces { } anywhere in the content
- Do NOT use the <Callout> or <InvestmentCalculator> components (plain text only)
- The frontmatter lastUpdated must be in double quotes
- Return the complete MDX file and nothing else`
    }]
  });

  const text = response.content
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("");

  // Strip markdown code fences if Claude wrapped the output
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:mdx|markdown)?\n/, "").replace(/\n```$/, "").trim();

  // Find frontmatter start if there is preamble text before it
  const frontmatterIndex = cleaned.indexOf("---");
  if (frontmatterIndex > 0) {
    cleaned = cleaned.slice(frontmatterIndex);
  }

  if (!cleaned.startsWith("---")) {
    console.log("Raw response preview:", cleaned.slice(0, 200));
    throw new Error("Article did not start with frontmatter after cleanup");
  }

  return cleaned;
}

// ─── Step 3: Generate slug from title ────────────────────────────────────────

function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function extractTitle(mdx) {
  const match = mdx.match(/^title:\s*(.+)$/m);
  return match ? match[1].replace(/['"]/g, "").trim() : "untitled";
}

// ─── Step 4: Commit to GitHub ─────────────────────────────────────────────

async function commitToGitHub(stageId, slug, content) {
  const filePath = `${GUIDES_PATH}/${stageId}/${slug}.mdx`;
  const message  = `Add article: ${slug}`;

  console.log(`📤 Committing to GitHub: ${filePath}`);

  try {
    // Check if file already exists (get its SHA if so)
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo:  GITHUB_REPO,
        path:  filePath,
      });
      sha = data.sha;
    } catch {
      // File does not exist yet — that is fine
    }

    await octokit.repos.createOrUpdateFileContents({
      owner:   GITHUB_OWNER,
      repo:    GITHUB_REPO,
      path:    filePath,
      message,
      content: Buffer.from(content).toString("base64"),
      ...(sha ? { sha } : {}),
    });

    console.log(`✅ Committed: ${filePath}`);
    return filePath;
  } catch (e) {
    console.error(`Failed to commit ${filePath}:`, e.message);
    throw e;
  }
}

// ─── Step 5: Log the run ──────────────────────────────────────────────────

function logRun(results) {
  const date = new Date().toISOString();
  console.log("\n─────────────────────────────────────");
  console.log(`Life Manual Agent run: ${date}`);
  console.log(`Articles written: ${results.filter(r => r.success).length}`);
  console.log(`Errors: ${results.filter(r => !r.success).length}`);
  results.forEach(r => {
    const icon = r.success ? "✅" : "❌";
    console.log(`  ${icon} ${r.topic} → ${r.path || r.error}`);
  });
  console.log("─────────────────────────────────────\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function run() {
  console.log("\n🚀 Life Manual Content Agent starting...\n");

  // Validate env
  const required = ["GITHUB_OWNER","GITHUB_REPO","GITHUB_TOKEN","ANTHROPIC_API_KEY"];
  const missing  = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`❌ Missing environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  // 1. Find trending topics
  const topics = await researchTrendingTopics();
  if (!topics.length) {
    console.error("No topics found — exiting");
    process.exit(1);
  }

  // 2. Write and commit the top article (or all 5 if you want)
  // Change topics.slice(0, 1) to topics to write all 5 per run
  const toWrite = topics.slice(0, 1);
  const results = [];

  for (const topic of toWrite) {
    try {
      const mdx   = await writeArticle(topic);
      const title = extractTitle(mdx);
      const slug  = titleToSlug(title);
      const path  = await commitToGitHub(topic.stageId, slug, mdx);
      results.push({ topic: topic.topic, success: true, path });
    } catch (e) {
      results.push({ topic: topic.topic, success: false, error: e.message });
    }
  }

  logRun(results);
}

run().catch(e => {
  console.error("Agent crashed:", e);
  process.exit(1);
});
