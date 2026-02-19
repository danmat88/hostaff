import {
  FAQ_ITEMS,
  HOSTS,
  HOSTING_TYPE_OPTIONS,
  HOST_TYPE_PROFILE_VERIFICATION,
  HOST_TYPE_PROFILES,
  REVIEWS,
  TRUST_METRICS,
} from '../../data/hosts';

const SORT_OPTIONS = [
  { id: 'overall', label: 'Top score' },
  { id: 'price', label: 'Lowest intro price' },
  { id: 'support', label: 'Fastest support' },
  { id: 'payout', label: 'Highest partner bonus' },
];

const DEFAULT_HOSTING_TYPE = HOSTING_TYPE_OPTIONS.find((option) => option.id === 'wordpress')?.id
  || HOSTING_TYPE_OPTIONS[0]?.id
  || 'shared';
const HOSTING_TYPE_IDS = HOSTING_TYPE_OPTIONS.map((option) => option.id);
const HOSTING_TYPE_LABELS = Object.fromEntries(
  HOSTING_TYPE_OPTIONS.map((option) => [option.id, option.label])
);
const ALL_CATEGORIES = ['All', ...new Set(HOSTS.map((host) => host.category))];
const ALL_HOST_IDS = HOSTS.map((host) => host.id);
const DEFAULT_COMPARE = [HOSTS[0].id, HOSTS[2]?.id || HOSTS[1].id];
const HOST_BY_ID = new Map(HOSTS.map((host) => [host.id, host]));
const NAV_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'finder', label: 'Finder' },
  { id: 'rankings', label: 'Rankings' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'compare', label: 'Compare' },
  { id: 'calculator', label: 'Savings' },
  { id: 'proof', label: 'Proof' },
  { id: 'faq', label: 'FAQ' },
];

const JOURNEY_STEPS = [
  { id: 'finder', label: 'Set Needs', desc: 'Project, traffic, and budget profile' },
  { id: 'rankings', label: 'Scan Rankings', desc: 'Sort and filter market options fast' },
  { id: 'workspace', label: 'Build Shortlist', desc: 'Save serious contenders for review' },
  { id: 'compare', label: 'Compare', desc: 'Check metrics side by side' },
  { id: 'calculator', label: 'Validate Cost', desc: 'Confirm annual and long-term spend' },
];

const HERO_INTENTS = [
  {
    id: 'launch',
    label: 'Launch first site',
    hint: 'Low-cost and easy setup',
    hostingType: 'shared',
    profile: {
      projectType: 'portfolio',
      traffic: 'starter',
      priority: 'value',
      budget: 12,
    },
  },
  {
    id: 'grow',
    label: 'Grow a business site',
    hint: 'Balanced speed and support',
    hostingType: 'wordpress',
    profile: {
      projectType: 'blog',
      traffic: 'growing',
      priority: 'balanced',
      budget: 26,
    },
  },
  {
    id: 'scale',
    label: 'Scale serious traffic',
    hint: 'Performance and stability',
    hostingType: 'cloud',
    profile: {
      projectType: 'saas',
      traffic: 'scale',
      priority: 'speed',
      budget: 48,
    },
  },
  {
    id: 'custom',
    label: 'Run a custom app',
    hint: 'Root access, full stack control',
    hostingType: 'vps',
    profile: {
      projectType: 'saas',
      traffic: 'growing',
      priority: 'speed',
      budget: 45,
    },
  },
  {
    id: 'production',
    label: 'Production-grade server',
    hint: 'Bare metal for heavy traffic',
    hostingType: 'dedicated',
    profile: {
      projectType: 'ecommerce',
      traffic: 'scale',
      priority: 'speed',
      budget: 180,
    },
  },
  {
    id: 'agency',
    label: 'Host client sites',
    hint: 'White-label reseller infrastructure',
    hostingType: 'reseller',
    profile: {
      projectType: 'agency',
      traffic: 'growing',
      priority: 'balanced',
      budget: 40,
    },
  },
];

const HOSTING_TYPE_DESCRIPTIONS = {
  shared: 'Cheapest entry, shared resources',
  wordpress: 'Managed WordPress environments',
  cloud: 'Scalable cloud infrastructure',
  vps: 'Dedicated virtual servers',
  dedicated: 'Full bare-metal control',
  reseller: 'Host multiple client sites',
};

