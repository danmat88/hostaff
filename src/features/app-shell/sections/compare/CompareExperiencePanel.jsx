export default function CompareExperiencePanel({ app }) {
  const {
    addSuggestedCompare,
    canAddThirdCompare,
    compareCheapest,
    compareExtraSlotEnabled,
    compareFastestSupport,
    compareHighestValue,
    compareHostMetricWins,
    compareHosts,
    compareLeadGap,
    compareLeader,
    compareMinimumRequired,
    compareReadinessLabel,
    compareRecommendationNote,
    compareSlotCId,
    compareSlotCapacity,
    compareSlotLocks,
    copyCompareShareLink,
    copyPromoCode,
    currency,
    getPromoCode,
    heroCompareA,
    heroCompareB,
    hostSelectOptions,
    openSavingsForHost,
    renderHostInline,
    renderHostText,
    s,
    scoreHost,
    setCompareThirdSlot,
    setHeroCompareSlot,
    setTopThreeCompare,
    shortlistedHosts,
    suggestedCompareHost,
    swapHeroCompare,
    syncShortlistToCompare,
  } = app;

  return (
<div className={s.compareExperience}>
            <div className={s.compareInsights}>
              <div className={s.compareSpotlight}>
                <article className={`${s.compareSpotlightCard} ${s.compareSpotlightLead}`}>
                  <small>Best overall right now</small>
                  <strong>{renderHostText(compareLeader)}</strong>
                  <span>{scoreHost(compareLeader)} score, lead by {compareLeadGap} pts</span>
                </article>
                <article className={s.compareSpotlightCard}>
                  <small>Lowest intro</small>
                  <strong>{renderHostText(compareCheapest)}</strong>
                  <span>{currency.format(compareCheapest.priceIntro)}/month</span>
                </article>
                <article className={s.compareSpotlightCard}>
                  <small>Fastest support</small>
                  <strong>{renderHostText(compareFastestSupport)}</strong>
                  <span>{compareFastestSupport.supportResponseMinutes} min average response</span>
                </article>
                <article className={s.compareSpotlightCard}>
                  <small>Best value</small>
                  <strong>{renderHostText(compareHighestValue)}</strong>
                  <span>{compareHighestValue.value}/100 value score</span>
                </article>
              </div>

              <div className={s.compareWinsBoard}>
                {compareHostMetricWins.map((item, index) => (
                  <article
                    key={`compare-win-${item.host.id}`}
                    className={`${s.compareWinsCard} ${index === 0 ? s.compareWinsCardLead : ''}`}
                  >
                    <small>{index === 0 ? 'Metric leader' : 'Metric wins'}</small>
                    <strong>{renderHostInline(item.host)}</strong>
                    <span>{item.wins} best marks · {item.winRate}% share</span>
                  </article>
                ))}
              </div>

              <div className={s.compareDecision}>
                <div className={s.compareDecisionMain}>
                  <p className={s.compareDecisionKicker}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    Analysis complete
                  </p>
                  <strong className={s.compareDecisionTitle}>
                    {renderHostInline(compareLeader)} is your top pick
                  </strong>
                  <p className={s.compareDecisionNote}>{compareRecommendationNote}</p>
                  <div className={s.compareDecisionStats}>
                    <span>{scoreHost(compareLeader)}/100 composite score</span>
                    <span>{compareHostMetricWins[0]?.wins || 0} metric wins</span>
                    <span>{currency.format(compareLeader.priceIntro)}/mo intro</span>
                  </div>
                  {compareLeader.priceRenewal > compareLeader.priceIntro * 1.5 && (
                    <p className={s.compareDecisionRenewalWarn}>
                      Renewal jumps to {currency.format(compareLeader.priceRenewal)}/mo after the intro period — factor this into your 3-year budget.
                    </p>
                  )}
                </div>
                <div className={s.compareDecisionActions}>
                  {getPromoCode(compareLeader) && (
                    <button
                      type="button"
                      className={s.compareDecisionPromo}
                      onClick={() => void copyPromoCode(compareLeader)}
                    >
                      <span>Promo code</span>
                      <strong>{getPromoCode(compareLeader)}</strong>
                    </button>
                  )}
                  <button
                    type="button"
                    className={s.compareDecisionSavings}
                    onClick={() => openSavingsForHost(compareLeader, 'compare')}
                  >
                    Model savings
                  </button>
                  <a
                    className={s.compareDecisionDeal}
                    href={compareLeader.affiliateUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Claim deal
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </a>
                </div>
              </div>
            </div>

            <div className={s.compareWorkbench}>
              <p className={s.compareWorkbenchHint}>
                Active stack: {compareHosts.length} host{compareHosts.length === 1 ? '' : 's'} selected.
                {' '}
                {compareReadinessLabel}. Adjust slots to test tradeoffs before opening offers.
              </p>
              <div className={s.compareSelectedHosts}>
                {compareHosts.map((host) => (
                  <span key={`compare-selected-${host.id}`}>
                    {renderHostInline(host)}
                    <small>{host.starterPlanName || host.planType}</small>
                  </span>
                ))}
              </div>
              <div className={s.compareSelectors}>
                <label className={s.compareField}>
                  <span>Slot A</span>
                  <select value={heroCompareA.id} onChange={(event) => setHeroCompareSlot(0, event.target.value)}>
                    {hostSelectOptions.map((host) => (
                      <option
                        key={`compare-a-${host.id}`}
                        value={host.id}
                        disabled={compareSlotLocks.slotA.has(host.id) && host.id !== heroCompareA.id}
                      >
                        {host.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={s.compareField}>
                  <span>Slot B</span>
                  <select value={heroCompareB.id} onChange={(event) => setHeroCompareSlot(1, event.target.value)}>
                    {hostSelectOptions.map((host) => (
                      <option
                        key={`compare-b-${host.id}`}
                        value={host.id}
                        disabled={compareSlotLocks.slotB.has(host.id) && host.id !== heroCompareB.id}
                      >
                        {host.name}
                      </option>
                    ))}
                  </select>
                </label>
                {compareExtraSlotEnabled && (
                  <label className={s.compareField}>
                    <span>Slot C (optional)</span>
                    <select value={compareSlotCId} onChange={(event) => setCompareThirdSlot(event.target.value)}>
                      <option value="">None</option>
                      {hostSelectOptions.map((host) => (
                        <option
                          key={`compare-c-${host.id}`}
                          value={host.id}
                          disabled={compareSlotLocks.slotC.has(host.id)}
                        >
                          {host.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <div className={s.compareQuickActions}>
                <button type="button" className={s.compareQuickNeutral} onClick={swapHeroCompare}>Swap A/B</button>
                <button type="button" className={s.compareQuickAccent} onClick={setTopThreeCompare}>
                  Use top {compareSlotCapacity}
                </button>
                <button
                  type="button"
                  className={s.compareQuickSoft}
                  onClick={syncShortlistToCompare}
                  disabled={shortlistedHosts.length < compareMinimumRequired}
                >
                  Use shortlist
                </button>
                {compareExtraSlotEnabled && (
                  <button type="button" className={s.compareQuickSoft} onClick={addSuggestedCompare} disabled={!canAddThirdCompare}>
                    {canAddThirdCompare ? <>Add {renderHostText(suggestedCompareHost)}</> : `${compareSlotCapacity} hosts selected`}
                  </button>
                )}
                <button type="button" className={s.compareQuickPrimary} onClick={() => { void copyCompareShareLink(); }}>
                  Copy share link
                </button>
              </div>
            </div>
          </div>
  );
}
