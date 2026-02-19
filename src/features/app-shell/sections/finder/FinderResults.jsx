export default function FinderResults({ app }) {
  const {
    compactNumber,
    currency,
    getHostReviewSignal,
    labProfile,
    labRecommendations,
    normalizedCompareIds,
    openSavingsForHost,
    renderHostInline,
    s,
    shortlistIds,
    toggleCompare,
    toggleShortlist,
  } = app;

  return (
    <div className={s.finderResults}>
      {labRecommendations.map((item, index) => {
        const isSaved = shortlistIds.includes(item.host.id);
        const inCompare = normalizedCompareIds.includes(item.host.id);
        const budgetDelta = labProfile.budget - item.host.priceIntro;
        const budgetDeltaCopy = budgetDelta >= 0
          ? `${currency.format(budgetDelta)} under budget`
          : `${currency.format(Math.abs(budgetDelta))} above budget`;
        const hostSignal = getHostReviewSignal(item.host.id);
        const liveRating = hostSignal.weightedScore || item.host.rating;
        const liveReviewCount = hostSignal.totalReviewCount || item.host.reviewCount;
        const starterPlan = item.host.plans?.[0] || null;

        return (
          <article key={item.host.id} className={s.finderCard}>
            <header className={s.finderCardHeader}>
              <div className={s.finderCardHeadMain}>
                <p className={s.finderMatchLabel}>Best match #{index + 1}</p>
                <h3>{renderHostInline(item.host)}</h3>
              </div>
              <div className={s.finderScore}>
                <strong>{item.score}</strong>
                <span>fit</span>
              </div>
            </header>

            <div className={s.finderCardMeta}>
              <span className={s.finderMetaCategory}>{item.host.category}</span>
              <span className={s.finderMetaPrice}>{currency.format(item.host.priceIntro)}/mo intro</span>
              <span className={s.finderMetaSupport}>{item.host.supportResponseMinutes}m support</span>
              <span className={s.finderMetaSpeed}>{item.host.ttfbMs}ms TTFB</span>
              <span className={s.finderMetaReviews}>{liveRating.toFixed(1)}? · {compactNumber.format(liveReviewCount)} reviews</span>
            </div>

            <p className={s.finderTagline}>{item.host.tagline}</p>
            {starterPlan && (
              <p className={s.finderPlanNote}>
                Starter plan: <strong>{starterPlan.name}</strong> at {currency.format(starterPlan.introMonthly)}/mo
              </p>
            )}
            <p className={`${s.finderBudgetDelta} ${budgetDelta >= 0 ? s.finderBudgetDeltaPositive : s.finderBudgetDeltaNegative}`}>
              {budgetDeltaCopy}
            </p>

            <div className={s.finderReasonBlock}>
              <p>Why this matches</p>
              <ul>
                {item.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>

            <div className={s.finderActions}>
              <button
                type="button"
                onClick={() => toggleShortlist(item.host.id)}
                className={`${s.finderActionGhost} ${isSaved ? s.finderActionGhostActive : ''}`}
              >
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => toggleCompare(item.host.id)}
                aria-pressed={inCompare}
                className={`${s.finderActionGhost} ${inCompare ? s.finderActionGhostActive : ''}`}
              >
                {inCompare ? 'In compare' : 'Add compare'}
              </button>
              <button
                type="button"
                onClick={() => openSavingsForHost(item.host, 'finder')}
                className={s.finderActionSoft}
              >
                Savings model
              </button>
              <a
                href={item.host.affiliateUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={s.finderActionPrimary}
              >
                View deal
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