const HERO_PANEL_VIEWS = [
  {
    id: 'leaders',
    label: 'Leaders',
    step: 'Step 1',
    title: 'Top-rated providers',
    hint: 'Scan the top picks before narrowing your shortlist.',
  },
  {
    id: 'compare',
    label: 'Compare',
    step: 'Step 2',
    title: 'Head-to-head matchup',
    hint: 'See exactly how your two picks differ on price and speed.',
  },
  {
    id: 'verdict',
    label: 'Verdict',
    step: 'Step 3',
    title: 'Confidence score',
    hint: 'Check which host wins overall before you click through.',
  },
];

const DEFAULT_THEME = 'sunset';
const ALT_THEME = 'ocean';

const STORAGE_KEYS = {
  shortlist: 'hostaff.shortlist.v1',
  lab: 'hostaff.lab.v1',
  dock: 'hostaff.dock.v1',
  compare: 'hostaff.compare.v1',
  compareTable: 'hostaff.compareTable.v1',
  controls: 'hostaff.controls.v1',
  reviewFilters: 'hostaff.reviewFilters.v1',
  reviewDraft: 'hostaff.reviewDraft.v1',
  reviewHelpful: 'hostaff.reviewHelpful.v2',
  theme: 'hostaff.theme.v1',
  reviews: 'hostaff.reviews.v3',
};

const LAB_PROJECTS = [
  { id: 'startup', label: 'Startup SaaS' },
  { id: 'ecommerce', label: 'Ecommerce store' },
  { id: 'blog', label: 'Content / blog' },
  { id: 'agency', label: 'Client agency stack' },
  { id: 'portfolio', label: 'Portfolio / landing pages' },
  { id: 'saas', label: 'Scale product app' },
];

const LAB_TRAFFIC = [
  { id: 'starter', label: 'Starter traffic' },
  { id: 'growing', label: 'Growing traffic' },
  { id: 'scale', label: 'High scale traffic' },
];
const LAB_PROJECT_ID_SET = new Set(LAB_PROJECTS.map((item) => item.id));
const LAB_TRAFFIC_ID_SET = new Set(LAB_TRAFFIC.map((item) => item.id));

const LAB_PRIORITIES = [
  { id: 'balanced', label: 'Balanced' },
  { id: 'speed', label: 'Speed first' },
  { id: 'support', label: 'Support first' },
  { id: 'value', label: 'Value first' },
];

const HOSTING_TYPE_STRATEGY = {
  shared: {
    projectFit: ['portfolio', 'blog', 'startup'],
    trafficFit: ['starter', 'growing'],
    budget: { min: 2, max: 40, default: 5, step: 1 },
  },
  wordpress: {
    projectFit: ['blog', 'ecommerce', 'agency', 'startup'],
    trafficFit: ['starter', 'growing', 'scale'],
    budget: { min: 5, max: 120, default: 24, step: 1 },
  },
  cloud: {
    projectFit: ['saas', 'ecommerce', 'agency', 'startup'],
    trafficFit: ['growing', 'scale'],
    budget: { min: 15, max: 260, default: 60, step: 2 },
  },
  vps: {
    projectFit: ['saas', 'agency', 'ecommerce', 'startup'],
    trafficFit: ['growing', 'scale'],
    budget: { min: 15, max: 220, default: 45, step: 2 },
  },
  dedicated: {
    projectFit: ['saas', 'ecommerce', 'agency'],
    trafficFit: ['scale'],
    budget: { min: 90, max: 320, default: 180, step: 5 },
  },
  reseller: {
    projectFit: ['agency', 'startup', 'ecommerce'],
    trafficFit: ['growing', 'scale'],
    budget: { min: 4, max: 150, default: 30, step: 2 },
  },
};

const DEFAULT_LAB_PROFILE = {
  projectType: 'startup',
  traffic: 'growing',
  priority: 'balanced',
  budget: 24,
};

const HOST_PLACEHOLDER_PALETTES = [
  { start: '#0f8e95', end: '#f26b1d', glow: '#fef0dc', panel: '#ffffff' },
  { start: '#1a6fb0', end: '#0f9f94', glow: '#e5f6ff', panel: '#ffffff' },
  { start: '#6a57d6', end: '#1e89c8', glow: '#ece8ff', panel: '#ffffff' },
  { start: '#157a67', end: '#3bbf7f', glow: '#def8e8', panel: '#ffffff' },
  { start: '#ae5a18', end: '#e09331', glow: '#fff0d8', panel: '#ffffff' },
];

const REVIEW_DIMENSIONS = [
  { id: 'performance', label: 'Performance' },
  { id: 'support', label: 'Support' },
  { id: 'value', label: 'Value for money' },
  { id: 'uptime', label: 'Uptime / reliability' },
  { id: 'ease', label: 'Ease of use' },
];

