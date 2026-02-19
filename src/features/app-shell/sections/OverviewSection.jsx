import { OverviewHeroCopy } from './overview';
import VsBattle from '../../../components/VsBattle/VsBattle';

export default function OverviewSection({ app }) {
  const {
    HOSTING_TYPE_DESCRIPTIONS,
    HOSTING_TYPE_OPTIONS,
    activeHostingType,
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

      {/* Row 2 — Main content (2-column) */}
      <OverviewHeroCopy app={app} />
      <div className={s.heroBattle}>
        <VsBattle />
      </div>

      {/* Row 3 — Trust footer (full-width) */}
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
          Affiliate disclosure: purchases from tracked links may generate commissions at no extra cost to the buyer.
        </p>
      </div>
    </section>
  );
}
