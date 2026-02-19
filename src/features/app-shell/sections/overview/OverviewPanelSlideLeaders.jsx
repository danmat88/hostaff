export default function OverviewPanelSlideLeaders({ app }) {
  const {
    currency,
    heroPanelView,
    heroTopHosts,
    pushToast,
    renderHostInline,
    scoreHost,
    setHeroCompareSlot,
    showHeroPanelView,
    s,
  } = app;

  return (
    <section
      id="hero-panel-leaders"
      role="tabpanel"
      aria-labelledby="hero-tab-leaders"
      aria-hidden={heroPanelView !== 'leaders'}
      tabIndex={heroPanelView === 'leaders' ? 0 : -1}
      className={s.heroPanelSlide}
    >
      <div className={s.snapshotGrid}>
        {heroTopHosts.map((host, index) => (
          <article
            key={host.id}
            className={`${s.snapshotCard} ${index === 0 ? s.snapshotCardLead : ''}`}
          >
            <div className={s.snapshotCardTop}>
              <span className={s.snapshotRank}>#{index + 1}</span>
              <strong>{renderHostInline(host)}</strong>
            </div>
            <p>{host.bestFor}</p>
            <div className={s.snapshotCardStats}>
              <span>{currency.format(host.priceIntro)}/mo</span>
              <b>{scoreHost(host)} score</b>
            </div>
            {index === 0 && (
              <button
                type="button"
                className={s.snapshotUse}
                onClick={() => {
                  setHeroCompareSlot(0, host.id);
                  showHeroPanelView('compare', true);
                  pushToast(`${host.name} loaded into quick compare.`);
                }}
              >
                Use in compare
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
