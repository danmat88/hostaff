export default function OverviewHeroCopy({ app }) {
  const {
    HERO_INTENTS,
    HOSTING_TYPE_DESCRIPTIONS,
    HOSTING_TYPE_OPTIONS,
    activeHostingType,
    activeHostingTypeLabel,
    activeIntentId,
    applyIntent,
    compactNumber,
    hostsForActiveType,
    lastUpdated,
    onSectionNavClick,
    recommendedHostingType,
    s,
    setHostingType,
    totalReviewSignalCount,
    workspaceReviewSignalCount,
  } = app;

  return (
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

      <div className={s.heroTypeRow}>
        <p>You are comparing:</p>
        <div className={s.heroTypePills}>
          {HOSTING_TYPE_OPTIONS.map((option) => {
            const isSuggested = recommendedHostingType === option.id && activeHostingType !== option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setHostingType(option.id)}
                className={[
                  s.heroTypePill,
                  activeHostingType === option.id ? s.heroTypePillActive : '',
                  isSuggested ? s.heroTypePillSuggested : '',
                ].filter(Boolean).join(' ')}
              >
                <strong>{option.label}</strong>
                <span>{HOSTING_TYPE_DESCRIPTIONS[option.id]}</span>
                {isSuggested && <em>Suggested</em>}
              </button>
            );
          })}
        </div>
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
  );
}
