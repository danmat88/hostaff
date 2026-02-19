export default function ProofSidebar({ app }) {
  const {
    compactNumber,
    currency,
    getHostReviewSignal,
    isReviewComposerOpen,
    marketplaceAverageScore,
    marketplaceTopReviewedHost,
    renderHostText,
    reviewAverageSavings,
    reviewPositiveRate,
    reviewStarBuckets,
    s,
    toggleReviewComposer,
    totalHelpfulVotes,
    totalReviewSignalCount,
  } = app;

  return (
<aside className={s.reviewSidebar}>
              <div className={s.reviewSpotlight}>
                <article>
                  <span>Average rating</span>
                  <strong>{marketplaceAverageScore.toFixed(1)}/5</strong>
                  <small>Across {compactNumber.format(totalReviewSignalCount)} review signals</small>
                </article>
                <article>
                  <span>Average monthly savings</span>
                  <strong>{currency.format(reviewAverageSavings)}</strong>
                  <small>Reported user savings</small>
                </article>
                <article>
                  <span>Helpful votes</span>
                  <strong>{compactNumber.format(totalHelpfulVotes)}</strong>
                  <small>Community feedback signals across published reviews</small>
                </article>
                <article>
                  <span>Most reviewed provider</span>
                  <strong>{marketplaceTopReviewedHost ? renderHostText(marketplaceTopReviewedHost) : 'Awaiting first published review'}</strong>
                  <small>
                    {marketplaceTopReviewedHost
                      ? `${compactNumber.format(getHostReviewSignal(marketplaceTopReviewedHost.id).totalReviewCount)} total review signals`
                      : 'Add the first review to start signals'}
                  </small>
                </article>
              </div>

              <div className={`${s.reviewSentiment} ${s.reviewSentimentSidebar}`}>
                <article className={s.reviewSentimentLead}>
                  <span>Community sentiment</span>
                  <strong>{reviewPositiveRate}% positive</strong>
                  <small>Reviews rated 4.5 / 5 or higher</small>
                </article>
                <div className={s.reviewDistribution}>
                  {reviewStarBuckets.map((bucket) => (
                    <div key={`star-bucket-${bucket.star}`} className={s.reviewDistributionRow}>
                      <span>{bucket.star}★</span>
                      <div aria-hidden="true">
                        <span style={{ width: `${bucket.percent}%` }} />
                      </div>
                      <small>{bucket.count}</small>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className={s.reviewSidebarCta}
                onClick={toggleReviewComposer}
              >
                {isReviewComposerOpen ? 'Close review form' : 'Write a review'}
              </button>
            </aside>
  );
}
