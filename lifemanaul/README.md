# Life Manual

> The guide school never gave you.

Practical, plain-English guides for every stage of life — built for New Zealand.

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your values (only `NEXT_PUBLIC_SITE_URL` is required to start).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
lifemanaul/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (nav + footer)
│   ├── page.tsx            # Homepage
│   ├── sitemap.ts          # Auto-generated sitemap
│   ├── not-found.tsx       # 404 page
│   ├── about/page.tsx      # About page
│   ├── stage/[slug]/       # Stage landing pages (/stage/mid-teens)
│   └── guide/[slug]/       # Individual guide pages (/guide/how-to-open-a-bank-account)
│
├── components/
│   ├── Analytics.tsx       # Fathom privacy-first analytics
│   └── ui/
│       ├── GuideCard.tsx           # Reusable guide card
│       ├── StageBadge.tsx          # Stage pill badge
│       ├── MortgageCalculator.tsx  # Interactive mortgage calculator
│       └── CompoundInterestCalculator.tsx
│
├── content/
│   └── guides/             # MDX files — one per guide
│       ├── how-to-open-a-bank-account.mdx
│       └── what-compound-interest-really-means.mdx
│
├── lib/
│   ├── stages.ts           # All stage/category definitions + types
│   └── guides.ts           # MDX file loader
│
├── styles/
│   └── globals.css         # Tailwind + custom prose styles
│
└── public/
    └── robots.txt
```

---

## Writing a new guide

Create a new `.mdx` file in `content/guides/`. The filename becomes the URL slug.

```mdx
---
title: How to get your first job
description: From writing your CV to surviving the interview.
stageId: mid-teens
categoryId: life-skills
lastUpdated: 2026-01-20
keyTakeaways:
  - A one-page CV is always better than two pages at your age.
  - Preparation is 90% of a good interview.
relatedSlugs:
  - how-to-open-a-bank-account
---

Your article content here, written in Markdown.

## Subheadings work like this

Use the `<Callout>` component for important notes:

<Callout>
This is a highlighted callout box — good for key warnings or tips.
</Callout>
```

### Available `stageId` values
- `early-teens`, `mid-teens`, `young-adult`, `establishing`, `mid-life`, `pre-retirement`

### Available `categoryId` values per stage
See `lib/stages.ts` for the full list — each stage has 3–5 categories.

---

## Adding an interactive calculator to a guide

Import calculator components inside MDX by passing them through the `components` prop in `app/guide/[slug]/page.tsx`:

```tsx
// In page.tsx components object:
MortgageCalculator: () => <MortgageCalculator />,
CompoundInterestCalculator: () => <CompoundInterestCalculator />,
```

Then use them in any `.mdx` file:

```mdx
Here's an interactive calculator to see the numbers for yourself:

<MortgageCalculator />
```

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables from `.env.example`
4. Deploy — Vercel auto-deploys on every push to `main`

The `vercel.json` is pre-configured with `"regions": ["syd1"]` for NZ-closest hosting.

### After deploying

- Submit your sitemap to [Google Search Console](https://search.google.com/search-console)
- Add your Fathom site ID to env vars
- Register `lifemanual.co.nz` at [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) (~$25/yr)

---

## Tech stack

| Layer | Tool | Cost |
|---|---|---|
| Framework | Next.js 14 (App Router) | Free |
| Styling | Tailwind CSS | Free |
| Content | MDX files in Git | Free |
| Hosting | Vercel | Free tier |
| Analytics | Fathom | ~$14/mo |
| Domain | Cloudflare Registrar | ~$25/yr |

**Total: ~$16/month to run at launch.**

---

## Roadmap

- [ ] Pagefind search (static, in-browser, zero cost)
- [ ] Sanity CMS integration (when multiple authors needed)
- [ ] Email newsletter signup (Buttondown)
- [ ] OG image generation per guide
- [ ] Mobile app (React Native)
