import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FAQ_ITEMS, HOSTS, REVIEWS, TRUST_METRICS } from './data/hosts';
import s from './App.module.css';

const SORT_OPTIONS = [
  { id: 'overall', label: 'Top score' },
  { id: 'price', label: 'Lowest intro price' },
  { id: 'support', label: 'Fastest support' },
  { id: 'payout', label: 'Highest partner bonus' },
];

const CATEGORIES = ['All', ...new Set(HOSTS.map((host) => host.category))];
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
    profile: {
      projectType: 'saas',
      traffic: 'scale',
      priority: 'speed',
      budget: 48,
    },
  },
];

const HERO_PANEL_VIEWS = [
  {
    id: 'leaders',
    label: 'Leaders',
    step: 'Step 1',
    hint: 'Scan top picks before narrowing your options.',
  },
  {
    id: 'compare',
    label: 'Compare',
    step: 'Step 2',
    hint: 'Set your exact matchup and check key differences.',
  },
  {
    id: 'verdict',
    label: 'Verdict',
    step: 'Step 3',
    hint: 'Validate confidence before opening offer pages.',
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
  reviews: 'hostaff.reviews.v2',
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

const LAB_PRIORITIES = [
  { id: 'balanced', label: 'Balanced' },
  { id: 'speed', label: 'Speed first' },
  { id: 'support', label: 'Support first' },
  { id: 'value', label: 'Value first' },
];

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

const DEFAULT_REVIEW_DRAFT = {
  name: '',
  role: '',
  hostId: HOSTS[0].id,
  quote: '',
  monthlySavings: 150,
  score: 5,
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

const FAQ_TOPIC_CHIPS = [
  { id: 'ranking', label: 'Ranking method', query: 'rank' },
  { id: 'pricing', label: 'Pricing updates', query: 'price' },
  { id: 'affiliate', label: 'Affiliate policy', query: 'affiliate' },
  { id: 'migration', label: 'Migration', query: 'migration' },
];

const MIN_REVIEW_QUOTE_LENGTH = 36;
const REVIEW_PREVIEW_LIMIT = 200;
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isEditableTarget(target) {
  return (
    target instanceof HTMLElement
    && (target.tagName === 'INPUT'
      || target.tagName === 'TEXTAREA'
      || target.tagName === 'SELECT'
      || target.isContentEditable)
  );
}

function scoreHost(host) {
  return Math.round(
    host.performance * 0.4
      + host.support * 0.25
      + host.value * 0.2
      + host.overallScore * 0.15
  );
}

function sortHosts(hosts, sortKey) {
  const list = [...hosts];

  if (sortKey === 'price') {
    return list.sort((a, b) => a.priceIntro - b.priceIntro);
  }

  if (sortKey === 'support') {
    return list.sort((a, b) => a.supportResponseMinutes - b.supportResponseMinutes);
  }

  if (sortKey === 'payout') {
    return list.sort((a, b) => b.affiliatePayout - a.affiliatePayout);
  }

  return list.sort((a, b) => scoreHost(b) - scoreHost(a));
}

function scoreLabHost(host, profile) {
  const budgetFit = clamp(100 - Math.abs(host.priceIntro - profile.budget) * 4.4, 0, 100);
  const projectFitBoost = host.projectFit.includes(profile.projectType) ? 10 : 0;
  const trafficFitBoost = host.trafficFit.includes(profile.traffic) ? 8 : 0;
  const scaleSignal = clamp(host.dataCenters * 1.3 + (host.uptimePercent - 99) * 25, 0, 100);

  const priorityScore = {
    speed: host.performance * 0.62 + host.overallScore * 0.25 + host.support * 0.13,
    support: host.support * 0.58 + host.overallScore * 0.22 + host.value * 0.2,
    value: host.value * 0.56 + host.performance * 0.2 + host.support * 0.14 + (100 - host.priceIntro * 3.2) * 0.1,
    balanced: scoreHost(host),
  }[profile.priority];

  const composite = priorityScore * 0.56 + budgetFit * 0.22 + scaleSignal * 0.12 + host.support * 0.1;
  const overBudgetPenalty = host.priceIntro > profile.budget * 1.65 ? 12 : 0;

  return Math.round(clamp(composite + projectFitBoost + trafficFitBoost - overBudgetPenalty, 0, 100));
}

function getProjectLabel(projectType) {
  return LAB_PROJECTS.find((item) => item.id === projectType)?.label || 'Project';
}

function getLabReasons(host, profile) {
  const reasons = [];

  if (host.projectFit.includes(profile.projectType)) {
    reasons.push(`Strong match for ${getProjectLabel(profile.projectType).toLowerCase()}.`);
  }

  if (profile.priority === 'speed') {
    reasons.push(`Performance score ${host.performance}/100 supports latency-sensitive workloads.`);
  } else if (profile.priority === 'support') {
    reasons.push(`Support response averages ${host.supportResponseMinutes} minutes.`);
  } else if (profile.priority === 'value') {
    reasons.push(`Value score ${host.value}/100 with intro pricing at ${currency.format(host.priceIntro)}.`);
  } else {
    reasons.push(`Balanced profile with overall score ${host.overallScore}/100.`);
  }

  if (host.trafficFit.includes(profile.traffic)) {
    reasons.push(`Built for ${profile.traffic} traffic stage.`);
  } else {
    reasons.push(`${host.dataCenters} data center regions keep growth options open.`);
  }

  const budgetGap = profile.budget - host.priceIntro;
  if (budgetGap >= 0) {
    reasons.push(`Inside your ${currency.format(profile.budget)}/month target.`);
  } else {
    reasons.push(`Above target by ${currency.format(Math.abs(budgetGap))} but strong on capability.`);
  }

  return reasons.slice(0, 3);
}

function hashSeed(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 2147483647;
  }

  return hash;
}

function buildHostAvatarPlaceholder(host) {
  const palette = HOST_PLACEHOLDER_PALETTES[hashSeed(host.id) % HOST_PLACEHOLDER_PALETTES.length];
  const initials = host.name
    .split(/\s+/)
    .map((part) => part[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.start}" />
      <stop offset="100%" stop-color="${palette.end}" />
    </linearGradient>
  </defs>
  <rect width="96" height="96" rx="24" fill="url(#g)" />
  <text
    x="48"
    y="58"
    text-anchor="middle"
    font-family="Space Grotesk, Arial, sans-serif"
    font-size="34"
    font-weight="700"
    fill="#ffffff"
  >
    ${initials}
  </text>
</svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildHostGoogleFaviconUrl(host) {
  try {
    const hostname = new URL(host.affiliateUrl).hostname.replace(/^www\./i, '');
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;
  } catch {
    return '';
  }
}

function normalizeReview(review, fallbackId) {
  if (!review || typeof review !== 'object') {
    return null;
  }

  const name = String(review.name || '').trim();
  const role = String(review.role || '').trim();
  const quote = String(review.quote || '').trim();

  if (!name || !role || !quote) {
    return null;
  }

  return {
    id: String(review.id ?? fallbackId),
    name,
    role,
    hostId: HOST_BY_ID.has(review.hostId) ? review.hostId : HOSTS[0].id,
    quote,
    monthlySavings: clamp(Number(review.monthlySavings) || 0, 0, 20000),
    score: clamp(Number(review.score) || 5, 1, 5),
    createdAt: typeof review.createdAt === 'string' ? review.createdAt : '',
  };
}

function getReviewTimestamp(review) {
  if (!review?.createdAt) {
    return 0;
  }

  const timestamp = new Date(review.createdAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatSiteLimit(limit) {
  if (!Number.isFinite(limit) || limit <= 0) {
    return 'N/A';
  }

  if (limit >= UNLIMITED_SITE_LIMIT) {
    return 'Unlimited';
  }

  return `${limit} site${limit === 1 ? '' : 's'}`;
}

function RatingStars({ rating }) {
  const rounded = Math.round(rating);

  return (
    <div className={s.stars} aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < rounded;
        return (
          <svg
            key={`star-${index + 1}`}
            className={`${s.star} ${filled ? s.starFilled : ''}`}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2.5l2.87 5.8 6.4.93-4.63 4.5 1.09 6.37L12 17.07 6.27 20.1l1.09-6.37-4.63-4.5 6.4-.93L12 2.5z" />
          </svg>
        );
      })}
    </div>
  );
}

function MetricBar({ label, value }) {
  return (
    <div className={s.metricRow}>
      <span>{label}</span>
      <div className={s.metricTrack} aria-hidden="true">
        <div className={s.metricFill} style={{ width: `${value}%` }} />
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function loadInitialShortlist() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedShortlist = window.localStorage.getItem(STORAGE_KEYS.shortlist);
    const parsedShortlist = storedShortlist ? JSON.parse(storedShortlist) : [];

    if (!Array.isArray(parsedShortlist)) {
      return [];
    }

    return parsedShortlist
      .filter((id) => HOST_BY_ID.has(id))
      .slice(0, 8);
  } catch {
    return [];
  }
}

function loadInitialLabProfile() {
  if (typeof window === 'undefined') {
    return DEFAULT_LAB_PROFILE;
  }

  try {
    const storedLab = window.localStorage.getItem(STORAGE_KEYS.lab);
    const parsedLab = storedLab ? JSON.parse(storedLab) : null;

    if (!parsedLab || typeof parsedLab !== 'object') {
      return DEFAULT_LAB_PROFILE;
    }

    return {
      projectType: LAB_PROJECTS.some((option) => option.id === parsedLab.projectType)
        ? parsedLab.projectType
        : DEFAULT_LAB_PROFILE.projectType,
      traffic: LAB_TRAFFIC.some((option) => option.id === parsedLab.traffic)
        ? parsedLab.traffic
        : DEFAULT_LAB_PROFILE.traffic,
      priority: LAB_PRIORITIES.some((option) => option.id === parsedLab.priority)
        ? parsedLab.priority
        : DEFAULT_LAB_PROFILE.priority,
      budget: Number.isFinite(Number(parsedLab.budget))
        ? clamp(Number(parsedLab.budget), 5, 80)
        : DEFAULT_LAB_PROFILE.budget,
    };
  } catch {
    return DEFAULT_LAB_PROFILE;
  }
}

function loadInitialDockState() {
  if (typeof window === 'undefined') {
    return { hidden: false, collapsed: false };
  }

  try {
    const storedDock = window.localStorage.getItem(STORAGE_KEYS.dock);
    const parsedDock = storedDock ? JSON.parse(storedDock) : null;

    if (!parsedDock || typeof parsedDock !== 'object') {
      return { hidden: false, collapsed: false };
    }

    return {
      hidden: Boolean(parsedDock.hidden),
      collapsed: Boolean(parsedDock.collapsed),
    };
  } catch {
    return { hidden: false, collapsed: false };
  }
}

function loadInitialTheme() {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  try {
    const storedTheme = window.localStorage.getItem(STORAGE_KEYS.theme);
    const resolvedTheme = storedTheme === DEFAULT_THEME || storedTheme === ALT_THEME
      ? storedTheme
      : DEFAULT_THEME;

    document.documentElement.dataset.theme = resolvedTheme;
    return resolvedTheme;
  } catch {
    // Fall through to default theme when storage is unavailable.
  }

  return DEFAULT_THEME;
}

function loadInitialReviews() {
  const seededReviews = REVIEWS
    .map((review, index) => normalizeReview(review, `seed-${index + 1}`))
    .filter(Boolean);

  if (typeof window === 'undefined') {
    return seededReviews;
  }

  try {
    const storedReviews = window.localStorage.getItem(STORAGE_KEYS.reviews);
    if (!storedReviews) {
      return seededReviews;
    }

    const parsedReviews = JSON.parse(storedReviews);
    if (!Array.isArray(parsedReviews)) {
      return seededReviews;
    }

    const normalizedReviews = parsedReviews
      .map((review, index) => normalizeReview(review, `stored-${index + 1}`))
      .filter(Boolean);

    return normalizedReviews.length ? normalizedReviews : seededReviews;
  } catch {
    return seededReviews;
  }
}

function loadInitialHeroPanelAutoPlay() {
  if (typeof window === 'undefined') {
    return true;
  }

  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function normalizeCompareIds(ids) {
  const valid = Array.isArray(ids)
    ? ids.filter((id) => HOST_BY_ID.has(id) && id)
    : [];

  const unique = [];
  valid.forEach((id) => {
    if (!unique.includes(id)) {
      unique.push(id);
    }
  });

  while (unique.length < 2) {
    const fallback = HOSTS.find((host) => !unique.includes(host.id))?.id;
    if (!fallback) {
      break;
    }
    unique.push(fallback);
  }

  return unique.slice(0, 3);
}

function areIdListsEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return false;
  }

  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) {
      return false;
    }
  }

  return true;
}

function moveHostToCompareSlot(ids, hostId, slotIndex) {
  const normalized = normalizeCompareIds(ids);

  if (!HOST_BY_ID.has(hostId)) {
    return normalized;
  }

  const next = normalized.filter((id) => id !== hostId);
  const boundedSlotIndex = Math.max(0, Math.min(2, Number(slotIndex) || 0));
  const insertIndex = Math.min(boundedSlotIndex, next.length);

  next.splice(insertIndex, 0, hostId);
  return normalizeCompareIds(next.slice(0, 3));
}

function loadInitialCompareIds() {
  if (typeof window === 'undefined') {
    return normalizeCompareIds(DEFAULT_COMPARE);
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCompareIds = String(urlParams.get('compare') || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .filter((id) => HOST_BY_ID.has(id));

    if (urlCompareIds.length >= 2) {
      return normalizeCompareIds(urlCompareIds);
    }
  } catch {
    // Continue to local storage fallback.
  }

  try {
    const storedCompare = window.localStorage.getItem(STORAGE_KEYS.compare);
    const parsedCompare = storedCompare ? JSON.parse(storedCompare) : [];
    const validStored = Array.isArray(parsedCompare)
      ? parsedCompare.filter((id) => HOST_BY_ID.has(id))
      : [];

    if (validStored.length >= 2) {
      return normalizeCompareIds(validStored);
    }
  } catch {
    // Fall through to default compare slots.
  }

  return normalizeCompareIds(DEFAULT_COMPARE);
}

function loadInitialRankingControls() {
  const fallback = {
    activeCategory: 'All',
    sortKey: 'overall',
    searchTerm: '',
  };

  if (typeof window === 'undefined') {
    return fallback;
  }

  const next = { ...fallback };

  try {
    const storedControls = window.localStorage.getItem(STORAGE_KEYS.controls);
    const parsedControls = storedControls ? JSON.parse(storedControls) : null;

    if (parsedControls && typeof parsedControls === 'object') {
      if (CATEGORIES.includes(parsedControls.activeCategory)) {
        next.activeCategory = parsedControls.activeCategory;
      }

      if (SORT_OPTIONS.some((option) => option.id === parsedControls.sortKey)) {
        next.sortKey = parsedControls.sortKey;
      }

      if (typeof parsedControls.searchTerm === 'string') {
        next.searchTerm = parsedControls.searchTerm.slice(0, 80);
      }
    }
  } catch {
    // Ignore storage errors.
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get('category');
    const urlSort = urlParams.get('sort');
    const urlQuery = urlParams.get('q');
    const hasUrlControlState = urlParams.has('compare')
      || urlParams.has('category')
      || urlParams.has('sort')
      || urlParams.has('q');

    if (urlCategory && CATEGORIES.includes(urlCategory)) {
      next.activeCategory = urlCategory;
    }

    if (urlSort && SORT_OPTIONS.some((option) => option.id === urlSort)) {
      next.sortKey = urlSort;
    }

    if (hasUrlControlState) {
      next.searchTerm = typeof urlQuery === 'string' ? urlQuery.trim().slice(0, 80) : '';
    }
  } catch {
    // Ignore URL parsing errors.
  }

  return next;
}

function loadInitialReviewFilters() {
  const fallback = {
    reviewHostFilter: 'all',
    reviewSortKey: 'recent',
    reviewMinScore: 0,
    reviewQuery: '',
  };

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const storedFilters = window.localStorage.getItem(STORAGE_KEYS.reviewFilters);
    const parsedFilters = storedFilters ? JSON.parse(storedFilters) : null;

    if (!parsedFilters || typeof parsedFilters !== 'object') {
      return fallback;
    }

    return {
      reviewHostFilter: parsedFilters.reviewHostFilter === 'all' || HOST_BY_ID.has(parsedFilters.reviewHostFilter)
        ? parsedFilters.reviewHostFilter
        : fallback.reviewHostFilter,
      reviewSortKey: REVIEW_SORT_OPTIONS.some((option) => option.id === parsedFilters.reviewSortKey)
        ? parsedFilters.reviewSortKey
        : fallback.reviewSortKey,
      reviewMinScore: Number.isFinite(Number(parsedFilters.reviewMinScore))
        ? clamp(Number(parsedFilters.reviewMinScore), 0, 5)
        : fallback.reviewMinScore,
      reviewQuery: typeof parsedFilters.reviewQuery === 'string'
        ? parsedFilters.reviewQuery.slice(0, 100)
        : fallback.reviewQuery,
    };
  } catch {
    return fallback;
  }
}

function loadInitialReviewDraft() {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_REVIEW_DRAFT };
  }

  try {
    const storedDraft = window.localStorage.getItem(STORAGE_KEYS.reviewDraft);
    const parsedDraft = storedDraft ? JSON.parse(storedDraft) : null;

    if (!parsedDraft || typeof parsedDraft !== 'object') {
      return { ...DEFAULT_REVIEW_DRAFT };
    }

    return {
      name: typeof parsedDraft.name === 'string' ? parsedDraft.name.slice(0, 80) : DEFAULT_REVIEW_DRAFT.name,
      role: typeof parsedDraft.role === 'string' ? parsedDraft.role.slice(0, 100) : DEFAULT_REVIEW_DRAFT.role,
      hostId: HOST_BY_ID.has(parsedDraft.hostId) ? parsedDraft.hostId : DEFAULT_REVIEW_DRAFT.hostId,
      quote: typeof parsedDraft.quote === 'string' ? parsedDraft.quote.slice(0, 1200) : DEFAULT_REVIEW_DRAFT.quote,
      monthlySavings: Number.isFinite(Number(parsedDraft.monthlySavings))
        ? clamp(Number(parsedDraft.monthlySavings), 0, 20000)
        : DEFAULT_REVIEW_DRAFT.monthlySavings,
      score: Number.isFinite(Number(parsedDraft.score))
        ? clamp(Number(parsedDraft.score), 1, 5)
        : DEFAULT_REVIEW_DRAFT.score,
    };
  } catch {
    return { ...DEFAULT_REVIEW_DRAFT };
  }
}

