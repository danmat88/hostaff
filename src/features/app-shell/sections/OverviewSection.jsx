import { OverviewHeroCopy } from './overview';
import VsBattle from '../../../components/VsBattle/VsBattle';

/* ── Intent icons ── */
const INTENT_ICONS = {
  launch: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  ),
  grow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  scale: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 20 6-6m4-4 6-6"/><path d="m18 8 4-4-4-4"/><circle cx="8" cy="14" r="2"/>
    </svg>
  ),
  custom: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  production: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
      <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>
  ),
  agency: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
};

export default function OverviewSection({ app }) {
  const {
    HERO_INTENTS,
    HOSTING_TYPE_DESCRIPTIONS,
    HOSTING_TYPE_OPTIONS,
    activeHostingType,
    activeIntentId,
    applyIntent,
    hostsForActiveType,
    lastUpdated,
    recommendedHostingType,
    s,
    setHostingType,
    totalReviewSignalCount,
  } = app;

  return (
    <section className={s.hero} id="overview">
      {/* Row 1 — Hosting type tabs (full-width) */}
      <div className={s.heroTypeBar}>
        <span className={s.heroTypeLabel}>Comparing:</span>
        <div className={s.heroTypeChips}>
          {HOSTING_TYPE_OPTIONS.map((option) => {
            const active = activeHostingType === option.id;
            const suggested = recommendedHostingType === option.id && !active;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setHostingType(option.id)}
                className={[
                  s.heroTypeChip,
                  active ? s.heroTypeChipActive : '',
                  suggested ? s.heroTypeChipSuggested : '',
                ].filter(Boolean).join(' ')}
                title={HOSTING_TYPE_DESCRIPTIONS[option.id]}
              >
                {option.label}
                {suggested && <span className={s.heroTypeDot} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2 — Main content (2-column: copy left, battle right) */}
      <OverviewHeroCopy app={app} />
      <div className={s.heroBattle}>
        <VsBattle />
      </div>

      {/* Row 3 — Intent grid (full-width) */}
      <div className={s.heroIntentBar}>
        <p className={s.heroIntentLabel}>Start with your goal:</p>
        <div className={s.heroIntentGrid}>
          {HERO_INTENTS.map((intent) => (
            <button
              key={intent.id}
              type="button"
              onClick={() => applyIntent(intent)}
              className={`${s.heroIntentBtn} ${activeIntentId === intent.id ? s.heroIntentBtnActive : ''}`}
            >
              <span className={s.intentIcon}>{INTENT_ICONS[intent.id]}</span>
              <span className={s.intentCopy}>
                <strong>{intent.label}</strong>
                <span>{intent.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Row 4 — Trust footer (full-width) */}
      <div className={s.heroFooter}>
        <div className={s.heroFooterStats}>
          <span className={s.footerStat}>
            <strong>{(totalReviewSignalCount || 101295).toLocaleString()}</strong> reviews analyzed
          </span>
          <span className={s.footerDot} />
          <span className={s.footerStat}>
            <strong>{hostsForActiveType.length}</strong> providers tracked
          </span>
          <span className={s.footerDot} />
          <span className={s.footerStat}>
            <strong>99.95%+</strong> uptime floor
          </span>
          <span className={s.footerDot} />
          <span className={s.footerStat}>
            Updated <strong>{lastUpdated}</strong>
          </span>
        </div>
        <p className={s.footerDisclosure}>
          Affiliate disclosure: tracked links may generate commissions at no extra cost to you.
        </p>
      </div>
    </section>
  );
}
