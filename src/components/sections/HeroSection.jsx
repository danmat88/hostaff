function HeroSection({ topProvider, stats }) {
  const bestFit = topProvider.bestFor.map((segment) => segment.toUpperCase()).join(' | ')

  return (
    <section className="section-shell hero-shell">
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="hero-kicker">Hosting Affiliate Comparison</p>
          <h1>Build Trust Faster With Transparent Hosting Recommendations</h1>
          <p className="hero-lead">
            Replace generic "best hosting" lists with structured comparisons,
            review depth, and conversion-ready affiliate placements.
          </p>

          <div className="hero-actions">
            <a className="button primary" href="#compare">
              Compare Plans
            </a>
            <a className="button secondary" href="#reviews">
              Read Full Reviews
            </a>
            <a className="button secondary" href="#decision-lab">
              Open Decision Lab
            </a>
          </div>

          <div className="hero-stat-grid">
            {stats.map((stat) => (
              <article key={stat.label} className="stat-card">
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="hero-highlight">
          <p className="highlight-eyebrow">Top Match Right Now</p>
          <h3>{topProvider.name}</h3>
          <p className="highlight-tagline">{topProvider.tagline}</p>

          <div className="highlight-metrics">
            <div>
              <span>Rating</span>
              <strong>{topProvider.rating.toFixed(1)} / 5</strong>
            </div>
            <div>
              <span>From</span>
              <strong>${topProvider.startingPrice.toFixed(2)} / mo</strong>
            </div>
            <div>
              <span>Uptime</span>
              <strong>{topProvider.uptime.toFixed(2)}%</strong>
            </div>
            <div>
              <span>Support</span>
              <strong>~{topProvider.supportReplyMinutes} min</strong>
            </div>
          </div>

          <p className="highlight-fit">Best fit: {bestFit}</p>
          <p className="highlight-promo">{topProvider.promotion}</p>
          <a
            className="button primary"
            href={topProvider.affiliateUrl}
            target="_blank"
            rel="noreferrer"
          >
            Visit Deal
          </a>
        </aside>
      </div>
    </section>
  )
}

export default HeroSection
