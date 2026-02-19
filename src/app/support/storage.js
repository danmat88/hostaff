import {
  ALL_CATEGORIES,
  ALL_HOST_IDS,
  ALT_THEME,
  COMPARE_TABLE_VIEWS,
  DEFAULT_COMPARE,
  DEFAULT_HOSTING_TYPE,
  DEFAULT_LAB_PROFILE,
  DEFAULT_REVIEW_DRAFT,
  DEFAULT_THEME,
  HOSTING_TYPE_IDS,
  HOST_BY_ID,
  LAB_PRIORITIES,
  LAB_PROJECTS,
  LAB_TRAFFIC,
  REVIEW_DIMENSIONS,
  REVIEW_SORT_OPTIONS,
  REVIEWS,
  SORT_OPTIONS,
  STORAGE_KEYS,
} from './constants';
import {
  clamp,
  normalizeReview,
} from './utils';

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

export {
  loadInitialShortlist,
  loadInitialLabProfile,
  loadInitialDockState,
  loadInitialTheme,
  loadInitialReviews,
  loadInitialHeroPanelAutoPlay,
  normalizeCompareIds,
  areIdListsEqual,
  moveHostToCompareSlot,
  loadInitialCompareIds,
  loadInitialRankingControls,
  loadInitialReviewFilters,
  loadInitialReviewDraft,
  loadInitialCompareTableView,
  loadInitialReviewHelpfulState,
  getInitialRankingControls,
  getInitialReviewFilters,
  getInitialReviewHelpfulState,
};