let initialRankingControlsCache;
let initialReviewFiltersCache;
let initialReviewHelpfulCache;

function loadInitialCompareTableView() {
  if (typeof window === 'undefined') {
    return COMPARE_TABLE_VIEWS[0].id;
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlView = String(urlParams.get('compareView') || '').trim();

    if (COMPARE_TABLE_VIEWS.some((view) => view.id === urlView)) {
      return urlView;
    }
  } catch {
    // Continue to local storage fallback.
  }

  try {
    const storedView = window.localStorage.getItem(STORAGE_KEYS.compareTable);
    if (COMPARE_TABLE_VIEWS.some((view) => view.id === storedView)) {
      return storedView;
    }
  } catch {
    // Ignore storage errors.
  }

  return COMPARE_TABLE_VIEWS[0].id;
}

function loadInitialReviewHelpfulState() {
  const fallback = { counts: {}, votedIds: [] };

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const storedState = window.localStorage.getItem(STORAGE_KEYS.reviewHelpful);
    const parsedState = storedState ? JSON.parse(storedState) : null;

    if (!parsedState || typeof parsedState !== 'object') {
      return fallback;
    }

    const rawCounts = parsedState.counts;
    const rawVotedIds = parsedState.votedIds;

    const counts = Object.entries(rawCounts && typeof rawCounts === 'object' ? rawCounts : {})
      .reduce((acc, [reviewId, value]) => {
        const parsedValue = clamp(Number(value) || 0, 0, 9999);
        if (parsedValue > 0) {
          acc[reviewId] = parsedValue;
        }
        return acc;
      }, {});

    const votedIds = Array.isArray(rawVotedIds)
      ? rawVotedIds
        .map((reviewId) => String(reviewId))
        .filter(Boolean)
        .slice(-600)
      : [];

    return { counts, votedIds };
  } catch {
    return fallback;
  }
}

function getInitialRankingControls() {
  if (!initialRankingControlsCache) {
    initialRankingControlsCache = loadInitialRankingControls();
  }

  return initialRankingControlsCache;
}

function getInitialReviewFilters() {
  if (!initialReviewFiltersCache) {
    initialReviewFiltersCache = loadInitialReviewFilters();
  }

  return initialReviewFiltersCache;
}

