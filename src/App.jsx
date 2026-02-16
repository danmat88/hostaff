import { useMemo, useState } from 'react';
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

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

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

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortKey, setSortKey] = useState('overall');
  const [compareIds, setCompareIds] = useState(DEFAULT_COMPARE);
  const [monthlySpend, setMonthlySpend] = useState(45);
  const [calculatorHostId, setCalculatorHostId] = useState(HOSTS[0].id);

  const rankedHosts = useMemo(() => {
    const filtered = activeCategory === 'All'
      ? HOSTS
      : HOSTS.filter((host) => host.category === activeCategory);

    return sortHosts(filtered, sortKey);
  }, [activeCategory, sortKey]);

  const topHost = rankedHosts[0] || HOSTS[0];

  const compareHosts = useMemo(
    () => compareIds
      .map((id) => HOSTS.find((host) => host.id === id))
      .filter(Boolean),
    [compareIds]
  );

  const calculatorHost = HOSTS.find((host) => host.id === calculatorHostId) || HOSTS[0];
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
            <a href="#rankings">Rankings</a>
            <a href="#compare">Compare</a>
            <a href="#calculator">Savings</a>
            <a href="#proof">Proof</a>
            <a href="#faq">FAQ</a>
          </nav>

          <a className={s.headerCta} href="#rankings">Find your host</a>
        </div>
      </header>

      <main className={s.main}>
        <section className={s.hero} id="overview">
          <div className={s.heroCopy}>
            <p className={s.eyebrow}>Independent rankings with affiliate-ready conversion flow</p>
            <h1>Build the hosting affiliate app serious marketers actually use.</h1>
            <p className={s.heroText}>
              Compare plans, expose true renewal costs, and push qualified traffic to top-converting offers.
              Every ranking blends benchmark speed, support latency, and margin-ready payout data.
            </p>

            <div className={s.heroActions}>
              <a className={s.primaryBtn} href="#rankings">Explore top hosts</a>
              <a className={s.ghostBtn} href="#compare">Open comparison table</a>
            </div>

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
            <p className={s.panelLabel}>Current top recommendation</p>
            <h2>{topHost.name}</h2>
            <p>{topHost.tagline}</p>

            <div className={s.panelMetrics}>
              <div>
                <span>Score</span>
                <strong>{scoreHost(topHost)}</strong>
              </div>
              <div>
                <span>Intro</span>
                <strong>{currency.format(topHost.priceIntro)}</strong>
              </div>
              <div>
                <span>Payout</span>
                <strong>Up to {currency.format(topHost.affiliatePayout)}</strong>
              </div>
            </div>

            <a
              href={topHost.affiliateUrl}
              target="_blank"
              rel="noreferrer noopener"
              className={s.panelCta}
            >
              Claim {topHost.name} offer
            </a>

            <small>Promo code: {topHost.promoCode}</small>
          </aside>
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

            <label className={s.sortControl}>
              <span>Sort by</span>
              <select value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className={s.hostGrid}>
            {rankedHosts.map((host, index) => (
              <article key={host.id} className={s.hostCard} style={{ '--delay': `${index * 70}ms` }}>
                <header className={s.hostTop}>
                  <div className={s.hostIdentity}>
                    <span className={s.rankNumber}>#{index + 1}</span>
                    <div>
                      <h3>{host.name}</h3>
                      <p>{host.bestFor}</p>
                    </div>
                  </div>
                  <span className={s.badge}>{host.editorBadge}</span>
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

                <div className={s.ctaRow}>
                  <a href={host.affiliateUrl} target="_blank" rel="noreferrer noopener">
                    Claim deal
                  </a>
                  <button
                    type="button"
                    onClick={() => toggleCompare(host.id)}
                    className={compareIds.includes(host.id) ? s.compareButtonActive : ''}
                  >
                    {compareIds.includes(host.id) ? 'In compare' : 'Add to compare'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={s.section} id="compare">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Compare</p>
              <h2>Decision table for your shortlisted hosts</h2>
            </div>
            <p className={s.sectionNote}>
              Keep at least two providers selected. Add a third from rankings to quickly pressure-test tradeoffs.
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
              const host = HOSTS.find((item) => item.id === review.hostId);
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
