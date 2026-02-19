import {
  COMPARE_METRIC_GROUPS,
  DEFAULT_HOSTING_TYPE,
  DEFAULT_LAB_PROFILE,
  HOSTING_TYPE_IDS,
  HOSTING_TYPE_LABELS,
  HOSTING_TYPE_STRATEGY,
  HOSTS,
  HOST_BY_ID,
  HOST_PLACEHOLDER_PALETTES,
  HOST_TYPE_PROFILE_VERIFICATION,
  HOST_TYPE_PROFILES,
  LAB_PRIORITIES,
  LAB_PROJECTS,
  LAB_PROJECT_ID_SET,
  LAB_TRAFFIC,
  LAB_TRAFFIC_ID_SET,
  REVIEW_DIMENSIONS,
  UNLIMITED_SITE_LIMIT,
  currency,
  reviewDateFormatter,
} from './constants';

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

export {
  clamp,
  getPromoCode,
  isEditableTarget,
  scoreHost,
  getHostingTypeStrategy,
  toUniqueValidIds,
  resolveFitValues,
  resolveFinderProjectIds,
  resolveFinderTrafficIds,
  getFinderBudgetConfig,
  normalizeLabProfileForType,
  getCalculatorSpendConfig,
  getHostTypeProfile,
  getHostTypeVerification,
  resolveHostForType,
  resolveHostsForType,
  sortHosts,
  scoreLabHost,
  getProjectLabel,
  getLabReasons,
  hashSeed,
  buildHostAvatarPlaceholder,
  buildHostGoogleFaviconUrl,
  getDefaultHostingTypeForHost,
  normalizeReview,
  getReviewTimestamp,
  createSlug,
  resolveCompareMetricGroup,
  scoreFaqMatch,
  formatVerifiedDate,
  formatSiteLimit,
  getFeatureIconType,
};
