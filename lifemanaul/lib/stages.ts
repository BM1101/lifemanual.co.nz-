// ─── Types ───────────────────────────────────────────────────────────────────

export interface Stage {
  id: string
  label: string         // "14–17"
  name: string          // "Mid teens"
  slug: string          // "mid-teens"
  description: string
  color: string         // Tailwind bg class for accent
  hex: string           // Raw hex for dynamic styles
  categories: Category[]
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string          // emoji
  description: string
}

export interface Guide {
  slug: string
  title: string
  description: string
  stageId: string
  categoryId: string
  readingTime: number   // minutes
  lastUpdated: string   // ISO date string
  content: string       // MDX source
  keyTakeaways?: string[]
  relatedSlugs?: string[]
}

export interface GuideMeta extends Omit<Guide, 'content'> {}

// ─── Life Stages ─────────────────────────────────────────────────────────────

export const STAGES: Stage[] = [
  {
    id: 'early-teens',
    label: '11–13',
    name: 'Early teens',
    slug: 'early-teens',
    description: 'Preparing for the changes ahead — body, emotions, and growing independence.',
    color: 'bg-purple-50',
    hex: '#EEEDFE',
    categories: [
      { id: 'health-body', name: 'Health & body', slug: 'health-body', icon: '🫀', description: 'Understanding puberty, sleep, and looking after yourself.' },
      { id: 'social', name: 'Social skills', slug: 'social', icon: '🤝', description: 'Friendships, online safety, and handling conflict.' },
      { id: 'study', name: 'Study & learning', slug: 'study', icon: '📚', description: 'How to study well and manage your time.' },
    ],
  },
  {
    id: 'mid-teens',
    label: '14–17',
    name: 'Mid teens',
    slug: 'mid-teens',
    description: 'Real-world firsts — legal identity, money, relationships, and navigating adult systems.',
    color: 'bg-green-50',
    hex: '#E1F5EE',
    categories: [
      { id: 'identity', name: 'Identity & legal', slug: 'identity', icon: '🪪', description: 'Passports, IRD numbers, and your legal rights.' },
      { id: 'money-basics', name: 'Money basics', slug: 'money-basics', icon: '💳', description: 'Bank accounts, budgeting, and KiwiSaver.' },
      { id: 'transport', name: 'Transport', slug: 'transport', icon: '🚗', description: "Learner's licence and getting around safely." },
      { id: 'health-relationships', name: 'Health & relationships', slug: 'health-relationships', icon: '❤️', description: 'Consent, relationships, and where to get help.' },
      { id: 'life-skills', name: 'Life skills', slug: 'life-skills', icon: '🍳', description: 'Cooking, laundry, first aid, and etiquette.' },
    ],
  },
  {
    id: 'young-adult',
    label: '18–24',
    name: 'Young adult',
    slug: 'young-adult',
    description: 'Stepping out — flatting, working, voting, and building habits that last.',
    color: 'bg-blue-50',
    hex: '#E0F2FE',
    categories: [
      { id: 'independent-living', name: 'Living independently', slug: 'independent-living', icon: '🏠', description: 'Renting, flatmates, and tenancy rights.' },
      { id: 'work-career', name: 'Work & career', slug: 'work-career', icon: '💼', description: 'CVs, interviews, and your employment rights.' },
      { id: 'finance', name: 'Finance', slug: 'finance', icon: '📊', description: 'Investing, compound interest, and credit scores.' },
      { id: 'health', name: 'Health', slug: 'health', icon: '🩺', description: 'GPs, mental health, and routine checkups.' },
    ],
  },
  {
    id: 'establishing',
    label: '25–35',
    name: 'Establishing yourself',
    slug: 'establishing',
    description: 'The decade of big decisions — property, relationships, career, and building real wealth.',
    color: 'bg-amber-50',
    hex: '#FEF3C7',
    categories: [
      { id: 'property', name: 'Property & mortgages', slug: 'property', icon: '🏡', description: 'How mortgages work and how to buy your first home.' },
      { id: 'investing', name: 'Investing & wealth', slug: 'investing', icon: '📈', description: 'Index funds, KiwiSaver, and growing your money.' },
      { id: 'family-legal', name: 'Relationships & family', slug: 'family-legal', icon: '💍', description: 'De facto rights, wills, and planning for a family.' },
      { id: 'career-growth', name: 'Career growth', slug: 'career-growth', icon: '🚀', description: 'Pay rises, starting a business, and managing people.' },
    ],
  },
  {
    id: 'mid-life',
    label: '40–49',
    name: 'Mid life',
    slug: 'mid-life',
    description: 'Protecting what you\'ve built — health checks, insurance, and staying on track.',
    color: 'bg-red-50',
    hex: '#FEE2E2',
    categories: [
      { id: 'health-checks', name: 'Health checks', slug: 'health-checks', icon: '🔬', description: 'Screening tests and what to monitor at 40+.' },
      { id: 'finance-review', name: 'Finance review', slug: 'finance-review', icon: '🧾', description: 'Are you on track? Insurance and KiwiSaver at 40.' },
      { id: 'estate-legal', name: 'Estate & legal', slug: 'estate-legal', icon: '📜', description: 'Updating your will and power of attorney.' },
    ],
  },
  {
    id: 'pre-retirement',
    label: '50–65',
    name: 'Pre-retirement',
    slug: 'pre-retirement',
    description: 'Getting ready — health, wealth, and what life after work actually looks like.',
    color: 'bg-purple-50',
    hex: '#EEEDFE',
    categories: [
      { id: 'mens-health', name: "Men's health", slug: 'mens-health', icon: '🧬', description: 'Prostate, blood pressure, and staying strong after 50.' },
      { id: 'womens-health', name: "Women's health", slug: 'womens-health', icon: '🌸', description: 'Menopause, HRT, and bone density.' },
      { id: 'retirement', name: 'Retirement planning', slug: 'retirement', icon: '🌅', description: 'NZ Super, downsizing, and phased retirement.' },
      { id: 'later-life-admin', name: 'Later life admin', slug: 'later-life-admin', icon: '📋', description: 'Aged care, digital estate, and planning ahead.' },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getStage(slug: string): Stage | undefined {
  return STAGES.find(s => s.slug === slug)
}

export function getCategory(stageSlug: string, categorySlug: string): Category | undefined {
  return getStage(stageSlug)?.categories.find(c => c.slug === categorySlug)
}

export function getAllStageSlugs(): string[] {
  return STAGES.map(s => s.slug)
}
