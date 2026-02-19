export default function FinderHeaderInsights({ app }) {
  const {
    activeHostingTypeLabel,
    compareSlotCapacity,
    currency,
    finderBudgetChampion,
    finderBudgetCoverageCount,
    finderConfidenceLabel,
    finderTopBudgetCopy,
    finderTopBudgetDelta,
    finderTopRecommendation,
    finderTopScore,
    finderTrafficCoverageCount,
    hostsForActiveType,
    jumpToSection,
    labProfile,
    openSavingsForHost,
    renderHostText,
    s,
    selectedPriorityLabel,
    selectedProjectLabel,
    selectedTrafficLabel,
    syncFinderToCompare,
  } = app;

  return (
    <>
      <div className={s.sectionHeader}>
        <div>
          <p className={s.kicker}>Smart finder <span className={s.typeBadge}>{activeHostingTypeLabel}</span></p>
          <h2>Personalized host recommendations in under 10 seconds</h2>
        </div>
        <p className={s.sectionNote}>
          Tune workload profile, budget, and priority to get context-aware {activeHostingTypeLabel.toLowerCase()} recommendations before reviewing the full ranking table.
        </p>
      </div>

      <div className={s.finderInsightBar}>
        <div className={s.finderInsightHead}>
          <div className={s.finderInsightTags}>
            <span><b>Project:</b> {selectedProjectLabel}</span>
            <span><b>Traffic:</b> {selectedTrafficLabel}</span>
            <span><b>Priority:</b> {selectedPriorityLabel}</span>
            <span><b>Budget:</b> {currency.format(labProfile.budget)}/mo</span>
          </div>
          <p className={s.finderInsightNote}>
            {finderBudgetCoverageCount} of {hostsForActiveType.length} tracked providers fit this budget.
            Strongest in-budget pick right now: <strong>{renderHostText(finderBudgetChampion)}</strong>.
          </p>
        </div>

        <div className={s.finderSignalGrid}>
          <article className={s.finderSignalCard}>
            <span>Top match confidence</span>
            <strong>{finderTopScore}/100</strong>
            <small>{finderConfidenceLabel}</small>
          </article>
          <article className={s.finderSignalCard}>
            <span>Traffic-fit providers</span>
            <strong>{finderTrafficCoverageCount}/{hostsForActiveType.length}</strong>
            <small>Optimized for {selectedTrafficLabel.toLowerCase()}</small>
          </article>
          <article className={s.finderSignalCard}>
            <span>Top match budget delta</span>
            <strong className={finderTopBudgetDelta >= 0 ? s.finderSignalPositive : s.finderSignalNegative}>
              {finderTopBudgetCopy}
            </strong>
            <small>
              {finderTopRecommendation
                ? <>For {renderHostText(finderTopRecommendation.host)}</>
                : 'Adjust your profile for better fit'}
            </small>
          </article>
        </div>

        <div className={s.finderInsightActions}>
          <button type="button" onClick={() => jumpToSection('rankings')}>View rankings</button>
          <button type="button" className={s.finderInsightPrimary} onClick={syncFinderToCompare}>
            Sync top {compareSlotCapacity} to compare
          </button>
          <button type="button" onClick={() => openSavingsForHost(finderBudgetChampion, 'finder')}>Model savings</button>
        </div>
      </div>
    </>
  );
}
