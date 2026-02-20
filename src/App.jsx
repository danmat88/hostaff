import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import s from './App.module.css';
import {
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
  DEFAULT_HOST_REVIEW_SIGNAL,
  currency,
  compactNumber,
  reviewDateFormatter,
  clamp,
  getPromoCode,
  isEditableTarget,
  scoreHost,
  resolveFinderProjectIds,
  resolveFinderTrafficIds,
  getFinderBudgetConfig,
  normalizeLabProfileForType,
  getCalculatorSpendConfig,
  resolveHostsForType,
  sortHosts,
  scoreLabHost,
  getLabReasons,
  hashSeed,
  buildHostAvatarPlaceholder,
  buildHostGoogleFaviconUrl,
  getReviewTimestamp,
  createSlug,
  resolveCompareMetricGroup,
  scoreFaqMatch,
  formatVerifiedDate,
  formatSiteLimit,
  getFeatureIconType,
  FeatureIcon,
  SpecIcon,
  RatingStars,
  RADAR_COLORS,
  RADAR_DIMS,
  getRadarScore,
  getRadarCompositeScore,
  RadarChart,
  MetricBar,
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
  loadInitialReviewDraft,
  loadInitialCompareTableView,
  getInitialRankingControls,
  getInitialReviewFilters,
  getInitialReviewHelpfulState,
  SavingsLineChart,
  CompareDock,
} from './app/support';
import { AppChrome, AppFooter, CommandOverlay } from './features/app-shell/chrome';
import {
  CalculatorSection,
  CompareSection,
  FaqSection,
  FinderSection,
  OverviewSection,
  ProofSection,
  RankingsSection,
  TrustStripSection,
  WorkspaceSection,
} from './features/app-shell/sections';
import { createCommandActions, createCompareRows } from './features/app-shell/model';

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
    type: 'default',
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

  const recommendedHostingType = useMemo(() => {
    const { projectType, traffic, budget } = labProfile;
    const scores = HOSTING_TYPE_OPTIONS.map(({ id }) => {
      const strategy = HOSTING_TYPE_STRATEGY[id];
      let score = 0;
      if (strategy.projectFit.includes(projectType)) score += 2;
      if (strategy.trafficFit.includes(traffic)) score += 2;
      if (budget >= strategy.budget.min && budget <= strategy.budget.max) score += 1;
      return { id, score };
    });
    const best = scores.reduce((a, b) => (b.score > a.score ? b : a));
    return best.score >= 3 ? best.id : null;
  }, [labProfile]);

  const pushToast = useCallback((message, action = null, type = 'default') => {
    setToast((current) => ({
      id: current.id + 1,
      message,
      actionId: action?.id || '',
      actionLabel: action?.label || '',
      type: type || 'default',
    }));
  }, []);

  const dismissToast = useCallback(() => {
    setToast((current) => ({
      ...current,
      message: '',
      actionId: '',
      actionLabel: '',
      type: 'default',
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
        type: 'default',
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
  const noReviewsForType = reviews.filter((r) => activeHostIdSet.has(r.hostId) && r.hostingType === activeHostingType).length === 0;
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

  const duelScoreA = Math.round(scoreHost(heroCompareA));
  const duelScoreB = Math.round(scoreHost(heroCompareB));

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
      button: 'Open finder',
      actionId: 'open-finder',
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
  const calculatorQuickPickHosts = useMemo(() => {
    const fromCompare = normalizedCompareIds
      .map((id) => hostByIdForActiveType.get(id))
      .filter(Boolean);
    if (fromCompare.length > 0) return fromCompare.slice(0, compareSlotCapacity);
    return [...hostsForActiveType]
      .sort((a, b) => scoreHost(b) - scoreHost(a))
      .slice(0, 3);
  }, [normalizedCompareIds, hostByIdForActiveType, hostsForActiveType, compareSlotCapacity]);
  const calculatorUsesTopPickFallback = normalizedCompareIds.filter((id) => hostByIdForActiveType.has(id)).length === 0;
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
      pushToast(`Keep at least ${compareMinimumRequired} host${compareMinimumRequired === 1 ? '' : 's'} in compare.`, null, 'error');
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

    const newHosts = resolveHostsForType(hostingType);
    const normalized = normalizeLabProfileForType(labProfile, hostingType, newHosts);
    const budgetChanged = normalized.budget !== labProfile.budget;

    setActiveHostingType((current) => {
      if (current === hostingType) {
        return current;
      }
      return hostingType;
    });
    setLabProfile(normalized);
    setActiveCategory('All');
    if (clearPreset) {
      setActivePreset(null);
    }

    if (!silent) {
      const typeLabel = HOSTING_TYPE_LABELS[hostingType] || hostingType;
      const msg = budgetChanged
        ? `${typeLabel} hosting loaded · budget adjusted to ${currency.format(normalized.budget)}/mo`
        : `${typeLabel} hosting data loaded.`;
      pushToast(msg);
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
      pushToast(isSaved ? `${host.name} removed from workspace.` : `${host.name} saved to workspace.`, null, isSaved ? 'default' : 'success');
    }
  };

  const clearShortlist = () => {
    if (!shortlistIds.length) {
      pushToast('Workspace shortlist is already empty.', null, 'warning');
      return;
    }

    setLastClearedShortlist(shortlistIds);
    setShortlistIds([]);
    pushToast('Shortlist cleared.', { id: 'undo-shortlist-clear', label: 'Undo' });
  };

  const syncShortlistToCompare = () => {
    if (shortlistedHosts.length < compareMinimumRequired) {
      pushToast(`Save at least ${compareMinimumRequired} host${compareMinimumRequired === 1 ? '' : 's'} before syncing to compare.`, null, 'error');
      return;
    }

    setCompareIds(normalizeCompareIds(shortlistedHosts.slice(0, compareSlotCapacity).map((host) => host.id), activeHostIds));
    pushToast('Compare synced from workspace.', null, 'success');
  };

  const syncAndCompare = () => {
    if (shortlistedHosts.length < compareMinimumRequired) {
      pushToast(`Save at least ${compareMinimumRequired} host${compareMinimumRequired === 1 ? '' : 's'} to compare.`, null, 'error');
      return;
    }

    setCompareIds(normalizeCompareIds(shortlistedHosts.slice(0, compareSlotCapacity).map((host) => host.id), activeHostIds));
    jumpToSection('compare');
    pushToast('Shortlist loaded into compare.', null, 'success');
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

  const compareRows = useMemo(
    () => createCompareRows({
      hostReviewSignals,
      compactNumber,
      currency,
      formatSiteLimit,
    }),
    [hostReviewSignals]
  );
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

  const toggleDockCollapsed = useCallback(() => {
    setDockState((current) => {
      const nextCollapsed = !current.collapsed;
      pushToast(nextCollapsed ? 'Compare dock minimized.' : 'Compare dock expanded.');
      return { ...current, collapsed: nextCollapsed };
    });
  }, [pushToast]);

  const hideDock = useCallback(() => {
    setDockState((current) => ({ ...current, hidden: true }));
    pushToast('Compare dock hidden. Press Shift + D to bring it back.');
  }, [pushToast]);

  const showDock = useCallback(() => {
    setDockState((current) => ({ ...current, hidden: false }));
    pushToast('Compare dock visible.');
  }, [pushToast]);

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
      ? clamp(Math.round(distance * 0.55), 250, 1600)
      : 150;

    // Lock scroll observer BEFORE any state updates to prevent race conditions
    isNavigatingRef.current = true;
    if (navigationTimeoutRef.current) {
      window.clearTimeout(navigationTimeoutRef.current);
    }
    navigationTimeoutRef.current = window.setTimeout(() => {
      isNavigatingRef.current = false;
      navigationTimeoutRef.current = null;
    }, navigationLockMs);

    setActiveSection((current) => (current === sectionId ? current : sectionId));

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
        pushToast(`${host.name} promo copied: ${promoCode}`, null, 'success');
        return;
      }
    } catch {
      // Fall through to visible fallback message.
    }

    pushToast(`${host.name} promo code: ${promoCode}`, null, 'success');
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

  const onSectionNavClick = useCallback((event, sectionId) => {
    event.preventDefault();
    jumpToSection(sectionId);
  }, [jumpToSection]);

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

  const commandActions = createCommandActions({
    activeHostingTypeLabel,
    canAddThirdCompare,
    compareExtraSlotEnabled,
    compareMinimumRequired,
    compareSlotCapacity,
    compareTableView,
    dockState,
    hasActiveCompareFilters,
    suggestedCompareHost,
    shortlistedHosts,
    theme,
    DEFAULT_THEME,
  });

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

  const app = {
    ALT_THEME,
    COMPARE_METRIC_GROUPS,
    COMPARE_TABLE_VIEWS,
    DEFAULT_HOSTING_TYPE,
    DEFAULT_THEME,
    FAQ_TOPIC_CHIPS,
    FeatureIcon,
    HERO_INTENTS,
    HERO_PANEL_VIEWS,
    HOSTING_TYPE_DESCRIPTIONS,
    HOSTING_TYPE_LABELS,
    HOSTING_TYPE_OPTIONS,
    HOST_BY_ID,
    HOST_PLACEHOLDER_PALETTES,
    JOURNEY_STEPS,
    LAB_PRIORITIES,
    NAV_SECTIONS,
    RADAR_COLORS,
    RADAR_DIMS,
    RadarChart,
    RANK_PRESETS,
    REVIEW_DIMENSIONS,
    REVIEW_PAGE_SIZE,
    REVIEW_PREVIEW_LIMIT,
    REVIEW_SORT_OPTIONS,
    RatingStars,
    SORT_OPTIONS,
    SavingsLineChart,
    SpecIcon,
    TRUST_METRICS,
    activeCategory,
    activeHeroPanelView,
    activeHostIds,
    activeHostingType,
    activeHostingTypeLabel,
    activeIntentId,
    activeJourneyIndex,
    activePreset,
    activeReviewFilterCount,
    activeReviewHost,
    activeSection,
    activeSectionLabel,
    addSuggestedCompare,
    annualCurrent,
    annualDelta,
    applyIntent,
    applyReviewPreset,
    calculatorHost,
    calculatorHostId,
    calculatorPolicySource,
    calculatorPricingSource,
    calculatorPromoCode,
    calculatorQuickPickHosts,
    calculatorSpendConfig,
    calculatorUsesTopPickFallback,
    calculatorVerifiedLabel,
    canAddThirdCompare,
    clamp,
    clearShortlist,
    closeCommandCenter,
    commandInputRef,
    commandQuery,
    compactNumber,
    compareCheapest,
    compareExtraSlotEnabled,
    compareFastestSupport,
    compareHiddenMetricCount,
    compareHighestValue,
    compareHostMetricWins,
    compareHosts,
    compareIds,
    compareKeyMetricsOnly,
    compareLeadGap,
    compareLeader,
    compareMetricGroup,
    compareMetricGroupCounts,
    compareMetricQuery,
    compareMinimumRequired,
    compareReadinessLabel,
    compareRecommendationNote,
    compareRowsBase,
    compareRowsHiddenByMode,
    compareSlotCId,
    compareSlotCapacity,
    compareSlotLocks,
    compareTableView,
    copyCompareShareLink,
    copyPromoCode,
    currency,
    displayedReviews,
    duelConfidence,
    duelMargin,
    duelRows,
    duelWinner,
    expandedReviewIds,
    faqQuery,
    fasterSetupHost,
    featuredReview,
    featuredReviewDateLabel,
    featuredReviewHelpful,
    featuredReviewHost,
    featuredReviewHostSignal,
    filteredFaqItems,
    filteredReviews,
    finderBudgetChampion,
    finderBudgetConfig,
    finderBudgetCoverageCount,
    finderBudgetMidpoint,
    finderConfidenceLabel,
    finderFlash,
    finderProjectOptions,
    finderTopBudgetCopy,
    finderTopBudgetDelta,
    finderTopRecommendation,
    finderTopScore,
    finderTrafficCoverageCount,
    finderTrafficOptions,
    formatSiteLimit,
    formatVerifiedDate,
    getFeatureIconType,
    getHostReviewSignal,
    getPromoCode,
    getRadarCompositeScore,
    getRadarScore,
    handleHeroPanelBlur,
    hasActiveCompareFilters,
    hasMoreReviews,
    hashSeed,
    headerRef,
    heroAverageIntro,
    heroCompareA,
    heroCompareB,
    heroPanelAutoPlay,
    heroPanelIndex,
    heroPanelProgress,
    heroPanelView,
    heroTopHosts,
    hiddenReviewCount,
    hostAvatarFallbackImages,
    hostByIdForActiveType,
    hostFaviconImages,
    hostSelectOptions,
    hostsForActiveType,
    introGap,
    introMonthlyDelta,
    isCommandOpen,
    isReviewComposerOpen,
    isReviewDraftReady,
    journeyProgress,
    jumpToReview,
    jumpToSection,
    labProfile,
    labRecommendations,
    lastUpdated,
    lowerPriceHost,
    markReviewHelpful,
    marketplaceAverageScore,
    marketplaceTopReviewedHost,
    mobileNavOpen,
    monthlySpend,
    noReviewsForType,
    normalizeCompareIds,
    normalizedCompareIds,
    normalizedFaqQuery,
    onHeroPanelTabKeyDown,
    onSectionNavClick,
    openCommandCenter,
    openSavingsForHost,
    pushToast,
    rankedHosts,
    rankingBudgetHost,
    rankingCategories,
    rankingLeader,
    rankingPayoutHost,
    rankingSupportHost,
    recommendedHostingType,
    renderHostInline,
    renderHostText,
    renewalMonthlyDelta,
    resetCompareFilters,
    resetLabProfile,
    resetRankingControls,
    resetReviewFilters,
    reviewAverageSavings,
    reviewDateFormatter,
    reviewDraft,
    reviewFormError,
    reviewFormRef,
    reviewHelpfulCounts,
    reviewHelpfulVotedSet,
    reviewHostFilter,
    reviewHostOptions,
    reviewMinScore,
    reviewPositiveRate,
    reviewQuery,
    reviewQueryChipLabel,
    reviewQueryNormalized,
    reviewQuoteLength,
    reviewQuoteRemaining,
    reviewSortKey,
    reviewSortLabel,
    reviewStarBuckets,
    runCommandAction,
    s,
    scoreHost,
    scoreLabHost,
    searchInputRef,
    searchTerm,
    MetricBar,
    selectedPriorityLabel,
    selectedProjectLabel,
    selectedTrafficLabel,
    setActiveCategory,
    setActivePreset,
    setCalculatorHostId,
    setCommandQuery,
    setCompareKeyMetricsOnly,
    setCompareMetricGroup,
    setCompareMetricQuery,
    setCompareTableViewMode,
    setCompareThirdSlot,
    setFaqQuery,
    setHeroCompareSlot,
    setHeroPanelInteracting,
    setHostingType,
    setLabProfile,
    setMobileNavOpen,
    setMonthlySpend,
    setReviewHostFilter,
    setReviewMinScore,
    setReviewQuery,
    setReviewSortKey,
    setSearchTerm,
    setSortKey,
    setTopThreeCompare,
    shortlistIds,
    shortlistRenewalIncrease,
    shortlistedHosts,
    showHeroPanelView,
    showMoreReviews,
    sortKey,
    strongerSupportHost,
    submitReview,
    suggestedCompareHost,
    swapHeroCompare,
    syncAndCompare,
    syncFinderToCompare,
    syncShortlistToCompare,
    theme,
    threeYearCurrent,
    threeYearDelta,
    toggleCompare,
    toggleHeroPanelAutoPlay,
    toggleReviewComposer,
    toggleReviewExpanded,
    toggleShortlist,
    toggleTheme,
    topHost,
    topHostPromoCode,
    totalHelpfulVotes,
    totalReviewSignalCount,
    twoYearDelta,
    updateReviewDraft,
    visibleCommandActions,
    visibleCompareRows,
    workspaceAverageIntro,
    workspaceAverageScore,
    workspaceCheapestHost,
    workspaceNeedsMoreToCompare,
    workspacePrimaryAction,
    workspaceReadiness,
    workspaceReviewSignalCount,
    workspaceTopHost,
  };

  return (
    <div className={s.app}>
      <a className={s.skipLink} href="#main-content">Skip to content</a>

      <AppChrome app={app} />
      <CommandOverlay app={app} />

      <main className={s.main} id="main-content">
        <OverviewSection app={app} />
        <FinderSection app={app} />
        <RankingsSection app={app} />
        <WorkspaceSection app={app} />
        <CompareSection app={app} />
        <CalculatorSection app={app} />
        <ProofSection app={app} />
        <FaqSection app={app} />
      </main>

      <CompareDock
        dockState={dockState}
        compareHosts={compareHosts}
        compareSlotCapacity={compareSlotCapacity}
        activeHostingTypeLabel={activeHostingTypeLabel}
        activeJourneyIndex={activeJourneyIndex}
        isJourneyFlowComplete={isJourneyFlowComplete}
        nextJourneyStep={nextJourneyStep}
        hostFaviconImages={hostFaviconImages}
        hostAvatarFallbackImages={hostAvatarFallbackImages}
        showDock={showDock}
        hideDock={hideDock}
        toggleCompare={toggleCompare}
        onSectionNavClick={onSectionNavClick}
        toggleDockCollapsed={toggleDockCollapsed}
        jumpToSection={jumpToSection}
      />

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
          className={`${s.toast} ${dockState.hidden ? s.toastLow : s.toastHigh} ${toast.type === 'success' ? s.toastSuccess : ''} ${toast.type === 'warning' ? s.toastWarning : ''} ${toast.type === 'error' ? s.toastError : ''}`}
          role="status"
          aria-live="polite"
          style={{ '--toast-duration': `${toast.actionId ? 4600 : 2600}ms` }}
        >
          <div className={s.toastProgress} key={toast.id} />
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
              ✕
            </button>
          </div>
        </div>
      )}

      <AppFooter app={app} />
    </div>
  );
}

