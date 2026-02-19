export default function OverviewPanelSummary({ app }) {
  const {
    activeHeroPanelView,
    currency,
    duelConfidence,
    fasterSetupHost,
    heroCompareA,
    heroCompareB,
    introGap,
    lowerPriceHost,
    renderHostInline,
    renderHostText,
    s,
  } = app;

  return (
    <div className={s.panelSummaryRow}>
      <article className={`${s.panelSummaryCard} ${s.panelSummaryCardMatch}`}>
        <small>Active matchup</small>
        <strong>
          {renderHostInline(heroCompareA)}
          <span className={s.panelSummaryVs}>vs</span>
          {renderHostInline(heroCompareB)}
        </strong>
        <span>{activeHeroPanelView.step} - {activeHeroPanelView.label}</span>
      </article>
      <div className={s.panelSummarySignals}>
        <article className={s.panelSummaryCard}>
          <small>Match quality</small>
          <strong>{duelConfidence}</strong>
          <span>{renderHostText(app.duelWinner)} leads</span>
        </article>
        <article className={s.panelSummaryCard}>
          <small>Cheaper intro</small>
          <strong>{renderHostText(lowerPriceHost)}</strong>
          <span>{currency.format(introGap)}/mo saved</span>
        </article>
        <article className={s.panelSummaryCard}>
          <small>Faster setup</small>
          <strong>{renderHostText(fasterSetupHost)}</strong>
          <span>{fasterSetupHost.setupMinutes} min avg</span>
        </article>
      </div>
    </div>
  );
}
