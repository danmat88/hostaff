export default function OverviewPanelSlideVerdict({ app }) {
  const {
    duelConfidence,
    duelMargin,
    duelRows,
    duelWinner,
    heroCompareA,
    heroCompareB,
    heroPanelView,
    renderHostInline,
    renderHostText,
    s,
  } = app;

  return (
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
          <strong>{renderHostInline(duelWinner)} leads by {duelMargin} pts</strong>
          <span>{duelConfidence} from performance, support, value, price, and setup weighting</span>
          <b className={s.duelConfidenceBadge}>{duelConfidence}</b>
        </header>

        <div className={s.duelRows}>
          {duelRows.map((row) => (
            <article key={row.id} className={s.duelRow}>
              <div className={s.duelRowTop}>
                <span>{row.label}</span>
                <div>
                  <strong>{renderHostText(heroCompareA)}</strong>
                  <small>{row.aValue}</small>
                </div>
                <div>
                  <strong>{renderHostText(heroCompareB)}</strong>
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
  );
}