function getInitialReviewHelpfulState() {
  if (!initialReviewHelpfulCache) {
    initialReviewHelpfulCache = loadInitialReviewHelpfulState();
  }

  return initialReviewHelpfulCache;
}

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [activeCategory, setActiveCategory] = useState(() => getInitialRankingControls().activeCategory);
  const [sortKey, setSortKey] = useState(() => getInitialRankingControls().sortKey);
  const [searchTerm, setSearchTerm] = useState(() => getInitialRankingControls().searchTerm);
  const [compareIds, setCompareIds] = useState(loadInitialCompareIds);
  const [compareTableView, setCompareTableView] = useState(loadInitialCompareTableView);
  const [shortlistIds, setShortlistIds] = useState(loadInitialShortlist);
  const [labProfile, setLabProfile] = useState(loadInitialLabProfile);
  const [monthlySpend, setMonthlySpend] = useState(45);
  const [calculatorHostId, setCalculatorHostId] = useState(HOSTS[0].id);
  const [heroPanelView, setHeroPanelView] = useState(HERO_PANEL_VIEWS[0].id);
  const [heroPanelAutoPlay, setHeroPanelAutoPlay] = useState(loadInitialHeroPanelAutoPlay);
  const [heroPanelInteracting, setHeroPanelInteracting] = useState(false);
  const [theme, setTheme] = useState(loadInitialTheme);
  const [reviews, setReviews] = useState(loadInitialReviews);
  const [reviewHelpfulCounts, setReviewHelpfulCounts] = useState(() => getInitialReviewHelpfulState().counts);
  const [reviewHelpfulVotedIds, setReviewHelpfulVotedIds] = useState(() => getInitialReviewHelpfulState().votedIds);
  const [isReviewComposerOpen, setIsReviewComposerOpen] = useState(false);
  const [reviewDraft, setReviewDraft] = useState(loadInitialReviewDraft);
  const [reviewFormError, setReviewFormError] = useState('');
  const [reviewHostFilter, setReviewHostFilter] = useState(() => getInitialReviewFilters().reviewHostFilter);
  const [reviewSortKey, setReviewSortKey] = useState(() => getInitialReviewFilters().reviewSortKey);
  const [reviewMinScore, setReviewMinScore] = useState(() => getInitialReviewFilters().reviewMinScore);
  const [reviewQuery, setReviewQuery] = useState(() => getInitialReviewFilters().reviewQuery);
  const [reviewVisibleCount, setReviewVisibleCount] = useState(REVIEW_PAGE_SIZE);
  const [expandedReviewIds, setExpandedReviewIds] = useState([]);
  const [faqQuery, setFaqQuery] = useState('');
  const [headerOffset, setHeaderOffset] = useState(128);
  const [dockState, setDockState] = useState(loadInitialDockState);
  const [toast, setToast] = useState({
    id: 0,
    message: '',
    actionId: '',
    actionLabel: '',
  });
  const [lastClearedShortlist, setLastClearedShortlist] = useState([]);
  const [lastReviewFiltersSnapshot, setLastReviewFiltersSnapshot] = useState(null);
  const [lastSharedCompareLink, setLastSharedCompareLink] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const headerRef = useRef(null);
  const hasSyncedInitialHashRef = useRef(false);
  const searchInputRef = useRef(null);
  const commandInputRef = useRef(null);

  const pushToast = useCallback((message, action = null) => {
    setToast((current) => ({
      id: current.id + 1,
      message,
      actionId: action?.id || '',
      actionLabel: action?.label || '',
    }));
  }, []);

  const dismissToast = useCallback(() => {
    setToast((current) => ({
      ...current,
      message: '',
      actionId: '',
      actionLabel: '',
    }));
  }, []);

  useEffect(() => {
    setCompareIds((current) => {
      const normalized = normalizeCompareIds(current);
      return areIdListsEqual(current, normalized) ? current : normalized;
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.shortlist, JSON.stringify(shortlistIds));
  }, [shortlistIds]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.lab, JSON.stringify(labProfile));
  }, [labProfile]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.dock, JSON.stringify(dockState));
  }, [dockState]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.compare, JSON.stringify(compareIds));
  }, [compareIds]);

  useEffect(() => {
    const normalizedCurrent = normalizeCompareIds(compareIds);
    const preferredHostId = normalizedCurrent[0] || HOSTS[0].id;

    setCalculatorHostId((current) => (
      normalizedCurrent.includes(current) ? current : preferredHostId
    ));

    setReviewDraft((current) => {
      const isPristineDraft = !current.name.trim() && !current.role.trim() && !current.quote.trim();
      if (!isPristineDraft || current.hostId === preferredHostId) {
        return current;
      }

      return {
        ...current,
        hostId: preferredHostId,
      };
    });
  }, [compareIds]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.compareTable, compareTableView);
  }, [compareTableView]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEYS.controls,
      JSON.stringify({
        activeCategory,
        sortKey,
        searchTerm,
      })
    );
  }, [activeCategory, sortKey, searchTerm]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEYS.reviewFilters,
      JSON.stringify({
        reviewHostFilter,
        reviewSortKey,
        reviewMinScore,
        reviewQuery,
      })
    );
  }, [reviewHostFilter, reviewSortKey, reviewMinScore, reviewQuery]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.reviewDraft, JSON.stringify(reviewDraft));
  }, [reviewDraft]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEYS.reviewHelpful,
      JSON.stringify({
        counts: reviewHelpfulCounts,
        votedIds: reviewHelpfulVotedIds,
      })
    );
  }, [reviewHelpfulCounts, reviewHelpfulVotedIds]);

  useEffect(() => {
    setReviewVisibleCount(REVIEW_PAGE_SIZE);
    setExpandedReviewIds([]);
  }, [reviewHostFilter, reviewMinScore, reviewQuery, reviewSortKey, reviews.length]);

  useEffect(() => {
    const measureHeaderOffset = () => {
      const headerHeight = headerRef.current?.getBoundingClientRect().height || 0;
      const nextOffset = Math.round(Math.max(96, headerHeight + 10));
      setHeaderOffset((current) => (current === nextOffset ? current : nextOffset));
      document.documentElement.style.setProperty('--header-offset', `${nextOffset}px`);
    };

    measureHeaderOffset();
    window.addEventListener('resize', measureHeaderOffset, { passive: true });

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined' && headerRef.current) {
      resizeObserver = new ResizeObserver(measureHeaderOffset);
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      window.removeEventListener('resize', measureHeaderOffset);
      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      event.preventDefault();
      searchInputRef.current?.focus();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!isCommandOpen) {
      return;
    }

    commandInputRef.current?.focus();
  }, [isCommandOpen]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (isCommandOpen && event.key === 'Escape') {
        event.preventDefault();
        setIsCommandOpen(false);
        setCommandQuery('');
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsCommandOpen((current) => !current);
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey || isEditableTarget(event.target)) {
        return;
      }

      if (event.key === '?') {
        event.preventDefault();
        setIsCommandOpen(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCommandOpen]);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 700);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!toast.message) {
      return undefined;
    }

    const timeoutMs = toast.actionId ? 4600 : 2600;
    const timeout = window.setTimeout(() => {
      setToast((current) => ({
        ...current,
        message: '',
        actionId: '',
        actionLabel: '',
      }));
    }, timeoutMs);

    return () => window.clearTimeout(timeout);
  }, [toast.actionId, toast.id, toast.message]);

  useEffect(() => {
    if (!heroPanelAutoPlay || heroPanelInteracting || isCommandOpen) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setHeroPanelView((current) => {
        const currentIndex = HERO_PANEL_VIEWS.findIndex((view) => view.id === current);
        const safeIndex = currentIndex < 0 ? 0 : currentIndex;
        return HERO_PANEL_VIEWS[(safeIndex + 1) % HERO_PANEL_VIEWS.length].id;
      });
    }, 5200);

    return () => window.clearInterval(interval);
  }, [heroPanelAutoPlay, heroPanelInteracting, isCommandOpen]);

  useEffect(() => {
    const sections = NAV_SECTIONS
      .map((section) => document.getElementById(section.id))
      .filter(Boolean);

    if (!sections.length) {
      return undefined;
    }

    let rafId = 0;

    const computeActiveSection = () => {
      rafId = 0;

      const anchorOffset = Math.max(headerOffset + 14, Math.round(window.innerHeight * 0.2));
      const anchorLine = window.scrollY + anchorOffset;

      let nextSection = sections[0].id;
      sections.forEach((section) => {
        if (section.offsetTop <= anchorLine) {
          nextSection = section.id;
        }
      });

      const reachedBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (reachedBottom) {
        nextSection = sections[sections.length - 1].id;
      }

      setActiveSection((current) => (current === nextSection ? current : nextSection));
    };

    const queueComputeActiveSection = () => {
      if (rafId) {
        return;
      }
      rafId = window.requestAnimationFrame(computeActiveSection);
    };

    queueComputeActiveSection();
    window.addEventListener('scroll', queueComputeActiveSection, { passive: true });
    window.addEventListener('resize', queueComputeActiveSection, { passive: true });

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(queueComputeActiveSection);
      sections.forEach((section) => resizeObserver.observe(section));
    }

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', queueComputeActiveSection);
      window.removeEventListener('resize', queueComputeActiveSection);
      resizeObserver?.disconnect();
    };
  }, [headerOffset]);

  const rankedHosts = useMemo(() => {
    let filtered = activeCategory === 'All'
      ? HOSTS
      : HOSTS.filter((host) => host.category === activeCategory);

    const query = searchTerm.trim().toLowerCase();

    if (query) {
      filtered = filtered.filter((host) => {
        const haystack = [
          host.name,
          host.category,
          host.planType,
          host.bestFor,
          host.tagline,
          host.controlPanel,
          host.backupPolicy,
          host.supportChannels,
          host.promoLabel,
          ...host.features,
        ].join(' ').toLowerCase();
        return haystack.includes(query);
      });
    }

    return sortHosts(filtered, sortKey);
  }, [activeCategory, sortKey, searchTerm]);

  const heroTopHosts = useMemo(
    () => sortHosts(HOSTS, 'overall').slice(0, 3),
    []
  );
  const hostAvatarFallbackImages = useMemo(
    () => Object.fromEntries(HOSTS.map((host) => [host.id, buildHostAvatarPlaceholder(host)])),
    []
  );
  const hostFaviconImages = useMemo(
    () => Object.fromEntries(HOSTS.map((host) => [host.id, buildHostGoogleFaviconUrl(host)])),
    []
  );
  const hostReviewSignals = useMemo(() => {
    const signals = new Map();

    HOSTS.forEach((host) => {
      const relatedReviews = reviews.filter((review) => review.hostId === host.id);
      const newReviewCount = relatedReviews.length;
      const scoreTotal = relatedReviews.reduce(
        (sum, review) => sum + clamp(Number(review.score) || 0, 1, 5),
        0
      );
      const userSavingsTotal = relatedReviews.reduce(
        (sum, review) => sum + clamp(Number(review.monthlySavings) || 0, 0, 20000),
        0
      );
      const totalReviewCount = host.reviewCount + newReviewCount;
      const weightedScore = totalReviewCount
        ? ((host.rating * host.reviewCount) + scoreTotal) / totalReviewCount
        : host.rating;

      signals.set(host.id, {
        newReviewCount,
        totalReviewCount,
        weightedScore,
        averageUserSavings: newReviewCount ? userSavingsTotal / newReviewCount : 0,
      });
    });

    return signals;
  }, [reviews]);
  const totalReviewSignalCount = useMemo(
    () => [...hostReviewSignals.values()].reduce(
      (sum, signal) => sum + signal.totalReviewCount,
      0
    ),
    [hostReviewSignals]
  );
  const workspaceReviewSignalCount = useMemo(
    () => reviews.filter((review) => String(review.id).startsWith('user-')).length,
    [reviews]
  );
  const getHostReviewSignal = (hostId) => hostReviewSignals.get(hostId) || DEFAULT_HOST_REVIEW_SIGNAL;
  const hostSelectOptions = useMemo(() => {
    const seen = new Set();
    const prioritized = [];
    const prioritizedCompareIds = normalizeCompareIds(compareIds);

    prioritizedCompareIds.forEach((hostId) => {
      const host = HOST_BY_ID.get(hostId);
      if (!host || seen.has(host.id)) {
        return;
      }
      prioritized.push(host);
      seen.add(host.id);
    });

    HOSTS.forEach((host) => {
      if (seen.has(host.id)) {
        return;
      }
      prioritized.push(host);
      seen.add(host.id);
    });

    return prioritized;
  }, [compareIds]);
  const reviewHostCounts = useMemo(() => {
    const counts = new Map();

    reviews.forEach((review) => {
      if (!HOST_BY_ID.has(review.hostId)) {
        return;
      }
      counts.set(review.hostId, (counts.get(review.hostId) || 0) + 1);
    });

    return counts;
  }, [reviews]);
  const reviewHostOptions = useMemo(() => {
    const options = [{ id: 'all', label: 'All hosts', count: reviews.length }];

    hostSelectOptions.forEach((host) => {
      const count = reviewHostCounts.get(host.id) || 0;
      options.push({ id: host.id, label: host.name, count });
    });

    return options;
  }, [hostSelectOptions, reviewHostCounts, reviews.length]);
  const reviewAverageScore = useMemo(() => {
    if (!reviews.length) {
      return 0;
    }

    const total = reviews.reduce((sum, review) => sum + clamp(Number(review.score) || 0, 1, 5), 0);
    return total / reviews.length;
  }, [reviews]);
  const reviewAverageSavings = useMemo(() => {
    if (!reviews.length) {
      return 0;
    }

    const total = reviews.reduce((sum, review) => sum + clamp(Number(review.monthlySavings) || 0, 0, 20000), 0);
    return total / reviews.length;
  }, [reviews]);
  const marketplaceAverageScore = useMemo(() => {
    if (!totalReviewSignalCount) {
      return reviewAverageScore;
    }

    const weightedTotal = HOSTS.reduce((sum, host) => {
      const signal = hostReviewSignals.get(host.id) || DEFAULT_HOST_REVIEW_SIGNAL;
      if (!signal.totalReviewCount) {
        return sum;
      }
      return sum + signal.weightedScore * signal.totalReviewCount;
    }, 0);

    return weightedTotal / totalReviewSignalCount;
  }, [hostReviewSignals, reviewAverageScore, totalReviewSignalCount]);
  const marketplaceTopReviewedHost = useMemo(() => {
    let winner = null;
    let winnerCount = -1;

    HOSTS.forEach((host) => {
      const totalCount = hostReviewSignals.get(host.id)?.totalReviewCount || host.reviewCount;
      if (totalCount > winnerCount) {
        winner = host;
        winnerCount = totalCount;
      }
    });

    return winner;
  }, [hostReviewSignals]);
  const reviewHelpfulVotedSet = useMemo(
    () => new Set(reviewHelpfulVotedIds),
    [reviewHelpfulVotedIds]
  );
  const reviewQueryNormalized = reviewQuery.trim().toLowerCase();
  const filteredReviews = useMemo(() => {
    const filtered = reviews.filter((review) => (
      (reviewHostFilter === 'all' || review.hostId === reviewHostFilter)
      && clamp(Number(review.score) || 0, 1, 5) >= reviewMinScore
      && (
        !reviewQueryNormalized
        || `${review.name} ${review.role} ${review.quote} ${HOST_BY_ID.get(review.hostId)?.name || ''}`
          .toLowerCase()
          .includes(reviewQueryNormalized)
      )
    ));

    const sorted = [...filtered];

    if (reviewSortKey === 'score') {
      sorted.sort((a, b) => {
        const scoreGap = (Number(b.score) || 0) - (Number(a.score) || 0);
        if (scoreGap !== 0) {
          return scoreGap;
        }
        return getReviewTimestamp(b) - getReviewTimestamp(a);
      });
      return sorted;
    }

    if (reviewSortKey === 'helpful') {
      sorted.sort((a, b) => {
        const helpfulGap = (Number(reviewHelpfulCounts[b.id]) || 0) - (Number(reviewHelpfulCounts[a.id]) || 0);
        if (helpfulGap !== 0) {
          return helpfulGap;
        }
        return getReviewTimestamp(b) - getReviewTimestamp(a);
      });
      return sorted;
    }

    if (reviewSortKey === 'savings') {
      sorted.sort((a, b) => {
        const savingsGap = (Number(b.monthlySavings) || 0) - (Number(a.monthlySavings) || 0);
        if (savingsGap !== 0) {
          return savingsGap;
        }
        return getReviewTimestamp(b) - getReviewTimestamp(a);
      });
      return sorted;
    }

    sorted.sort((a, b) => getReviewTimestamp(b) - getReviewTimestamp(a));
    return sorted;
  }, [reviewHelpfulCounts, reviewHostFilter, reviewMinScore, reviewQueryNormalized, reviewSortKey, reviews]);
  const reviewPositiveRate = useMemo(() => {
    if (!reviews.length) {
      return 0;
    }

    const positiveCount = reviews.filter((review) => clamp(Number(review.score) || 0, 1, 5) >= 4.5).length;
    return Math.round((positiveCount / reviews.length) * 100);
  }, [reviews]);
  const reviewStarBuckets = useMemo(
    () => [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter(
        (review) => Math.round(clamp(Number(review.score) || 0, 1, 5)) === star
      ).length;
      const percent = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
      return { star, count, percent };
    }),
    [reviews]
  );
  const reviewSortLabel = REVIEW_SORT_OPTIONS.find((option) => option.id === reviewSortKey)?.label || 'Newest first';
  const activeReviewHost = reviewHostFilter === 'all' ? null : HOST_BY_ID.get(reviewHostFilter);
  const activeReviewFilterCount = Number(reviewHostFilter !== 'all') + Number(reviewMinScore > 0) + Number(reviewQueryNormalized.length > 0);
  const displayedReviews = filteredReviews.slice(0, reviewVisibleCount);
  const hasMoreReviews = reviewVisibleCount < filteredReviews.length;
  const hiddenReviewCount = Math.max(0, filteredReviews.length - displayedReviews.length);
  const reviewQueryChipLabel = reviewQueryNormalized.length > 28
    ? `${reviewQueryNormalized.slice(0, 28)}...`
    : reviewQueryNormalized;
  const totalHelpfulVotes = useMemo(
    () => Object.values(reviewHelpfulCounts).reduce((sum, count) => sum + (Number(count) || 0), 0),
    [reviewHelpfulCounts]
  );
  const featuredReview = useMemo(() => {
    if (!displayedReviews.length) {
      return null;
    }

    return [...displayedReviews].sort((a, b) => {
      const helpfulGap = (Number(reviewHelpfulCounts[b.id]) || 0) - (Number(reviewHelpfulCounts[a.id]) || 0);
      if (helpfulGap !== 0) {
        return helpfulGap;
      }

      const scoreGap = (Number(b.score) || 0) - (Number(a.score) || 0);
      if (scoreGap !== 0) {
        return scoreGap;
      }

      return getReviewTimestamp(b) - getReviewTimestamp(a);
    })[0];
  }, [displayedReviews, reviewHelpfulCounts]);
  const featuredReviewHost = featuredReview ? HOST_BY_ID.get(featuredReview.hostId) || null : null;
  const featuredReviewHostSignal = featuredReviewHost
    ? getHostReviewSignal(featuredReviewHost.id)
    : DEFAULT_HOST_REVIEW_SIGNAL;
  const featuredReviewHelpful = featuredReview ? (Number(reviewHelpfulCounts[featuredReview.id]) || 0) : 0;
  const featuredReviewTimestamp = featuredReview ? getReviewTimestamp(featuredReview) : 0;
  const featuredReviewDateLabel = featuredReviewTimestamp
    ? reviewDateFormatter.format(new Date(featuredReviewTimestamp))
    : 'Verified reviewer';
  const reviewQuoteLength = reviewDraft.quote.trim().length;
  const reviewQuoteRemaining = Math.max(0, MIN_REVIEW_QUOTE_LENGTH - reviewQuoteLength);
  const reviewMonthlySavingsValue = Number(reviewDraft.monthlySavings);
  const reviewScoreValue = Number(reviewDraft.score);
  const isReviewDraftReady = Boolean(
    reviewDraft.name.trim()
    && reviewDraft.role.trim()
    && reviewQuoteRemaining === 0
    && Number.isFinite(reviewMonthlySavingsValue)
    && reviewMonthlySavingsValue >= 0
    && Number.isFinite(reviewScoreValue)
    && reviewScoreValue >= 1
    && reviewScoreValue <= 5
  );

  const topHost = heroTopHosts[0] || HOSTS[0];
  const heroAverageIntro = heroTopHosts.reduce((sum, host) => sum + host.priceIntro, 0) / (heroTopHosts.length || 1);
  const rankingLeader = rankedHosts[0] || topHost;
  const rankingBudgetHost = rankedHosts.length
    ? rankedHosts.reduce((best, host) => (host.priceIntro < best.priceIntro ? host : best), rankedHosts[0])
    : topHost;
  const rankingSupportHost = rankedHosts.length
    ? rankedHosts.reduce(
      (best, host) => (host.supportResponseMinutes < best.supportResponseMinutes ? host : best),
      rankedHosts[0]
    )
    : topHost;
  const rankingPayoutHost = rankedHosts.length
    ? rankedHosts.reduce((best, host) => (host.affiliatePayout > best.affiliatePayout ? host : best), rankedHosts[0])
    : topHost;
  const lastUpdated = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const activeSectionLabel = NAV_SECTIONS.find((section) => section.id === activeSection)?.label || 'Overview';

  const activeJourneyIndex = useMemo(() => {
    const directIndex = JOURNEY_STEPS.findIndex((step) => step.id === activeSection);
    if (directIndex >= 0) {
      return directIndex;
    }

    if (activeSection === 'overview') {
      return 0;
    }

    return JOURNEY_STEPS.length - 1;
  }, [activeSection]);
  const journeyProgress = Math.round(((activeJourneyIndex + 1) / JOURNEY_STEPS.length) * 100);
  const isJourneyFlowComplete = activeJourneyIndex >= JOURNEY_STEPS.length - 1;
  const nextJourneyStep = activeSection === 'overview'
    ? JOURNEY_STEPS[0]
    : isJourneyFlowComplete
      ? { id: 'proof', label: 'Proof', desc: 'Validate social proof before choosing a provider.' }
      : JOURNEY_STEPS[activeJourneyIndex + 1];

  const activeIntentId = useMemo(() => {
    const intent = HERO_INTENTS.find((item) => (
      labProfile.projectType === item.profile.projectType
      && labProfile.traffic === item.profile.traffic
      && labProfile.priority === item.profile.priority
      && Math.abs(labProfile.budget - item.profile.budget) <= 1
    ));

    return intent?.id || '';
  }, [labProfile]);

  const normalizedCompareIds = useMemo(
    () => normalizeCompareIds(compareIds),
    [compareIds]
  );

  const compareHosts = useMemo(
    () => normalizedCompareIds
      .map((id) => HOST_BY_ID.get(id))
      .filter(Boolean),
    [normalizedCompareIds]
  );

  const heroCompareIds = useMemo(() => {
    const ids = [...normalizedCompareIds];
    while (ids.length < 2) {
      const fallback = HOSTS.find((host) => !ids.includes(host.id))?.id;
      if (!fallback) {
        break;
      }
      ids.push(fallback);
    }
    return ids.slice(0, 2);
  }, [normalizedCompareIds]);

  const heroCompareA = HOST_BY_ID.get(heroCompareIds[0]) || topHost;
  const heroCompareB = HOST_BY_ID.get(heroCompareIds[1]) || heroTopHosts[1] || topHost;
  const compareSlotCId = normalizedCompareIds[2] || '';
  const compareSlotLocks = useMemo(
    () => ({
      slotA: new Set([heroCompareB.id, compareSlotCId].filter(Boolean)),
      slotB: new Set([heroCompareA.id, compareSlotCId].filter(Boolean)),
      slotC: new Set([heroCompareA.id, heroCompareB.id].filter(Boolean)),
    }),
    [compareSlotCId, heroCompareA.id, heroCompareB.id]
  );

  const lowerPriceHost = heroCompareA.priceIntro <= heroCompareB.priceIntro ? heroCompareA : heroCompareB;
  const fasterSetupHost = heroCompareA.setupMinutes <= heroCompareB.setupMinutes ? heroCompareA : heroCompareB;
  const strongerSupportHost = heroCompareA.support >= heroCompareB.support ? heroCompareA : heroCompareB;
  const introGap = Math.abs(heroCompareA.priceIntro - heroCompareB.priceIntro);

  const priceSignalA = Math.round((1 - heroCompareA.priceIntro / (heroCompareA.priceIntro + heroCompareB.priceIntro)) * 100);
  const priceSignalB = 100 - priceSignalA;
  const setupSignalA = Math.round((1 - heroCompareA.setupMinutes / (heroCompareA.setupMinutes + heroCompareB.setupMinutes)) * 100);
  const setupSignalB = 100 - setupSignalA;

  const duelRows = [
    {
      id: 'performance',
      label: 'Performance',
      aSignal: heroCompareA.performance,
      bSignal: heroCompareB.performance,
      aValue: `${heroCompareA.performance}/100`,
      bValue: `${heroCompareB.performance}/100`,
    },
    {
      id: 'support',
      label: 'Support',
      aSignal: heroCompareA.support,
      bSignal: heroCompareB.support,
      aValue: `${heroCompareA.support}/100`,
      bValue: `${heroCompareB.support}/100`,
    },
    {
      id: 'Price advantage',
      label: 'Price advantage',
      aSignal: priceSignalA,
      bSignal: priceSignalB,
      aValue: `${currency.format(heroCompareA.priceIntro)}/mo`,
      bValue: `${currency.format(heroCompareB.priceIntro)}/mo`,
    },
  ];

  const duelScoreA = Math.round(
    heroCompareA.performance * 0.32
      + heroCompareA.support * 0.24
      + heroCompareA.value * 0.16
      + priceSignalA * 0.16
      + setupSignalA * 0.12
  );

  const duelScoreB = Math.round(
    heroCompareB.performance * 0.32
      + heroCompareB.support * 0.24
      + heroCompareB.value * 0.16
      + priceSignalB * 0.16
      + setupSignalB * 0.12
  );

  const duelWinner = duelScoreA >= duelScoreB ? heroCompareA : heroCompareB;
  const duelMargin = Math.abs(duelScoreA - duelScoreB);
  const duelConfidence = duelMargin >= 10 ? 'High confidence' : duelMargin >= 5 ? 'Moderate confidence' : 'Close call';
  const heroPanelIndex = Math.max(0, HERO_PANEL_VIEWS.findIndex((view) => view.id === heroPanelView));
  const activeHeroPanelView = HERO_PANEL_VIEWS[heroPanelIndex] || HERO_PANEL_VIEWS[0];
  const heroPanelProgress = Math.round(((heroPanelIndex + 1) / HERO_PANEL_VIEWS.length) * 100);

  const shortlistedHosts = useMemo(
    () => shortlistIds
      .map((id) => HOST_BY_ID.get(id))
      .filter(Boolean),
    [shortlistIds]
  );

  const labRecommendations = useMemo(
    () => HOSTS
      .map((host) => ({
        host,
        score: scoreLabHost(host, labProfile),
        reasons: getLabReasons(host, labProfile),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3),
    [labProfile]
  );
  const finderTopRecommendation = labRecommendations[0] || null;
  const finderTopScore = finderTopRecommendation?.score || 0;
  const finderConfidenceLabel = finderTopScore >= 85
    ? 'High confidence'
    : finderTopScore >= 74
      ? 'Medium confidence'
      : 'Explore more options';
  const finderTrafficCoverageCount = HOSTS.filter((host) => host.trafficFit.includes(labProfile.traffic)).length;
  const finderTopBudgetDelta = finderTopRecommendation
    ? labProfile.budget - finderTopRecommendation.host.priceIntro
    : 0;
  const finderTopBudgetCopy = finderTopRecommendation
    ? finderTopBudgetDelta >= 0
      ? `${currency.format(finderTopBudgetDelta)} under budget`
      : `${currency.format(Math.abs(finderTopBudgetDelta))} above budget`
    : 'No recommendation yet';
  const selectedProjectLabel = LAB_PROJECTS.find((option) => option.id === labProfile.projectType)?.label || 'Project';
  const selectedTrafficLabel = LAB_TRAFFIC.find((option) => option.id === labProfile.traffic)?.label || 'Traffic';
  const selectedPriorityLabel = LAB_PRIORITIES.find((option) => option.id === labProfile.priority)?.label || 'Priority';
  const finderBudgetCoverageCount = HOSTS.filter((host) => host.priceIntro <= labProfile.budget).length;
  const finderBudgetChampion = labRecommendations.find((item) => item.host.priceIntro <= labProfile.budget)?.host
    || labRecommendations[0]?.host
    || topHost;

  const shortlistRenewalIncrease = shortlistedHosts.reduce(
    (total, host) => total + Math.max(0, host.priceRenewal - host.priceIntro),
    0
  );
  const workspaceReadiness = Math.round(clamp((shortlistedHosts.length / 3) * 100, 0, 100));
  const workspaceAverageScore = shortlistedHosts.length
    ? Math.round(
      shortlistedHosts.reduce((total, host) => total + scoreHost(host), 0) / shortlistedHosts.length
    )
    : 0;
  const workspaceAverageIntro = shortlistedHosts.length
    ? shortlistedHosts.reduce((total, host) => total + host.priceIntro, 0) / shortlistedHosts.length
    : 0;
  const workspaceTopHost = shortlistedHosts.length
    ? [...shortlistedHosts].sort((a, b) => scoreHost(b) - scoreHost(a))[0]
    : null;
  const workspaceCheapestHost = shortlistedHosts.length
    ? shortlistedHosts.reduce((best, host) => (host.priceIntro < best.priceIntro ? host : best), shortlistedHosts[0])
    : null;

  const calculatorHost = HOST_BY_ID.get(calculatorHostId) || HOSTS[0];
  const annualCurrent = monthlySpend * 12;
  const annualWithHost = calculatorHost.priceIntro * 12;
  const annualDelta = annualCurrent - annualWithHost;
  const twoYearCurrent = monthlySpend * 24;
  const twoYearWithHost = calculatorHost.priceIntro * 12 + calculatorHost.priceRenewal * 12;
  const twoYearDelta = twoYearCurrent - twoYearWithHost;
  const threeYearCurrent = monthlySpend * 36;
  const threeYearWithHost = calculatorHost.priceIntro * 12 + calculatorHost.priceRenewal * 24;
  const threeYearDelta = threeYearCurrent - threeYearWithHost;
  const introMonthlyDelta = monthlySpend - calculatorHost.priceIntro;
  const renewalMonthlyDelta = monthlySpend - calculatorHost.priceRenewal;

  const toggleCompare = (hostId) => {
    if (!HOST_BY_ID.has(hostId)) {
      return;
    }

    const host = HOST_BY_ID.get(hostId);
    const normalizedCurrent = normalizeCompareIds(compareIds);
    const isAlreadyInCompare = normalizedCurrent.includes(hostId);
    const currentSlotCHost = HOST_BY_ID.get(normalizedCurrent[2]);

    if (isAlreadyInCompare && normalizedCurrent.length <= 2) {
      pushToast('Keep at least two hosts in compare.');
      return;
    }

    setCompareIds((current) => {
      const normalized = normalizeCompareIds(current);

      if (normalized.includes(hostId)) {
        if (normalized.length <= 2) {
          return normalized;
        }

        return normalizeCompareIds(normalized.filter((id) => id !== hostId));
      }

      if (normalized.length === 3) {
        return normalizeCompareIds([normalized[0], normalized[1], hostId]);
      }

      return normalizeCompareIds([...normalized, hostId]);
    });

    if (!host) {
      return;
    }

    if (isAlreadyInCompare) {
      pushToast(`${host.name} removed from compare.`);
      return;
    }

    if (normalizedCurrent.length === 3) {
      pushToast(`${host.name} added. ${currentSlotCHost?.name || 'Slot C'} replaced.`);
      return;
    }

    pushToast(`${host.name} added to compare.`);
  };

  const setHeroCompareSlot = (slotIndex, hostId) => {
    if (!HOST_BY_ID.has(hostId) || (slotIndex !== 0 && slotIndex !== 1)) {
      return;
    }

    setCompareIds((current) => moveHostToCompareSlot(current, hostId, slotIndex));
  };

  const swapHeroCompare = () => {
    setCompareIds((current) => {
      const normalized = normalizeCompareIds(current);
      if (normalized.length >= 2) {
        return normalizeCompareIds([normalized[1], normalized[0], normalized[2]].filter(Boolean));
      }
      return normalized;
    });
  };

  const cycleHeroPanel = useCallback((step) => {
    setHeroPanelView((current) => {
      const currentIndex = HERO_PANEL_VIEWS.findIndex((view) => view.id === current);
      const safeIndex = currentIndex < 0 ? 0 : currentIndex;
      const nextIndex = (safeIndex + step + HERO_PANEL_VIEWS.length) % HERO_PANEL_VIEWS.length;
      return HERO_PANEL_VIEWS[nextIndex].id;
    });
  }, []);

  const toggleHeroPanelAutoPlay = () => {
    const nextAutoPlay = !heroPanelAutoPlay;
    setHeroPanelAutoPlay(nextAutoPlay);
    pushToast(nextAutoPlay ? 'Hero insights auto-rotate enabled.' : 'Hero insights auto-rotate paused.');
  };

  const showHeroPanelView = (viewId, pauseAuto = false) => {
    setHeroPanelView(viewId);
    if (pauseAuto) {
      setHeroPanelAutoPlay(false);
    }
  };

  const onHeroPanelTabKeyDown = (event) => {
    const tabs = Array.from(
      event.currentTarget.parentElement?.querySelectorAll('[role="tab"]') || []
    );
    const currentIndex = HERO_PANEL_VIEWS.findIndex((view) => view.id === heroPanelView);
    const safeIndex = currentIndex < 0 ? 0 : currentIndex;
    let nextIndex = safeIndex;

    if (event.key === 'ArrowRight') {
      nextIndex = (safeIndex + 1) % HERO_PANEL_VIEWS.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (safeIndex - 1 + HERO_PANEL_VIEWS.length) % HERO_PANEL_VIEWS.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = HERO_PANEL_VIEWS.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    showHeroPanelView(HERO_PANEL_VIEWS[nextIndex].id, true);
    tabs[nextIndex]?.focus();
  };

  const handleHeroPanelBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setHeroPanelInteracting(false);
    }
  };

  const applyIntent = (intent) => {
    setLabProfile(intent.profile);
    setActiveCategory('All');
    setSortKey('overall');
    setSearchTerm('');
    jumpToSection('finder');
    pushToast(`Applied profile: ${intent.label}.`);
  };

  const resetRankingControls = () => {
    setActiveCategory('All');
    setSortKey('overall');
    setSearchTerm('');
    pushToast('Ranking controls reset.');
  };

  const toggleShortlist = (hostId) => {
    const host = HOST_BY_ID.get(hostId);
    const isSaved = shortlistIds.includes(hostId);

    setShortlistIds((current) => {
      if (current.includes(hostId)) {
        return current.filter((id) => id !== hostId);
      }

      return [...current, hostId].slice(-8);
    });

    if (host) {
      pushToast(isSaved ? `${host.name} removed from workspace.` : `${host.name} saved to workspace.`);
    }
  };

  const clearShortlist = () => {
    if (!shortlistIds.length) {
      pushToast('Workspace shortlist is already empty.');
      return;
    }

    setLastClearedShortlist(shortlistIds);
    setShortlistIds([]);
    pushToast('Shortlist cleared.', { id: 'undo-shortlist-clear', label: 'Undo' });
  };

  const syncShortlistToCompare = () => {
    if (shortlistedHosts.length < 2) {
      pushToast('Save at least two hosts before syncing to compare.');
      return;
    }

    setCompareIds(normalizeCompareIds(shortlistedHosts.slice(0, 3).map((host) => host.id)));
    pushToast('Compare synced from workspace.');
  };

  const syncFinderToCompare = () => {
    const finderIds = labRecommendations.map((item) => item.host.id).slice(0, 3);

    if (finderIds.length < 2) {
      pushToast('Finder needs at least two matches before syncing compare.');
      return;
    }

    setCompareIds(normalizeCompareIds(finderIds));
    pushToast('Compare synced from smart finder results.');
  };

  const resetLabProfile = () => {
    setLabProfile(DEFAULT_LAB_PROFILE);
    pushToast('Finder profile reset.');
  };

  const toggleReviewComposer = () => {
    setIsReviewComposerOpen((current) => !current);
    setReviewFormError('');
  };

  const updateReviewDraft = (field, value) => {
    setReviewDraft((current) => ({ ...current, [field]: value }));
  };

  const resetReviewFilters = () => {
    setLastReviewFiltersSnapshot({
      reviewHostFilter,
      reviewSortKey,
      reviewMinScore,
      reviewQuery,
    });
    setReviewHostFilter('all');
    setReviewMinScore(0);
    setReviewSortKey('recent');
    setReviewQuery('');
    pushToast('Review filters reset.', { id: 'undo-review-filters', label: 'Undo' });
  };

  const applyReviewPreset = (presetId) => {
    if (presetId === 'recent') {
      setReviewSortKey('recent');
      setReviewMinScore(0);
      pushToast('Preset applied: recent reviews.');
      return;
    }

    if (presetId === 'top') {
      setReviewSortKey('score');
      setReviewMinScore(4.5);
      pushToast('Preset applied: top rated reviews.');
      return;
    }

    if (presetId === 'helpful') {
      setReviewSortKey('helpful');
      pushToast('Preset applied: most helpful reviews.');
      return;
    }

    if (presetId === 'savings') {
      setReviewSortKey('savings');
      pushToast('Preset applied: highest savings reviews.');
    }
  };

  const markReviewHelpful = (reviewId) => {
    const normalizedReviewId = String(reviewId || '');
    if (!normalizedReviewId) {
      return;
    }

    if (reviewHelpfulVotedSet.has(normalizedReviewId)) {
      pushToast('You already marked this review as helpful.');
      return;
    }

    setReviewHelpfulCounts((current) => ({
      ...current,
      [normalizedReviewId]: clamp((Number(current[normalizedReviewId]) || 0) + 1, 0, 9999),
    }));
    setReviewHelpfulVotedIds((current) => [...current, normalizedReviewId].slice(-600));
    pushToast('Marked review as helpful.');
  };

  const toggleReviewExpanded = (reviewId) => {
    const normalizedReviewId = String(reviewId || '');
    if (!normalizedReviewId) {
      return;
    }

    setExpandedReviewIds((current) => (
      current.includes(normalizedReviewId)
        ? current.filter((id) => id !== normalizedReviewId)
        : [...current, normalizedReviewId].slice(-200)
    ));
  };

  const showMoreReviews = () => {
    setReviewVisibleCount((current) => Math.min(filteredReviews.length, current + REVIEW_PAGE_SIZE));
  };

  const jumpToReview = (reviewId) => {
    const card = document.getElementById(`review-${reviewId}`);
    if (!card) {
      return;
    }

    const targetTop = Math.max(0, window.scrollY + card.getBoundingClientRect().top - headerOffset - 12);
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  };

  const submitReview = (event) => {
    event.preventDefault();

    const name = reviewDraft.name.trim();
    const role = reviewDraft.role.trim();
    const quote = reviewDraft.quote.trim();
    const hostId = HOST_BY_ID.has(reviewDraft.hostId) ? reviewDraft.hostId : HOSTS[0].id;
    const monthlySavings = Number(reviewDraft.monthlySavings);
    const score = Number(reviewDraft.score);

    if (!name || !role || !quote) {
      setReviewFormError('Name, role, and review text are required.');
      return;
    }

    if (quote.length < MIN_REVIEW_QUOTE_LENGTH) {
      setReviewFormError(`Write at least ${MIN_REVIEW_QUOTE_LENGTH} characters so the review is useful.`);
      return;
    }

    if (!Number.isFinite(monthlySavings) || monthlySavings < 0) {
      setReviewFormError('Monthly savings must be a valid non-negative number.');
      return;
    }

    if (!Number.isFinite(score) || score < 1 || score > 5) {
      setReviewFormError('Rating must be between 1 and 5.');
      return;
    }

    const nextReview = {
      id: `user-${Date.now()}`,
      name,
      role,
      hostId,
      quote,
      monthlySavings: Math.round(clamp(monthlySavings, 0, 20000)),
      score: Number(score.toFixed(1)),
      createdAt: new Date().toISOString(),
    };

    setReviews((current) => [nextReview, ...current]);
    setReviewDraft((current) => ({ ...DEFAULT_REVIEW_DRAFT, hostId: current.hostId }));
    setReviewSortKey('recent');
    setReviewHostFilter('all');
    setReviewMinScore(0);
    setReviewFormError('');
    setIsReviewComposerOpen(false);
    pushToast('Review published and now visible in social proof.');
  };

  const compareRows = useMemo(() => [
    {
      label: 'Overall score',
      getValue: (host) => host.overallScore,
      format: (value) => `${value}/100`,
      higherIsBetter: true,
    },
    {
      label: 'Live user rating',
      getValue: (host) => (hostReviewSignals.get(host.id)?.weightedScore || host.rating),
      format: (value) => `${value.toFixed(2)} / 5`,
      higherIsBetter: true,
      compareValue: (value) => Number(value.toFixed(4)),
    },
    {
      label: 'Review signals',
      getValue: (host) => (hostReviewSignals.get(host.id)?.totalReviewCount || host.reviewCount),
      format: (value) => `${compactNumber.format(value)} reviews`,
      higherIsBetter: true,
    },
    {
      label: 'Avg user savings',
      getValue: (host) => (hostReviewSignals.get(host.id)?.averageUserSavings || 0),
      format: (value) => value > 0 ? `${currency.format(value)} / mo` : 'No user data yet',
      higherIsBetter: true,
    },
    {
      label: 'Intro price',
      getValue: (host) => host.priceIntro,
      format: (value) => `${currency.format(value)} / month`,
      higherIsBetter: false,
    },
    {
      label: 'Renewal price',
      getValue: (host) => host.priceRenewal,
      format: (value) => `${currency.format(value)} / month`,
      higherIsBetter: false,
    },
    {
      label: 'Year-1 cost',
      getValue: (host) => host.priceIntro * 12,
      format: (value) => `${currency.format(value)} / year`,
      higherIsBetter: false,
    },
    {
      label: '3-year cost',
      getValue: (host) => host.priceIntro * 12 + host.priceRenewal * 24,
      format: (value) => `${currency.format(value)} total`,
      higherIsBetter: false,
    },
    {
      label: 'Avg TTFB',
      getValue: (host) => host.ttfbMs,
      format: (value) => `${value} ms`,
      higherIsBetter: false,
    },
    {
      label: 'Performance score',
      getValue: (host) => host.performance,
      format: (value) => `${value}/100`,
      higherIsBetter: true,
    },
    {
      label: 'Support response',
      getValue: (host) => host.supportResponseMinutes,
      format: (value) => `${value} min avg`,
      higherIsBetter: false,
    },
    {
      label: 'Setup time',
      getValue: (host) => host.setupMinutes,
      format: (value) => `${value} min`,
      higherIsBetter: false,
    },
    {
      label: 'Uptime',
      getValue: (host) => host.uptimePercent,
      format: (value) => `${value.toFixed(2)}%`,
      higherIsBetter: true,
    },
    {
      label: 'Visit capacity',
      getValue: (host) => host.visitCapacityMonthly,
      format: (value) => `${compactNumber.format(value)} / mo`,
      higherIsBetter: true,
    },
    {
      label: 'Storage',
      getValue: (host) => host.storageGb,
      format: (value) => `${value} GB`,
      higherIsBetter: true,
    },
    {
      label: 'Site limit',
      getValue: (host) => host.siteLimit,
      format: (value) => formatSiteLimit(value),
      higherIsBetter: true,
    },
    {
      label: 'Money-back',
      getValue: (host) => host.moneyBackDays,
      format: (value) => `${value} days`,
      higherIsBetter: true,
    },
    {
      label: 'Data centers',
      getValue: (host) => host.dataCenters,
      format: (value) => `${value} regions`,
      higherIsBetter: true,
    },
    {
      label: 'Free domain',
      getValue: (host) => Number(Boolean(host.freeDomain)),
      format: (value) => value ? 'Included' : 'No',
      higherIsBetter: true,
    },
    {
      label: 'Free SSL',
      getValue: (host) => Number(Boolean(host.freeSsl)),
      format: (value) => value ? 'Included' : 'No',
      higherIsBetter: true,
    },
    {
      label: 'CDN included',
      getValue: (host) => Number(Boolean(host.cdnIncluded)),
      format: (value) => value ? 'Included' : 'No',
      higherIsBetter: true,
    },
    {
      label: 'Staging',
      getValue: (host) => Number(Boolean(host.stagingIncluded)),
      format: (value) => value ? 'Included' : 'No',
      higherIsBetter: true,
    },
    {
      label: 'Free migration',
      getValue: (host) => Number(Boolean(host.freeMigration)),
      format: (value) => value ? 'Included' : 'No',
      higherIsBetter: true,
    },
    {
      label: 'Malware protection',
      getValue: (host) => Number(Boolean(host.malwareProtection)),
      format: (value) => value ? 'Included' : 'No',
      higherIsBetter: true,
    },
    {
      label: 'Backup policy',
      getValue: (host) => host.backupPolicy,
      format: (value) => value,
      highlightBest: false,
    },
    {
      label: 'Support channels',
      getValue: (host) => host.supportChannels,
      format: (value) => value,
      highlightBest: false,
    },
    {
      label: 'Control panel',
      getValue: (host) => host.controlPanel,
      format: (value) => value,
      highlightBest: false,
    },
  ], [hostReviewSignals]);
  const compareRowsWithMeta = useMemo(
    () => compareRows.map((row) => {
      const values = compareHosts.map(row.getValue);
      const compareValues = values.map((value) => (
        typeof row.compareValue === 'function' ? row.compareValue(value) : value
      ));
      const canHighlightBest = row.highlightBest !== false
        && compareValues.every((value) => typeof value === 'number' && Number.isFinite(value));
      const best = canHighlightBest
        ? (row.higherIsBetter ? Math.max(...compareValues) : Math.min(...compareValues))
        : null;
      const uniqueValueCount = new Set(values.map((value) => String(value))).size;
      return {
        ...row,
        values,
        compareValues,
        best,
        canHighlightBest,
        hasDifference: uniqueValueCount > 1,
      };
    }),
    [compareHosts, compareRows]
  );
  const compareDifferentMetricCount = compareRowsWithMeta.filter((row) => row.hasDifference).length;
  const visibleCompareRows = compareTableView === 'differences'
    ? compareRowsWithMeta.filter((row) => row.hasDifference)
    : compareRowsWithMeta;
  const compareHiddenMetricCount = compareRowsWithMeta.length - visibleCompareRows.length;

  const compareByScore = [...compareHosts].sort((a, b) => scoreHost(b) - scoreHost(a));
  const compareLeader = compareByScore[0] || topHost;
  const compareRunnerUp = compareByScore[1] || compareLeader;
  const compareLeadGap = Math.max(0, scoreHost(compareLeader) - scoreHost(compareRunnerUp));

  const compareCheapest = compareHosts.length
    ? compareHosts.reduce((best, host) => (host.priceIntro < best.priceIntro ? host : best), compareHosts[0])
    : topHost;

  const compareFastestSupport = compareHosts.length
    ? compareHosts.reduce(
      (best, host) => (host.supportResponseMinutes < best.supportResponseMinutes ? host : best),
      compareHosts[0]
    )
    : topHost;

  const compareHighestValue = compareHosts.length
    ? compareHosts.reduce((best, host) => (host.value > best.value ? host : best), compareHosts[0])
    : topHost;
  const compareRecommendationNote = compareLeadGap >= 8
    ? 'Clear lead with stronger balance across performance, support, value, and user sentiment.'
    : 'Slight edge right now, but this matchup is close and should be validated against budget and renewal costs.';

  const suggestedCompareHost = HOSTS.find((host) => !normalizedCompareIds.includes(host.id)) || null;
  const canAddThirdCompare = normalizedCompareIds.length < 3 && Boolean(suggestedCompareHost);
  const compareReadinessLabel = compareHosts.length === 3
    ? 'Pressure test ready'
    : 'Add a 3rd host for stronger comparison';

  const setCompareThirdSlot = (hostId) => {
    if (!hostId) {
      setCompareIds((current) => normalizeCompareIds(current).slice(0, 2));
      return;
    }

    setCompareIds((current) => moveHostToCompareSlot(current, hostId, 2));
  };

  const setTopThreeCompare = () => {
    setCompareIds(normalizeCompareIds(sortHosts(HOSTS, 'overall').slice(0, 3).map((host) => host.id)));
    pushToast('Compare set to top 3 providers.');
  };

  const addSuggestedCompare = () => {
    if (!suggestedCompareHost) {
      pushToast('No suggested host available right now.');
      return;
    }

    setCompareThirdSlot(suggestedCompareHost.id);
    pushToast(`${suggestedCompareHost.name} added to compare.`);
  };

  const setCompareTableViewMode = useCallback((viewId) => {
    if (!COMPARE_TABLE_VIEWS.some((view) => view.id === viewId)) {
      return;
    }

    if (compareTableView === viewId) {
      return;
    }

    setCompareTableView(viewId);
    pushToast(
      viewId === 'differences'
        ? 'Compare table now shows only differentiators.'
        : 'Compare table reset to all metrics.'
    );
  }, [compareTableView, pushToast]);

  const toggleCompareTableView = useCallback(() => {
    setCompareTableViewMode(compareTableView === 'all' ? 'differences' : 'all');
  }, [compareTableView, setCompareTableViewMode]);

  const toggleDockCollapsed = () => {
    const nextCollapsed = !dockState.collapsed;
    setDockState((current) => ({ ...current, collapsed: nextCollapsed }));
    pushToast(nextCollapsed ? 'Compare dock minimized.' : 'Compare dock expanded.');
  };

  const hideDock = () => {
    setDockState((current) => ({ ...current, hidden: true }));
    pushToast('Compare dock hidden. Press Shift + D to bring it back.');
  };

  const showDock = () => {
    setDockState((current) => ({ ...current, hidden: false }));
    pushToast('Compare dock visible.');
  };

  const openCommandCenter = () => {
    setIsCommandOpen(true);
  };

  const closeCommandCenter = () => {
    setIsCommandOpen(false);
    setCommandQuery('');
  };

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === DEFAULT_THEME ? ALT_THEME : DEFAULT_THEME;
    setTheme(nextTheme);
    pushToast(nextTheme === ALT_THEME ? 'Ocean theme enabled.' : 'Sunset theme enabled.');
  }, [theme, pushToast]);

  const jumpToSection = useCallback((sectionId, options = {}) => {
    const { behavior = 'smooth', updateHash = true } = options;
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    setActiveSection(sectionId);
    const targetTop = Math.max(0, window.scrollY + section.getBoundingClientRect().top - headerOffset);
    window.scrollTo({ top: targetTop, behavior });

    if (updateHash && window.location.hash !== `#${sectionId}`) {
      window.history.replaceState(null, '', `#${sectionId}`);
    }
  }, [headerOffset]);

  const openSavingsForHost = (host, source = 'selection') => {
    if (!host) {
      return;
    }

    setCalculatorHostId(host.id);
    jumpToSection('calculator');
    pushToast(`${host.name} loaded into savings model from ${source}.`);
  };

  const copyPromoCode = async (host) => {
    if (!host) {
      return;
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(host.promoCode);
        pushToast(`${host.name} promo copied: ${host.promoCode}`);
        return;
      }
    } catch {
      // Fall through to visible fallback message.
    }

    pushToast(`${host.name} promo code: ${host.promoCode}`);
  };

  const copyCompareShareLink = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const query = searchTerm.trim();

    urlParams.set('compare', normalizedCompareIds.join(','));
    urlParams.set('compareView', compareTableView);
    urlParams.set('category', activeCategory);
    urlParams.set('sort', sortKey);

    if (query) {
      urlParams.set('q', query);
    } else {
      urlParams.delete('q');
    }

    const queryString = urlParams.toString();
    const sharePath = `${window.location.pathname}${queryString ? `?${queryString}` : ''}#compare`;
    const shareUrl = `${window.location.origin}${sharePath}`;

    setLastSharedCompareLink(shareUrl);

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        pushToast('Compare share link copied.', { id: 'open-shared-compare-link', label: 'Open' });
        return;
      }
    } catch {
      // Fall through to URL bar fallback.
    }

    window.history.replaceState(null, '', sharePath);
    pushToast('Share link ready in the address bar.');
  }, [activeCategory, normalizedCompareIds, compareTableView, searchTerm, sortKey, pushToast]);

  const runToastAction = () => {
    if (toast.actionId === 'undo-shortlist-clear') {
      if (lastClearedShortlist.length) {
        setShortlistIds(lastClearedShortlist.slice(0, 8));
        setLastClearedShortlist([]);
        pushToast('Shortlist restored.');
      } else {
        dismissToast();
      }
      return;
    }

    if (toast.actionId === 'undo-review-filters') {
      if (lastReviewFiltersSnapshot) {
        setReviewHostFilter(lastReviewFiltersSnapshot.reviewHostFilter);
        setReviewSortKey(lastReviewFiltersSnapshot.reviewSortKey);
        setReviewMinScore(lastReviewFiltersSnapshot.reviewMinScore);
        setReviewQuery(lastReviewFiltersSnapshot.reviewQuery || '');
        setLastReviewFiltersSnapshot(null);
        pushToast('Review filters restored.');
      } else {
        dismissToast();
      }
      return;
    }

    if (toast.actionId === 'open-shared-compare-link') {
      if (lastSharedCompareLink) {
        window.open(lastSharedCompareLink, '_blank', 'noopener,noreferrer');
      }
      dismissToast();
      return;
    }

    dismissToast();
  };

  const onSectionNavClick = (event, sectionId) => {
    event.preventDefault();
    jumpToSection(sectionId);
  };

  useEffect(() => {
    if (hasSyncedInitialHashRef.current) {
      return;
    }

    hasSyncedInitialHashRef.current = true;
    const hashSectionId = window.location.hash.replace('#', '');
    if (!hashSectionId || !NAV_SECTIONS.some((section) => section.id === hashSectionId)) {
      return;
    }

    window.requestAnimationFrame(() => {
      jumpToSection(hashSectionId, { behavior: 'auto', updateHash: false });
    });
  }, [jumpToSection]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || !event.shiftKey) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'd') {
        event.preventDefault();
        const nextHidden = !dockState.hidden;
        setDockState((current) => ({ ...current, hidden: nextHidden }));
        pushToast(nextHidden ? 'Compare dock hidden.' : 'Compare dock visible.');
        return;
      }

      if (key === 'm') {
        event.preventDefault();
        const nextCollapsed = !dockState.collapsed;
        setDockState((current) => ({ ...current, hidden: false, collapsed: nextCollapsed }));
        pushToast(nextCollapsed ? 'Compare dock minimized.' : 'Compare dock expanded.');
        return;
      }

      if (key === 'c') {
        event.preventDefault();
        jumpToSection('compare');
        pushToast('Jumped to compare section.');
        return;
      }

      if (key === 's') {
        event.preventDefault();
        void copyCompareShareLink();
        return;
      }

      if (key === 'v') {
        event.preventDefault();
        toggleCompareTableView();
        return;
      }

      if (key === 't') {
        event.preventDefault();
        jumpToSection('overview');
        return;
      }

      if (key === 'l') {
        event.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [copyCompareShareLink, dockState.collapsed, dockState.hidden, jumpToSection, pushToast, toggleCompareTableView, toggleTheme]);

  const runCommandAction = (actionId) => {
    if (actionId === 'jump-finder') {
      jumpToSection('finder');
      return;
    }

    if (actionId === 'jump-rankings') {
      jumpToSection('rankings');
      return;
    }

    if (actionId === 'jump-workspace') {
      jumpToSection('workspace');
      return;
    }

    if (actionId === 'jump-compare') {
      jumpToSection('compare');
      return;
    }

    if (actionId === 'open-review-compose') {
      jumpToSection('proof');
      setIsReviewComposerOpen(true);
      setReviewFormError('');
      return;
    }

    if (actionId === 'focus-ranking-search') {
      jumpToSection('rankings');
      window.setTimeout(() => searchInputRef.current?.focus(), 260);
      return;
    }

    if (actionId === 'reset-ranking-controls') {
      resetRankingControls();
      return;
    }

    if (actionId === 'toggle-theme') {
      toggleTheme();
      return;
    }

    if (actionId === 'compare-top-three') {
      setTopThreeCompare();
      return;
    }

    if (actionId === 'compare-sync-shortlist') {
      syncShortlistToCompare();
      return;
    }

    if (actionId === 'compare-add-suggested') {
      addSuggestedCompare();
      return;
    }

    if (actionId === 'toggle-compare-table-view') {
      toggleCompareTableView();
      return;
    }

    if (actionId === 'copy-compare-link') {
      void copyCompareShareLink();
      return;
    }

    if (actionId === 'toggle-dock') {
      if (dockState.hidden) {
        showDock();
      } else {
        hideDock();
      }
      return;
    }

    if (actionId === 'toggle-dock-size') {
      toggleDockCollapsed();
      return;
    }

    if (actionId === 'scroll-top') {
      jumpToSection('overview');
    }
  };

  const commandActions = [
    {
      id: 'jump-finder',
      label: 'Go to smart finder',
      hint: 'Section',
    },
    {
      id: 'jump-rankings',
      label: 'Go to rankings',
      hint: 'Section',
    },
    {
      id: 'jump-workspace',
      label: 'Go to workspace',
      hint: 'Section',
    },
    {
      id: 'jump-compare',
      label: 'Go to compare studio',
      hint: 'Section',
    },
    {
      id: 'open-review-compose',
      label: 'Write a user review',
      hint: 'Proof',
    },
    {
      id: 'focus-ranking-search',
      label: 'Focus ranking search',
      hint: 'Search',
    },
    {
      id: 'reset-ranking-controls',
      label: 'Reset ranking controls',
      hint: 'Search',
    },
    {
      id: 'toggle-theme',
      label: theme === DEFAULT_THEME ? 'Switch to ocean theme' : 'Switch to sunset theme',
      hint: 'Theme',
    },
    {
      id: 'compare-top-three',
      label: 'Set compare to top 3 providers',
      hint: 'Compare',
    },
    {
      id: 'compare-sync-shortlist',
      label: 'Sync compare from workspace shortlist',
      hint: 'Compare',
      disabled: shortlistedHosts.length < 2,
    },
    {
      id: 'compare-add-suggested',
      label: suggestedCompareHost ? `Add ${suggestedCompareHost.name} to compare` : 'Add suggested host to compare',
      hint: 'Compare',
      disabled: !canAddThirdCompare,
    },
    {
      id: 'toggle-compare-table-view',
      label: compareTableView === 'all' ? 'Show compare differences only' : 'Show all compare metrics',
      hint: 'Compare',
    },
    {
      id: 'copy-compare-link',
      label: 'Copy compare share link',
      hint: 'Compare',
    },
    {
      id: 'toggle-dock',
      label: dockState.hidden ? 'Show compare dock' : 'Hide compare dock',
      hint: 'Dock',
    },
    {
      id: 'toggle-dock-size',
      label: dockState.collapsed ? 'Expand compare dock' : 'Minimize compare dock',
      hint: 'Dock',
      disabled: dockState.hidden,
    },
    {
      id: 'scroll-top',
      label: 'Scroll to top',
      hint: 'Utility',
    },
  ];

  const normalizedCommandQuery = commandQuery.trim().toLowerCase();
  const visibleCommandActions = normalizedCommandQuery
    ? commandActions.filter((action) => `${action.label} ${action.hint}`.toLowerCase().includes(normalizedCommandQuery))
    : commandActions;
  const normalizedFaqQuery = faqQuery.trim().toLowerCase();
  const filteredFaqItems = normalizedFaqQuery
    ? FAQ_ITEMS.filter((item) => `${item.question} ${item.answer}`.toLowerCase().includes(normalizedFaqQuery))
    : FAQ_ITEMS;
  const renderHostInline = (host, label = host?.name, options = {}) => {
    const { withIcon = true } = options;

    if (!host) {
      return <span className={s.hostInlineText}>{label}</span>;
    }

    return (
      <span className={s.hostInline}>
        {withIcon && (
          <img
            className={s.hostMiniAvatar}
            src={hostFaviconImages[host.id] || hostAvatarFallbackImages[host.id]}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = hostAvatarFallbackImages[host.id];
            }}
          />
        )}
        <span className={s.hostInlineText}>{label || host.name}</span>
      </span>
    );
  };
  const renderHostText = (host, label = host?.name) => renderHostInline(host, label, { withIcon: false });

  return (
    <div className={s.app}>
      <a className={s.skipLink} href="#main-content">Skip to content</a>

      <header ref={headerRef} className={s.header}>
        <div className={s.headerInner}>
          <a className={s.brand} href="#overview" onClick={(event) => onSectionNavClick(event, 'overview')}>
            <span className={s.brandMark}>HA</span>
            <span className={s.brandText}>
              <strong>HostAff Pro</strong>
              <small>Hosting comparison intelligence</small>
            </span>
          </a>

          <nav className={s.nav} aria-label="Primary">
            {NAV_SECTIONS.filter((section) => section.id !== 'overview').map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(event) => onSectionNavClick(event, section.id)}
                  className={`${s.navLink} ${activeSection === section.id ? s.navLinkActive : ''}`}
                >
                  {section.label}
                </a>
            ))}
          </nav>

          <button type="button" className={s.headerUtility} onClick={openCommandCenter}>
            Quick actions
          </button>

          <button
            type="button"
            className={s.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === DEFAULT_THEME ? 'ocean' : 'sunset'} theme`}
            aria-pressed={theme === ALT_THEME}
            title={`Switch to ${theme === DEFAULT_THEME ? 'ocean' : 'sunset'} theme`}
          >
            {theme === DEFAULT_THEME ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2.5 14.5c2.1 0 2.1-2.3 4.2-2.3s2.1 2.3 4.2 2.3 2.1-2.3 4.2-2.3 2.1 2.3 4.2 2.3" />
                <path d="M2.5 18.5h19" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="3.8" />
                <path d="M12 3.2v2.1M12 18.7v2.1M20.8 12h-2.1M5.3 12H3.2M18.2 5.8l-1.5 1.5M7.3 16.7l-1.5 1.5M18.2 18.2l-1.5-1.5M7.3 7.3 5.8 5.8" />
              </svg>
            )}
          </button>

          <a className={s.headerCta} href="#finder" onClick={(event) => onSectionNavClick(event, 'finder')}>Start host finder</a>
        </div>

        <div className={s.pageMapWrap} aria-label="Journey map">
          <div className={s.pageMapInner}>
            <p className={s.pageMapStatus}>
              You are here:
              {' '}
              <strong>{activeSectionLabel}</strong>
            </p>
            <div className={s.pageMapTrack}>
              {JOURNEY_STEPS.map((step, index) => {
                const isActive = index === activeJourneyIndex;
                const isDone = index < activeJourneyIndex;

                return (
                  <a
                    key={step.id}
                    href={`#${step.id}`}
                    onClick={(event) => onSectionNavClick(event, step.id)}
                    className={`${s.pageMapStep} ${isActive ? s.pageMapStepActive : ''} ${isDone ? s.pageMapStepDone : ''}`}
                  >
                    <span>{index + 1}</span>
                    <b>{step.label}</b>
                  </a>
                );
              })}
            </div>
          </div>
          <div className={s.pageMapProgress} aria-hidden="true">
            <span style={{ width: `${journeyProgress}%` }} />
          </div>
        </div>
      </header>

      {isCommandOpen && (
        <div className={s.commandOverlay} onClick={closeCommandCenter}>
          <section
            className={s.commandPanel}
            role="dialog"
            aria-modal="true"
            aria-label="Quick actions"
            onClick={(event) => event.stopPropagation()}
          >
            <header className={s.commandHeader}>
              <strong>Quick Actions</strong>
              <button type="button" onClick={closeCommandCenter} aria-label="Close quick actions">
                Close
              </button>
            </header>

            <label className={s.commandSearch}>
              <span>Search actions</span>
              <input
                ref={commandInputRef}
                type="search"
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                placeholder="Type an action, section, or keyword"
              />
            </label>

            <div className={s.commandList}>
              {visibleCommandActions.length ? (
                visibleCommandActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={s.commandAction}
                    onClick={() => {
                      if (action.disabled) {
                        return;
                      }
                      runCommandAction(action.id);
                      closeCommandCenter();
                    }}
                    disabled={Boolean(action.disabled)}
                  >
                    <strong>{action.label}</strong>
                    <span>{action.hint}</span>
                  </button>
                ))
              ) : (
                <p className={s.commandEmpty}>No actions match this search.</p>
              )}
            </div>

            <p className={s.commandHint}>Shortcuts: Ctrl/Cmd + K open · ? open · Esc close · Shift + L theme · Shift + S share · Shift + V compare view</p>
          </section>
        </div>
      )}

      <main className={s.main} id="main-content">
        <section className={s.hero} id="overview">
          <div className={s.heroCopy}>
            <p className={s.eyebrow}>Hosting Comparison Platform</p>
            <h1>Compare the best web hosting providers by speed, uptime, support, and real pricing.</h1>
            <p className={s.heroText}>
              Stop guessing from marketing pages. Get ranked providers with transparent intro-to-renewal pricing,
              benchmark-backed performance, and support quality signals in one decision flow.
            </p>

            <div className={s.heroActions}>
              <a className={s.primaryBtn} href="#compare" onClick={(event) => onSectionNavClick(event, 'compare')}>Compare providers now</a>
              <a className={s.ghostBtn} href="#finder" onClick={(event) => onSectionNavClick(event, 'finder')}>Find my best host</a>
            </div>

            <div className={s.heroIntentRow}>
              <p>Start with your goal:</p>
              <div className={s.heroIntentGrid}>
                {HERO_INTENTS.map((intent) => (
                  <button
                    key={intent.id}
                    type="button"
                    onClick={() => applyIntent(intent)}
                    className={`${s.heroIntentBtn} ${activeIntentId === intent.id ? s.heroIntentBtnActive : ''}`}
                  >
                    <strong>{intent.label}</strong>
                    <span>{intent.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={s.heroMetaRow}>
              <span>Updated {lastUpdated}</span>
              <span>{HOSTS.length} providers tracked</span>
              <span>
                {compactNumber.format(totalReviewSignalCount)} verified review signals
                {workspaceReviewSignalCount > 0 ? ` (+${workspaceReviewSignalCount} in this workspace)` : ''}
              </span>
            </div>

            <div className={s.disclosure}>
              Affiliate disclosure: purchases from tracked links may generate commissions at no extra cost to the buyer.
            </div>
          </div>

          <aside
            className={s.heroPanel}
            onMouseEnter={() => setHeroPanelInteracting(true)}
            onMouseLeave={() => setHeroPanelInteracting(false)}
            onFocusCapture={() => setHeroPanelInteracting(true)}
            onBlurCapture={handleHeroPanelBlur}
          >
            <div className={s.panelHeader}>
              <div className={s.panelHeaderCopy}>
                <p className={s.panelLabel}>Decision cockpit</p>
                <strong className={s.panelTitle}>What users compare first</strong>
                <p className={s.panelSubtext}>
                  <strong>{activeHeroPanelView.step}</strong>
                  {' '}
                  {activeHeroPanelView.hint}
                </p>
              </div>
              <div className={s.panelPager}>
                <div className={s.panelPagerNav}>
                  <button
                    type="button"
                    onClick={() => {
                      cycleHeroPanel(-1);
                      setHeroPanelAutoPlay(false);
                    }}
                    aria-label="Show previous view"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      cycleHeroPanel(1);
                      setHeroPanelAutoPlay(false);
                    }}
                    aria-label="Show next view"
                  >
                    Next
                  </button>
                </div>
                <button
                  type="button"
                  className={`${s.panelPagerMode} ${heroPanelAutoPlay ? s.panelPagerModeActive : ''}`}
                  onClick={toggleHeroPanelAutoPlay}
                  aria-pressed={heroPanelAutoPlay}
                >
                  {heroPanelAutoPlay ? 'Auto' : 'Manual'}
                </button>
              </div>
            </div>

            <div className={s.panelSummaryRow}>
              <article className={`${s.panelSummaryCard} ${s.panelSummaryCardMatch}`}>
                <small>Active matchup</small>
                <strong>
                  {renderHostInline(heroCompareA)}
                  <span className={s.panelSummaryVs}>vs</span>
                  {renderHostInline(heroCompareB)}
                </strong>
                <span>{activeHeroPanelView.step} • {activeHeroPanelView.label}</span>
              </article>
              <div className={s.panelSummarySignals}>
                <article className={s.panelSummaryCard}>
                  <small>Confidence</small>
                  <strong>{duelConfidence}</strong>
                  <span>{renderHostText(duelWinner)} leads</span>
                </article>
                <article className={s.panelSummaryCard}>
                  <small>Price edge</small>
                  <strong>{renderHostText(lowerPriceHost)}</strong>
                  <span>{currency.format(introGap)}/mo cheaper intro</span>
                </article>
                <article className={s.panelSummaryCard}>
                  <small>Setup speed</small>
                  <strong>{renderHostText(fasterSetupHost)}</strong>
                  <span>{fasterSetupHost.setupMinutes} min setup</span>
                </article>
              </div>
            </div>

            <div className={s.panelWorkspace}>
              <div className={s.panelStepper} role="tablist" aria-label="Hero panel views">
                {HERO_PANEL_VIEWS.map((view) => (
                  <button
                    key={view.id}
                    id={`hero-tab-${view.id}`}
                    type="button"
                    role="tab"
                    aria-selected={heroPanelView === view.id}
                    aria-controls={`hero-panel-${view.id}`}
                    tabIndex={heroPanelView === view.id ? 0 : -1}
                    className={`${s.panelStepButton} ${heroPanelView === view.id ? s.panelStepButtonActive : ''}`}
                    onKeyDown={onHeroPanelTabKeyDown}
                    onClick={() => showHeroPanelView(view.id, true)}
                  >
                    <span className={s.panelStepNumber}>{view.step}</span>
                    <strong>{view.label}</strong>
                    <small>{view.hint}</small>
                  </button>
                ))}
              </div>

              <div className={s.panelWorkspaceMain}>
                <div className={s.panelProgress} aria-hidden="true">
                  <span style={{ width: `${heroPanelProgress}%` }} />
                </div>

                <div className={s.heroPanelViewport}>
                  <div
                    className={s.heroPanelSlider}
                    style={{ transform: `translateX(-${heroPanelIndex * 100}%)` }}
                  >
                    <section
                      id="hero-panel-leaders"
                      role="tabpanel"
                      aria-labelledby="hero-tab-leaders"
                      aria-hidden={heroPanelView !== 'leaders'}
                      tabIndex={heroPanelView === 'leaders' ? 0 : -1}
                      className={s.heroPanelSlide}
                    >
                      <div className={s.snapshotGrid}>
                        {heroTopHosts.map((host, index) => (
                          <article
                            key={host.id}
                            className={`${s.snapshotCard} ${index === 0 ? s.snapshotCardLead : ''}`}
                          >
                            <div className={s.snapshotCardTop}>
                              <span className={s.snapshotRank}>#{index + 1}</span>
                              <strong>{renderHostInline(host)}</strong>
                            </div>
                            <p>{host.bestFor}</p>
                            <div className={s.snapshotCardStats}>
                              <span>{currency.format(host.priceIntro)}/mo</span>
                              <b>{scoreHost(host)} score</b>
                            </div>
                            {index === 0 && (
                              <button
                                type="button"
                                className={s.snapshotUse}
                                onClick={() => {
                                  setHeroCompareSlot(0, host.id);
                                  showHeroPanelView('compare', true);
                                  pushToast(`${host.name} loaded into quick compare.`);
                                }}
                              >
                                Use in compare
                              </button>
                            )}
                          </article>
                        ))}
                      </div>
                    </section>

                    <section
                      id="hero-panel-compare"
                      role="tabpanel"
                      aria-labelledby="hero-tab-compare"
                      aria-hidden={heroPanelView !== 'compare'}
                      tabIndex={heroPanelView === 'compare' ? 0 : -1}
                      className={s.heroPanelSlide}
                    >
                      <div className={s.quickCompareBox}>
                        <div className={s.quickCompareHeader}>
                          <p className={s.quickCompareLabel}>Instant compare focus</p>
                          <button type="button" className={s.quickCompareSwap} onClick={swapHeroCompare}>
                            Swap
                          </button>
                        </div>
                        <div className={s.quickCompareControls}>
                          <label className={s.quickCompareField}>
                            <span>Host A</span>
                            <select
                              value={heroCompareA.id}
                              onChange={(event) => setHeroCompareSlot(0, event.target.value)}
                            >
                              {hostSelectOptions.map((host) => (
                                <option
                                  key={host.id}
                                  value={host.id}
                                  disabled={compareSlotLocks.slotA.has(host.id) && host.id !== heroCompareA.id}
                                >
                                  {host.name}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className={s.quickCompareField}>
                            <span>Host B</span>
                            <select
                              value={heroCompareB.id}
                              onChange={(event) => setHeroCompareSlot(1, event.target.value)}
                            >
                              {hostSelectOptions.map((host) => (
                                <option
                                  key={host.id}
                                  value={host.id}
                                  disabled={compareSlotLocks.slotB.has(host.id) && host.id !== heroCompareB.id}
                                >
                                  {host.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>

                        <div className={s.quickSignals}>
                          <article className={s.quickSignalCard}>
                            <small>Winner now</small>
                            <strong>{renderHostText(duelWinner)}</strong>
                            <span>{duelConfidence}</span>
                          </article>
                          <article className={s.quickSignalCard}>
                            <small>Price edge</small>
                            <strong>{renderHostText(lowerPriceHost)}</strong>
                            <span>{currency.format(introGap)}/mo cheaper</span>
                          </article>
                          <article className={s.quickSignalCard}>
                            <small>Setup speed</small>
                            <strong>{renderHostText(fasterSetupHost)}</strong>
                            <span>{fasterSetupHost.setupMinutes} min setup</span>
                          </article>
                          <article className={s.quickSignalCard}>
                            <small>Support lead</small>
                            <strong>{renderHostText(strongerSupportHost)}</strong>
                            <span>{strongerSupportHost.support}/100 support score</span>
                          </article>
                        </div>
                      </div>
                    </section>

                    <section
                      id="hero-panel-verdict"
                      role="tabpanel"
                      aria-labelledby="hero-tab-verdict"
                      aria-hidden={heroPanelView !== 'verdict'}
                      tabIndex={heroPanelView === 'verdict' ? 0 : -1}
                      className={s.heroPanelSlide}
                    >
                      <div className={s.duelPanel}>
                        <header className={s.duelHeader}>
                          <p>Head-to-head verdict</p>
                          <strong>{renderHostInline(duelWinner)} leads by {duelMargin} pts</strong>
                          <span>{duelConfidence} from performance, support, value, price, and setup weighting</span>
                          <b className={s.duelConfidenceBadge}>{duelConfidence}</b>
                        </header>

                        <div className={s.duelRows}>
                          {duelRows.map((row) => (
                            <article key={row.id} className={s.duelRow}>
                              <div className={s.duelRowTop}>
                                <span>{row.label}</span>
                                <div>
                                  <strong>{renderHostText(heroCompareA)}</strong>
                                  <small>{row.aValue}</small>
                                </div>
                                <div>
                                  <strong>{renderHostText(heroCompareB)}</strong>
                                  <small>{row.bValue}</small>
                                </div>
                              </div>

                              <div className={s.duelBars} aria-hidden="true">
                                <div className={s.duelBarTrack}>
                                  <div className={s.duelBarFillA} style={{ width: `${row.aSignal}%` }} />
                                </div>
                                <div className={s.duelBarTrack}>
                                  <div className={s.duelBarFillB} style={{ width: `${row.bSignal}%` }} />
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>

            <div className={s.panelFooter}>
              <div className={s.panelFooterTop}>
                <div className={s.panelMetrics}>
                  <div>
                    <span>Top score</span>
                    <strong>{renderHostText(topHost)} {scoreHost(topHost)}</strong>
                  </div>
                  <div>
                    <span>Avg intro</span>
                    <strong>{currency.format(heroAverageIntro)}</strong>
                  </div>
                  <div>
                    <span>Fastest setup</span>
                    <strong>{renderHostText(fasterSetupHost)} {fasterSetupHost.setupMinutes}m</strong>
                  </div>
                </div>

                <div className={s.panelActions}>
                  <a className={s.panelCta} href="#compare" onClick={(event) => onSectionNavClick(event, 'compare')}>Compare top picks</a>
                  <a className={s.panelGhost} href="#finder" onClick={(event) => onSectionNavClick(event, 'finder')}>Run smart finder</a>
                </div>
              </div>

              <small className={s.panelPromo}>
                Best promo right now: {renderHostText(topHost)} ({topHost.promoCode})
              </small>
            </div>
          </aside>
        </section>

        <section className={s.heroTrustStrip} aria-label="Trust and transparency">
          {TRUST_METRICS.map((item) => (
            <article key={item.label} className={s.heroTrustItem}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </section>

        <section className={`${s.section} ${s.finderSection}`} id="finder">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Smart finder</p>
              <h2>Personalized host recommendations in under 10 seconds</h2>
            </div>
            <p className={s.sectionNote}>
              Tune workload profile, budget, and priority to get context-aware recommendations before reviewing the full ranking table.
            </p>
          </div>

          <div className={s.finderInsightBar}>
            <div className={s.finderInsightHead}>
              <div className={s.finderInsightTags}>
                <span><b>Project:</b> {selectedProjectLabel}</span>
                <span><b>Traffic:</b> {selectedTrafficLabel}</span>
                <span><b>Priority:</b> {selectedPriorityLabel}</span>
                <span><b>Budget:</b> {currency.format(labProfile.budget)}/mo</span>
              </div>
              <p className={s.finderInsightNote}>
                {finderBudgetCoverageCount} of {HOSTS.length} tracked providers fit this budget.
                Strongest in-budget pick right now: <strong>{renderHostText(finderBudgetChampion)}</strong>.
              </p>
            </div>

            <div className={s.finderSignalGrid}>
              <article className={s.finderSignalCard}>
                <span>Top match confidence</span>
                <strong>{finderTopScore}/100</strong>
                <small>{finderConfidenceLabel}</small>
              </article>
              <article className={s.finderSignalCard}>
                <span>Traffic-fit providers</span>
                <strong>{finderTrafficCoverageCount}/{HOSTS.length}</strong>
                <small>Optimized for {selectedTrafficLabel.toLowerCase()}</small>
              </article>
              <article className={s.finderSignalCard}>
                <span>Top match budget delta</span>
                <strong className={finderTopBudgetDelta >= 0 ? s.finderSignalPositive : s.finderSignalNegative}>
                  {finderTopBudgetCopy}
                </strong>
                <small>
                  {finderTopRecommendation
                    ? <>For {renderHostText(finderTopRecommendation.host)}</>
                    : 'Adjust your profile for better fit'}
                </small>
              </article>
            </div>

            <div className={s.finderInsightActions}>
              <button type="button" onClick={() => jumpToSection('rankings')}>Open rankings</button>
              <button type="button" onClick={syncFinderToCompare}>Sync top 3 to compare</button>
              <button type="button" onClick={() => openSavingsForHost(finderBudgetChampion, 'finder')}>Model savings</button>
            </div>
          </div>

          <div className={s.finderLayout}>
            <article className={s.finderControls}>
              <div className={s.finderControlGroup}>
                <h3>Workload profile</h3>

                <label className={s.finderLabel}>
                  <span>Project type</span>
                  <select
                    value={labProfile.projectType}
                    onChange={(event) => setLabProfile((current) => ({ ...current, projectType: event.target.value }))}
                  >
                    {LAB_PROJECTS.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <div className={s.finderPillGroup}>
                  <span>Traffic stage</span>
                  <div>
                    {LAB_TRAFFIC.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setLabProfile((current) => ({ ...current, traffic: option.id }))}
                        className={labProfile.traffic === option.id ? s.finderPillActive : ''}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={s.finderControlGroup}>
                <h3>Budget target</h3>

                <label className={s.finderLabel}>
                  <span>Target monthly budget</span>
                  <output>{currency.format(labProfile.budget)}</output>
                </label>
                <input
                  className={s.finderBudget}
                  type="range"
                  min="5"
                  max="80"
                  step="1"
                  value={labProfile.budget}
                  onChange={(event) => setLabProfile((current) => ({ ...current, budget: Number(event.target.value) }))}
                />
                <div className={s.finderBudgetTicks} aria-hidden="true">
                  <span>$5</span>
                  <span>$40</span>
                  <span>$80</span>
                </div>
              </div>

              <div className={s.finderControlGroup}>
                <h3>Decision priority</h3>

                <div className={s.finderPillGroup}>
                  <span>Priority mode</span>
                  <div>
                    {LAB_PRIORITIES.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setLabProfile((current) => ({ ...current, priority: option.id }))}
                        className={labProfile.priority === option.id ? s.finderPillActive : ''}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={s.finderControlActions}>
                <button className={s.finderReset} type="button" onClick={resetLabProfile}>
                  Reset profile
                </button>
                <button className={s.finderSync} type="button" onClick={syncFinderToCompare}>
                  Sync top 3 to compare
                </button>
              </div>
              <p className={s.finderControlHint}>Profile saves automatically in this browser.</p>
            </article>

            <div className={s.finderResults}>
              {labRecommendations.map((item, index) => {
                const isSaved = shortlistIds.includes(item.host.id);
                const inCompare = compareIds.includes(item.host.id);
                const budgetDelta = labProfile.budget - item.host.priceIntro;
                const budgetDeltaCopy = budgetDelta >= 0
                  ? `${currency.format(budgetDelta)} under budget`
                  : `${currency.format(Math.abs(budgetDelta))} above budget`;
                const hostSignal = getHostReviewSignal(item.host.id);
                const liveRating = hostSignal.weightedScore || item.host.rating;
                const liveReviewCount = hostSignal.totalReviewCount || item.host.reviewCount;

                return (
                  <article key={item.host.id} className={s.finderCard}>
                    <header className={s.finderCardHeader}>
                      <div className={s.finderCardHeadMain}>
                        <p className={s.finderMatchLabel}>Best match #{index + 1}</p>
                        <h3>{renderHostInline(item.host)}</h3>
                      </div>
                      <div className={s.finderScore}>
                        <strong>{item.score}</strong>
                        <span>fit</span>
                      </div>
                    </header>

                    <div className={s.finderCardMeta}>
                      <span>{item.host.category}</span>
                      <span>{currency.format(item.host.priceIntro)}/mo intro</span>
                      <span>{item.host.supportResponseMinutes}m support</span>
                      <span>{item.host.ttfbMs}ms TTFB</span>
                      <span>{liveRating.toFixed(1)}★ · {compactNumber.format(liveReviewCount)} reviews</span>
                    </div>

                    <p className={s.finderTagline}>{item.host.tagline}</p>
                    <p className={`${s.finderBudgetDelta} ${budgetDelta >= 0 ? s.finderBudgetDeltaPositive : s.finderBudgetDeltaNegative}`}>
                      {budgetDeltaCopy}
                    </p>

                    <div className={s.finderReasonBlock}>
                      <p>Why this matches</p>
                      <ul>
                        {item.reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </div>

                    <div className={s.finderActions}>
                      <button
                        type="button"
                        onClick={() => toggleShortlist(item.host.id)}
                        className={`${s.finderActionGhost} ${isSaved ? s.finderActionGhostActive : ''}`}
                      >
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCompare(item.host.id)}
                        aria-pressed={inCompare}
                        className={`${s.finderActionGhost} ${inCompare ? s.finderActionGhostActive : ''}`}
                      >
                        {inCompare ? 'In compare' : 'Add compare'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openSavingsForHost(item.host, 'finder')}
                        className={s.finderActionSoft}
                      >
                        Savings model
                      </button>
                      <a
                        href={item.host.affiliateUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={s.finderActionPrimary}
                      >
                        View deal
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className={`${s.section} ${s.sectionShell}`} id="rankings">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Ranked list</p>
              <h2>Top hosting providers right now</h2>
            </div>
            <p className={s.sectionNote}>
              Filter by business model and sort by score, intro pricing, support speed, or payout potential.
            </p>
          </div>

          <div className={s.rankingsHighlights}>
            <article className={s.rankingsHighlightCard}>
              <span>Top overall</span>
              <strong>{renderHostText(rankingLeader)}</strong>
              <small>{scoreHost(rankingLeader)} composite score</small>
            </article>
            <article className={s.rankingsHighlightCard}>
              <span>Best intro price</span>
              <strong>{renderHostText(rankingBudgetHost)}</strong>
              <small>{currency.format(rankingBudgetHost.priceIntro)} / month</small>
            </article>
            <article className={s.rankingsHighlightCard}>
              <span>Fastest support</span>
              <strong>{renderHostText(rankingSupportHost)}</strong>
              <small>{rankingSupportHost.supportResponseMinutes} min response</small>
            </article>
            <article className={s.rankingsHighlightCard}>
              <span>Highest affiliate payout</span>
              <strong>{renderHostText(rankingPayoutHost)}</strong>
              <small>{currency.format(rankingPayoutHost.affiliatePayout)} payout</small>
            </article>
          </div>

          <div className={s.controlBar}>
            <div className={s.segmentControl}>
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`${s.segmentButton} ${activeCategory === category ? s.segmentButtonActive : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className={s.controlRight}>
              <label className={s.searchControl}>
                <span>Quick finder</span>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search host, category, or use case"
                />
                <small>Tip: press / to focus instantly</small>
              </label>

              <label className={s.sortControl}>
                <span>Sort by</span>
                <select value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </label>

              {(searchTerm.trim() || activeCategory !== 'All' || sortKey !== 'overall') && (
                <div className={s.controlActions}>
                  {searchTerm.trim() && (
                    <button type="button" onClick={() => setSearchTerm('')}>Clear search</button>
                  )}
                  <button type="button" onClick={resetRankingControls}>Reset all</button>
                </div>
              )}
            </div>
          </div>

          <div className={s.resultsMeta}>
            <span>Showing {rankedHosts.length} host{rankedHosts.length === 1 ? '' : 's'}</span>
            <span>{compareHosts.length} in compare</span>
            <span>{shortlistedHosts.length} saved to workspace</span>
            <span>{compactNumber.format(totalReviewSignalCount)} review signals synced</span>
          </div>

          <div className={s.hostGrid}>
            {rankedHosts.length === 0 ? (
              <article className={s.emptyState}>
                <h3>No hosts match this filter set.</h3>
                <p>Try a wider category or clear your search phrase.</p>
                <button
                  type="button"
                  onClick={resetRankingControls}
                >
                  Reset filters
                </button>
              </article>
            ) : (
              rankedHosts.map((host, index) => {
                const isSaved = shortlistIds.includes(host.id);
                const inCompare = compareIds.includes(host.id);
                const hostSignal = getHostReviewSignal(host.id);
                const hostRating = hostSignal.weightedScore || host.rating;
                const hostReviewTotal = hostSignal.totalReviewCount || host.reviewCount;
                const hostFeatureHighlights = [
                  `${host.storageGb} GB NVMe storage`,
                  `${formatSiteLimit(host.siteLimit)} included`,
                  host.backupPolicy,
                  ...host.features,
                ];

                return (
                  <article key={host.id} className={s.hostCard} style={{ '--delay': `${index * 70}ms` }}>
                    <header className={s.hostTop}>
                      <div className={s.hostIdentity}>
                        <span className={s.rankNumber}>#{index + 1}</span>
                        <div>
                          <h3>{renderHostInline(host)}</h3>
                          <p>{host.bestFor}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`${s.saveChip} ${isSaved ? s.saveChipActive : ''}`}
                        onClick={() => toggleShortlist(host.id)}
                        aria-pressed={isSaved}
                      >
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                    </header>

                    <div className={s.hostLabelRow}>
                      <span className={s.badge}>{host.editorBadge}</span>
                      <span className={s.hostCategory}>{host.category}</span>
                    </div>

                    <div className={s.ratingLine}>
                      <RatingStars rating={hostRating} />
                      <span>{hostRating.toFixed(1)}</span>
                      <small>{compactNumber.format(hostReviewTotal)} verified reviews</small>
                    </div>

                    <div className={s.hostDataRow}>
                      <span>{host.planType}</span>
                      <span>{host.ttfbMs}ms TTFB</span>
                      <span>{compactNumber.format(host.visitCapacityMonthly)} visits/mo</span>
                    </div>

                    <p className={s.tagline}>{host.tagline}</p>

                    <div className={s.metricBlock}>
                      <MetricBar label="Performance" value={host.performance} />
                      <MetricBar label="Support" value={host.support} />
                      <MetricBar label="Value" value={host.value} />
                    </div>

                    <ul className={s.featureList}>
                      {hostFeatureHighlights.slice(0, 3).map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>

                    <div className={s.offerStrip}>
                      <div>
                        <strong>{currency.format(host.priceIntro)} / month</strong>
                        <span>Renews at {currency.format(host.priceRenewal)} / month</span>
                      </div>
                      <button
                        type="button"
                        className={s.promoCodeButton}
                        onClick={() => { void copyPromoCode(host); }}
                        aria-label={`Copy promo code ${host.promoCode} for ${host.name}`}
                      >
                        {host.promoCode}
                      </button>
                    </div>

                    <p className={s.caveat}>Watch-out: {host.caveat}</p>

                    <div className={s.hostActions}>
                      <div className={s.actionRow}>
                        <button
                          type="button"
                          onClick={() => toggleCompare(host.id)}
                          className={inCompare ? s.compareButtonActive : ''}
                          aria-pressed={inCompare}
                        >
                          {inCompare ? 'In compare' : 'Add to compare'}
                        </button>
                      </div>

                      <div className={s.ctaRow}>
                        <button type="button" onClick={() => openSavingsForHost(host, 'rankings')}>
                          Model savings
                        </button>
                        <a href={host.affiliateUrl} target="_blank" rel="noreferrer noopener">
                          Claim deal
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className={`${s.section} ${s.sectionShell}`} id="workspace">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Workspace</p>
              <h2>Shortlist planner for decision-ready buying journeys</h2>
            </div>
            <p className={s.sectionNote}>
              Save candidates while browsing, keep your compare set in sync, and narrow down the best fit for your budget and needs.
            </p>
          </div>

          <div className={s.workspaceSignals}>
            <article className={s.workspaceSignalCard}>
              <span>Decision readiness</span>
              <strong>{workspaceReadiness}%</strong>
              <small>{shortlistedHosts.length}/3 hosts added for compare confidence</small>
            </article>
            <article className={s.workspaceSignalCard}>
              <span>Average shortlist score</span>
              <strong>{workspaceAverageScore ? `${workspaceAverageScore}/100` : 'No data yet'}</strong>
              <small>
                {workspaceTopHost ? (
                  <>
                    Best current fit: {renderHostText(workspaceTopHost)}
                  </>
                ) : 'Save hosts to start scoring'}
              </small>
            </article>
            <article className={s.workspaceSignalCard}>
              <span>Price anchor</span>
              <strong>{workspaceAverageIntro ? `${currency.format(workspaceAverageIntro)} / mo avg` : 'No shortlist yet'}</strong>
              <small>
                {workspaceCheapestHost ? (
                  <>
                    Lowest intro: {renderHostText(workspaceCheapestHost)}
                  </>
                ) : 'Find low-intro options in rankings'}
              </small>
            </article>
          </div>

          {shortlistedHosts.length === 0 ? (
            <article className={s.workspaceEmpty}>
              <h3>No saved hosts yet</h3>
              <p>
                Save hosts from recommendations or rankings. Your shortlist stays in this browser so you can continue later.
              </p>
              <div className={s.workspaceEmptyActions}>
                <button type="button" onClick={() => jumpToSection('finder')}>Open finder</button>
                <button type="button" onClick={() => jumpToSection('rankings')}>Browse rankings</button>
              </div>
            </article>
          ) : (
            <div className={s.workspaceShell}>
              <header className={s.workspaceSummary}>
                <div>
                  <h3>{shortlistedHosts.length} hosts saved</h3>
                  <p>Combined monthly increase after intro pricing: {currency.format(shortlistRenewalIncrease)}</p>
                </div>
                <div className={s.workspaceActions}>
                  <button type="button" onClick={() => jumpToSection('compare')} disabled={shortlistedHosts.length < 2}>
                    Start compare
                  </button>
                  <button type="button" onClick={syncShortlistToCompare} disabled={shortlistedHosts.length < 2}>
                    Sync to compare
                  </button>
                  <button type="button" onClick={clearShortlist}>
                    Clear shortlist
                  </button>
                </div>
              </header>

              <div className={s.workspaceGrid}>
                {shortlistedHosts.map((host) => (
                  <article key={host.id} className={s.workspaceCard}>
                    <div>
                      <strong>{renderHostInline(host)}</strong>
                      <span>{host.category}</span>
                    </div>
                    <p>{host.bestFor}</p>
                    <div>
                      <small>{currency.format(host.priceIntro)} intro</small>
                      <small>Renews at {currency.format(host.priceRenewal)} / month</small>
                    </div>
                    <div className={s.workspaceCardActions}>
                      <button type="button" onClick={() => toggleCompare(host.id)}>
                        {compareIds.includes(host.id) ? 'In compare' : 'Add compare'}
                      </button>
                      <button type="button" onClick={() => openSavingsForHost(host, 'workspace')}>
                        Savings
                      </button>
                      <button type="button" onClick={() => toggleShortlist(host.id)}>
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className={`${s.section} ${s.sectionShell}`} id="compare">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Compare</p>
              <h2>Decision table for your shortlisted hosts</h2>
            </div>
            <p className={s.sectionNote}>
              Keep at least two providers selected. Add a third from rankings or finder results to pressure-test tradeoffs.
            </p>
          </div>

          <div className={s.compareVerdict}>
            <div className={s.compareVerdictMain}>
              <p>Current recommendation</p>
              <strong>{renderHostInline(compareLeader)} leads your compare stack.</strong>
              <span>{compareRecommendationNote}</span>
            </div>
            <div className={s.compareVerdictActions}>
              <button type="button" onClick={() => openSavingsForHost(compareLeader, 'compare')}>
                <span className={s.compareVerdictActionKicker}>Model</span>
                {renderHostText(compareLeader)}
              </button>
              <a href={compareLeader.affiliateUrl} target="_blank" rel="noreferrer noopener">
                <span className={s.compareVerdictActionKicker}>Open deal</span>
                {renderHostText(compareLeader)}
              </a>
            </div>
          </div>

          <div className={s.compareExperience}>
            <div className={s.compareSpotlight}>
              <article className={`${s.compareSpotlightCard} ${s.compareSpotlightLead}`}>
                <small>Best overall right now</small>
                <strong>{renderHostText(compareLeader)}</strong>
                <span>{scoreHost(compareLeader)} score, lead by {compareLeadGap} pts</span>
              </article>
              <article className={s.compareSpotlightCard}>
                <small>Lowest intro</small>
                <strong>{renderHostText(compareCheapest)}</strong>
                <span>{currency.format(compareCheapest.priceIntro)}/month</span>
              </article>
              <article className={s.compareSpotlightCard}>
                <small>Fastest support</small>
                <strong>{renderHostText(compareFastestSupport)}</strong>
                <span>{compareFastestSupport.supportResponseMinutes} min average response</span>
              </article>
              <article className={s.compareSpotlightCard}>
                <small>Best value</small>
                <strong>{renderHostText(compareHighestValue)}</strong>
                <span>{compareHighestValue.value}/100 value score</span>
              </article>
            </div>

            <div className={s.compareWorkbench}>
              <div className={s.compareSelectors}>
                <label className={s.compareField}>
                  <span>Slot A</span>
                  <select value={heroCompareA.id} onChange={(event) => setHeroCompareSlot(0, event.target.value)}>
                    {hostSelectOptions.map((host) => (
                      <option
                        key={`compare-a-${host.id}`}
                        value={host.id}
                        disabled={compareSlotLocks.slotA.has(host.id) && host.id !== heroCompareA.id}
                      >
                        {host.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={s.compareField}>
                  <span>Slot B</span>
                  <select value={heroCompareB.id} onChange={(event) => setHeroCompareSlot(1, event.target.value)}>
                    {hostSelectOptions.map((host) => (
                      <option
                        key={`compare-b-${host.id}`}
                        value={host.id}
                        disabled={compareSlotLocks.slotB.has(host.id) && host.id !== heroCompareB.id}
                      >
                        {host.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={s.compareField}>
                  <span>Slot C (optional)</span>
                  <select value={compareSlotCId} onChange={(event) => setCompareThirdSlot(event.target.value)}>
                    <option value="">None</option>
                    {hostSelectOptions.map((host) => (
                      <option
                        key={`compare-c-${host.id}`}
                        value={host.id}
                        disabled={compareSlotLocks.slotC.has(host.id)}
                      >
                        {host.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className={s.compareQuickActions}>
                <button type="button" onClick={swapHeroCompare}>Swap A/B</button>
                <button type="button" onClick={setTopThreeCompare}>Use top 3</button>
                <button type="button" onClick={syncShortlistToCompare} disabled={shortlistedHosts.length < 2}>
                  Use shortlist
                </button>
                <button type="button" onClick={addSuggestedCompare} disabled={!canAddThirdCompare}>
                  {canAddThirdCompare ? <>Add {renderHostText(suggestedCompareHost)}</> : '3 hosts selected'}
                </button>
                <button type="button" onClick={() => { void copyCompareShareLink(); }}>
                  Copy share link
                </button>
              </div>
            </div>
          </div>

          <div className={s.compareTableControls}>
            <div className={s.compareTableModes} aria-label="Compare table visibility">
              {COMPARE_TABLE_VIEWS.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  aria-pressed={compareTableView === view.id}
                  className={compareTableView === view.id ? s.compareTableModeActive : ''}
                  onClick={() => setCompareTableViewMode(view.id)}
                >
                  {view.label}
                </button>
              ))}
            </div>
            <p className={s.compareTableMeta}>
              {compareTableView === 'differences'
                ? `${visibleCompareRows.length} differentiators shown${
                  compareHiddenMetricCount > 0 ? ` (${compareHiddenMetricCount} equal metrics hidden)` : ''
                }.`
                : `${visibleCompareRows.length} metrics shown. ${compareDifferentMetricCount} currently differentiate providers.`}
            </p>
          </div>

          <div className={s.compareTableWrap}>
            <table className={s.compareTable}>
              <thead>
                <tr>
                  <th>Metric</th>
                  {compareHosts.map((host) => {
                    const hostSignal = getHostReviewSignal(host.id);
                    const liveRating = hostSignal.weightedScore || host.rating;
                    const liveReviewCount = hostSignal.totalReviewCount || host.reviewCount;

                    return (
                      <th key={host.id}>
                        <div className={s.compareHead}>
                          <strong>{renderHostInline(host)}</strong>
                          <span>{host.category}</span>
                          <small>
                            {currency.format(host.priceIntro)}/mo intro
                            {' · '}
                            {liveRating.toFixed(1)}★ ({compactNumber.format(liveReviewCount)} reviews)
                          </small>
                          <a href={host.affiliateUrl} target="_blank" rel="noreferrer noopener">View deal</a>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visibleCompareRows.length ? visibleCompareRows.map((row) => (
                  <tr key={row.label} className={!row.hasDifference ? s.compareTableRowEqual : ''}>
                    <th>{row.label}</th>
                    {row.values.map((value, index) => {
                      const comparableValue = row.compareValues[index];
                      const isBest = row.canHighlightBest
                        && Number.isFinite(comparableValue)
                        && Number.isFinite(row.best)
                        && Math.abs(comparableValue - row.best) < 0.0001;
                      return (
                        <td key={`${row.label}-${compareHosts[index].id}`} className={isBest ? s.bestCell : ''}>
                          <span>{row.format(value)}</span>
                          {isBest && <small>Best</small>}
                        </td>
                      );
                    })}
                  </tr>
                )) : (
                  <tr>
                    <th colSpan={compareHosts.length + 1} className={s.compareTableEmpty}>
                      Selected providers are tied across the current metric set.
                    </th>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={`${s.section} ${s.sectionShell}`} id="calculator">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Savings model</p>
              <h2>Estimate your real hosting cost before you commit</h2>
            </div>
            <p className={s.sectionNote}>
              Compare first-year and long-term costs so you can choose with confidence.
            </p>
          </div>

          <div className={s.calculatorSummary}>
            <article className={s.calculatorSummaryCard}>
              <span>Intro monthly delta</span>
              <strong className={introMonthlyDelta >= 0 ? s.deltaPositive : s.deltaNegative}>
                {introMonthlyDelta >= 0
                  ? `${currency.format(introMonthlyDelta)} lower`
                  : `${currency.format(Math.abs(introMonthlyDelta))} higher`}
              </strong>
              <small>vs your current stack</small>
            </article>
            <article className={s.calculatorSummaryCard}>
              <span>Renewal monthly delta</span>
              <strong className={renewalMonthlyDelta >= 0 ? s.deltaPositive : s.deltaNegative}>
                {renewalMonthlyDelta >= 0
                  ? `${currency.format(renewalMonthlyDelta)} lower`
                  : `${currency.format(Math.abs(renewalMonthlyDelta))} higher`}
              </strong>
              <small>after year one pricing</small>
            </article>
            <article className={s.calculatorSummaryCard}>
              <span>Two-year impact</span>
              <strong className={twoYearDelta >= 0 ? s.deltaPositive : s.deltaNegative}>
                {twoYearDelta >= 0
                  ? `${currency.format(twoYearDelta)} saved`
                  : `${currency.format(Math.abs(twoYearDelta))} extra`}
              </strong>
              <small>intro + one renewal year</small>
            </article>
          </div>

          <div className={s.calculator}>
            <div className={s.calculatorControls}>
              <label>
                <span>Current monthly hosting spend</span>
                <output>{currency.format(monthlySpend)}</output>
              </label>
              <input
                type="range"
                min="8"
                max="180"
                step="1"
                value={monthlySpend}
                onChange={(event) => setMonthlySpend(Number(event.target.value))}
              />

              <label className={s.hostSelect}>
                <span>Compare against provider</span>
                <select
                  value={calculatorHostId}
                  onChange={(event) => setCalculatorHostId(event.target.value)}
                >
                  {hostSelectOptions.map((host) => (
                    <option key={host.id} value={host.id}>{host.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className={s.calculatorCards}>
              <article>
                <span>Annual financial impact</span>
                <strong>{currency.format(Math.abs(annualDelta))}</strong>
                <p>
                  {annualDelta >= 0
                    ? `Projected first-year savings vs current annual spend (${currency.format(annualCurrent)})`
                    : `Projected first-year extra spend vs current annual spend (${currency.format(annualCurrent)})`}
                </p>
              </article>
              <article>
                <span>3-year financial impact</span>
                <strong>{currency.format(Math.abs(threeYearDelta))}</strong>
                <p>{threeYearDelta >= 0 ? 'Savings across intro + two renewal years' : 'Extra spend across intro + two renewal years'}</p>
              </article>
              <article>
                <span>Top current offer</span>
                <strong>{calculatorHost.promoLabel}</strong>
                <p>Promo code: {calculatorHost.promoCode} · Renewal {currency.format(calculatorHost.priceRenewal)}/mo</p>
              </article>
            </div>
          </div>
        </section>

        <section className={`${s.section} ${s.sectionShell}`} id="proof">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Social proof</p>
              <h2>Real operator feedback for higher buyer confidence</h2>
            </div>
            <p className={s.sectionNote}>
              Verified testimonials with savings context help you compare providers with more confidence.
            </p>
          </div>

          <div className={s.reviewLayout}>
            <aside className={s.reviewSidebar}>
              <div className={s.reviewSpotlight}>
                <article>
                  <span>Average rating</span>
                  <strong>{marketplaceAverageScore.toFixed(1)}/5</strong>
                  <small>Across {compactNumber.format(totalReviewSignalCount)} review signals</small>
                </article>
                <article>
                  <span>Average monthly savings</span>
                  <strong>{currency.format(reviewAverageSavings)}</strong>
                  <small>Reported user savings</small>
                </article>
                <article>
                  <span>Helpful votes</span>
                  <strong>{compactNumber.format(totalHelpfulVotes)}</strong>
                  <small>Community feedback signals across published reviews</small>
                </article>
                <article>
                  <span>Most reviewed provider</span>
                  <strong>{marketplaceTopReviewedHost ? renderHostText(marketplaceTopReviewedHost) : 'Awaiting first published review'}</strong>
                  <small>
                    {marketplaceTopReviewedHost
                      ? `${compactNumber.format(getHostReviewSignal(marketplaceTopReviewedHost.id).totalReviewCount)} total review signals`
                      : 'Add the first review to start signals'}
                  </small>
                </article>
              </div>

              <div className={`${s.reviewSentiment} ${s.reviewSentimentSidebar}`}>
                <article className={s.reviewSentimentLead}>
                  <span>Sentiment signal</span>
                  <strong>{reviewPositiveRate}% positive</strong>
                  <small>Share of reviews rated 4.5/5 or higher</small>
                </article>
                <div className={s.reviewDistribution}>
                  {reviewStarBuckets.map((bucket) => (
                    <div key={`star-bucket-${bucket.star}`} className={s.reviewDistributionRow}>
                      <span>{bucket.star}★</span>
                      <div aria-hidden="true">
                        <span style={{ width: `${bucket.percent}%` }} />
                      </div>
                      <small>{bucket.count}</small>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div className={s.reviewMain}>
              <div className={s.reviewControlPanel}>
              <div className={s.reviewTools}>
                <div className={s.reviewToolActions}>
                  <button type="button" className={s.reviewWriteButton} onClick={toggleReviewComposer}>
                    {isReviewComposerOpen ? 'Close review form' : 'Write review'}
                  </button>
                  {activeReviewFilterCount > 0 && (
                    <button type="button" className={s.reviewResetButton} onClick={resetReviewFilters}>
                      Reset filters
                    </button>
                  )}
                </div>
                <div className={s.reviewPresetRow} role="group" aria-label="Quick review presets">
                  <button
                    type="button"
                    className={`${s.reviewPresetButton} ${reviewSortKey === 'recent' && reviewMinScore === 0 ? s.reviewPresetButtonActive : ''}`}
                    onClick={() => applyReviewPreset('recent')}
                  >
                    Recent
                  </button>
                  <button
                    type="button"
                    className={`${s.reviewPresetButton} ${reviewSortKey === 'score' && reviewMinScore >= 4.5 ? s.reviewPresetButtonActive : ''}`}
                    onClick={() => applyReviewPreset('top')}
                  >
                    Top rated
                  </button>
                  <button
                    type="button"
                    className={`${s.reviewPresetButton} ${reviewSortKey === 'helpful' ? s.reviewPresetButtonActive : ''}`}
                    onClick={() => applyReviewPreset('helpful')}
                  >
                    Helpful
                  </button>
                  <button
                    type="button"
                    className={`${s.reviewPresetButton} ${reviewSortKey === 'savings' ? s.reviewPresetButtonActive : ''}`}
                    onClick={() => applyReviewPreset('savings')}
                  >
                    Savings
                  </button>
                </div>
                <p>Share your experience here. Reviews publish instantly, and your draft auto-saves in this browser.</p>
              </div>

              <div className={s.reviewFilters}>
                <div className={s.reviewHostFilters} role="tablist" aria-label="Filter reviews by provider">
                  {reviewHostOptions.map((option) => {
                    const filterHost = option.id === 'all' ? null : HOST_BY_ID.get(option.id);

                    return (
                      <button
                        key={`review-filter-${option.id}`}
                        type="button"
                        role="tab"
                        aria-selected={reviewHostFilter === option.id}
                        className={reviewHostFilter === option.id ? s.reviewFilterActive : ''}
                        onClick={() => setReviewHostFilter(option.id)}
                      >
                        <strong>{filterHost ? filterHost.name : option.label}</strong>
                        <span>{option.count}</span>
                      </button>
                    );
                  })}
                </div>

                <label className={s.reviewFilterField}>
                  <span>Sort</span>
                  <select value={reviewSortKey} onChange={(event) => setReviewSortKey(event.target.value)}>
                    {REVIEW_SORT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label className={s.reviewFilterField}>
                  <span>Minimum rating</span>
                  <select
                    value={reviewMinScore}
                    onChange={(event) => setReviewMinScore(Number(event.target.value))}
                  >
                    <option value={0}>All ratings</option>
                    <option value={4.5}>4.5+</option>
                    <option value={4}>4.0+</option>
                    <option value={3.5}>3.5+</option>
                    <option value={3}>3.0+</option>
                  </select>
                </label>

                <label className={`${s.reviewFilterField} ${s.reviewSearchField}`}>
                  <span>Search reviews</span>
                  <input
                    type="search"
                    value={reviewQuery}
                    onChange={(event) => setReviewQuery(event.target.value)}
                    placeholder="Search by quote, role, provider, or reviewer"
                  />
                  {reviewQuery.trim() && (
                    <button
                      type="button"
                      className={s.reviewSearchClear}
                      onClick={() => setReviewQuery('')}
                    >
                      Clear search
                    </button>
                  )}
                </label>
              </div>
            </div>

          {featuredReview && (
            <article className={s.reviewFeatured}>
              <div className={s.reviewFeaturedMain}>
                <span className={s.reviewFeaturedKicker}>Featured voice</span>
                <strong>
                  {featuredReviewHost
                    ? renderHostInline(featuredReviewHost, `${featuredReview.name} on ${featuredReviewHost.name}`)
                    : featuredReview.name}
                </strong>
                <p>
                  {featuredReview.quote.length > 260
                    ? `${featuredReview.quote.slice(0, 260).trim()}...`
                    : featuredReview.quote}
                </p>
              </div>
              <div className={s.reviewFeaturedMeta}>
                <span>{Number(featuredReview.score).toFixed(1)}/5 rating</span>
                <span>
                  {featuredReviewHost
                    ? `${(featuredReviewHostSignal.weightedScore || featuredReviewHost.rating).toFixed(1)}★ host avg`
                    : 'Host average unavailable'}
                </span>
                <span>{currency.format(featuredReview.monthlySavings)} monthly savings</span>
                <span>
                  {featuredReviewHelpful > 0
                    ? `${featuredReviewHelpful} helpful vote${featuredReviewHelpful === 1 ? '' : 's'}`
                    : 'No helpful votes yet'}
                </span>
                <span>{featuredReviewDateLabel}</span>
              </div>
              <div className={s.reviewFeaturedActions}>
                <button type="button" onClick={() => jumpToReview(featuredReview.id)}>
                  Jump to review
                </button>
                {featuredReviewHost && (
                  <button
                    type="button"
                    onClick={() => {
                      setReviewHostFilter(featuredReviewHost.id);
                      pushToast(`Showing ${featuredReviewHost.name} reviews.`);
                    }}
                  >
                    Filter {featuredReviewHost.name}
                  </button>
                )}
              </div>
            </article>
          )}

          <div className={s.reviewListBar}>
            <p className={s.reviewListCount}>
              Showing
              {' '}
              <strong>{displayedReviews.length}</strong>
              {' '}
              of
              {' '}
              <strong>{filteredReviews.length}</strong>
              {' '}
              matching reviews
            </p>
            <div className={s.reviewListMeta}>
              <span className={s.reviewMetaChip}>Sort: {reviewSortLabel}</span>
              <span className={s.reviewMetaChip}>
                Provider: {activeReviewHost ? activeReviewHost.name : 'All hosts'}
              </span>
              <span className={s.reviewMetaChip}>
                Rating: {reviewMinScore > 0 ? `${reviewMinScore.toFixed(1)}+` : 'All'}
              </span>
              {reviewQueryNormalized && (
                <span className={s.reviewMetaChip}>Query: {reviewQueryChipLabel}</span>
              )}
            </div>
          </div>

          {isReviewComposerOpen && (
            <form className={s.reviewForm} onSubmit={submitReview}>
              <div className={s.reviewFormGrid}>
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    value={reviewDraft.name}
                    onChange={(event) => updateReviewDraft('name', event.target.value)}
                    placeholder="Full name"
                    autoComplete="name"
                    required
                  />
                </label>

                <label>
                  <span>Role / company</span>
                  <input
                    type="text"
                    value={reviewDraft.role}
                    onChange={(event) => updateReviewDraft('role', event.target.value)}
                    placeholder="Role and company"
                    required
                  />
                </label>

                <label>
                  <span>Provider</span>
                  <select
                    value={reviewDraft.hostId}
                    onChange={(event) => updateReviewDraft('hostId', event.target.value)}
                  >
                    {hostSelectOptions.map((host) => (
                      <option key={`review-host-${host.id}`} value={host.id}>{host.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Monthly savings (USD)</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={reviewDraft.monthlySavings}
                    onChange={(event) => updateReviewDraft('monthlySavings', event.target.value)}
                    required
                  />
                </label>

                <label>
                  <span>Rating</span>
                  <select
                    value={reviewDraft.score}
                    onChange={(event) => updateReviewDraft('score', Number(event.target.value))}
                  >
                    {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map((score) => (
                      <option key={`review-score-${score}`} value={score}>
                        {score.toFixed(1)} / 5
                      </option>
                    ))}
                  </select>
                </label>

                <label className={s.reviewQuoteField}>
                  <span>Review</span>
                  <textarea
                    rows={4}
                    value={reviewDraft.quote}
                    onChange={(event) => updateReviewDraft('quote', event.target.value)}
                    placeholder="Share setup, support, performance, and pricing outcomes."
                    required
                  />
                  <small className={`${s.reviewQuoteMeta} ${reviewQuoteRemaining === 0 ? s.reviewQuoteMetaReady : ''}`}>
                    {reviewQuoteLength} characters
                    {' '}
                    {reviewQuoteRemaining > 0
                      ? `• ${reviewQuoteRemaining} more needed`
                      : '• Ready to publish'}
                  </small>
                </label>
              </div>

              {reviewFormError && <p className={s.reviewFormError}>{reviewFormError}</p>}

              <div className={s.reviewFormActions}>
                <button type="submit" disabled={!isReviewDraftReady}>Publish review</button>
                <button type="button" onClick={toggleReviewComposer}>Cancel</button>
              </div>
            </form>
          )}

          <div className={s.reviewGrid}>
            {filteredReviews.length ? displayedReviews.map((review) => {
              const host = HOST_BY_ID.get(review.hostId);
              const reviewScore = clamp(Number(review.score) || 5, 1, 5);
              const createdDate = review.createdAt ? new Date(review.createdAt) : null;
              const hasValidDate = Boolean(createdDate && Number.isFinite(createdDate.getTime()));
              const createdLabel = hasValidDate ? reviewDateFormatter.format(createdDate) : 'Verified reviewer';
              const helpfulCount = Number(reviewHelpfulCounts[review.id]) || 0;
              const hasMarkedHelpful = reviewHelpfulVotedSet.has(review.id);
              const normalizedReviewId = String(review.id);
              const isExpanded = expandedReviewIds.includes(normalizedReviewId);
              const isLongQuote = review.quote.length > REVIEW_PREVIEW_LIMIT;
              const quoteText = !isExpanded && isLongQuote
                ? `${review.quote.slice(0, REVIEW_PREVIEW_LIMIT).trim()}...`
                : review.quote;
              return (
                <article key={review.id} id={`review-${normalizedReviewId}`} className={s.reviewCard}>
                  <div className={s.reviewCardTop}>
                    <div className={s.reviewCardLabels}>
                      <span className={s.reviewCardHost}>{host ? renderHostInline(host) : 'Hosting provider'}</span>
                      <span className={s.reviewVerified}>Verified review</span>
                    </div>
                    <div className={s.reviewCardRating}>
                      <RatingStars rating={reviewScore} />
                      <span className={s.reviewCardScore}>{reviewScore.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className={s.reviewQuote}>{quoteText}</p>
                  {isLongQuote && (
                    <button
                      type="button"
                      className={s.reviewQuoteToggle}
                      onClick={() => toggleReviewExpanded(normalizedReviewId)}
                    >
                      {isExpanded ? 'Show less' : 'Read full review'}
                    </button>
                  )}
                  <div className={s.reviewCardEngagement}>
                    <button
                      type="button"
                      className={`${s.reviewHelpfulButton} ${hasMarkedHelpful ? s.reviewHelpfulButtonActive : ''}`}
                      onClick={() => markReviewHelpful(review.id)}
                      disabled={hasMarkedHelpful}
                    >
                      {hasMarkedHelpful ? 'Helpful saved' : 'Mark helpful'}
                    </button>
                    <small>
                      {helpfulCount > 0
                        ? `${helpfulCount} user${helpfulCount === 1 ? '' : 's'} found this helpful`
                        : 'Be the first to mark this review as helpful'}
                    </small>
                  </div>
                  <div className={s.reviewCardMeta}>
                    <div className={s.reviewCardAuthor}>
                      <strong>{review.name}</strong>
                      <span className={s.reviewCardRole}>{review.role}</span>
                    </div>
                    <div className={s.reviewCardFooter}>
                      <small className={s.reviewSavings}>
                        Saved {currency.format(review.monthlySavings)} monthly with {host ? host.name : 'the selected provider'}
                      </small>
                      <time dateTime={hasValidDate ? review.createdAt : undefined}>{createdLabel}</time>
                    </div>
                  </div>
                </article>
              );
            }) : (
              <article className={s.reviewEmpty}>
                <h3>No reviews match these filters.</h3>
                <p>Try a broader rating threshold, clear search terms, or switch back to all providers.</p>
                <button
                  type="button"
                  onClick={resetReviewFilters}
                >
                  Reset review filters
                </button>
              </article>
            )}
          </div>

          {hasMoreReviews && (
            <div className={s.reviewLoadMoreWrap}>
              <button type="button" className={s.reviewLoadMoreButton} onClick={showMoreReviews}>
                Load {Math.min(REVIEW_PAGE_SIZE, hiddenReviewCount)} more reviews
              </button>
              <small>{hiddenReviewCount} still hidden</small>
            </div>
          )}
            </div>
          </div>
        </section>

        <section className={`${s.section} ${s.sectionShell}`} id="faq">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>FAQ</p>
              <h2>Compliance and methodology answers</h2>
            </div>
            <p className={s.sectionNote}>
              Clear answers on pricing, methods, and policy before you choose a provider.
            </p>
          </div>

          <div className={s.faqToolbar}>
            <label className={s.faqSearch}>
              <span>Search answers</span>
              <input
                type="search"
                value={faqQuery}
                onChange={(event) => setFaqQuery(event.target.value)}
                placeholder="Search pricing, ranking, migration, or policy"
              />
            </label>
            <p className={s.faqResultsCount}>
              {filteredFaqItems.length} answer{filteredFaqItems.length === 1 ? '' : 's'} shown
            </p>
            {faqQuery && (
              <button type="button" className={s.faqClearButton} onClick={() => setFaqQuery('')}>
                Clear
              </button>
            )}
          </div>

          <div className={s.faqTopicRow}>
            <span>Popular topics:</span>
            <div className={s.faqTopicChips}>
              {FAQ_TOPIC_CHIPS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  className={normalizedFaqQuery.includes(topic.query) ? s.faqTopicChipActive : ''}
                  onClick={() => setFaqQuery(topic.query)}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>

          <div className={s.faqList}>
            {filteredFaqItems.length ? (
              filteredFaqItems.map((item) => (
                <details key={item.question} className={s.faqItem}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))
            ) : (
              <article className={s.faqEmpty}>
                <h3>No FAQ matches this query.</h3>
                <p>Clear or broaden your search to see all methodology answers.</p>
                <button type="button" onClick={() => setFaqQuery('')}>Reset FAQ search</button>
              </article>
            )}
          </div>
        </section>
      </main>

      {dockState.hidden ? (
        <button
          type="button"
          className={s.compareDockReveal}
          onClick={showDock}
          aria-label="Show compare dock"
        >
          <strong>Show compare dock</strong>
          <span>{compareHosts.length}/3 selected</span>
        </button>
      ) : (
        <aside
          className={`${s.compareDock} ${dockState.collapsed ? s.compareDockCollapsed : ''}`}
          aria-label="Comparison shortcuts"
        >
          <div className={s.compareDockSummary}>
            <p className={s.compareDockTitle}>
              {dockState.collapsed ? `${compareHosts.length}/3 hosts selected` : `Viewing ${activeSectionLabel}`}
            </p>
            {!dockState.collapsed && (
              <div className={s.compareDockStats}>
                <span>{compareHosts.length} compare</span>
                <span>{shortlistedHosts.length} saved</span>
                <span>{journeyProgress}% journey</span>
                <span>{compareReadinessLabel}</span>
              </div>
            )}
            {!dockState.collapsed && (
              <small className={s.compareDockHint}>Shortcuts: Shift + C compare · Shift + S share · Shift + V view · Shift + D dock · Shift + T top</small>
            )}
          </div>

          {!dockState.collapsed && (
            <div className={s.compareDockTags}>
              {compareHosts.map((host) => (
                <span key={host.id}>{renderHostInline(host)}</span>
              ))}
            </div>
          )}

          <div className={s.compareDockActions}>
            <a href="#compare" onClick={(event) => onSectionNavClick(event, 'compare')}>Compare</a>
            {!dockState.collapsed && (
              <a href="#rankings" onClick={(event) => onSectionNavClick(event, 'rankings')}>Rankings</a>
            )}
            {!dockState.collapsed && (
              <a href="#workspace" onClick={(event) => onSectionNavClick(event, 'workspace')}>Workspace</a>
            )}
            {!dockState.collapsed && (
              <button
                type="button"
                className={s.compareDockContinue}
                onClick={() => jumpToSection(nextJourneyStep.id)}
              >
                {isJourneyFlowComplete ? 'View proof' : `Continue: ${nextJourneyStep.label}`}
              </button>
            )}
            {!dockState.collapsed && suggestedCompareHost && compareHosts.length < 3 && (
              <button type="button" className={s.compareDockAdd} onClick={() => toggleCompare(suggestedCompareHost.id)}>
                + {renderHostText(suggestedCompareHost)}
              </button>
            )}
          </div>

          <div className={s.compareDockControls}>
            <button type="button" onClick={toggleDockCollapsed}>
              {dockState.collapsed ? 'Expand' : 'Minimize'}
            </button>
            <button type="button" onClick={hideDock}>Hide</button>
          </div>
        </aside>
      )}

      {showBackToTop && (
        <button
          type="button"
          className={`${s.backToTop} ${dockState.hidden ? s.backToTopLow : s.backToTopHigh}`}
          onClick={() => jumpToSection('overview')}
          aria-label="Back to top"
        >
          Top
        </button>
      )}

      {toast.message && (
        <div
          className={`${s.toast} ${dockState.hidden ? s.toastLow : s.toastHigh}`}
          role="status"
          aria-live="polite"
        >
          <span>{toast.message}</span>
          <div className={s.toastActions}>
            {toast.actionId && toast.actionLabel && (
              <button
                type="button"
                className={s.toastActionButton}
                onClick={runToastAction}
              >
                {toast.actionLabel}
              </button>
            )}
            <button
              type="button"
              onClick={dismissToast}
              aria-label="Dismiss notification"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div>
            <strong>HostAff Pro</strong>
            <p>Affiliate-first hosting decision app for high-intent buyers.</p>
          </div>
          <p>
            {new Date().getFullYear()} HostAff Pro. Affiliate links may earn commissions.
            Data refresh cadence: every 24 hours.
          </p>
        </div>
      </footer>
    </div>
  );
}

