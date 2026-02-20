export default function OverviewHeroCopy({ app }) {
  const {
    activeHostingTypeLabel,
    onSectionNavClick,
    s,
  } = app;

  return (
    <div className={s.heroCopy}>
      <p className={s.eyebrow}>
        <span className={s.eyebrowDot} />
        Live Hosting Intelligence
      </p>

      <h1>
        <span className={s.headSub}>Find the best</span>{' '}
        <span className={s.headGrad}>{activeHostingTypeLabel} host</span>{' '}
        <span className={s.headSub}>based on real data.</span>
      </h1>

      <p className={s.heroText}>
        Benchmarked performance, transparent intro-to-renewal pricing, and developer-verified reviews.
        No marketing fluff — just the numbers that matter.
      </p>

      <div className={s.heroActions}>
        <a className={s.primaryBtn} href="#finder" onClick={(e) => onSectionNavClick(e, 'finder')}>
          Find my best host
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
        </a>
        <a className={s.ghostBtn} href="#compare" onClick={(e) => onSectionNavClick(e, 'compare')}>
          Compare providers
        </a>
      </div>

      <p className={s.heroCopyTrust}>
        <span className={s.heroCopyTrustDot} />
        Trusted by 10,000+ developers &amp; site owners
      </p>
    </div>
  );
}
