export default function OverviewPanelFooter({ app }) {
  const {
    currency,
    fasterSetupHost,
    heroAverageIntro,
    onSectionNavClick,
    renderHostText,
    s,
    scoreHost,
    topHost,
    topHostPromoCode,
  } = app;

  return (
    <div className={s.panelFooter}>
      <div className={s.panelFooterTop}>
        <div className={s.panelMetrics}>
          <div>
            <span>Top score</span>
            <strong>{renderHostText(topHost)} {scoreHost(topHost)}</strong>
          </div>
          <div>
            <span>Avg intro</span>
            <strong>{currency.format(heroAverageIntro)}</strong>
          </div>
          <div>
            <span>Fastest setup</span>
            <strong>{renderHostText(fasterSetupHost)} {fasterSetupHost.setupMinutes}m</strong>
          </div>
        </div>

        <div className={s.panelActions}>
          <a className={s.panelCta} href="#compare" onClick={(event) => onSectionNavClick(event, 'compare')}>Compare top picks</a>
          <a className={s.panelGhost} href="#finder" onClick={(event) => onSectionNavClick(event, 'finder')}>Run smart finder</a>
        </div>
      </div>

      <small className={s.panelPromo}>
        Best promo right now: {renderHostText(topHost)} ({topHostPromoCode || 'No code listed'})
      </small>
    </div>
  );
}
