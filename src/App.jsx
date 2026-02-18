import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FAQ_ITEMS,
  HOSTS,
  HOSTING_TYPE_OPTIONS,
  HOST_TYPE_PROFILE_VERIFICATION,
  HOST_TYPE_PROFILES,
  REVIEWS,
  TRUST_METRICS,
} from './data/hosts';
import s from './App.module.css';

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
];

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
    budget: { min: 5, max: 40, default: 12, step: 1 },
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
    budget: { min: 20, max: 150, default: 50, step: 2 },
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getPromoCode(host) {
  if (!host || typeof host.promoCode !== 'string') {
    return '';
  }

  return host.promoCode.trim();
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

function getHostingTypeStrategy(hostingType) {
  return HOSTING_TYPE_STRATEGY[hostingType]
    || HOSTING_TYPE_STRATEGY[DEFAULT_HOSTING_TYPE]
    || {
      projectFit: LAB_PROJECTS.map((item) => item.id),
      trafficFit: LAB_TRAFFIC.map((item) => item.id),
      budget: { min: 5, max: 120, default: 24, step: 1 },
    };
}

function toUniqueValidIds(values, validSet) {
  if (!Array.isArray(values)) {
    return [];
  }

  const unique = [];
  values.forEach((value) => {
    const normalized = String(value || '').trim();
    if (!normalized || !validSet.has(normalized) || unique.includes(normalized)) {
      return;
    }
    unique.push(normalized);
  });
  return unique;
}

function resolveFitValues(profileValues, hostValues, strategyValues, validSet) {
  const explicit = toUniqueValidIds(profileValues, validSet);
  if (explicit.length) {
    return explicit;
  }

  const host = toUniqueValidIds(hostValues, validSet);
  const strategy = toUniqueValidIds(strategyValues, validSet);

  if (host.length && strategy.length) {
    const hostSet = new Set(host);
    const overlap = strategy.filter((value) => hostSet.has(value));
    if (overlap.length) {
      return overlap;
    }
    return strategy;
  }

  if (host.length) {
    return host;
  }

  if (strategy.length) {
    return strategy;
  }

  return [...validSet];
}

function resolveFinderProjectIds(hostingType, hosts) {
  const strategy = getHostingTypeStrategy(hostingType);
  const hostSet = new Set();

  hosts.forEach((host) => {
    const hostProjects = toUniqueValidIds(host.projectFit, LAB_PROJECT_ID_SET);
    hostProjects.forEach((projectId) => hostSet.add(projectId));
  });

  const strategyIds = toUniqueValidIds(strategy.projectFit, LAB_PROJECT_ID_SET);
  const preferred = strategyIds.filter((projectId) => hostSet.size === 0 || hostSet.has(projectId));
  if (preferred.length) {
    return preferred;
  }

  const hostFirst = LAB_PROJECTS
    .map((item) => item.id)
    .filter((projectId) => hostSet.has(projectId));
  if (hostFirst.length) {
    return hostFirst;
  }

  return strategyIds.length ? strategyIds : LAB_PROJECTS.map((item) => item.id);
}

function resolveFinderTrafficIds(hostingType, hosts) {
  const strategy = getHostingTypeStrategy(hostingType);
  const hostSet = new Set();

  hosts.forEach((host) => {
    const hostTraffic = toUniqueValidIds(host.trafficFit, LAB_TRAFFIC_ID_SET);
    hostTraffic.forEach((trafficId) => hostSet.add(trafficId));
  });

  const strategyIds = toUniqueValidIds(strategy.trafficFit, LAB_TRAFFIC_ID_SET);
  const preferred = strategyIds.filter((trafficId) => hostSet.size === 0 || hostSet.has(trafficId));
  if (preferred.length) {
    return preferred;
  }

  const hostFirst = LAB_TRAFFIC
    .map((item) => item.id)
    .filter((trafficId) => hostSet.has(trafficId));
  if (hostFirst.length) {
    return hostFirst;
  }

  return strategyIds.length ? strategyIds : LAB_TRAFFIC.map((item) => item.id);
}

function getFinderBudgetConfig(hostingType, hosts) {
  const strategy = getHostingTypeStrategy(hostingType);
  const introPrices = hosts
    .map((host) => Number(host.priceIntro))
    .filter((value) => Number.isFinite(value) && value > 0);
  const observedMin = introPrices.length ? Math.min(...introPrices) : DEFAULT_LAB_PROFILE.budget;
  const observedMax = introPrices.length ? Math.max(...introPrices) : DEFAULT_LAB_PROFILE.budget;
  const budget = strategy.budget || {};
  const configuredMin = Number(budget.min);
  const configuredMax = Number(budget.max);
  const configuredDefault = Number(budget.default);
  const configuredStep = Number(budget.step);
  const min = Math.max(
    5,
    Math.floor(Number.isFinite(configuredMin) ? configuredMin : observedMin * 0.8)
  );
  const maxFromData = Math.ceil(Math.max(observedMax * 1.35, observedMin + 10));
  const max = Math.max(
    min + 10,
    Number.isFinite(configuredMax) ? Math.max(configuredMax, maxFromData) : maxFromData
  );
  const step = Number.isFinite(configuredStep)
    ? Math.max(1, Math.floor(configuredStep))
    : (max - min > 140 ? 5 : 1);
  const fallbackDefault = Number.isFinite(configuredDefault)
    ? configuredDefault
    : Math.round((min + max) / 2);

  return {
    min,
    max,
    step,
    defaultBudget: clamp(fallbackDefault, min, max),
  };
}

function normalizeLabProfileForType(profile, hostingType, hosts) {
  const safeProfile = profile && typeof profile === 'object' ? profile : {};
  const projectIds = resolveFinderProjectIds(hostingType, hosts);
  const trafficIds = resolveFinderTrafficIds(hostingType, hosts);
  const budgetConfig = getFinderBudgetConfig(hostingType, hosts);
  const projectType = projectIds.includes(safeProfile.projectType)
    ? safeProfile.projectType
    : (projectIds[0] || DEFAULT_LAB_PROFILE.projectType);
  const traffic = trafficIds.includes(safeProfile.traffic)
    ? safeProfile.traffic
    : (trafficIds[0] || DEFAULT_LAB_PROFILE.traffic);
  const priority = LAB_PRIORITIES.some((item) => item.id === safeProfile.priority)
    ? safeProfile.priority
    : DEFAULT_LAB_PROFILE.priority;
  const rawBudget = Number(safeProfile.budget);
  const clampedBudget = clamp(
    Number.isFinite(rawBudget) ? rawBudget : budgetConfig.defaultBudget,
    budgetConfig.min,
    budgetConfig.max
  );
  const normalizedBudget = Math.round((clampedBudget - budgetConfig.min) / budgetConfig.step) * budgetConfig.step + budgetConfig.min;

  return {
    projectType,
    traffic,
    priority,
    budget: clamp(normalizedBudget, budgetConfig.min, budgetConfig.max),
  };
}

function getCalculatorSpendConfig(hosts) {
  const basePrices = hosts
    .map((host) => Number(host.priceIntro))
    .filter((value) => Number.isFinite(value) && value > 0);
  const renewalPrices = hosts
    .map((host) => Number(host.priceRenewal))
    .filter((value) => Number.isFinite(value) && value > 0);
  const observedMin = basePrices.length ? Math.min(...basePrices) : 8;
  const observedMax = renewalPrices.length
    ? Math.max(...renewalPrices)
    : (basePrices.length ? Math.max(...basePrices) : 180);
  const min = Math.max(8, Math.floor(observedMin * 0.7));
  const max = Math.max(min + 24, Math.ceil(observedMax * 2));
  const step = max - min > 240 ? 5 : 1;

  return { min, max, step };
}

function getHostTypeProfile(host, hostingType) {
  if (!host || !hostingType) {
    return null;
  }

  const hostProfiles = HOST_TYPE_PROFILES[host.id];
  if (!hostProfiles || typeof hostProfiles !== 'object') {
    return null;
  }

  return hostProfiles[hostingType] || null;
}

function getHostTypeVerification(hostId, hostingType) {
  const hostVerification = HOST_TYPE_PROFILE_VERIFICATION[hostId];
  if (!hostVerification || typeof hostVerification !== 'object') {
    return null;
  }

  return hostVerification[hostingType] || null;
}

function resolveHostForType(host, hostingType) {
  const profile = getHostTypeProfile(host, hostingType);
  if (!profile) {
    return null;
  }

  const verification = getHostTypeVerification(host.id, hostingType);
  const strategy = getHostingTypeStrategy(hostingType);
  const plans = Array.isArray(profile.plans)
    ? profile.plans
    : Array.isArray(host.plans)
      ? host.plans
      : [];
  const features = Array.isArray(profile.features) ? profile.features : host.features;
  const projectFit = resolveFitValues(
    profile.projectFit,
    host.projectFit,
    strategy.projectFit,
    LAB_PROJECT_ID_SET
  );
  const trafficFit = resolveFitValues(
    profile.trafficFit,
    host.trafficFit,
    strategy.trafficFit,
    LAB_TRAFFIC_ID_SET
  );
  const mergedDataSources = {
    ...(host.dataSources || {}),
    ...(verification?.dataSources || {}),
    ...(profile.dataSources || {}),
  };
  const starterPlan = plans[0] || null;
  const scalePlan = plans.length > 1 ? plans[plans.length - 1] : null;
  const promoLabel = profile.promoLabel
    || host.promoLabel
    || (starterPlan
      ? `${starterPlan.name} from ${currency.format(starterPlan.introMonthly)}/mo`
      : host.promoLabel);

  return {
    ...host,
    ...profile,
    activeHostingType: hostingType,
    activeHostingTypeLabel: HOSTING_TYPE_LABELS[hostingType] || hostingType,
    plans,
    features,
    projectFit,
    trafficFit,
    dataSources: mergedDataSources,
    lastVerified: profile.lastVerified || verification?.lastVerified || host.lastVerified,
    promoLabel,
    starterPlanName: starterPlan?.name || '',
    starterPlanIntro: starterPlan?.introMonthly ?? profile.priceIntro ?? host.priceIntro,
    scalePlanName: scalePlan?.name || starterPlan?.name || '',
    scalePlanIntro: scalePlan?.introMonthly ?? profile.priceRenewal ?? host.priceRenewal,
  };
}

function resolveHostsForType(hostingType) {
  return HOSTS
    .map((host) => resolveHostForType(host, hostingType))
    .filter(Boolean);
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
  const matchesProject = host.projectFit.includes(profile.projectType);
  const matchesTraffic = host.trafficFit.includes(profile.traffic);
  const projectFitBoost = matchesProject ? 10 : 0;
  const trafficFitBoost = matchesTraffic ? 8 : 0;
  const scaleSignal = clamp(host.dataCenters * 1.3 + (host.uptimePercent - 99) * 25, 0, 100);

  const priorityScore = {
    speed: host.performance * 0.62 + host.overallScore * 0.25 + host.support * 0.13,
    support: host.support * 0.58 + host.overallScore * 0.22 + host.value * 0.2,
    value: host.value * 0.56 + host.performance * 0.2 + host.support * 0.14 + (100 - host.priceIntro * 3.2) * 0.1,
    balanced: scoreHost(host),
  }[profile.priority];

  const composite = priorityScore * 0.56 + budgetFit * 0.22 + scaleSignal * 0.12 + host.support * 0.1;
  const overBudgetPenalty = host.priceIntro > profile.budget * 1.65 ? 12 : 0;
  const projectMismatchPenalty = matchesProject ? 0 : 14;
  const trafficMismatchPenalty = matchesTraffic ? 0 : 10;

  return Math.round(
    clamp(
      composite + projectFitBoost + trafficFitBoost - overBudgetPenalty - projectMismatchPenalty - trafficMismatchPenalty,
      0,
      100
    )
  );
}

function getProjectLabel(projectType) {
  return LAB_PROJECTS.find((item) => item.id === projectType)?.label || 'Project';
}

function getLabReasons(host, profile) {
  const reasons = [];

  if (host.projectFit.includes(profile.projectType)) {
    reasons.push(`Strong match for ${getProjectLabel(profile.projectType).toLowerCase()}.`);
  } else {
    reasons.push(`Not primarily optimized for ${getProjectLabel(profile.projectType).toLowerCase()} workloads.`);
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
    reasons.push(`Best fit is ${host.trafficFit.join(' / ')} traffic; this profile requests ${profile.traffic}.`);
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

function getDefaultHostingTypeForHost(hostId) {
  const normalizedHostId = String(hostId || '');
  if (!normalizedHostId) {
    return DEFAULT_HOSTING_TYPE;
  }

  const profiles = HOST_TYPE_PROFILES[normalizedHostId];
  if (!profiles || typeof profiles !== 'object') {
    return DEFAULT_HOSTING_TYPE;
  }

  const detectedType = HOSTING_TYPE_IDS.find((typeId) => Boolean(profiles[typeId]));
  return detectedType || DEFAULT_HOSTING_TYPE;
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

  const rawDims = review.dimensions && typeof review.dimensions === 'object' ? review.dimensions : {};
  const dimensions = Object.fromEntries(
    REVIEW_DIMENSIONS.map((d) => [d.id, clamp(Number(rawDims[d.id]) || 0, 0, 5)])
  );
  const hostId = HOST_BY_ID.has(review.hostId) ? review.hostId : HOSTS[0].id;
  const reviewHostingType = String(review.hostingType || '').trim().toLowerCase();
  const supportsExplicitType = reviewHostingType
    && HOSTING_TYPE_IDS.includes(reviewHostingType)
    && Boolean(HOST_TYPE_PROFILES[hostId]?.[reviewHostingType]);
  const hostingType = supportsExplicitType
    ? reviewHostingType
    : getDefaultHostingTypeForHost(hostId);

  return {
    id: String(review.id ?? fallbackId),
    name,
    role,
    hostId,
    hostingType,
    quote,
    monthlySavings: clamp(Number(review.monthlySavings) || 0, 0, 20000),
    score: clamp(Number(review.score) || 5, 1, 5),
    dimensions,
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

function createSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function resolveCompareMetricGroup(label) {
  const normalized = String(label || '').toLowerCase();

  if (
    normalized.includes('price')
    || normalized.includes('cost')
    || normalized.includes('plan')
    || normalized.includes('money-back')
  ) {
    return 'pricing';
  }

  if (
    normalized.includes('ttfb')
    || normalized.includes('performance')
    || normalized.includes('uptime')
    || normalized.includes('setup')
  ) {
    return 'performance';
  }

  if (
    normalized.includes('support')
    || normalized.includes('control panel')
  ) {
    return 'support';
  }

  if (
    normalized.includes('visit capacity')
    || normalized.includes('storage')
    || normalized.includes('site limit')
    || normalized.includes('data centers')
  ) {
    return 'scale';
  }

  if (
    normalized.includes('free ')
    || normalized.includes('cdn')
    || normalized.includes('staging')
    || normalized.includes('migration')
    || normalized.includes('malware')
    || normalized.includes('backup')
  ) {
    return 'features';
  }

  return 'proof';
}

function scoreFaqMatch(item, query) {
  const normalizedQuestion = String(item?.question || '').toLowerCase();
  const normalizedAnswer = String(item?.answer || '').toLowerCase();

  let score = 0;

  if (normalizedQuestion.includes(query)) {
    score += 3;
  }
  if (normalizedQuestion.startsWith(query)) {
    score += 1;
  }
  if (normalizedAnswer.includes(query)) {
    score += 1;
  }

  return score;
}

function formatVerifiedDate(value) {
  if (!value) {
    return 'Date unavailable';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return reviewDateFormatter.format(date);
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

function getFeatureIconType(featureLabel) {
  const normalized = String(featureLabel || '').toLowerCase();

  if (
    normalized.includes('ssl')
    || normalized.includes('malware')
    || normalized.includes('security')
    || normalized.includes('firewall')
    || normalized.includes('waf')
    || normalized.includes('protect')
  ) {
    return 'security';
  }

  if (
    normalized.includes('backup')
    || normalized.includes('restore')
    || normalized.includes('snapshot')
  ) {
    return 'backup';
  }

  if (
    normalized.includes('cdn')
    || normalized.includes('ttfb')
    || normalized.includes('cache')
    || normalized.includes('speed')
    || normalized.includes('performance')
    || normalized.includes('latency')
  ) {
    return 'speed';
  }

  if (
    normalized.includes('support')
    || normalized.includes('chat')
    || normalized.includes('ticket')
    || normalized.includes('phone')
  ) {
    return 'support';
  }

  if (
    normalized.includes('storage')
    || normalized.includes('visit')
    || normalized.includes('site')
    || normalized.includes('data center')
    || normalized.includes('nvme')
    || normalized.includes('bandwidth')
    || normalized.includes('traffic')
  ) {
    return 'scale';
  }

  if (
    normalized.includes('migrat')
    || normalized.includes('staging')
    || normalized.includes('deploy')
  ) {
    return 'migration';
  }

  if (
    normalized.includes('email')
    || normalized.includes('domain')
    || normalized.includes('commerce')
    || normalized.includes('store')
    || normalized.includes('woocommerce')
  ) {
    return 'commerce';
  }

  return 'general';
}

function FeatureIcon({ type }) {
  if (type === 'security') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3 5 6v5c0 4.2 2.5 8 7 10 4.5-2 7-5.8 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="m9.3 11.8 1.8 1.8 3.7-3.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'backup') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <ellipse cx="12" cy="6.5" rx="6.8" ry="3.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5.2 6.5v7.3c0 1.8 3 3.2 6.8 3.2s6.8-1.4 6.8-3.2V6.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 10.1V14m0 0-1.7-1.7M12 14l1.7-1.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'speed') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M13.5 2 6 13h5l-1 9 8-12h-5.2L13.5 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'support') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 10a6 6 0 1 1 12 0v4.5a1.5 1.5 0 0 1-1.5 1.5H15" stroke="currentColor" strokeWidth="1.7" />
        <rect x="4" y="10.5" width="3.4" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
        <rect x="16.6" y="10.5" width="3.4" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (type === 'scale') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4.5 8.5h15M4.5 12h15M4.5 15.5h15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <rect x="3.5" y="5" width="17" height="14" rx="2.4" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (type === 'migration') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 8h12m0 0-3-3m3 3-3 3M18 16H6m0 0 3 3m-3-3 3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'commerce') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4.5 7h15l-1.1 6.1a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5.9 6.9" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="10" cy="18.5" r="1.3" fill="currentColor" />
        <circle cx="16" cy="18.5" r="1.3" fill="currentColor" />
        <path d="M3.5 5.1h2.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8.7 12.1 2.1 2.1 4.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function RatingStars({ rating }) {
  const floor = Math.floor(rating);
  const fraction = rating - floor;

  return (
    <div className={s.stars} aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < floor;
        const half = !filled && index === floor && fraction >= 0.25;
        const uid = `star-half-${index}`;
        return (
          <svg
            key={`star-${index + 1}`}
            className={`${s.star} ${filled ? s.starFilled : ''} ${half ? s.starHalfFilled : ''}`}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {half && (
              <defs>
                <linearGradient id={uid} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="50%" stopColor="#f5a524" />
                  <stop offset="50%" stopColor="#f5a524" stopOpacity={0} />
                </linearGradient>
              </defs>
            )}
            <path
              d="M12 2.5l2.87 5.8 6.4.93-4.63 4.5 1.09 6.37L12 17.07 6.27 20.1l1.09-6.37-4.63-4.5 6.4-.93L12 2.5z"
              fill={half ? `url(#${uid})` : undefined}
            />
          </svg>
        );
      })}
    </div>
  );
}


const RADAR_COLORS = ['#f26b1d', '#1499a8', '#6a57d6', '#157a67', '#ae5a18'];
const RADAR_DIMS = [
  { key: 'performance', label: 'Performance', shortLabel: 'Perf' },
  { key: 'support', label: 'Support', shortLabel: 'Support' },
  { key: 'value', label: 'Value', shortLabel: 'Value' },
  { key: 'uptime', label: 'Uptime', shortLabel: 'Uptime' },
  { key: 'speed', label: 'Speed', shortLabel: 'Speed' },
];

function getRadarScore(host, key) {
  if (key === 'uptime') {
    return Math.round(clamp((host.uptimePercent - 99) / 0.01, 0, 100));
  }
  if (key === 'speed') {
    return Math.round(clamp(100 - (host.ttfbMs - 200) / 8, 0, 100));
  }
  return host[key] ?? 0;
}

function getRadarCompositeScore(host) {
  const total = RADAR_DIMS.reduce((sum, dim) => sum + getRadarScore(host, dim.key), 0);
  return Math.round(total / RADAR_DIMS.length);
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function RadarChart({ hosts }) {
  const cx = 120;
  const cy = 120;
  const maxR = 90;
  const dimCount = RADAR_DIMS.length;
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

  const dimAngles = RADAR_DIMS.map((_, i) => (360 / dimCount) * i);

  const gridPoints = (fraction) =>
    dimAngles.map((angle) => {
      const pt = polarToCartesian(cx, cy, maxR * fraction, angle);
      return `${pt.x},${pt.y}`;
    }).join(' ');

  const hostPointSets = hosts.map((host) => (
    RADAR_DIMS.map((dim, i) => {
      const score = getRadarScore(host, dim.key);
      const point = polarToCartesian(cx, cy, maxR * (score / 100), dimAngles[i]);
      return { ...point, score };
    })
  ));

  const hostNames = hosts.map((host) => host.name).join(', ');
  const metricNames = RADAR_DIMS.map((dim) => dim.label).join(', ');

  return (
    <svg
      className={s.radarChart}
      viewBox="0 0 240 240"
      width="240"
      height="240"
      aria-label={`Radar comparison chart for ${hostNames} across ${metricNames}`}
      role="img"
    >
      <defs>
        {hosts.map((host, hostIndex) => {
          const color = RADAR_COLORS[hostIndex % RADAR_COLORS.length];
          return (
            <linearGradient
              key={`radar-gradient-${host.id}`}
              id={`radar-gradient-${host.id}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.08" />
            </linearGradient>
          );
        })}
      </defs>

      <circle
        cx={cx}
        cy={cy}
        r={maxR + 6}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.08"
      />

      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={gridPoints(level)}
          fill="currentColor"
          fillOpacity={Math.round(level * 100) % 40 === 0 ? 0.035 : 0}
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="1"
        />
      ))}
      {dimAngles.map((angle, i) => {
        const outer = polarToCartesian(cx, cy, maxR, angle);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke="currentColor"
            strokeOpacity="0.15"
            strokeWidth="1"
          />
        );
      })}
      {gridLevels.map((level) => {
        const scalePoint = polarToCartesian(cx, cy, maxR * level, 0);
        return (
          <text
            key={`radar-scale-${level}`}
            x={scalePoint.x + 5}
            y={scalePoint.y + 3}
            fontSize="7"
            fontWeight="700"
            fill="currentColor"
            opacity="0.48"
          >
            {Math.round(level * 100)}
          </text>
        );
      })}

      {hosts.map((host, hostIndex) => {
        const color = RADAR_COLORS[hostIndex % RADAR_COLORS.length];
        const points = hostPointSets[hostIndex];
        const polygonPoints = points.map((point) => `${point.x},${point.y}`).join(' ');
        const closedPolylinePoints = points.length
          ? `${polygonPoints} ${points[0].x},${points[0].y}`
          : polygonPoints;

        return (
          <g
            key={host.id}
            className={s.radarSeries}
            style={{ '--radar-color': color }}
          >
            <polygon
              points={polygonPoints}
              className={s.radarSeriesFill}
              fill={`url(#radar-gradient-${host.id})`}
            />
            <polyline
              points={closedPolylinePoints}
              className={s.radarSeriesStroke}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {points.map((point, dimIndex) => (
              <circle
                key={`${host.id}-radar-point-${RADAR_DIMS[dimIndex].key}`}
                className={s.radarSeriesPoint}
                cx={point.x}
                cy={point.y}
                r="3.1"
                fill="white"
                stroke={color}
                strokeWidth="1.7"
              />
            ))}
          </g>
        );
      })}

      <circle cx={cx} cy={cy} r="2.8" fill="currentColor" opacity="0.35" />

      {RADAR_DIMS.map((dim, i) => {
        const labelPt = polarToCartesian(cx, cy, maxR + 16, dimAngles[i]);
        return (
          <text
            key={dim.key}
            x={labelPt.x}
            y={labelPt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8.2"
            fontWeight="700"
            fill="currentColor"
            opacity="0.7"
            style={{
              paintOrder: 'stroke',
              stroke: 'rgba(255, 255, 255, 0.82)',
              strokeWidth: 2.2,
            }}
          >
            {dim.shortLabel}
          </text>
        );
      })}
    </svg>
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
        ? clamp(Number(parsedLab.budget), 5, 500)
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

function normalizeCompareIds(ids, allowedHostIds = ALL_HOST_IDS) {
  const allowedSet = new Set(
    Array.isArray(allowedHostIds)
      ? allowedHostIds.filter((id) => HOST_BY_ID.has(id) && id)
      : []
  );
  const fallbackIds = [...allowedSet];
  const minimumCount = Math.min(2, fallbackIds.length);
  const maxCount = Math.min(3, fallbackIds.length || 3);
  const valid = Array.isArray(ids)
    ? ids.filter((id) => allowedSet.has(id))
    : [];

  const unique = [];
  valid.forEach((id) => {
    if (!unique.includes(id)) {
      unique.push(id);
    }
  });

  while (unique.length < minimumCount) {
    const fallback = fallbackIds.find((id) => !unique.includes(id));
    if (!fallback) {
      break;
    }
    unique.push(fallback);
  }

  return unique.slice(0, maxCount);
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

function moveHostToCompareSlot(ids, hostId, slotIndex, allowedHostIds = ALL_HOST_IDS) {
  const normalized = normalizeCompareIds(ids, allowedHostIds);
  const allowedSet = new Set(
    Array.isArray(allowedHostIds)
      ? allowedHostIds.filter((id) => HOST_BY_ID.has(id) && id)
      : []
  );

  if (!allowedSet.has(hostId)) {
    return normalized;
  }

  const next = normalized.filter((id) => id !== hostId);
  const boundedSlotIndex = Math.max(0, Math.min(2, Number(slotIndex) || 0));
  const insertIndex = Math.min(boundedSlotIndex, next.length);

  next.splice(insertIndex, 0, hostId);
  return normalizeCompareIds(next.slice(0, 3), allowedHostIds);
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
    activeHostingType: DEFAULT_HOSTING_TYPE,
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
      if (HOSTING_TYPE_IDS.includes(parsedControls.activeHostingType)) {
        next.activeHostingType = parsedControls.activeHostingType;
      }

      if (ALL_CATEGORIES.includes(parsedControls.activeCategory)) {
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
    const urlType = urlParams.get('type');
    const urlCategory = urlParams.get('category');
    const urlSort = urlParams.get('sort');
    const urlQuery = urlParams.get('q');
    const hasUrlControlState = urlParams.has('compare')
      || urlParams.has('type')
      || urlParams.has('category')
      || urlParams.has('sort')
      || urlParams.has('q');

    if (urlType && HOSTING_TYPE_IDS.includes(urlType)) {
      next.activeHostingType = urlType;
    }

    if (urlCategory && ALL_CATEGORIES.includes(urlCategory)) {
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

    const rawDims = parsedDraft.dimensions && typeof parsedDraft.dimensions === 'object' ? parsedDraft.dimensions : {};
    const dimensions = Object.fromEntries(
      REVIEW_DIMENSIONS.map((d) => [d.id, clamp(Number(rawDims[d.id]) || 0, 0, 5)])
    );

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
      dimensions,
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
  const [activeHostingType, setActiveHostingType] = useState(() => getInitialRankingControls().activeHostingType);
  const [activeCategory, setActiveCategory] = useState(() => getInitialRankingControls().activeCategory);
  const [sortKey, setSortKey] = useState(() => getInitialRankingControls().sortKey);
  const [searchTerm, setSearchTerm] = useState(() => getInitialRankingControls().searchTerm);
  const [compareIds, setCompareIds] = useState(loadInitialCompareIds);
  const [compareTableView, setCompareTableView] = useState(loadInitialCompareTableView);
  const [compareMetricGroup, setCompareMetricGroup] = useState('all');
  const [compareMetricQuery, setCompareMetricQuery] = useState('');
  const [compareKeyMetricsOnly, setCompareKeyMetricsOnly] = useState(false);
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
  const [finderFlash, setFinderFlash] = useState(false);
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const headerRef = useRef(null);
  const hasSyncedInitialHashRef = useRef(false);
  const searchInputRef = useRef(null);
  const commandInputRef = useRef(null);
  const isNavigatingRef = useRef(false);
  const navigationTimeoutRef = useRef(null);
  const reviewFormRef = useRef(null);
  const hostsForActiveType = useMemo(
    () => resolveHostsForType(activeHostingType),
    [activeHostingType]
  );
  const activeHostIds = useMemo(
    () => hostsForActiveType.map((host) => host.id),
    [hostsForActiveType]
  );
  const activeHostIdSet = useMemo(
    () => new Set(activeHostIds),
    [activeHostIds]
  );
  const hostByIdForActiveType = useMemo(
    () => new Map(hostsForActiveType.map((host) => [host.id, host])),
    [hostsForActiveType]
  );
  const activeHostingTypeLabel = HOSTING_TYPE_LABELS[activeHostingType] || activeHostingType;
  const rankingCategories = useMemo(
    () => ['All', ...new Set(hostsForActiveType.map((host) => host.category))],
    [hostsForActiveType]
  );
  const fallbackHostId = hostsForActiveType[0]?.id || HOSTS[0].id;
  const finderProjectIds = useMemo(
    () => resolveFinderProjectIds(activeHostingType, hostsForActiveType),
    [activeHostingType, hostsForActiveType]
  );
  const finderTrafficIds = useMemo(
    () => resolveFinderTrafficIds(activeHostingType, hostsForActiveType),
    [activeHostingType, hostsForActiveType]
  );
  const finderProjectOptions = useMemo(
    () => LAB_PROJECTS.filter((option) => finderProjectIds.includes(option.id)),
    [finderProjectIds]
  );
  const finderTrafficOptions = useMemo(
    () => LAB_TRAFFIC.filter((option) => finderTrafficIds.includes(option.id)),
    [finderTrafficIds]
  );
  const finderBudgetConfig = useMemo(
    () => getFinderBudgetConfig(activeHostingType, hostsForActiveType),
    [activeHostingType, hostsForActiveType]
  );
  const calculatorSpendConfig = useMemo(
    () => getCalculatorSpendConfig(hostsForActiveType),
    [hostsForActiveType]
  );
  const finderBudgetMidpoint = Math.round((finderBudgetConfig.min + finderBudgetConfig.max) / 2);

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
      const normalized = normalizeCompareIds(current, activeHostIds);
      return areIdListsEqual(current, normalized) ? current : normalized;
    });
  }, [activeHostIds]);

  useEffect(() => {
    if (rankingCategories.includes(activeCategory)) {
      return;
    }

    setActiveCategory('All');
  }, [activeCategory, rankingCategories]);

  useEffect(() => {
    setLabProfile((current) => {
      const normalized = normalizeLabProfileForType(current, activeHostingType, hostsForActiveType);
      return (
        current.projectType === normalized.projectType
        && current.traffic === normalized.traffic
        && current.priority === normalized.priority
        && current.budget === normalized.budget
      )
        ? current
        : normalized;
    });
  }, [activeHostingType, hostsForActiveType]);

  useEffect(() => {
    setMonthlySpend((current) => {
      const clamped = clamp(current, calculatorSpendConfig.min, calculatorSpendConfig.max);
      return current === clamped ? current : clamped;
    });
  }, [calculatorSpendConfig.max, calculatorSpendConfig.min]);

  useEffect(() => {
    if (reviewHostFilter === 'all' || activeHostIdSet.has(reviewHostFilter)) {
      return;
    }

    setReviewHostFilter('all');
  }, [activeHostIdSet, reviewHostFilter]);

  useEffect(() => {
    setReviewDraft((current) => (
      activeHostIdSet.has(current.hostId)
        ? current
        : { ...current, hostId: fallbackHostId }
    ));
  }, [activeHostIdSet, fallbackHostId]);

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
    const normalizedCurrent = normalizeCompareIds(compareIds, activeHostIds);
    const preferredHostId = normalizedCurrent[0] || fallbackHostId;

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
  }, [activeHostIds, compareIds, fallbackHostId]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.compareTable, compareTableView);
  }, [compareTableView]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEYS.controls,
      JSON.stringify({
        activeHostingType,
        activeCategory,
        sortKey,
        searchTerm,
      })
    );
  }, [activeHostingType, activeCategory, sortKey, searchTerm]);

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
  }, [reviewHostFilter, reviewMinScore, reviewQuery, reviewSortKey, reviews.length, activeHostingType]);

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
      if (event.key === 'Escape') {
        if (mobileNavOpen) {
          event.preventDefault();
          setMobileNavOpen(false);
          return;
        }

        if (isCommandOpen) {
          event.preventDefault();
          setIsCommandOpen(false);
          setCommandQuery('');
          return;
        }
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
  }, [isCommandOpen, mobileNavOpen]);

  useEffect(() => {
    let rafId = 0;

    const updateBackToTop = () => {
      rafId = 0;
      const nextVisible = window.scrollY > 700;
      setShowBackToTop((current) => (current === nextVisible ? current : nextVisible));
    };

    const onScroll = () => {
      if (rafId) {
        return;
      }
      rafId = window.requestAnimationFrame(updateBackToTop);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => () => {
    if (navigationTimeoutRef.current) {
      window.clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }
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
    document.body.style.overflow = mobileNavOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) {
      return undefined;
    }
    const onResize = () => {
      if (window.innerWidth > 820) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [mobileNavOpen]);

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

      if (isNavigatingRef.current) {
        return;
      }

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
      ? hostsForActiveType
      : hostsForActiveType.filter((host) => host.category === activeCategory);

    const query = searchTerm.trim().toLowerCase();

    if (query) {
      filtered = filtered.filter((host) => {
        const hostPlans = Array.isArray(host.plans) ? host.plans : [];
        const haystack = [
          host.name,
          host.activeHostingTypeLabel,
          host.category,
          host.planType,
          host.bestFor,
          host.tagline,
          host.controlPanel,
          host.backupPolicy,
          host.supportChannels,
          host.promoLabel,
          ...host.features,
          ...hostPlans.map((plan) => `${plan.name} ${plan.summary}`),
        ].join(' ').toLowerCase();
        return haystack.includes(query);
      });
    }

    return sortHosts(filtered, sortKey);
  }, [activeCategory, hostsForActiveType, sortKey, searchTerm]);

  const heroTopHosts = useMemo(
    () => sortHosts(hostsForActiveType, 'overall').slice(0, 3),
    [hostsForActiveType]
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

    hostsForActiveType.forEach((host) => {
      const relatedReviews = reviews.filter(
        (review) => review.hostId === host.id && review.hostingType === activeHostingType
      );
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
  }, [activeHostingType, hostsForActiveType, reviews]);
  const totalReviewSignalCount = useMemo(
    () => [...hostReviewSignals.values()].reduce(
      (sum, signal) => sum + signal.totalReviewCount,
      0
    ),
    [hostReviewSignals]
  );
  const workspaceReviewSignalCount = useMemo(
    () => reviews.filter(
      (review) => activeHostIdSet.has(review.hostId)
      && review.hostingType === activeHostingType
      && String(review.id).startsWith('user-')
    ).length,
    [activeHostIdSet, activeHostingType, reviews]
  );
  const getHostReviewSignal = (hostId) => hostReviewSignals.get(hostId) || DEFAULT_HOST_REVIEW_SIGNAL;
  const hostSelectOptions = useMemo(() => {
    const seen = new Set();
    const prioritized = [];
    const prioritizedCompareIds = normalizeCompareIds(compareIds, activeHostIds);

    prioritizedCompareIds.forEach((hostId) => {
      const host = hostByIdForActiveType.get(hostId);
      if (!host || seen.has(host.id)) {
        return;
      }
      prioritized.push(host);
      seen.add(host.id);
    });

    hostsForActiveType.forEach((host) => {
      if (seen.has(host.id)) {
        return;
      }
      prioritized.push(host);
      seen.add(host.id);
    });

    return prioritized;
  }, [activeHostIds, compareIds, hostByIdForActiveType, hostsForActiveType]);
  const reviewHostCounts = useMemo(() => {
    const counts = new Map();

    reviews.forEach((review) => {
      if (!activeHostIdSet.has(review.hostId) || review.hostingType !== activeHostingType) {
        return;
      }
      counts.set(review.hostId, (counts.get(review.hostId) || 0) + 1);
    });

    return counts;
  }, [activeHostIdSet, activeHostingType, reviews]);
  const reviewHostOptions = useMemo(() => {
    const options = [{ id: 'all', label: `All ${activeHostingTypeLabel.toLowerCase()} hosts`, count: 0 }];

    hostSelectOptions.forEach((host) => {
      const count = reviewHostCounts.get(host.id) || 0;
      options.push({ id: host.id, label: host.name, count });
      options[0].count += count;
    });

    return options;
  }, [activeHostingTypeLabel, hostSelectOptions, reviewHostCounts]);
  const scopedReviews = useMemo(
    () => reviews.filter(
      (review) => activeHostIdSet.has(review.hostId) && review.hostingType === activeHostingType
    ),
    [activeHostIdSet, activeHostingType, reviews]
  );
  const reviewAverageScore = useMemo(() => {
    if (!scopedReviews.length) {
      return 0;
    }

    const total = scopedReviews.reduce((sum, review) => sum + clamp(Number(review.score) || 0, 1, 5), 0);
    return total / scopedReviews.length;
  }, [scopedReviews]);
  const reviewAverageSavings = useMemo(() => {
    if (!scopedReviews.length) {
      return 0;
    }

    const total = scopedReviews.reduce((sum, review) => sum + clamp(Number(review.monthlySavings) || 0, 0, 20000), 0);
    return total / scopedReviews.length;
  }, [scopedReviews]);
  const marketplaceAverageScore = useMemo(() => {
    if (!totalReviewSignalCount) {
      return reviewAverageScore;
    }

    const weightedTotal = hostsForActiveType.reduce((sum, host) => {
      const signal = hostReviewSignals.get(host.id) || DEFAULT_HOST_REVIEW_SIGNAL;
      if (!signal.totalReviewCount) {
        return sum;
      }
      return sum + signal.weightedScore * signal.totalReviewCount;
    }, 0);

    return weightedTotal / totalReviewSignalCount;
  }, [hostReviewSignals, hostsForActiveType, reviewAverageScore, totalReviewSignalCount]);
  const marketplaceTopReviewedHost = useMemo(() => {
    let winner = null;
    let winnerCount = -1;

    hostsForActiveType.forEach((host) => {
      const totalCount = hostReviewSignals.get(host.id)?.totalReviewCount || host.reviewCount;
      if (totalCount > winnerCount) {
        winner = host;
        winnerCount = totalCount;
      }
    });

    return winner;
  }, [hostReviewSignals, hostsForActiveType]);
  const reviewHelpfulVotedSet = useMemo(
    () => new Set(reviewHelpfulVotedIds),
    [reviewHelpfulVotedIds]
  );
  const reviewQueryNormalized = reviewQuery.trim().toLowerCase();
  const filteredReviews = useMemo(() => {
    const filtered = scopedReviews.filter((review) => (
      (reviewHostFilter === 'all' || review.hostId === reviewHostFilter)
      && clamp(Number(review.score) || 0, 1, 5) >= reviewMinScore
      && (
        !reviewQueryNormalized
        || `${review.name} ${review.role} ${review.quote} ${(hostByIdForActiveType.get(review.hostId) || HOST_BY_ID.get(review.hostId))?.name || ''}`
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
  }, [hostByIdForActiveType, reviewHelpfulCounts, reviewHostFilter, reviewMinScore, reviewQueryNormalized, reviewSortKey, scopedReviews]);
  const reviewPositiveRate = useMemo(() => {
    if (!scopedReviews.length) {
      return 0;
    }

    const positiveCount = scopedReviews.filter((review) => clamp(Number(review.score) || 0, 1, 5) >= 4.5).length;
    return Math.round((positiveCount / scopedReviews.length) * 100);
  }, [scopedReviews]);
  const reviewStarBuckets = useMemo(
    () => [5, 4, 3, 2, 1].map((star) => {
      const count = scopedReviews.filter(
        (review) => Math.round(clamp(Number(review.score) || 0, 1, 5)) === star
      ).length;
      const percent = scopedReviews.length ? Math.round((count / scopedReviews.length) * 100) : 0;
      return { star, count, percent };
    }),
    [scopedReviews]
  );
  const reviewSortLabel = REVIEW_SORT_OPTIONS.find((option) => option.id === reviewSortKey)?.label || 'Newest first';
  const activeReviewHost = reviewHostFilter === 'all' ? null : hostByIdForActiveType.get(reviewHostFilter);
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
  const featuredReviewHost = featuredReview ? hostByIdForActiveType.get(featuredReview.hostId) || null : null;
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

  const topHost = heroTopHosts[0] || hostsForActiveType[0] || HOSTS[0];
  const topHostPromoCode = getPromoCode(topHost);
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
    () => normalizeCompareIds(compareIds, activeHostIds),
    [activeHostIds, compareIds]
  );

  const compareHosts = useMemo(
    () => normalizedCompareIds
      .map((id) => hostByIdForActiveType.get(id))
      .filter(Boolean),
    [hostByIdForActiveType, normalizedCompareIds]
  );
  const compareSlotCapacity = Math.max(1, Math.min(3, activeHostIds.length || 1));
  const compareMinimumRequired = Math.min(2, compareSlotCapacity);
  const compareExtraSlotEnabled = compareSlotCapacity >= 3;

  const heroCompareIds = useMemo(() => {
    const ids = [...normalizedCompareIds];
    while (ids.length < 2) {
      const fallback = activeHostIds.find((id) => !ids.includes(id));
      if (!fallback) {
        break;
      }
      ids.push(fallback);
    }
    return ids.slice(0, 2);
  }, [activeHostIds, normalizedCompareIds]);

  const heroCompareA = hostByIdForActiveType.get(heroCompareIds[0]) || topHost;
  const heroCompareB = hostByIdForActiveType.get(heroCompareIds[1]) || heroTopHosts[1] || topHost;
  const compareSlotCId = compareExtraSlotEnabled ? (normalizedCompareIds[2] || '') : '';
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
      .map((id) => hostByIdForActiveType.get(id))
      .filter(Boolean),
    [hostByIdForActiveType, shortlistIds]
  );

  const labRecommendations = useMemo(
    () => hostsForActiveType
      .map((host) => ({
        host,
        score: scoreLabHost(host, labProfile),
        reasons: getLabReasons(host, labProfile),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3),
    [hostsForActiveType, labProfile]
  );
  const finderTopRecommendation = labRecommendations[0] || null;
  const finderTopScore = finderTopRecommendation?.score || 0;
  const finderConfidenceLabel = finderTopScore >= 85
    ? 'High confidence'
    : finderTopScore >= 74
      ? 'Medium confidence'
      : 'Explore more options';
  const finderTrafficCoverageCount = hostsForActiveType.filter((host) => host.trafficFit.includes(labProfile.traffic)).length;
  const finderTopBudgetDelta = finderTopRecommendation
    ? labProfile.budget - finderTopRecommendation.host.priceIntro
    : 0;
  const finderTopBudgetCopy = finderTopRecommendation
    ? finderTopBudgetDelta >= 0
      ? `${currency.format(finderTopBudgetDelta)} under budget`
      : `${currency.format(Math.abs(finderTopBudgetDelta))} above budget`
    : 'No recommendation yet';
  const selectedProjectLabel = finderProjectOptions.find((option) => option.id === labProfile.projectType)?.label || 'Project';
  const selectedTrafficLabel = finderTrafficOptions.find((option) => option.id === labProfile.traffic)?.label || 'Traffic';
  const selectedPriorityLabel = LAB_PRIORITIES.find((option) => option.id === labProfile.priority)?.label || 'Priority';
  const finderBudgetCoverageCount = hostsForActiveType.filter((host) => host.priceIntro <= labProfile.budget).length;
  const finderBudgetChampion = labRecommendations.find((item) => item.host.priceIntro <= labProfile.budget)?.host
    || labRecommendations[0]?.host
    || topHost;

  const shortlistRenewalIncrease = shortlistedHosts.reduce(
    (total, host) => total + Math.max(0, host.priceRenewal - host.priceIntro),
    0
  );
  const workspaceReadiness = Math.round(clamp((shortlistedHosts.length / compareSlotCapacity) * 100, 0, 100));
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
  const workspaceSyncedCount = shortlistedHosts.filter((host) => normalizedCompareIds.includes(host.id)).length;
  const workspaceNeedsMoreToCompare = Math.max(0, compareMinimumRequired - shortlistedHosts.length);
  const workspaceTargetSyncCount = Math.min(shortlistedHosts.length, compareSlotCapacity);
  const workspaceUnsyncedCount = Math.max(0, workspaceTargetSyncCount - workspaceSyncedCount);
  const workspacePrimaryAction = workspaceNeedsMoreToCompare > 0
    ? {
      label: workspaceNeedsMoreToCompare === 1 ? 'Add 1 more host to unlock compare' : `Add ${workspaceNeedsMoreToCompare} hosts to unlock compare`,
      button: 'Open rankings',
      actionId: 'open-rankings',
    }
    : workspaceUnsyncedCount > 0
      ? {
        label: `${workspaceUnsyncedCount} saved host${workspaceUnsyncedCount === 1 ? '' : 's'} not in compare yet`,
        button: 'Sync shortlist to compare',
        actionId: 'sync-shortlist',
      }
      : {
        label: 'Your shortlist is synced and ready for side-by-side evaluation',
        button: 'Open compare table',
        actionId: 'open-compare',
      };

  const calculatorHost = hostByIdForActiveType.get(calculatorHostId) || topHost;
  const calculatorQuickPickHosts = normalizedCompareIds
    .map((id) => hostByIdForActiveType.get(id))
    .filter(Boolean)
    .slice(0, compareSlotCapacity);
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
  const calculatorPromoCode = getPromoCode(calculatorHost);
  const calculatorPlans = Array.isArray(calculatorHost.plans) ? calculatorHost.plans : [];
  const calculatorStarterPlan = calculatorPlans[0] || null;
  const calculatorScalePlan = calculatorPlans.length > 1 ? calculatorPlans[calculatorPlans.length - 1] : null;
  const calculatorVerifiedLabel = formatVerifiedDate(calculatorHost.lastVerified);
  const calculatorPricingSource = calculatorHost.dataSources?.pricing || '';
  const calculatorPolicySource = calculatorHost.dataSources?.policy || '';

  const toggleCompare = (hostId) => {
    if (!activeHostIdSet.has(hostId)) {
      return;
    }

    const host = hostByIdForActiveType.get(hostId);
    const normalizedCurrent = normalizeCompareIds(compareIds, activeHostIds);
    const isAlreadyInCompare = normalizedCurrent.includes(hostId);
    const replacementSlotIndex = Math.max(0, compareSlotCapacity - 1);
    const replacementSlotHost = hostByIdForActiveType.get(normalizedCurrent[replacementSlotIndex]);

    if (isAlreadyInCompare && normalizedCurrent.length <= compareMinimumRequired) {
      pushToast(`Keep at least ${compareMinimumRequired} host${compareMinimumRequired === 1 ? '' : 's'} in compare.`);
      return;
    }

    setCompareIds((current) => {
      const normalized = normalizeCompareIds(current, activeHostIds);

      if (normalized.includes(hostId)) {
        if (normalized.length <= compareMinimumRequired) {
          return normalized;
        }

        return normalizeCompareIds(normalized.filter((id) => id !== hostId), activeHostIds);
      }

      if (normalized.length >= compareSlotCapacity) {
        const next = [...normalized];
        next[replacementSlotIndex] = hostId;
        return normalizeCompareIds(next, activeHostIds);
      }

      return normalizeCompareIds([...normalized, hostId], activeHostIds);
    });

    if (!host) {
      return;
    }

    if (isAlreadyInCompare) {
      pushToast(`${host.name} removed from compare.`);
      return;
    }

    if (normalizedCurrent.length >= compareSlotCapacity) {
      const slotLabel = compareExtraSlotEnabled ? 'Slot C' : `Slot ${compareSlotCapacity}`;
      pushToast(`${host.name} added. ${replacementSlotHost?.name || slotLabel} replaced.`);
      return;
    }

    pushToast(`${host.name} added to compare.`);
  };

  const setHeroCompareSlot = (slotIndex, hostId) => {
    if (!activeHostIdSet.has(hostId) || (slotIndex !== 0 && slotIndex !== 1)) {
      return;
    }

    setCompareIds((current) => moveHostToCompareSlot(current, hostId, slotIndex, activeHostIds));
  };

  const swapHeroCompare = () => {
    setCompareIds((current) => {
      const normalized = normalizeCompareIds(current, activeHostIds);
      if (normalized.length >= 2) {
        return normalizeCompareIds([normalized[1], normalized[0], normalized[2]].filter(Boolean), activeHostIds);
      }
      return normalized;
    });
  };

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
    const intentType = HOSTING_TYPE_IDS.includes(intent.hostingType)
      ? intent.hostingType
      : activeHostingType;
    const intentHosts = resolveHostsForType(intentType);
    setLabProfile(normalizeLabProfileForType(intent.profile, intentType, intentHosts));
    setActiveHostingType(intentType);
    setActiveCategory('All');
    setSortKey('overall');
    setSearchTerm('');
    jumpToSection('finder');
    pushToast(`Profile set: ${intent.label} (${HOSTING_TYPE_LABELS[intentType] || intentType}).`);
    setFinderFlash(true);
    setTimeout(() => setFinderFlash(false), 1600);
  };

  const setHostingType = (hostingType, options = {}) => {
    const { silent = false, clearPreset = true } = options;
    if (!HOSTING_TYPE_IDS.includes(hostingType)) {
      return;
    }

    setActiveHostingType((current) => {
      if (current === hostingType) {
        return current;
      }
      return hostingType;
    });
    setLabProfile((current) => normalizeLabProfileForType(current, hostingType, resolveHostsForType(hostingType)));
    setActiveCategory('All');
    if (clearPreset) {
      setActivePreset(null);
    }

    if (!silent) {
      const typeLabel = HOSTING_TYPE_LABELS[hostingType] || hostingType;
      pushToast(`${typeLabel} hosting data loaded.`);
    }
  };

  const resetRankingControls = () => {
    setHostingType(DEFAULT_HOSTING_TYPE, { silent: true, clearPreset: false });
    setActiveCategory('All');
    setSortKey('overall');
    setSearchTerm('');
    setActivePreset(null);
    pushToast('Ranking controls reset.');
  };

  const toggleShortlist = (hostId) => {
    const host = hostByIdForActiveType.get(hostId) || HOST_BY_ID.get(hostId);
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
    if (shortlistedHosts.length < compareMinimumRequired) {
      pushToast(`Save at least ${compareMinimumRequired} host${compareMinimumRequired === 1 ? '' : 's'} before syncing to compare.`);
      return;
    }

    setCompareIds(normalizeCompareIds(shortlistedHosts.slice(0, compareSlotCapacity).map((host) => host.id), activeHostIds));
    pushToast('Compare synced from workspace.');
  };

  const syncFinderToCompare = () => {
    const finderIds = labRecommendations.map((item) => item.host.id).slice(0, compareSlotCapacity);

    if (finderIds.length < compareMinimumRequired) {
      pushToast(`Finder needs at least ${compareMinimumRequired} match${compareMinimumRequired === 1 ? '' : 'es'} before syncing compare.`);
      return;
    }

    setCompareIds(normalizeCompareIds(finderIds, activeHostIds));
    pushToast('Compare synced from smart finder results.');
  };

  const resetLabProfile = () => {
    setLabProfile(normalizeLabProfileForType(DEFAULT_LAB_PROFILE, activeHostingType, hostsForActiveType));
    pushToast('Finder profile reset.');
  };

  const toggleReviewComposer = () => {
    setIsReviewComposerOpen((current) => {
      if (!current) {
        setTimeout(() => {
          reviewFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 60);
      }
      return !current;
    });
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
    const hostId = activeHostIdSet.has(reviewDraft.hostId) ? reviewDraft.hostId : fallbackHostId;
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
      hostingType: activeHostingType,
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
      label: 'Starter plan',
      getValue: (host) => host.plans?.[0]?.name || host.planType,
      format: (value) => value,
      highlightBest: false,
    },
    {
      label: 'Starter plan intro',
      getValue: (host) => host.plans?.[0]?.introMonthly ?? host.priceIntro,
      format: (value) => `${currency.format(value)} / month`,
      higherIsBetter: false,
    },
    {
      label: 'Top plan',
      getValue: (host) => {
        const plans = Array.isArray(host.plans) ? host.plans : [];
        return plans.length ? plans[plans.length - 1].name : host.planType;
      },
      format: (value) => value,
      highlightBest: false,
    },
    {
      label: 'Top plan intro',
      getValue: (host) => {
        const plans = Array.isArray(host.plans) ? host.plans : [];
        return plans.length ? plans[plans.length - 1].introMonthly : host.priceIntro;
      },
      format: (value) => `${currency.format(value)} / month`,
      higherIsBetter: false,
    },
    {
      label: 'Top plan renewal',
      getValue: (host) => {
        const plans = Array.isArray(host.plans) ? host.plans : [];
        return plans.length ? plans[plans.length - 1].renewalMonthly : host.priceRenewal;
      },
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
        id: createSlug(row.label),
        group: resolveCompareMetricGroup(row.label),
        isKeyMetric: COMPARE_KEY_METRIC_LABELS.has(row.label),
        values,
        compareValues,
        best,
        canHighlightBest,
        hasDifference: uniqueValueCount > 1,
      };
    }),
    [compareHosts, compareRows]
  );
  const compareRowsBase = compareTableView === 'differences'
    ? compareRowsWithMeta.filter((row) => row.hasDifference)
    : compareRowsWithMeta;
  const compareRowsHiddenByMode = compareRowsWithMeta.length - compareRowsBase.length;
  const compareMetricQueryNormalized = compareMetricQuery.trim().toLowerCase();
  const visibleCompareRows = compareRowsBase.filter((row) => (
    (compareMetricGroup === 'all' || row.group === compareMetricGroup)
    && (!compareKeyMetricsOnly || row.isKeyMetric)
    && (!compareMetricQueryNormalized || row.label.toLowerCase().includes(compareMetricQueryNormalized))
  ));
  const compareHiddenMetricCount = compareRowsBase.length - visibleCompareRows.length;
  const compareMetricGroupCounts = useMemo(() => {
    const counts = new Map(
      COMPARE_METRIC_GROUPS
        .filter((group) => group.id !== 'all')
        .map((group) => [group.id, 0])
    );

    compareRowsBase.forEach((row) => {
      counts.set(row.group, (counts.get(row.group) || 0) + 1);
    });

    return counts;
  }, [compareRowsBase]);
  const hasActiveCompareFilters = compareMetricGroup !== 'all'
    || compareKeyMetricsOnly
    || compareMetricQueryNormalized.length > 0;
  const compareHostMetricWins = useMemo(() => {
    const wins = compareHosts.map((host) => ({ host, wins: 0 }));
    const scoredRows = compareRowsWithMeta.filter(
      (row) => row.hasDifference && row.canHighlightBest && Number.isFinite(row.best)
    );

    scoredRows.forEach((row) => {
      row.compareValues.forEach((value, index) => {
        if (!Number.isFinite(value)) {
          return;
        }

        if (Math.abs(value - row.best) < 0.0001 && wins[index]) {
          wins[index].wins += 1;
        }
      });
    });

    return wins
      .map((item) => ({
        ...item,
        winRate: scoredRows.length ? Math.round((item.wins / scoredRows.length) * 100) : 0,
      }))
      .sort((a, b) => b.wins - a.wins || scoreHost(b.host) - scoreHost(a.host));
  }, [compareHosts, compareRowsWithMeta]);

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

  const suggestedCompareHost = hostsForActiveType.find((host) => !normalizedCompareIds.includes(host.id)) || null;
  const canAddThirdCompare = compareExtraSlotEnabled && normalizedCompareIds.length < compareSlotCapacity && Boolean(suggestedCompareHost);
  const compareReadinessLabel = compareHosts.length >= compareSlotCapacity
    ? (compareExtraSlotEnabled ? 'Pressure test ready' : 'Decision-ready with two hosts')
    : `Add ${compareSlotCapacity - compareHosts.length} more host${compareSlotCapacity - compareHosts.length === 1 ? '' : 's'} for stronger comparison`;

  const setCompareThirdSlot = (hostId) => {
    if (!compareExtraSlotEnabled) {
      return;
    }

    if (!hostId) {
      setCompareIds((current) => normalizeCompareIds(current, activeHostIds).slice(0, 2));
      return;
    }

    setCompareIds((current) => moveHostToCompareSlot(current, hostId, 2, activeHostIds));
  };

  const setTopThreeCompare = () => {
    if (hostsForActiveType.length < compareMinimumRequired) {
      pushToast('Not enough providers in this hosting type to build compare.');
      return;
    }

    setCompareIds(
      normalizeCompareIds(
        sortHosts(hostsForActiveType, 'overall')
          .slice(0, compareSlotCapacity)
          .map((host) => host.id),
        activeHostIds
      )
    );
    pushToast(`Compare set to top ${compareSlotCapacity} ${activeHostingTypeLabel.toLowerCase()} providers.`);
  };

  const addSuggestedCompare = () => {
    if (!suggestedCompareHost) {
      pushToast('No suggested host available right now.');
      return;
    }

    setCompareThirdSlot(suggestedCompareHost.id);
    pushToast(`${suggestedCompareHost.name} added to compare.`);
  };

  useEffect(() => {
    if (compareMetricGroup === 'all') {
      return;
    }

    const groupCount = compareMetricGroupCounts.get(compareMetricGroup) || 0;
    if (groupCount === 0) {
      setCompareMetricGroup('all');
    }
  }, [compareMetricGroup, compareMetricGroupCounts]);

  const resetCompareFilters = () => {
    setCompareMetricGroup('all');
    setCompareMetricQuery('');
    setCompareKeyMetricsOnly(false);
    pushToast('Compare filters reset.');
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
    const { behavior: requestedBehavior = 'smooth', updateHash = true } = options;
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    const prefersReducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = prefersReducedMotion ? 'auto' : requestedBehavior;
    const targetTop = Math.max(0, window.scrollY + section.getBoundingClientRect().top - headerOffset);
    const distance = Math.abs(targetTop - window.scrollY);
    const shouldSmoothScroll = behavior === 'smooth' && distance > 6;
    const navigationLockMs = shouldSmoothScroll
      ? clamp(Math.round(distance * 0.32), 160, 620)
      : 120;

    setActiveSection((current) => (current === sectionId ? current : sectionId));

    isNavigatingRef.current = true;
    if (navigationTimeoutRef.current) {
      window.clearTimeout(navigationTimeoutRef.current);
    }
    navigationTimeoutRef.current = window.setTimeout(() => {
      isNavigatingRef.current = false;
      navigationTimeoutRef.current = null;
    }, navigationLockMs);

    window.scrollTo({ top: targetTop, behavior: shouldSmoothScroll ? 'smooth' : 'auto' });

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

    const promoCode = getPromoCode(host);

    if (!promoCode) {
      pushToast(`No public promo code listed for ${host.name}.`);
      return;
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(promoCode);
        pushToast(`${host.name} promo copied: ${promoCode}`);
        return;
      }
    } catch {
      // Fall through to visible fallback message.
    }

    pushToast(`${host.name} promo code: ${promoCode}`);
  };

  const copyCompareShareLink = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const query = searchTerm.trim();

    urlParams.set('compare', normalizedCompareIds.join(','));
    urlParams.set('compareView', compareTableView);
    urlParams.set('type', activeHostingType);
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
  }, [activeHostingType, activeCategory, normalizedCompareIds, compareTableView, searchTerm, sortKey, pushToast]);

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

    if (actionId === 'reset-compare-filters') {
      resetCompareFilters();
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
      label: `Set compare to top ${compareSlotCapacity} ${activeHostingTypeLabel.toLowerCase()} providers`,
      hint: 'Compare',
    },
    {
      id: 'compare-sync-shortlist',
      label: 'Sync compare from workspace shortlist',
      hint: 'Compare',
      disabled: shortlistedHosts.length < compareMinimumRequired,
    },
    {
      id: 'compare-add-suggested',
      label: compareExtraSlotEnabled
        ? (suggestedCompareHost ? `Add ${suggestedCompareHost.name} to compare` : 'Add suggested host to compare')
        : `No extra compare slot for ${activeHostingTypeLabel.toLowerCase()}`,
      hint: 'Compare',
      disabled: !canAddThirdCompare,
    },
    {
      id: 'toggle-compare-table-view',
      label: compareTableView === 'all' ? 'Show compare differences only' : 'Show all compare metrics',
      hint: 'Compare',
    },
    {
      id: 'reset-compare-filters',
      label: 'Reset compare metric filters',
      hint: 'Compare',
      disabled: !hasActiveCompareFilters,
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
  const filteredFaqItems = useMemo(() => {
    if (!normalizedFaqQuery) {
      return FAQ_ITEMS;
    }

    return FAQ_ITEMS
      .filter((item) => `${item.question} ${item.answer}`.toLowerCase().includes(normalizedFaqQuery))
      .sort((a, b) => scoreFaqMatch(b, normalizedFaqQuery) - scoreFaqMatch(a, normalizedFaqQuery));
  }, [normalizedFaqQuery]);
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

          <label className={s.headerTypeControl}>
            <span>Type</span>
            <select
              value={activeHostingType}
              onChange={(event) => setHostingType(event.target.value, { clearPreset: true })}
              aria-label="Select hosting type"
            >
              {HOSTING_TYPE_OPTIONS.map((option) => (
                <option key={`header-type-${option.id}`} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className={s.mobileMenuBtn}
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileNavOpen}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          <button type="button" className={s.headerUtility} onClick={openCommandCenter}>
            Actions <span className={s.headerKbd}>Ctrl+K</span>
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

      <div
        className={`${s.mobileNav} ${mobileNavOpen ? s.mobileNavOpen : ''}`}
        aria-hidden={!mobileNavOpen}
      >
        <div className={s.mobileBackdrop} onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
        <div className={s.mobileNavDrawer} role="dialog" aria-label="Site navigation">
          <button
            type="button"
            className={s.mobileNavClose}
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <label className={s.mobileTypeControl}>
            <span>Hosting type</span>
            <select
              value={activeHostingType}
              onChange={(event) => setHostingType(event.target.value, { clearPreset: true })}
            >
              {HOSTING_TYPE_OPTIONS.map((option) => (
                <option key={`mobile-type-${option.id}`} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
          {NAV_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(event) => {
                onSectionNavClick(event, section.id);
                setMobileNavOpen(false);
              }}
              className={`${s.mobileNavLink} ${activeSection === section.id ? s.mobileNavLinkActive : ''}`}
            >
              {section.label}
            </a>
          ))}
        </div>
      </div>

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
            <h1>Compare the best {activeHostingTypeLabel} hosting providers by speed, uptime, support, and real pricing.</h1>
            <p className={s.heroText}>
              Stop guessing from marketing pages. Get ranked providers with transparent intro-to-renewal pricing,
              benchmark-backed performance, and support quality signals in one decision flow.
            </p>

            <div className={s.heroActions}>
              <a className={s.primaryBtn} href="#finder" onClick={(event) => onSectionNavClick(event, 'finder')}>Find my best host</a>
              <a className={s.ghostBtn} href="#compare" onClick={(event) => onSectionNavClick(event, 'compare')}>Compare providers</a>
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
              <span>{hostsForActiveType.length} providers tracked for {activeHostingTypeLabel}</span>
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
                <p className={s.panelLabel}>
                  {activeHeroPanelView.step}
                  <span className={s.panelLabelOf}>{' '}of {HERO_PANEL_VIEWS.length}</span>
                </p>
                <strong className={s.panelTitle}>{activeHeroPanelView.title}</strong>
                <p className={s.panelSubtext}>{activeHeroPanelView.hint}</p>
              </div>
              <button
                type="button"
                className={`${s.panelPlayPause} ${heroPanelAutoPlay ? s.panelPlayPauseActive : ''}`}
                onClick={toggleHeroPanelAutoPlay}
                aria-pressed={heroPanelAutoPlay}
                aria-label={heroPanelAutoPlay ? 'Pause auto-advance' : 'Auto-advance steps'}
                title={heroPanelAutoPlay ? 'Pause' : 'Play through steps'}
              >
                {heroPanelAutoPlay ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                    <rect x="2" y="2" width="3.5" height="10" rx="1" />
                    <rect x="8.5" y="2" width="3.5" height="10" rx="1" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                    <path d="M3 2.5l9 4.5-9 4.5V2.5z" />
                  </svg>
                )}
              </button>
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
                  <small>Match quality</small>
                  <strong>{duelConfidence}</strong>
                  <span>{renderHostText(duelWinner)} leads</span>
                </article>
                <article className={s.panelSummaryCard}>
                  <small>Cheaper intro</small>
                  <strong>{renderHostText(lowerPriceHost)}</strong>
                  <span>{currency.format(introGap)}/mo saved</span>
                </article>
                <article className={s.panelSummaryCard}>
                  <small>Faster setup</small>
                  <strong>{renderHostText(fasterSetupHost)}</strong>
                  <span>{fasterSetupHost.setupMinutes} min avg</span>
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
                    <span className={s.panelStepHint}>{view.hint}</span>
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
                Best promo right now: {renderHostText(topHost)} ({topHostPromoCode || 'No code listed'})
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

        <section className={`${s.section} ${s.finderSection} ${finderFlash ? s.finderFlash : ''}`} id="finder">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Smart finder</p>
              <h2>Personalized host recommendations in under 10 seconds</h2>
            </div>
            <p className={s.sectionNote}>
              Tune workload profile, budget, and priority to get context-aware {activeHostingTypeLabel.toLowerCase()} recommendations before reviewing the full ranking table.
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
                {finderBudgetCoverageCount} of {hostsForActiveType.length} tracked providers fit this budget.
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
                <strong>{finderTrafficCoverageCount}/{hostsForActiveType.length}</strong>
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
              <button type="button" onClick={() => jumpToSection('rankings')}>View rankings</button>
              <button type="button" className={s.finderInsightPrimary} onClick={syncFinderToCompare}>
                Sync top {compareSlotCapacity} to compare
              </button>
              <button type="button" onClick={() => openSavingsForHost(finderBudgetChampion, 'finder')}>Model savings</button>
            </div>
          </div>

          <div className={s.finderLayout}>
            <article className={s.finderControls}>
              <div className={s.finderControlGroup}>
                <h3>Workload profile</h3>

                <label className={s.finderLabel}>
                  <span>Hosting type</span>
                  <select
                    value={activeHostingType}
                    onChange={(event) => setHostingType(event.target.value, { clearPreset: true })}
                  >
                    {HOSTING_TYPE_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label className={s.finderLabel}>
                  <span>Project type</span>
                  <select
                    value={labProfile.projectType}
                    onChange={(event) => setLabProfile((current) => ({ ...current, projectType: event.target.value }))}
                  >
                    {finderProjectOptions.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <div className={s.finderPillGroup}>
                  <span>Traffic stage</span>
                  <div>
                    {finderTrafficOptions.map((option) => (
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
                  min={finderBudgetConfig.min}
                  max={finderBudgetConfig.max}
                  step={finderBudgetConfig.step}
                  value={labProfile.budget}
                  onChange={(event) => setLabProfile((current) => ({ ...current, budget: Number(event.target.value) }))}
                />
                <div className={s.finderBudgetTicks} aria-hidden="true">
                  <span>{currency.format(finderBudgetConfig.min)}</span>
                  <span>{currency.format(finderBudgetMidpoint)}</span>
                  <span>{currency.format(finderBudgetConfig.max)}</span>
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
                  Sync top {compareSlotCapacity} to compare
                </button>
              </div>
              <p className={s.finderControlHint}>Profile saves automatically in this browser.</p>
            </article>

            <div className={s.finderResults}>
              {labRecommendations.map((item, index) => {
                const isSaved = shortlistIds.includes(item.host.id);
                const inCompare = normalizedCompareIds.includes(item.host.id);
                const budgetDelta = labProfile.budget - item.host.priceIntro;
                const budgetDeltaCopy = budgetDelta >= 0
                  ? `${currency.format(budgetDelta)} under budget`
                  : `${currency.format(Math.abs(budgetDelta))} above budget`;
                const hostSignal = getHostReviewSignal(item.host.id);
                const liveRating = hostSignal.weightedScore || item.host.rating;
                const liveReviewCount = hostSignal.totalReviewCount || item.host.reviewCount;
                const starterPlan = item.host.plans?.[0] || null;

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
                      <span className={s.finderMetaCategory}>{item.host.category}</span>
                      <span className={s.finderMetaPrice}>{currency.format(item.host.priceIntro)}/mo intro</span>
                      <span className={s.finderMetaSupport}>{item.host.supportResponseMinutes}m support</span>
                      <span className={s.finderMetaSpeed}>{item.host.ttfbMs}ms TTFB</span>
                      <span className={s.finderMetaReviews}>{liveRating.toFixed(1)}★ · {compactNumber.format(liveReviewCount)} reviews</span>
                    </div>

                    <p className={s.finderTagline}>{item.host.tagline}</p>
                    {starterPlan && (
                      <p className={s.finderPlanNote}>
                        Starter plan: <strong>{starterPlan.name}</strong> at {currency.format(starterPlan.introMonthly)}/mo
                      </p>
                    )}
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
              <h2>Top {activeHostingTypeLabel} hosting providers right now</h2>
            </div>
            <p className={s.sectionNote}>
              Filter by category and sort by score, intro pricing, support speed, or payout potential for the selected hosting type.
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

          <div className={s.presetRow}>
            <p>Quick picks:</p>
            {RANK_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`${s.presetChip} ${activePreset === preset.id ? s.presetChipActive : ''}`}
                onClick={() => {
                  if (activePreset === preset.id) {
                    setActivePreset(null);
                    setHostingType(DEFAULT_HOSTING_TYPE, { silent: true, clearPreset: false });
                    setSortKey('overall');
                    setActiveCategory('All');
                    setSearchTerm('');
                  } else {
                    setActivePreset(preset.id);
                    setHostingType(preset.type, { silent: true, clearPreset: false });
                    setSortKey(preset.sort);
                    setActiveCategory(preset.cat);
                    setSearchTerm('');
                  }
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className={s.controlBar}>
            <div className={s.controlSegments}>
              <div className={s.segmentControl}>
                {HOSTING_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setHostingType(option.id)}
                    className={`${s.segmentButton} ${activeHostingType === option.id ? s.segmentButtonActive : ''}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className={s.segmentControl}>
                {rankingCategories.map((category) => (
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

              {(searchTerm.trim() || activeCategory !== 'All' || sortKey !== 'overall' || activeHostingType !== DEFAULT_HOSTING_TYPE) && (
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
            <span>Only providers with real {activeHostingTypeLabel.toLowerCase()} data are shown</span>
          </div>

          <div className={s.hostGrid}>
            {rankedHosts.length === 0 ? (
              <article className={s.emptyState}>
                <h3>No hosts match this filter set.</h3>
                <p>Try a wider category, switch hosting type, or clear your search phrase.</p>
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
                const inCompare = normalizedCompareIds.includes(host.id);
                const hostSignal = getHostReviewSignal(host.id);
                const hostRating = hostSignal.weightedScore || host.rating;
                const hostReviewTotal = hostSignal.totalReviewCount || host.reviewCount;
                const hostPlans = Array.isArray(host.plans) ? host.plans : [];
                const hostFeatureHighlights = [
                  `${host.storageGb} GB NVMe storage`,
                  `${formatSiteLimit(host.siteLimit)} included`,
                  host.backupPolicy,
                  ...host.features,
                ];

                const cardPalette = HOST_PLACEHOLDER_PALETTES[hashSeed(host.id) % HOST_PLACEHOLDER_PALETTES.length];
                const renewalSpikePercent = Math.round((host.priceRenewal - host.priceIntro) / host.priceIntro * 100);
                const fitScore = scoreLabHost(host, labProfile);
                const normalizedCompare = normalizeCompareIds(compareIds, activeHostIds);
                const compareIsFull = normalizedCompare.length >= compareSlotCapacity;
                const replacementSlotIndex = Math.max(0, compareSlotCapacity - 1);
                const isReplacementSlot = compareIsFull && normalizedCompare[replacementSlotIndex] === host.id;
                const promoCode = getPromoCode(host);
                const pricingSource = host.dataSources?.pricing || '';
                const infraSource = host.dataSources?.infrastructure || '';
                const reviewsSource = host.dataSources?.reviews || '';
                const verifiedDateLabel = formatVerifiedDate(host.lastVerified);

                return (
                  <article
                    key={`${host.id}-${activeHostingType}-${sortKey}-${activeCategory}`}
                    className={s.hostCard}
                    style={{
                      '--delay': `${index * 55}ms`,
                      '--card-accent-start': cardPalette.start,
                      '--card-accent-end': cardPalette.end,
                    }}
                  >
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
                      <span className={`${s.fitBadge} ${fitScore >= 80 ? s.fitBadgeHigh : fitScore >= 62 ? s.fitBadgeMed : ''}`}>
                        {fitScore}% fit
                      </span>
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
                        <li key={feature} className={s.featureListItem}>
                          <span className={s.featureIcon} aria-hidden="true">
                            <FeatureIcon type={getFeatureIconType(feature)} />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {hostPlans.length > 0 && (
                      <div className={s.hostPlanGrid}>
                        {hostPlans.slice(0, 2).map((plan) => (
                          <article key={`${host.id}-${plan.name}`} className={s.hostPlanCard}>
                            <strong>{plan.name}</strong>
                            <span>{currency.format(plan.introMonthly)} intro</span>
                            <small>{plan.summary}</small>
                          </article>
                        ))}
                      </div>
                    )}

                    <div className={s.offerStrip}>
                      <div className={s.offerMain}>
                        <div className={s.offerPriceRow}>
                          <strong>
                            {currency.format(host.priceIntro)}
                            {' '}
                            <em>/ month</em>
                          </strong>
                          <span className={s.offerYearOne}>Year 1 {currency.format(host.priceIntro * 12)}</span>
                        </div>
                        <span className={s.offerRenewal}>
                          Renews at {currency.format(host.priceRenewal)} / month
                          {renewalSpikePercent > 10 && (
                            <span className={s.renewalSpike}>&#8593;{renewalSpikePercent}%</span>
                          )}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={s.promoCodeButton}
                        onClick={() => { if (promoCode) { void copyPromoCode(host); } }}
                        aria-label={promoCode ? `Copy promo code ${promoCode} for ${host.name}` : `No promo code listed for ${host.name}`}
                        disabled={!promoCode}
                      >
                        <span>Promo</span>
                        <b>{promoCode || 'No code'}</b>
                      </button>
                    </div>

                    <p className={s.caveat}>Watch-out: {host.caveat}</p>
                    <div className={s.hostProofRow}>
                      <span>Verified {verifiedDateLabel}</span>
                      <div className={s.hostProofLinks}>
                        {pricingSource && (
                          <a href={pricingSource} target="_blank" rel="noreferrer noopener">Pricing</a>
                        )}
                        {infraSource && (
                          <a href={infraSource} target="_blank" rel="noreferrer noopener">Infra</a>
                        )}
                        {reviewsSource && (
                          <a href={reviewsSource} target="_blank" rel="noreferrer noopener">Reviews</a>
                        )}
                      </div>
                    </div>

                    <div className={s.hostActions}>
                      <div className={s.actionRow}>
                        <button
                          type="button"
                          onClick={() => toggleCompare(host.id)}
                          className={`${s.actionCompareButton} ${isReplacementSlot ? s.compareWillReplace : inCompare ? s.compareButtonActive : ''}`}
                          aria-pressed={inCompare}
                          title={isReplacementSlot ? `Slot ${compareSlotCapacity} will be replaced if you add another host` : undefined}
                        >
                          {isReplacementSlot
                            ? `Slot ${compareSlotCapacity} — will swap`
                            : inCompare
                              ? 'In compare'
                              : compareIsFull
                                ? 'Swap in'
                                : 'Add to compare'}
                        </button>
                      </div>

                      <div className={s.ctaRow}>
                        <button type="button" className={s.actionModelButton} onClick={() => openSavingsForHost(host, 'rankings')}>
                          Model savings
                        </button>
                        <a className={s.actionDealButton} href={host.affiliateUrl} target="_blank" rel="noreferrer noopener">
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
              <h2>Your saved {activeHostingTypeLabel} shortlist and next best action</h2>
            </div>
            <p className={s.sectionNote}>
              Use this as your decision queue for {activeHostingTypeLabel.toLowerCase()} offers: save providers, sync them to compare, then validate costs before opening deals.
            </p>
          </div>

          <div className={s.workspaceSignals}>
            <article className={s.workspaceSignalCard}>
              <span>Decision readiness</span>
              <strong>{workspaceReadiness}%</strong>
              <small>{shortlistedHosts.length}/{compareSlotCapacity} hosts added for compare confidence</small>
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

          <div className={s.workspaceGuide}>
            <article>
              <span>Step 1</span>
              <strong>Save hosts while browsing</strong>
              <p>Use the Save button in Finder and Rankings to build your shortlist in one place.</p>
            </article>
            <article>
              <span>Step 2</span>
              <strong>Sync shortlist into compare</strong>
              <p>
                {compareExtraSlotEnabled
                  ? `Keep 2-${compareSlotCapacity} providers in compare so key metrics stay side by side.`
                  : `Keep ${compareMinimumRequired} provider${compareMinimumRequired === 1 ? '' : 's'} in compare so key metrics stay side by side.`}
              </p>
            </article>
            <article>
              <span>Step 3</span>
              <strong>Validate cost before clicking out</strong>
              <p>Open Savings to check first-year and renewal impact before you choose a host.</p>
            </article>
          </div>

          <div className={s.workspaceHintBar}>
            <p>{workspacePrimaryAction.label}</p>
            <button
              type="button"
              onClick={() => {
                if (workspacePrimaryAction.actionId === 'sync-shortlist') {
                  syncShortlistToCompare();
                  return;
                }

                if (workspacePrimaryAction.actionId === 'open-compare') {
                  jumpToSection('compare');
                  return;
                }

                jumpToSection('rankings');
              }}
            >
              {workspacePrimaryAction.button}
            </button>
          </div>

          {shortlistedHosts.length === 0 ? (
            <article className={s.workspaceEmpty}>
              <h3>No saved hosts yet</h3>
              <p>
                Save hosts from Finder or Rankings and they will appear here. This helps you track serious options without losing context.
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
                  <p>Estimated monthly price change after intro periods: {currency.format(shortlistRenewalIncrease)}</p>
                </div>
                <div className={s.workspaceActions}>
                  <button
                    type="button"
                    className={s.workspaceActionPrimary}
                    onClick={() => jumpToSection('compare')}
                    disabled={shortlistedHosts.length < compareMinimumRequired}
                  >
                    Start compare
                  </button>
                  <button
                    type="button"
                    className={s.workspaceActionSecondary}
                    onClick={syncShortlistToCompare}
                    disabled={shortlistedHosts.length < compareMinimumRequired}
                  >
                    Sync to compare
                  </button>
                  <button type="button" className={s.workspaceActionDanger} onClick={clearShortlist}>
                    Clear shortlist
                  </button>
                </div>
              </header>

              <div className={s.workspaceGrid}>
                {shortlistedHosts.map((host) => {
                  const starterPlan = host.plans?.[0] || null;
                  const verifiedDateLabel = formatVerifiedDate(host.lastVerified);

                  return (
                    <article key={host.id} className={s.workspaceCard}>
                      <div>
                        <strong>{renderHostInline(host)}</strong>
                        <span>{host.category}</span>
                      </div>
                      <p>{host.bestFor}</p>
                      {starterPlan && (
                        <p className={s.workspacePlanMeta}>
                          Starter: <strong>{starterPlan.name}</strong> ({currency.format(starterPlan.introMonthly)}/mo)
                        </p>
                      )}
                      <div className={s.workspacePriceMeta}>
                        <small className={s.workspacePriceIntro}>{currency.format(host.priceIntro)} intro</small>
                        <small className={s.workspacePriceRenewal}>Renews at {currency.format(host.priceRenewal)} / month</small>
                      </div>
                      <small className={s.workspaceVerifiedMeta}>Verified {verifiedDateLabel}</small>
                      <div className={s.workspaceCardActions}>
                        <button type="button" className={s.workspaceCardCompare} onClick={() => toggleCompare(host.id)}>
                          {normalizedCompareIds.includes(host.id) ? 'In compare' : 'Add compare'}
                        </button>
                        <button type="button" className={s.workspaceCardSavings} onClick={() => openSavingsForHost(host, 'workspace')}>
                          Savings
                        </button>
                        <button type="button" className={s.workspaceCardRemove} onClick={() => toggleShortlist(host.id)}>
                          Remove
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className={`${s.section} ${s.sectionShell}`} id="compare">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Compare</p>
              <h2>{activeHostingTypeLabel} decision table for your shortlisted hosts</h2>
            </div>
            <p className={s.sectionNote}>
              Keep at least {compareMinimumRequired} {activeHostingTypeLabel.toLowerCase()} provider{compareMinimumRequired === 1 ? '' : 's'} selected.
              {compareExtraSlotEnabled
                ? ' Add a third from rankings or finder results to pressure-test tradeoffs.'
                : ' This type has a focused two-provider compare stack.'}
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
                <span className={s.compareVerdictActionKicker}>Savings model</span>
                {renderHostText(compareLeader)}
              </button>
              <a href={compareLeader.affiliateUrl} target="_blank" rel="noreferrer noopener">
                <span className={s.compareVerdictActionKicker}>Open deal</span>
                {renderHostText(compareLeader)}
              </a>
            </div>
          </div>

          {compareHosts.length >= 2 && (
            <div className={s.radarWrap}>
              <div className={s.radarWrapHeader}>
                <div>
                  <p>Performance radar</p>
                  <strong>5-dimension visual comparison</strong>
                </div>
                <div className={s.radarLegend}>
                  {compareHosts.map((host, i) => {
                    const composite = getRadarCompositeScore(host);
                    return (
                      <span key={host.id} className={s.radarLegendItem}>
                        <span
                          className={s.radarLegendSwatch}
                          style={{ background: RADAR_COLORS[i % RADAR_COLORS.length] }}
                        />
                        <span>{host.name}</span>
                        <strong>{composite}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className={s.radarBody}>
                <div className={s.radarChartPanel}>
                  <RadarChart hosts={compareHosts} />
                  <p className={s.radarChartHint}>
                    Normalized 0-100 scores. Higher is better on every spoke.
                  </p>
                </div>
                <div className={s.radarDimGrid}>
                  {RADAR_DIMS.map((dim) => {
                    const ranked = compareHosts
                      .map((host, index) => ({
                        host,
                        score: getRadarScore(host, dim.key),
                        color: RADAR_COLORS[index % RADAR_COLORS.length],
                      }))
                      .sort((a, b) => b.score - a.score);
                    const leader = ranked[0] || null;
                    const runnerUpScore = ranked[1]?.score ?? leader?.score ?? 0;
                    const leadMargin = Math.max(0, (leader?.score || 0) - runnerUpScore);

                    return (
                      <article key={`radar-dim-${dim.key}`} className={s.radarDimCard}>
                        <div className={s.radarDimCardHead}>
                          <strong>{dim.label}</strong>
                          {leader && (
                            <span>
                              {renderHostInline(leader.host)}
                              <b>{leader.score}</b>
                            </span>
                          )}
                        </div>
                        <div className={s.radarDimBars}>
                          {ranked.map((item) => (
                            <div key={`radar-dim-${dim.key}-${item.host.id}`} className={s.radarDimBarRow}>
                              <span>
                                <i style={{ background: item.color }} aria-hidden="true" />
                                {item.host.name}
                              </span>
                              <div className={s.radarDimBarTrack} aria-hidden="true">
                                <div
                                  className={s.radarDimBarFill}
                                  style={{
                                    width: `${item.score}%`,
                                    background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`,
                                  }}
                                />
                              </div>
                              <strong>{item.score}</strong>
                            </div>
                          ))}
                        </div>
                        <small>
                          {leader
                            ? `${leader.host.name} leads by ${leadMargin} point${leadMargin === 1 ? '' : 's'}.`
                            : 'No data available.'}
                        </small>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className={s.compareExperience}>
            <div className={s.compareInsights}>
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

              <div className={s.compareWinsBoard}>
                {compareHostMetricWins.map((item, index) => (
                  <article
                    key={`compare-win-${item.host.id}`}
                    className={`${s.compareWinsCard} ${index === 0 ? s.compareWinsCardLead : ''}`}
                  >
                    <small>{index === 0 ? 'Metric leader' : 'Metric wins'}</small>
                    <strong>{renderHostInline(item.host)}</strong>
                    <span>{item.wins} best marks · {item.winRate}% share</span>
                  </article>
                ))}
              </div>
            </div>

            <div className={s.compareWorkbench}>
              <p className={s.compareWorkbenchHint}>
                Active stack: {compareHosts.length} host{compareHosts.length === 1 ? '' : 's'} selected.
                {' '}
                {compareReadinessLabel}. Adjust slots to test tradeoffs before opening offers.
              </p>
              <div className={s.compareSelectedHosts}>
                {compareHosts.map((host) => (
                  <span key={`compare-selected-${host.id}`}>
                    {renderHostInline(host)}
                    <small>{host.starterPlanName || host.planType}</small>
                  </span>
                ))}
              </div>
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
                {compareExtraSlotEnabled && (
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
                )}
              </div>

              <div className={s.compareQuickActions}>
                <button type="button" className={s.compareQuickNeutral} onClick={swapHeroCompare}>Swap A/B</button>
                <button type="button" className={s.compareQuickAccent} onClick={setTopThreeCompare}>
                  Use top {compareSlotCapacity}
                </button>
                <button
                  type="button"
                  className={s.compareQuickSoft}
                  onClick={syncShortlistToCompare}
                  disabled={shortlistedHosts.length < compareMinimumRequired}
                >
                  Use shortlist
                </button>
                {compareExtraSlotEnabled && (
                  <button type="button" className={s.compareQuickSoft} onClick={addSuggestedCompare} disabled={!canAddThirdCompare}>
                    {canAddThirdCompare ? <>Add {renderHostText(suggestedCompareHost)}</> : `${compareSlotCapacity} hosts selected`}
                  </button>
                )}
                <button type="button" className={s.compareQuickPrimary} onClick={() => { void copyCompareShareLink(); }}>
                  Copy share link
                </button>
              </div>
            </div>
          </div>

          <div className={s.compareTableControls}>
            <div className={s.compareTableControlRow}>
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
                  ? `${visibleCompareRows.length} differentiators shown.`
                  : `${visibleCompareRows.length} metrics shown.`}
                {compareRowsHiddenByMode > 0 && ` ${compareRowsHiddenByMode} equal metrics hidden by view mode.`}
                {compareHiddenMetricCount > 0 && ` ${compareHiddenMetricCount} hidden by metric filters.`}
              </p>
            </div>

            <div className={s.compareTableFilters}>
              <label className={s.compareMetricSearch}>
                <span>Find metric</span>
                <input
                  type="search"
                  value={compareMetricQuery}
                  onChange={(event) => setCompareMetricQuery(event.target.value)}
                  placeholder="Search pricing, support, uptime..."
                />
              </label>

              <div className={s.compareMetricGroups} role="tablist" aria-label="Filter compare metrics by group">
                {COMPARE_METRIC_GROUPS.map((group) => {
                  const groupCount = group.id === 'all'
                    ? compareRowsBase.length
                    : (compareMetricGroupCounts.get(group.id) || 0);
                  const isDisabled = group.id !== 'all' && groupCount === 0;
                  const isActive = compareMetricGroup === group.id;

                  return (
                    <button
                      key={`compare-group-${group.id}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      disabled={isDisabled}
                      className={isActive ? s.compareMetricGroupActive : ''}
                      onClick={() => setCompareMetricGroup(group.id)}
                    >
                      {group.label}
                      <span>{groupCount}</span>
                    </button>
                  );
                })}
              </div>

              <div className={s.compareFilterActions}>
                <button
                  type="button"
                  className={compareKeyMetricsOnly ? s.compareFilterActionActive : ''}
                  onClick={() => setCompareKeyMetricsOnly((current) => !current)}
                >
                  {compareKeyMetricsOnly ? 'Showing key metrics' : 'Focus key metrics'}
                </button>
                {hasActiveCompareFilters && (
                  <button type="button" onClick={resetCompareFilters}>
                    Reset filters
                  </button>
                )}
              </div>
            </div>
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
                    const verifiedDateLabel = formatVerifiedDate(host.lastVerified);
                    const pricingSource = host.dataSources?.pricing || '';
                    const infraSource = host.dataSources?.infrastructure || '';

                    return (
                      <th key={host.id}>
                        <div className={s.compareHead}>
                          <strong>{renderHostInline(host)}</strong>
                          <span>{host.category} · {host.planType}</span>
                          <small>
                            {currency.format(host.priceIntro)}/mo intro
                            {' · '}
                            {liveRating.toFixed(1)}★ ({compactNumber.format(liveReviewCount)} reviews)
                          </small>
                          <small>Verified {verifiedDateLabel}</small>
                          <div className={s.compareHeadLinks}>
                            {pricingSource && (
                              <a href={pricingSource} target="_blank" rel="noreferrer noopener">Pricing source</a>
                            )}
                            {infraSource && (
                              <a href={infraSource} target="_blank" rel="noreferrer noopener">Infra source</a>
                            )}
                          </div>
                          <a href={host.affiliateUrl} target="_blank" rel="noreferrer noopener">View deal</a>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visibleCompareRows.length ? visibleCompareRows.map((row) => (
                  <tr key={row.label} id={`compare-metric-${row.id}`} className={!row.hasDifference ? s.compareTableRowEqual : ''}>
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
                      {hasActiveCompareFilters
                        ? 'No metrics match the current compare filters.'
                        : 'Selected providers are tied across the current metric set.'}
                    </th>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!visibleCompareRows.length && hasActiveCompareFilters && (
            <div className={s.compareNoMatchActions}>
              <button type="button" onClick={resetCompareFilters}>Reset compare filters</button>
            </div>
          )}
        </section>

        <section className={`${s.section} ${s.sectionShell}`} id="calculator">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Savings estimator</p>
              <h2>Understand {activeHostingTypeLabel.toLowerCase()} cost impact before you buy</h2>
            </div>
            <p className={s.sectionNote}>
              Move the slider to your current monthly bill, choose a provider, then compare year-1 promo costs against renewal years.
            </p>
          </div>

          <div className={s.calculatorGuide}>
            <article>
              <span>1</span>
              <p>Set your current monthly hosting spend.</p>
            </article>
            <article>
              <span>2</span>
              <p>Select a {activeHostingTypeLabel.toLowerCase()} provider (compare picks are prioritized first).</p>
            </article>
            <article>
              <span>3</span>
              <p>Review year-1, year-2, and 3-year impact before clicking any deal.</p>
            </article>
          </div>

          <div className={s.calculatorSummary}>
            <article className={s.calculatorSummaryCard}>
              <span>Month 1-12 monthly delta</span>
              <strong className={introMonthlyDelta >= 0 ? s.deltaPositive : s.deltaNegative}>
                {introMonthlyDelta >= 0
                  ? `${currency.format(introMonthlyDelta)} lower`
                  : `${currency.format(Math.abs(introMonthlyDelta))} higher`}
              </strong>
              <small>vs your current monthly bill</small>
            </article>
            <article className={s.calculatorSummaryCard}>
              <span>Month 13+ monthly delta</span>
              <strong className={renewalMonthlyDelta >= 0 ? s.deltaPositive : s.deltaNegative}>
                {renewalMonthlyDelta >= 0
                  ? `${currency.format(renewalMonthlyDelta)} lower`
                  : `${currency.format(Math.abs(renewalMonthlyDelta))} higher`}
              </strong>
              <small>after intro pricing ends</small>
            </article>
            <article className={s.calculatorSummaryCard}>
              <span>Two-year total impact</span>
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
              <p className={s.calculatorControlHint}>
                Include your full monthly bill (hosting plan, add-ons, and managed services if applicable).
              </p>
              <input
                type="range"
                min={calculatorSpendConfig.min}
                max={calculatorSpendConfig.max}
                step={calculatorSpendConfig.step}
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

              <div className={s.calculatorQuickPicks}>
                <span>Quick picks from compare</span>
                <div>
                  {calculatorQuickPickHosts.map((host) => (
                    <button
                      key={`calculator-quick-${host.id}`}
                      type="button"
                      className={calculatorHostId === host.id ? s.calculatorQuickPickActive : ''}
                      onClick={() => setCalculatorHostId(host.id)}
                    >
                      {host.name}
                    </button>
                  ))}
                </div>
              </div>

              <p className={s.calculatorFormula}>
                Formula used: Year 1 = intro price × 12, Year 2+ = renewal price × 12.
              </p>
            </div>

            <div className={s.calculatorCards}>
              <article>
                <span>Year-1 impact</span>
                <strong>{currency.format(Math.abs(annualDelta))}</strong>
                <p>You would pay {currency.format(annualWithHost)} vs {currency.format(annualCurrent)} currently.</p>
              </article>
              <article>
                <span>3-year impact</span>
                <strong>{currency.format(Math.abs(threeYearDelta))}</strong>
                <p>Total with {calculatorHost.name}: {currency.format(threeYearWithHost)} vs {currency.format(threeYearCurrent)}.</p>
              </article>
              <article>
                <span>Top current offer</span>
                <strong>{calculatorHost.promoLabel}</strong>
                <p>
                  {calculatorPromoCode
                    ? <>Promo code: {calculatorPromoCode} · </>
                    : 'No public promo code listed · '}
                  Renewal {currency.format(calculatorHost.priceRenewal)}/mo
                </p>
                {calculatorStarterPlan && (
                  <p>
                    Starter plan: <strong>{calculatorStarterPlan.name}</strong> at {currency.format(calculatorStarterPlan.introMonthly)}/mo
                  </p>
                )}
                {calculatorScalePlan && calculatorScalePlan.name !== calculatorStarterPlan?.name && (
                  <p>
                    Scale plan: <strong>{calculatorScalePlan.name}</strong> at {currency.format(calculatorScalePlan.introMonthly)}/mo
                  </p>
                )}
                <p className={s.calculatorSourceRow}>
                  Verified {calculatorVerifiedLabel}
                  {calculatorPricingSource && (
                    <>
                      {' · '}
                      <a href={calculatorPricingSource} target="_blank" rel="noreferrer noopener">Pricing source</a>
                    </>
                  )}
                  {calculatorPolicySource && (
                    <>
                      {' · '}
                      <a href={calculatorPolicySource} target="_blank" rel="noreferrer noopener">Policy</a>
                    </>
                  )}
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className={`${s.section} ${s.sectionShell}`} id="proof">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Social proof</p>
              <h2>Real operator feedback for higher {activeHostingTypeLabel.toLowerCase()} buyer confidence</h2>
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
                  <span>Community sentiment</span>
                  <strong>{reviewPositiveRate}% positive</strong>
                  <small>Reviews rated 4.5 / 5 or higher</small>
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

              <button
                type="button"
                className={s.reviewSidebarCta}
                onClick={toggleReviewComposer}
              >
                {isReviewComposerOpen ? 'Close review form' : 'Write a review'}
              </button>
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
                    const filterHost = option.id === 'all' ? null : hostByIdForActiveType.get(option.id);

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
                Provider: {activeReviewHost ? activeReviewHost.name : `All ${activeHostingTypeLabel.toLowerCase()} hosts`}
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
            <form ref={reviewFormRef} className={s.reviewForm} onSubmit={submitReview}>
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

                <div className={s.reviewDimensionGroup}>
                  <p className={s.reviewDimensionLabel}>Rate specific features <span>(optional)</span></p>
                  <div className={s.reviewDimensionGrid}>
                    {REVIEW_DIMENSIONS.map((dim) => (
                      <label key={dim.id} className={s.reviewDimensionField}>
                        <span>{dim.label}</span>
                        <select
                          value={reviewDraft.dimensions?.[dim.id] ?? 0}
                          onChange={(event) => updateReviewDraft('dimensions', {
                            ...reviewDraft.dimensions,
                            [dim.id]: Number(event.target.value),
                          })}
                        >
                          <option value={0}>Not rated</option>
                          {[5, 4, 3, 2, 1].map((v) => (
                            <option key={v} value={v}>{v}.0 / 5</option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                </div>

                <label className={s.reviewQuoteField}>
                  <span>Overall review</span>
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
              const host = hostByIdForActiveType.get(review.hostId) || HOST_BY_ID.get(review.hostId);
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
                  {review.dimensions && REVIEW_DIMENSIONS.some((d) => (review.dimensions[d.id] || 0) > 0) && (
                    <div className={s.reviewDimBadges}>
                      {REVIEW_DIMENSIONS.filter((d) => (review.dimensions[d.id] || 0) > 0).map((dim) => (
                        <span key={dim.id} className={s.reviewDimBadge}>
                          <b>{dim.label}</b>
                          <RatingStars rating={review.dimensions[dim.id]} />
                        </span>
                      ))}
                    </div>
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
              <h2>Questions users ask before choosing hosting</h2>
            </div>
            <p className={s.sectionNote}>
              Search by topic or jump straight to the right tool so you can decide faster.
            </p>
          </div>

          <div className={s.faqQuickActions}>
            <button type="button" className={s.faqQuickActionPrimary} onClick={() => jumpToSection('finder')}>Start in Finder</button>
            <button type="button" onClick={() => jumpToSection('workspace')}>Workspace</button>
            <button type="button" onClick={() => jumpToSection('compare')}>Compare</button>
            <button type="button" onClick={() => jumpToSection('calculator')}>Savings Estimator</button>
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

          {normalizedFaqQuery && (
            <p className={s.faqQueryHint}>
              Showing results for "{normalizedFaqQuery}".
            </p>
          )}

          <div className={s.faqTopicRow}>
            <span>Popular topics:</span>
            <div className={s.faqTopicChips}>
              {FAQ_TOPIC_CHIPS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  className={normalizedFaqQuery.includes(topic.query) ? s.faqTopicChipActive : ''}
                  onClick={() => setFaqQuery((current) => (
                    current.trim().toLowerCase() === topic.query ? '' : topic.query
                  ))}
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
          <span className={s.compareDockRevealBadge}>{compareHosts.length}</span>
          <strong>Compare dock</strong>
          <span>{compareHosts.length}/{compareSlotCapacity} selected</span>
        </button>
      ) : (
        <aside
          className={`${s.compareDock} ${dockState.collapsed ? s.compareDockCollapsed : ''}`}
          aria-label="Comparison dock"
        >
          {/* Slot zone */}
          <div className={s.dockSlots}>
            <p className={s.dockSlotLabel}>Comparing {activeHostingTypeLabel}</p>
            {Array.from({ length: compareSlotCapacity }, (_, slotIndex) => {
              const host = compareHosts[slotIndex];
              return host ? (
                <span key={host.id} className={s.dockSlotFilled}>
                  {renderHostInline(host)}
                  <button
                    type="button"
                    className={s.dockSlotRemove}
                    onClick={() => toggleCompare(host.id)}
                    aria-label={`Remove ${host.name} from compare`}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M2 2l6 6M8 2l-6 6" />
                    </svg>
                  </button>
                </span>
              ) : (
                <a
                  key={`empty-${slotIndex}`}
                  href="#rankings"
                  className={s.dockSlotEmpty}
                  onClick={(event) => onSectionNavClick(event, 'rankings')}
                  title="Go to Rankings to add a host"
                >
                  + Add host
                </a>
              );
            })}
          </div>

          {/* Journey zone — progress dots + current section */}
          {!dockState.collapsed && (
            <div className={s.dockJourney}>
              <span className={s.dockJourneyLabel}>{activeSectionLabel}</span>
              <div className={s.dockJourneyDots}>
                {JOURNEY_STEPS.map((step, i) => (
                  <span
                    key={step.id}
                    className={`${s.dockJourneyDot} ${i < activeJourneyIndex ? s.dockJourneyDotDone : ''} ${i === activeJourneyIndex ? s.dockJourneyDotActive : ''}`}
                    title={step.label}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Actions zone */}
          <div className={s.dockActions}>
            {!dockState.collapsed && (
              <button
                type="button"
                className={s.dockContinue}
                onClick={() => jumpToSection(nextJourneyStep.id)}
              >
                {isJourneyFlowComplete ? 'View proof' : `${nextJourneyStep.label} →`}
              </button>
            )}
            <a
              href="#compare"
              className={s.dockCompareCta}
              onClick={(event) => onSectionNavClick(event, 'compare')}
            >
              Compare
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" />
              </svg>
            </a>
            <div className={s.dockDivider} aria-hidden="true" />
            <button
              type="button"
              className={s.dockControl}
              onClick={toggleDockCollapsed}
              aria-label={dockState.collapsed ? 'Expand dock' : 'Minimize dock'}
              title={dockState.collapsed ? 'Expand' : 'Minimize'}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {dockState.collapsed
                  ? <path d="M2 8l4-4 4 4" />
                  : <path d="M2 4l4 4 4-4" />}
              </svg>
            </button>
            <button
              type="button"
              className={`${s.dockControl} ${s.dockControlClose}`}
              onClick={hideDock}
              aria-label="Hide dock"
              title="Hide dock"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 2l6 6M8 2l-6 6" />
              </svg>
            </button>
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

