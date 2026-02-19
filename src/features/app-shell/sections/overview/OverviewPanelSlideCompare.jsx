export default function OverviewPanelSlideCompare({ app }) {
  const {
    compareSlotLocks,
    currency,
    duelConfidence,
    duelWinner,
    fasterSetupHost,
    heroCompareA,
    heroCompareB,
    heroPanelView,
    hostSelectOptions,
    introGap,
    lowerPriceHost,
    renderHostText,
    s,
    setHeroCompareSlot,
    strongerSupportHost,
    swapHeroCompare,
  } = app;

  return (
    <section
      id="hero-panel-compare"
      role="tabpanel"
      aria-labelledby="hero-tab-compare"
      aria-hidden={heroPanelView !== 'compare'}
      tabIndex={heroPanelView === 'compare' ? 0 : -1}
      className={s.heroPanelSlide}
    >
      <div className={s.quickCompareBox}>
        <div className={s.quickCompareHeader}>
          <p className={s.quickCompareLabel}>Instant compare focus</p>
          <button type="button" className={s.quickCompareSwap} onClick={swapHeroCompare}>
            Swap
          </button>
        </div>
        <div className={s.quickCompareControls}>
          <label className={s.quickCompareField}>
            <span>Host A</span>
            <select
              value={heroCompareA.id}
              onChange={(event) => setHeroCompareSlot(0, event.target.value)}
            >
              {hostSelectOptions.map((host) => (
                <option
                  key={host.id}
                  value={host.id}
                  disabled={compareSlotLocks.slotA.has(host.id) && host.id !== heroCompareA.id}
                >
                  {host.name}
                </option>
              ))}
            </select>
          </label>

          <label className={s.quickCompareField}>
            <span>Host B</span>
            <select
              value={heroCompareB.id}
              onChange={(event) => setHeroCompareSlot(1, event.target.value)}
            >
              {hostSelectOptions.map((host) => (
                <option
                  key={host.id}
                  value={host.id}
                  disabled={compareSlotLocks.slotB.has(host.id) && host.id !== heroCompareB.id}
                >
                  {host.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={s.quickSignals}>
          <article className={s.quickSignalCard}>
            <small>Winner now</small>
            <strong>{renderHostText(duelWinner)}</strong>
            <span>{duelConfidence}</span>
          </article>
          <article className={s.quickSignalCard}>
            <small>Price edge</small>
            <strong>{renderHostText(lowerPriceHost)}</strong>
            <span>{currency.format(introGap)}/mo cheaper</span>
          </article>
          <article className={s.quickSignalCard}>
            <small>Setup speed</small>
            <strong>{renderHostText(fasterSetupHost)}</strong>
            <span>{fasterSetupHost.setupMinutes} min setup</span>
          </article>
          <article className={s.quickSignalCard}>
            <small>Support lead</small>
            <strong>{renderHostText(strongerSupportHost)}</strong>
            <span>{strongerSupportHost.support}/100 support score</span>
          </article>
        </div>
      </div>
    </section>
  );
}
