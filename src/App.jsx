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
  theme: 'hostaff.theme.v1',
  reviews: 'hostaff.reviews.v1',
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
  { id: 'savings', label: 'Highest savings' },
];

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

function buildHostPlaceholderImage(host) {
  const palette = HOST_PLACEHOLDER_PALETTES[hashSeed(host.id) % HOST_PLACEHOLDER_PALETTES.length];
  const initials = host.name
    .split(/\s+/)
    .map((part) => part[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.start}" />
      <stop offset="100%" stop-color="${palette.end}" />
    </linearGradient>
  </defs>
  <rect width="640" height="360" rx="34" fill="url(#g)" />
  <circle cx="104" cy="66" r="88" fill="${palette.glow}" fill-opacity="0.22" />
  <circle cx="566" cy="312" r="136" fill="${palette.glow}" fill-opacity="0.14" />
  <rect x="44" y="42" width="124" height="124" rx="28" fill="${palette.panel}" fill-opacity="0.16" />
  <text x="106" y="119" font-family="Space Grotesk, Arial, sans-serif" font-size="54" font-weight="700" text-anchor="middle" fill="${palette.panel}">
    ${initials}
  </text>
  <text x="44" y="232" font-family="Manrope, Arial, sans-serif" font-size="40" font-weight="700" fill="${palette.panel}">
    ${host.name}
  </text>
  <text x="44" y="272" font-family="Manrope, Arial, sans-serif" font-size="20" fill="${palette.panel}" fill-opacity="0.94">
    ${host.category} hosting
  </text>
</svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
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

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortKey, setSortKey] = useState('overall');
  const [searchTerm, setSearchTerm] = useState('');
  const [compareIds, setCompareIds] = useState(DEFAULT_COMPARE);
  const [shortlistIds, setShortlistIds] = useState(loadInitialShortlist);
  const [labProfile, setLabProfile] = useState(loadInitialLabProfile);
  const [monthlySpend, setMonthlySpend] = useState(45);
  const [calculatorHostId, setCalculatorHostId] = useState(HOSTS[0].id);
  const [heroPanelView, setHeroPanelView] = useState(HERO_PANEL_VIEWS[0].id);
  const [heroPanelAutoPlay, setHeroPanelAutoPlay] = useState(loadInitialHeroPanelAutoPlay);
  const [heroPanelInteracting, setHeroPanelInteracting] = useState(false);
  const [theme, setTheme] = useState(loadInitialTheme);
  const [reviews, setReviews] = useState(loadInitialReviews);
  const [isReviewComposerOpen, setIsReviewComposerOpen] = useState(false);
  const [reviewDraft, setReviewDraft] = useState(() => ({ ...DEFAULT_REVIEW_DRAFT }));
  const [reviewFormError, setReviewFormError] = useState('');
  const [reviewHostFilter, setReviewHostFilter] = useState('all');
  const [reviewSortKey, setReviewSortKey] = useState('recent');
  const [reviewMinScore, setReviewMinScore] = useState(0);
  const [faqQuery, setFaqQuery] = useState('');
  const [headerOffset, setHeaderOffset] = useState(128);
  const [dockState, setDockState] = useState(loadInitialDockState);
  const [toast, setToast] = useState({ id: 0, message: '' });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const headerRef = useRef(null);
  const hasSyncedInitialHashRef = useRef(false);
  const searchInputRef = useRef(null);
  const commandInputRef = useRef(null);

  const pushToast = useCallback((message) => {
    setToast((current) => ({ id: current.id + 1, message }));
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

    const timeout = window.setTimeout(() => {
      setToast((current) => ({ ...current, message: '' }));
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [toast.id, toast.message]);

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

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visible.length) {
          return;
        }

        const nextSection = visible[0].target.id;
        setActiveSection((current) => (current === nextSection ? current : nextSection));
      },
      {
        rootMargin: `-${Math.max(84, headerOffset + 18)}px 0px -52% 0px`,
        threshold: [0.16, 0.32, 0.58],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [headerOffset]);

  const rankedHosts = useMemo(() => {
    let filtered = activeCategory === 'All'
      ? HOSTS
      : HOSTS.filter((host) => host.category === activeCategory);

    const query = searchTerm.trim().toLowerCase();

    if (query) {
      filtered = filtered.filter((host) => {
        const haystack = `${host.name} ${host.category} ${host.bestFor} ${host.tagline}`.toLowerCase();
        return haystack.includes(query);
      });
    }

    return sortHosts(filtered, sortKey);
  }, [activeCategory, sortKey, searchTerm]);

  const heroTopHosts = useMemo(
    () => sortHosts(HOSTS, 'overall').slice(0, 3),
    []
  );
  const hostPlaceholderImages = useMemo(
    () => Object.fromEntries(HOSTS.map((host) => [host.id, buildHostPlaceholderImage(host)])),
    []
  );
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

    HOSTS.forEach((host) => {
      const count = reviewHostCounts.get(host.id) || 0;
      if (count > 0) {
        options.push({ id: host.id, label: host.name, count });
      }
    });

    return options;
  }, [reviewHostCounts, reviews.length]);
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
  const topReviewedHost = useMemo(() => {
    let winner = null;
    let winnerCount = -1;

    reviewHostCounts.forEach((count, hostId) => {
      if (count > winnerCount) {
        winner = HOST_BY_ID.get(hostId) || null;
        winnerCount = count;
      }
    });

    return winner;
  }, [reviewHostCounts]);
  const visibleReviews = useMemo(() => {
    const filtered = reviews.filter((review) => (
      (reviewHostFilter === 'all' || review.hostId === reviewHostFilter)
      && clamp(Number(review.score) || 0, 1, 5) >= reviewMinScore
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
  }, [reviews, reviewHostFilter, reviewMinScore, reviewSortKey]);
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

  const activeIntentId = useMemo(() => {
    const intent = HERO_INTENTS.find((item) => (
      labProfile.projectType === item.profile.projectType
      && labProfile.traffic === item.profile.traffic
      && labProfile.priority === item.profile.priority
      && Math.abs(labProfile.budget - item.profile.budget) <= 1
    ));

    return intent?.id || '';
  }, [labProfile]);

  const compareHosts = useMemo(
    () => compareIds
      .map((id) => HOST_BY_ID.get(id))
      .filter(Boolean),
    [compareIds]
  );

  const heroCompareIds = useMemo(() => {
    const ids = [...compareIds];
    while (ids.length < 2) {
      const fallback = HOSTS.find((host) => !ids.includes(host.id))?.id;
      if (!fallback) {
        break;
      }
      ids.push(fallback);
    }
    return ids.slice(0, 2);
  }, [compareIds]);

  const heroCompareA = HOST_BY_ID.get(heroCompareIds[0]) || topHost;
  const heroCompareB = HOST_BY_ID.get(heroCompareIds[1]) || heroTopHosts[1] || topHost;

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
    const host = HOST_BY_ID.get(hostId);
    const isAlreadyInCompare = compareIds.includes(hostId);

    if (isAlreadyInCompare && compareIds.length <= 2) {
      pushToast('Keep at least two hosts in compare.');
      return;
    }

    setCompareIds((current) => {
      if (current.includes(hostId)) {
        if (current.length <= 2) {
          return current;
        }

        return current.filter((id) => id !== hostId);
      }

      if (current.length === 3) {
        return [...current.slice(1), hostId];
      }

      return [...current, hostId];
    });

    if (!host) {
      return;
    }

    if (isAlreadyInCompare) {
      pushToast(`${host.name} removed from compare.`);
      return;
    }

    if (compareIds.length === 3) {
      pushToast(`${host.name} added. Oldest compare slot replaced.`);
      return;
    }

    pushToast(`${host.name} added to compare.`);
  };

  const setHeroCompareSlot = (slotIndex, hostId) => {
    setCompareIds((current) => {
      const next = [...current];

      while (next.length < 2) {
        const fallback = HOSTS.find((host) => !next.includes(host.id))?.id;
        if (!fallback) {
          break;
        }
        next.push(fallback);
      }

      const otherIndex = slotIndex === 0 ? 1 : 0;

      if (next[otherIndex] === hostId) {
        next[otherIndex] = next[slotIndex];
      }

      next[slotIndex] = hostId;

      const unique = [];
      next.forEach((id) => {
        if (id && !unique.includes(id)) {
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

      return unique;
    });
  };

  const swapHeroCompare = () => {
    setCompareIds((current) => {
      const next = [...current];

      while (next.length < 2) {
        const fallback = HOSTS.find((host) => !next.includes(host.id))?.id;
        if (!fallback) {
          break;
        }
        next.push(fallback);
      }

      if (next.length >= 2) {
        [next[0], next[1]] = [next[1], next[0]];
      }

      return next;
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

  const syncShortlistToCompare = () => {
    if (shortlistedHosts.length < 2) {
      pushToast('Save at least two hosts before syncing to compare.');
      return;
    }

    setCompareIds(shortlistedHosts.slice(0, 3).map((host) => host.id));
    pushToast('Compare synced from workspace.');
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

    if (quote.length < 36) {
      setReviewFormError('Write at least 36 characters so the review is useful.');
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

  const compareRows = [
    {
      label: 'Overall score',
      getValue: (host) => host.overallScore,
      format: (value) => `${value}/100`,
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
      label: 'Uptime',
      getValue: (host) => host.uptimePercent,
      format: (value) => `${value.toFixed(2)}%`,
      higherIsBetter: true,
    },
    {
      label: 'Money-back guarantee',
      getValue: (host) => host.moneyBackDays,
      format: (value) => `${value} days`,
      higherIsBetter: true,
    },
    {
      label: 'Data center regions',
      getValue: (host) => host.dataCenters,
      format: (value) => `${value} regions`,
      higherIsBetter: true,
    },
  ];

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
    ? `${compareLeader.name} has a clear lead with stronger balance across performance, support, and value.`
    : `${compareLeader.name} holds a slight edge, but this matchup is close and worth validating against price sensitivity.`;

  const suggestedCompareHost = HOSTS.find((host) => !compareIds.includes(host.id)) || null;
  const canAddThirdCompare = compareIds.length < 3 && Boolean(suggestedCompareHost);

  const setCompareThirdSlot = (hostId) => {
    setCompareIds((current) => {
      const next = [...current];

      while (next.length < 2) {
        const fallback = HOSTS.find((host) => !next.includes(host.id))?.id;
        if (!fallback) {
          break;
        }
        next.push(fallback);
      }

      const base = [];
      next.slice(0, 2).forEach((id) => {
        if (id && !base.includes(id)) {
          base.push(id);
        }
      });

      while (base.length < 2) {
        const fallback = HOSTS.find((host) => !base.includes(host.id))?.id;
        if (!fallback) {
          break;
        }
        base.push(fallback);
      }

      if (hostId && !base.includes(hostId)) {
        base.push(hostId);
      }

      return base.slice(0, 3);
    });
  };

  const setTopThreeCompare = () => {
    setCompareIds(sortHosts(HOSTS, 'overall').slice(0, 3).map((host) => host.id));
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
  }, [dockState.collapsed, dockState.hidden, jumpToSection, pushToast, toggleTheme]);

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

            <p className={s.commandHint}>Shortcuts: Ctrl/Cmd + K open · ? open · Esc close · Shift + L theme</p>
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
              <span>{compactNumber.format(REVIEWS.length * 1000)}+ user signal snapshots</span>
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
              <div>
                <p className={s.panelLabel}>Decision cockpit</p>
                <strong className={s.panelTitle}>What users compare first</strong>
                <p className={s.panelSubtext}>
                  <strong>{activeHeroPanelView.step}</strong>
                  {' '}
                  {activeHeroPanelView.hint}
                </p>
              </div>
              <div className={s.panelPager}>
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
                <button
                  type="button"
                  className={`${s.panelPagerMode} ${heroPanelAutoPlay ? s.panelPagerModeActive : ''}`}
                  onClick={toggleHeroPanelAutoPlay}
                  aria-pressed={heroPanelAutoPlay}
                >
                  {heroPanelAutoPlay ? 'Pause' : 'Play'}
                </button>
              </div>
            </div>

            <div className={s.panelTabs} role="tablist" aria-label="Hero panel views">
              {HERO_PANEL_VIEWS.map((view) => (
                <button
                  key={view.id}
                  id={`hero-tab-${view.id}`}
                  type="button"
                  role="tab"
                  aria-selected={heroPanelView === view.id}
                  aria-controls={`hero-panel-${view.id}`}
                  tabIndex={heroPanelView === view.id ? 0 : -1}
                  className={heroPanelView === view.id ? s.panelTabActive : ''}
                  onKeyDown={onHeroPanelTabKeyDown}
                  onClick={() => showHeroPanelView(view.id, true)}
                >
                  <span>{view.step}</span>
                  <strong>{view.label}</strong>
                </button>
              ))}
            </div>

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
                          <strong>{host.name}</strong>
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
                          {HOSTS.map((host) => (
                            <option key={host.id} value={host.id}>{host.name}</option>
                          ))}
                        </select>
                      </label>

                      <label className={s.quickCompareField}>
                        <span>Host B</span>
                        <select
                          value={heroCompareB.id}
                          onChange={(event) => setHeroCompareSlot(1, event.target.value)}
                        >
                          {HOSTS.map((host) => (
                            <option key={host.id} value={host.id}>{host.name}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className={s.quickSignals}>
                      <article className={s.quickSignalCard}>
                        <small>Winner now</small>
                        <strong>{duelWinner.name}</strong>
                        <span>{duelConfidence}</span>
                      </article>
                      <article className={s.quickSignalCard}>
                        <small>Price edge</small>
                        <strong>{lowerPriceHost.name}</strong>
                        <span>{currency.format(introGap)}/mo cheaper</span>
                      </article>
                      <article className={s.quickSignalCard}>
                        <small>Setup speed</small>
                        <strong>{fasterSetupHost.name}</strong>
                        <span>{fasterSetupHost.setupMinutes} min setup</span>
                      </article>
                      <article className={s.quickSignalCard}>
                        <small>Support lead</small>
                        <strong>{strongerSupportHost.name}</strong>
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
                      <strong>{duelWinner.name} leads by {duelMargin} pts</strong>
                      <span>{duelConfidence} from performance, support, value, price, and setup weighting</span>
                      <b className={s.duelConfidenceBadge}>{duelConfidence}</b>
                    </header>

                    <div className={s.duelRows}>
                      {duelRows.map((row) => (
                        <article key={row.id} className={s.duelRow}>
                          <div className={s.duelRowTop}>
                            <span>{row.label}</span>
                            <div>
                              <strong>{heroCompareA.name}</strong>
                              <small>{row.aValue}</small>
                            </div>
                            <div>
                              <strong>{heroCompareB.name}</strong>
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

            <div className={s.panelMetrics}>
              <div>
                <span>Top score</span>
                <strong>{topHost.name} {scoreHost(topHost)}</strong>
              </div>
              <div>
                <span>Avg intro</span>
                <strong>{currency.format(heroAverageIntro)}</strong>
              </div>
              <div>
                <span>Fastest setup</span>
                <strong>{fasterSetupHost.name} {fasterSetupHost.setupMinutes}m</strong>
              </div>
            </div>

            <div className={s.panelActions}>
              <a className={s.panelCta} href="#compare" onClick={(event) => onSectionNavClick(event, 'compare')}>Compare top picks</a>
              <a className={s.panelGhost} href="#finder" onClick={(event) => onSectionNavClick(event, 'finder')}>Run smart finder</a>
            </div>

            <small className={s.panelPromo}>Best promo right now: {topHost.name} ({topHost.promoCode})</small>
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
            <div className={s.finderInsightTags}>
              <span><b>Project:</b> {selectedProjectLabel}</span>
              <span><b>Traffic:</b> {selectedTrafficLabel}</span>
              <span><b>Priority:</b> {selectedPriorityLabel}</span>
              <span><b>Budget:</b> {currency.format(labProfile.budget)}/mo</span>
            </div>
            <p className={s.finderInsightNote}>
              {finderBudgetCoverageCount} of {HOSTS.length} tracked providers fit this budget.
              Strongest in-budget pick right now: <strong>{finderBudgetChampion.name}</strong>.
            </p>
            <div className={s.finderInsightActions}>
              <button type="button" onClick={() => jumpToSection('rankings')}>Open rankings</button>
              <button type="button" onClick={() => openSavingsForHost(finderBudgetChampion, 'finder')}>Model savings</button>
            </div>
          </div>

          <div className={s.finderLayout}>
            <article className={s.finderControls}>
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

              <button className={s.finderReset} type="button" onClick={resetLabProfile}>
                Reset profile
              </button>
            </article>

            <div className={s.finderResults}>
              {labRecommendations.map((item, index) => {
                const isSaved = shortlistIds.includes(item.host.id);
                const inCompare = compareIds.includes(item.host.id);

                return (
                  <article key={item.host.id} className={s.finderCard}>
                    <header>
                      <div>
                        <p>Best match #{index + 1}</p>
                        <h3>{item.host.name}</h3>
                      </div>
                      <strong>{item.score}</strong>
                    </header>

                    <p className={s.finderTagline}>{item.host.tagline}</p>

                    <ul>
                      {item.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>

                    <div className={s.finderActions}>
                      <button type="button" onClick={() => toggleShortlist(item.host.id)}>
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCompare(item.host.id)}
                        aria-pressed={inCompare}
                      >
                        {inCompare ? 'In compare' : 'Add compare'}
                      </button>
                      <button type="button" onClick={() => openSavingsForHost(item.host, 'finder')}>
                        Savings
                      </button>
                      <a href={item.host.affiliateUrl} target="_blank" rel="noreferrer noopener">
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
              <strong>{rankingLeader.name}</strong>
              <small>{scoreHost(rankingLeader)} composite score</small>
            </article>
            <article className={s.rankingsHighlightCard}>
              <span>Best intro price</span>
              <strong>{rankingBudgetHost.name}</strong>
              <small>{currency.format(rankingBudgetHost.priceIntro)} / month</small>
            </article>
            <article className={s.rankingsHighlightCard}>
              <span>Fastest support</span>
              <strong>{rankingSupportHost.name}</strong>
              <small>{rankingSupportHost.supportResponseMinutes} min response</small>
            </article>
            <article className={s.rankingsHighlightCard}>
              <span>Highest affiliate payout</span>
              <strong>{rankingPayoutHost.name}</strong>
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
            </div>
          </div>

          <div className={s.resultsMeta}>
            <span>Showing {rankedHosts.length} host{rankedHosts.length === 1 ? '' : 's'}</span>
            <span>{compareHosts.length} in compare</span>
            <span>{shortlistedHosts.length} saved to workspace</span>
          </div>

          <div className={s.hostGrid}>
            {rankedHosts.length === 0 ? (
              <article className={s.emptyState}>
                <h3>No hosts match this filter set.</h3>
                <p>Try a wider category or clear your search phrase.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('All');
                    setSortKey('overall');
                    setSearchTerm('');
                  }}
                >
                  Reset filters
                </button>
              </article>
            ) : (
              rankedHosts.map((host, index) => {
                const isSaved = shortlistIds.includes(host.id);
                const inCompare = compareIds.includes(host.id);

                return (
                  <article key={host.id} className={s.hostCard} style={{ '--delay': `${index * 70}ms` }}>
                    <header className={s.hostTop}>
                      <div className={s.hostIdentity}>
                        <span className={s.rankNumber}>#{index + 1}</span>
                        <div>
                          <h3>{host.name}</h3>
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

                    <figure className={s.hostVisual}>
                      <img
                        src={hostPlaceholderImages[host.id]}
                        alt={`${host.name} hosting preview`}
                        loading="lazy"
                        decoding="async"
                      />
                      <figcaption className={s.hostVisualMeta}>
                        <span className={s.badge}>{host.editorBadge}</span>
                        <span className={s.hostCategory}>{host.category}</span>
                      </figcaption>
                    </figure>

                    <div className={s.ratingLine}>
                      <RatingStars rating={host.rating} />
                      <span>{host.rating.toFixed(1)}</span>
                      <small>{compactNumber.format(host.reviewCount)} reviews</small>
                    </div>

                    <p className={s.tagline}>{host.tagline}</p>

                    <div className={s.metricBlock}>
                      <MetricBar label="Performance" value={host.performance} />
                      <MetricBar label="Support" value={host.support} />
                      <MetricBar label="Value" value={host.value} />
                    </div>

                    <ul className={s.featureList}>
                      {host.features.slice(0, 3).map((feature) => (
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
              <small>{workspaceTopHost ? `Best current fit: ${workspaceTopHost.name}` : 'Save hosts to start scoring'}</small>
            </article>
            <article className={s.workspaceSignalCard}>
              <span>Price anchor</span>
              <strong>{workspaceAverageIntro ? `${currency.format(workspaceAverageIntro)} / mo avg` : 'No shortlist yet'}</strong>
              <small>{workspaceCheapestHost ? `Lowest intro: ${workspaceCheapestHost.name}` : 'Find low-intro options in rankings'}</small>
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
                  <button type="button" onClick={() => setShortlistIds([])}>
                    Clear shortlist
                  </button>
                </div>
              </header>

              <div className={s.workspaceGrid}>
                {shortlistedHosts.map((host) => (
                  <article key={host.id} className={s.workspaceCard}>
                    <div>
                      <strong>{host.name}</strong>
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
            <div>
              <p>Current recommendation</p>
              <strong>{compareLeader.name} leads your compare stack.</strong>
              <span>{compareRecommendationNote}</span>
            </div>
            <div className={s.compareVerdictActions}>
              <button type="button" onClick={() => openSavingsForHost(compareLeader, 'compare')}>
                Model {compareLeader.name}
              </button>
              <a href={compareLeader.affiliateUrl} target="_blank" rel="noreferrer noopener">
                Open {compareLeader.name} deal
              </a>
            </div>
          </div>

          <div className={s.compareExperience}>
            <div className={s.compareSpotlight}>
              <article className={`${s.compareSpotlightCard} ${s.compareSpotlightLead}`}>
                <small>Best overall right now</small>
                <strong>{compareLeader.name}</strong>
                <span>{scoreHost(compareLeader)} score, lead by {compareLeadGap} pts</span>
              </article>
              <article className={s.compareSpotlightCard}>
                <small>Lowest intro</small>
                <strong>{compareCheapest.name}</strong>
                <span>{currency.format(compareCheapest.priceIntro)}/month</span>
              </article>
              <article className={s.compareSpotlightCard}>
                <small>Fastest support</small>
                <strong>{compareFastestSupport.name}</strong>
                <span>{compareFastestSupport.supportResponseMinutes} min average response</span>
              </article>
              <article className={s.compareSpotlightCard}>
                <small>Best value</small>
                <strong>{compareHighestValue.name}</strong>
                <span>{compareHighestValue.value}/100 value score</span>
              </article>
            </div>

            <div className={s.compareWorkbench}>
              <div className={s.compareSelectors}>
                <label className={s.compareField}>
                  <span>Slot A</span>
                  <select value={heroCompareA.id} onChange={(event) => setHeroCompareSlot(0, event.target.value)}>
                    {HOSTS.map((host) => (
                      <option key={`compare-a-${host.id}`} value={host.id}>{host.name}</option>
                    ))}
                  </select>
                </label>
                <label className={s.compareField}>
                  <span>Slot B</span>
                  <select value={heroCompareB.id} onChange={(event) => setHeroCompareSlot(1, event.target.value)}>
                    {HOSTS.map((host) => (
                      <option key={`compare-b-${host.id}`} value={host.id}>{host.name}</option>
                    ))}
                  </select>
                </label>
                <label className={s.compareField}>
                  <span>Slot C (optional)</span>
                  <select value={compareIds[2] || ''} onChange={(event) => setCompareThirdSlot(event.target.value)}>
                    <option value="">None</option>
                    {HOSTS.map((host) => (
                      <option key={`compare-c-${host.id}`} value={host.id}>{host.name}</option>
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
                  {canAddThirdCompare ? `Add ${suggestedCompareHost.name}` : '3 hosts selected'}
                </button>
              </div>
            </div>
          </div>

          <div className={s.compareTableWrap}>
            <table className={s.compareTable}>
              <thead>
                <tr>
                  <th>Metric</th>
                  {compareHosts.map((host) => (
                    <th key={host.id}>
                      <div className={s.compareHead}>
                        <strong>{host.name}</strong>
                        <span>{host.category}</span>
                        <small>{currency.format(host.priceIntro)}/mo intro</small>
                        <a href={host.affiliateUrl} target="_blank" rel="noreferrer noopener">View deal</a>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => {
                  const values = compareHosts.map(row.getValue);
                  const best = row.higherIsBetter ? Math.max(...values) : Math.min(...values);

                  return (
                    <tr key={row.label}>
                      <th>{row.label}</th>
                      {values.map((value, index) => (
                        <td key={`${row.label}-${compareHosts[index].id}`} className={value === best ? s.bestCell : ''}>
                          <span>{row.format(value)}</span>
                          {value === best && <small>Best</small>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
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
                  {HOSTS.map((host) => (
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

          <div className={s.reviewExperience}>
            <aside className={s.reviewSpotlight}>
              <article>
                <span>Average rating</span>
                <strong>{reviewAverageScore.toFixed(1)}/5</strong>
                <small>Across {reviews.length} verified reviews</small>
              </article>
              <article>
                <span>Average monthly savings</span>
                <strong>{currency.format(reviewAverageSavings)}</strong>
                <small>Reported user savings</small>
              </article>
              <article>
                <span>Most reviewed provider</span>
                <strong>{topReviewedHost?.name || 'Awaiting first published review'}</strong>
                <small>
                  {topReviewedHost ? `${reviewHostCounts.get(topReviewedHost.id)} published reviews` : 'Add the first review to start signals'}
                </small>
              </article>
            </aside>

            <div className={s.reviewControlPanel}>
              <div className={s.reviewTools}>
                <button type="button" className={s.reviewWriteButton} onClick={toggleReviewComposer}>
                  {isReviewComposerOpen ? 'Close review form' : 'Write review'}
                </button>
                <p>Share your experience here. New reviews publish instantly and stay saved in this browser.</p>
              </div>

              <div className={s.reviewFilters}>
                <div className={s.reviewHostFilters} role="tablist" aria-label="Filter reviews by provider">
                  {reviewHostOptions.map((option) => (
                    <button
                      key={`review-filter-${option.id}`}
                      type="button"
                      role="tab"
                      aria-selected={reviewHostFilter === option.id}
                      className={reviewHostFilter === option.id ? s.reviewFilterActive : ''}
                      onClick={() => setReviewHostFilter(option.id)}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.count}</span>
                    </button>
                  ))}
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
              </div>
            </div>
          </div>

          <div className={s.reviewSentiment}>
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
                    {HOSTS.map((host) => (
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
                </label>
              </div>

              {reviewFormError && <p className={s.reviewFormError}>{reviewFormError}</p>}

              <div className={s.reviewFormActions}>
                <button type="submit">Publish review</button>
                <button type="button" onClick={toggleReviewComposer}>Cancel</button>
              </div>
            </form>
          )}

          <div className={s.reviewGrid}>
            {visibleReviews.length ? visibleReviews.map((review) => {
              const host = HOST_BY_ID.get(review.hostId);
              const reviewScore = clamp(Number(review.score) || 5, 1, 5);
              const createdDate = review.createdAt ? new Date(review.createdAt) : null;
              const hasValidDate = Boolean(createdDate && Number.isFinite(createdDate.getTime()));
              const createdLabel = hasValidDate ? reviewDateFormatter.format(createdDate) : 'Verified reviewer';
              return (
                <article key={review.id} className={s.reviewCard}>
                  <div className={s.reviewCardTop}>
                    <div className={s.reviewCardRating}>
                      <RatingStars rating={reviewScore} />
                      <span className={s.reviewCardScore}>{reviewScore.toFixed(1)}</span>
                    </div>
                    <span className={s.reviewCardHost}>{host?.name || 'Hosting provider'}</span>
                  </div>
                  <p>{review.quote}</p>
                  <div className={s.reviewCardMeta}>
                    <strong>{review.name}</strong>
                    <span className={s.reviewCardRole}>{review.role}</span>
                    <small>
                      Saved {currency.format(review.monthlySavings)} monthly with {host?.name || 'the selected provider'}
                    </small>
                    <time dateTime={hasValidDate ? review.createdAt : undefined}>{createdLabel}</time>
                  </div>
                </article>
              );
            }) : (
              <article className={s.reviewEmpty}>
                <h3>No reviews match these filters.</h3>
                <p>Try a broader rating threshold or switch back to all providers.</p>
                <button
                  type="button"
                  onClick={() => {
                    setReviewHostFilter('all');
                    setReviewMinScore(0);
                  }}
                >
                  Reset review filters
                </button>
              </article>
            )}
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
                <span>{compareHosts.length === 3 ? 'Pressure test ready' : 'Add a 3rd host for stronger comparison'}</span>
              </div>
            )}
            {!dockState.collapsed && (
              <small className={s.compareDockHint}>Shortcuts: Shift + C compare · Shift + D dock · Shift + T top</small>
            )}
          </div>

          {!dockState.collapsed && (
            <div className={s.compareDockTags}>
              {compareHosts.map((host) => (
                <span key={host.id}>{host.name}</span>
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
            {!dockState.collapsed && suggestedCompareHost && compareHosts.length < 3 && (
              <button type="button" className={s.compareDockAdd} onClick={() => toggleCompare(suggestedCompareHost.id)}>
                + {suggestedCompareHost.name}
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
          <button
            type="button"
            onClick={() => setToast((current) => ({ ...current, message: '' }))}
            aria-label="Dismiss notification"
          >
            Dismiss
          </button>
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