const DEFAULT_REVIEW_DRAFT = {
  name: '',
  role: '',
  hostId: HOSTS[0].id,
  quote: '',
  monthlySavings: 150,
  score: 5,
  dimensions: { performance: 0, support: 0, value: 0, uptime: 0, ease: 0 },
};

const REVIEW_SORT_OPTIONS = [
  { id: 'recent', label: 'Newest first' },
  { id: 'score', label: 'Highest rating' },
  { id: 'helpful', label: 'Most helpful' },
  { id: 'savings', label: 'Highest savings' },
];

const COMPARE_TABLE_VIEWS = [
  { id: 'all', label: 'All metrics' },
  { id: 'differences', label: 'Only differences' },
];

const COMPARE_METRIC_GROUPS = [
  { id: 'all', label: 'All' },
  { id: 'proof', label: 'Trust' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'performance', label: 'Performance' },
  { id: 'scale', label: 'Scale' },
  { id: 'features', label: 'Features' },
  { id: 'support', label: 'Support' },
];

const COMPARE_KEY_METRIC_LABELS = new Set([
  'Overall score',
  'Live user rating',
  'Intro price',
  'Renewal price',
  'Year-1 cost',
  '3-year cost',
  'Avg TTFB',
  'Support response',
  'Uptime',
  'Money-back',
]);

const FAQ_TOPIC_CHIPS = [
  { id: 'ranking', label: 'Ranking method', query: 'rank' },
  { id: 'pricing', label: 'Pricing updates', query: 'price' },
  { id: 'affiliate', label: 'Affiliate policy', query: 'affiliate' },
  { id: 'migration', label: 'Migration', query: 'migration' },
  { id: 'workspace', label: 'Workspace', query: 'workspace' },
  { id: 'estimator', label: 'Savings estimator', query: 'estimate' },
];

const MIN_REVIEW_QUOTE_LENGTH = 36;
const REVIEW_PREVIEW_LIMIT = 200;

const RANK_PRESETS = [
  { id: 'budget', label: 'Budget shared', sort: 'price', cat: 'All', type: 'shared' },
  { id: 'support', label: 'Support first', sort: 'support', cat: 'All', type: 'wordpress' },
  { id: 'cloud', label: 'Cloud performance', sort: 'overall', cat: 'All', type: 'cloud' },
  { id: 'reseller', label: 'Reseller picks', sort: 'overall', cat: 'All', type: 'reseller' },
];
const REVIEW_PAGE_SIZE = 6;
const UNLIMITED_SITE_LIMIT = 999;
const DEFAULT_HOST_REVIEW_SIGNAL = {
  newReviewCount: 0,
  totalReviewCount: 0,
  weightedScore: 0,
  averageUserSavings: 0,
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const reviewDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export {
  FAQ_ITEMS,
  HOSTS,
  HOSTING_TYPE_OPTIONS,
  HOST_TYPE_PROFILE_VERIFICATION,
  HOST_TYPE_PROFILES,
  REVIEWS,
  TRUST_METRICS,
  SORT_OPTIONS,
  DEFAULT_HOSTING_TYPE,
  HOSTING_TYPE_IDS,
  HOSTING_TYPE_LABELS,
  ALL_CATEGORIES,
  ALL_HOST_IDS,
  DEFAULT_COMPARE,
  HOST_BY_ID,
  NAV_SECTIONS,
  JOURNEY_STEPS,
  HERO_INTENTS,
  HOSTING_TYPE_DESCRIPTIONS,
  HERO_PANEL_VIEWS,
  DEFAULT_THEME,
  ALT_THEME,
  STORAGE_KEYS,
  LAB_PROJECTS,
  LAB_TRAFFIC,
  LAB_PROJECT_ID_SET,
  LAB_TRAFFIC_ID_SET,
  LAB_PRIORITIES,
  HOSTING_TYPE_STRATEGY,
  DEFAULT_LAB_PROFILE,
  HOST_PLACEHOLDER_PALETTES,
  REVIEW_DIMENSIONS,
  DEFAULT_REVIEW_DRAFT,
  REVIEW_SORT_OPTIONS,
  COMPARE_TABLE_VIEWS,
  COMPARE_METRIC_GROUPS,
  COMPARE_KEY_METRIC_LABELS,
  FAQ_TOPIC_CHIPS,
  MIN_REVIEW_QUOTE_LENGTH,
  REVIEW_PREVIEW_LIMIT,
  RANK_PRESETS,
  REVIEW_PAGE_SIZE,
  UNLIMITED_SITE_LIMIT,
  DEFAULT_HOST_REVIEW_SIGNAL,
  currency,
  compactNumber,
  reviewDateFormatter,
};
