import { useEffect, useMemo, useRef, useState } from 'react';
import { FAQ_ITEMS, HOSTS, REVIEWS, TRUST_METRICS } from './data/hosts';
import s from './App.module.css';

const SORT_OPTIONS = [
  { id: 'overall', label: 'Top score' },
  { id: 'price', label: 'Lowest intro price' },
  { id: 'support', label: 'Fastest support' },
  { id: 'payout', label: 'Highest affiliate payout' },
];

const CATEGORIES = ['All', ...new Set(HOSTS.map((host) => host.category))];
const DEFAULT_COMPARE = [HOSTS[0].id, HOSTS[2]?.id || HOSTS[1].id];
const HOST_BY_ID = new Map(HOSTS.map((host) => [host.id, host]));

const STORAGE_KEYS = {
  shortlist: 'hostaff.shortlist.v1',
  lab: 'hostaff.lab.v1',
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

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
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

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortKey, setSortKey] = useState('overall');
  const [searchTerm, setSearchTerm] = useState('');
  const [compareIds, setCompareIds] = useState(DEFAULT_COMPARE);
  const [shortlistIds, setShortlistIds] = useState(loadInitialShortlist);
  const [labProfile, setLabProfile] = useState(loadInitialLabProfile);
  const [monthlySpend, setMonthlySpend] = useState(45);
  const [calculatorHostId, setCalculatorHostId] = useState(HOSTS[0].id);
  const searchInputRef = useRef(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.shortlist, JSON.stringify(shortlistIds));
  }, [shortlistIds]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.lab, JSON.stringify(labProfile));
  }, [labProfile]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement
        && (target.tagName === 'INPUT'
          || target.tagName === 'TEXTAREA'
          || target.tagName === 'SELECT'
          || target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      searchInputRef.current?.focus();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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

  const topHost = heroTopHosts[0] || HOSTS[0];
  const heroAverageIntro = heroTopHosts.reduce((sum, host) => sum + host.priceIntro, 0) / (heroTopHosts.length || 1);
  const lastUpdated = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const compareHosts = useMemo(
    () => compareIds
      .map((id) => HOST_BY_ID.get(id))
      .filter(Boolean),
    [compareIds]
  );

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

  const shortlistPotentialPayout = shortlistedHosts.reduce((total, host) => total + host.affiliatePayout, 0);

  const calculatorHost = HOST_BY_ID.get(calculatorHostId) || HOSTS[0];
  const annualCurrent = monthlySpend * 12;
  const annualWithHost = calculatorHost.priceIntro * 12;
  const annualSavings = Math.max(0, annualCurrent - annualWithHost);
  const threeYearCurrent = monthlySpend * 36;
  const threeYearWithHost = calculatorHost.priceIntro * 12 + calculatorHost.priceRenewal * 24;
  const threeYearSavings = Math.max(0, threeYearCurrent - threeYearWithHost);

  const toggleCompare = (hostId) => {
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
  };

  const toggleShortlist = (hostId) => {
    setShortlistIds((current) => {
      if (current.includes(hostId)) {
        return current.filter((id) => id !== hostId);
      }

      return [...current, hostId].slice(-8);
    });
  };

  const syncShortlistToCompare = () => {
    if (shortlistedHosts.length < 2) {
      return;
    }

    setCompareIds(shortlistedHosts.slice(0, 3).map((host) => host.id));
  };

  const resetLabProfile = () => {
    setLabProfile(DEFAULT_LAB_PROFILE);
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

  return (
    <div className={s.app}>
      <a className={s.skipLink} href="#main-content">Skip to content</a>

      <header className={s.header}>
        <div className={s.headerInner}>
          <a className={s.brand} href="#overview">
            <span className={s.brandMark}>HA</span>
            <span className={s.brandText}>
              <strong>HostAff Pro</strong>
              <small>Hosting affiliate intelligence</small>
            </span>
          </a>

          <nav className={s.nav} aria-label="Primary">
            <a href="#finder">Finder</a>
            <a href="#rankings">Rankings</a>
            <a href="#workspace">Workspace</a>
            <a href="#compare">Compare</a>
            <a href="#calculator">Savings</a>
            <a href="#faq">FAQ</a>
          </nav>

          <a className={s.headerCta} href="#finder">Start host finder</a>
        </div>
      </header>

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
              <a className={s.primaryBtn} href="#compare">Compare providers now</a>
              <a className={s.ghostBtn} href="#finder">Find my best host</a>
            </div>

            <div className={s.heroMetaRow}>
              <span>Updated {lastUpdated}</span>
              <span>{HOSTS.length} providers tracked</span>
              <span>{compactNumber.format(REVIEWS.length * 1000)}+ user signal snapshots</span>
            </div>

            <ul className={s.heroHighlights}>
              <li>Real intro vs renewal pricing side by side</li>
              <li>Performance and support benchmarks in one scorecard</li>
              <li>Fast shortlist + compare workflow for confident decisions</li>
            </ul>

            <div className={s.disclosure}>
              Affiliate disclosure: purchases from tracked links may generate commissions at no extra cost to the buyer.
            </div>

            <div className={s.trustGrid}>
              {TRUST_METRICS.map((item) => (
                <article key={item.label} className={s.trustCard}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </div>

          <aside className={s.heroPanel}>
            <p className={s.panelLabel}>Top picks this month</p>

            <div className={s.snapshotRows}>
              {heroTopHosts.map((host, index) => (
                <article key={host.id} className={s.snapshotRow}>
                  <span className={s.snapshotRank}>#{index + 1}</span>
                  <div className={s.snapshotMain}>
                    <strong>{host.name}</strong>
                    <span>{host.bestFor}</span>
                  </div>
                  <div className={s.snapshotStats}>
                    <strong>{currency.format(host.priceIntro)}/mo</strong>
                    <span>{scoreHost(host)} score</span>
                  </div>
                </article>
              ))}
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
                <span>Top payout</span>
                <strong>Up to {currency.format(Math.max(...heroTopHosts.map((host) => host.affiliatePayout)))}</strong>
              </div>
            </div>

            <div className={s.panelActions}>
              <a className={s.panelCta} href="#compare">Compare top picks</a>
              <a className={s.panelGhost} href="#finder">Run smart finder</a>
            </div>

            <small>Best promo right now: {topHost.name} ({topHost.promoCode})</small>
          </aside>
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

        <section className={s.section} id="rankings">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Ranked list</p>
              <h2>Top hosting affiliate opportunities right now</h2>
            </div>
            <p className={s.sectionNote}>
              Filter by business model and sort by score, intro pricing, support speed, or payout potential.
            </p>
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

          <p className={s.resultsMeta}>
            Showing {rankedHosts.length} host{rankedHosts.length === 1 ? '' : 's'}.
            {' '}
            {compareHosts.length} in compare.
            {' '}
            {shortlistedHosts.length} saved to workspace.
          </p>

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
                      <div className={s.hostTopActions}>
                        <span className={s.badge}>{host.editorBadge}</span>
                        <button
                          type="button"
                          className={`${s.saveChip} ${isSaved ? s.saveChipActive : ''}`}
                          onClick={() => toggleShortlist(host.id)}
                          aria-pressed={isSaved}
                        >
                          {isSaved ? 'Saved' : 'Save'}
                        </button>
                      </div>
                    </header>

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
                      <code>{host.promoCode}</code>
                    </div>

                    <p className={s.caveat}>Watch-out: {host.caveat}</p>

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
                      <a href={host.affiliateUrl} target="_blank" rel="noreferrer noopener">
                        Claim deal
                      </a>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className={s.section} id="workspace">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Workspace</p>
              <h2>Shortlist planner for decision-ready buying journeys</h2>
            </div>
            <p className={s.sectionNote}>
              Save candidates while browsing. Keep your compare set in sync and estimate potential affiliate revenue from likely conversions.
            </p>
          </div>

          {shortlistedHosts.length === 0 ? (
            <article className={s.workspaceEmpty}>
              <h3>No saved hosts yet</h3>
              <p>
                Save hosts from recommendations or rankings. Your shortlist persists in this browser so users can continue later.
              </p>
            </article>
          ) : (
            <div className={s.workspaceShell}>
              <header className={s.workspaceSummary}>
                <div>
                  <h3>{shortlistedHosts.length} hosts saved</h3>
                  <p>Potential payout if one customer converts on each: {currency.format(shortlistPotentialPayout)}</p>
                </div>
                <div className={s.workspaceActions}>
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
                      <small>Up to {currency.format(host.affiliatePayout)} payout</small>
                    </div>
                    <div className={s.workspaceCardActions}>
                      <button type="button" onClick={() => toggleCompare(host.id)}>
                        {compareIds.includes(host.id) ? 'In compare' : 'Add compare'}
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

        <section className={s.section} id="compare">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Compare</p>
              <h2>Decision table for your shortlisted hosts</h2>
            </div>
            <p className={s.sectionNote}>
              Keep at least two providers selected. Add a third from rankings or finder results to pressure-test tradeoffs.
            </p>
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
                          {row.format(value)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className={s.section} id="calculator">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Savings model</p>
              <h2>Estimate cost gap before sending affiliate traffic</h2>
            </div>
            <p className={s.sectionNote}>
              Use this for your comparison pages so users understand first-year and long-term spend before clicking through.
            </p>
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
                <span>Annual savings estimate</span>
                <strong>{currency.format(annualSavings)}</strong>
                <p>Current annual cost: {currency.format(annualCurrent)}</p>
              </article>
              <article>
                <span>3-year savings estimate</span>
                <strong>{currency.format(threeYearSavings)}</strong>
                <p>Includes renewal pricing after year one</p>
              </article>
              <article>
                <span>Recommended angle</span>
                <strong>{calculatorHost.promoLabel}</strong>
                <p>Use code {calculatorHost.promoCode} in your CTA block</p>
              </article>
            </div>
          </div>
        </section>

        <section className={s.section} id="proof">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Social proof</p>
              <h2>Real operator feedback for higher buyer confidence</h2>
            </div>
            <p className={s.sectionNote}>
              Testimonials with savings context outperform generic review snippets on affiliate comparison pages.
            </p>
          </div>

          <div className={s.reviewGrid}>
            {REVIEWS.map((review) => {
              const host = HOST_BY_ID.get(review.hostId);
              return (
                <article key={review.id} className={s.reviewCard}>
                  <p>{review.quote}</p>
                  <div>
                    <strong>{review.name}</strong>
                    <span>{review.role}</span>
                    <small>
                      Saved {currency.format(review.monthlySavings)} monthly with {host?.name}
                    </small>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={s.section} id="faq">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>FAQ</p>
              <h2>Compliance and methodology answers</h2>
            </div>
            <p className={s.sectionNote}>
              Keep these visible to improve trust and reduce objection-heavy support tickets.
            </p>
          </div>

          <div className={s.faqList}>
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className={s.faqItem}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <aside className={s.compareDock} aria-label="Comparison shortcuts">
        <p>
          {compareHosts.length} in compare | {shortlistedHosts.length} saved
        </p>
        <div className={s.compareDockTags}>
          {compareHosts.map((host) => (
            <span key={host.id}>{host.name}</span>
          ))}
        </div>
        <div className={s.compareDockActions}>
          <a href="#compare">Open compare</a>
          <a href="#workspace">Open workspace</a>
        </div>
      </aside>

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
