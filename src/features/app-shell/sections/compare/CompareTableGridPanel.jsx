export default function CompareTableGridPanel({ app }) {
  const {
    compactNumber,
    compareHosts,
    currency,
    formatVerifiedDate,
    getHostReviewSignal,
    hasActiveCompareFilters,
    renderHostInline,
    s,
    visibleCompareRows,
  } = app;

  return (
<div className={s.compareTableWrap}>
            <table className={s.compareTable}>
              <thead>
                <tr>
                  <th>Metric</th>
                  {compareHosts.map((host) => {
                    const hostSignal = getHostReviewSignal(host.id);
                    const liveRating = hostSignal.weightedScore || host.rating;
                    const liveReviewCount = hostSignal.totalReviewCount || host.reviewCount;
                    const verifiedDateLabel = formatVerifiedDate(host.lastVerified);
                    const pricingSource = host.dataSources?.pricing || '';
                    const infraSource = host.dataSources?.infrastructure || '';

                    return (
                      <th key={host.id}>
                        <div className={s.compareHead}>
                          <strong>{renderHostInline(host)}</strong>
                          <span>{host.category} · {host.planType}</span>
                          <small>
                            {currency.format(host.priceIntro)}/mo intro
                            {' · '}
                            {liveRating.toFixed(1)}★ ({compactNumber.format(liveReviewCount)} reviews)
                          </small>
                          <small>Verified {verifiedDateLabel}</small>
                          <div className={s.compareHeadLinks}>
                            {pricingSource && (
                              <a href={pricingSource} target="_blank" rel="noreferrer noopener">Pricing source</a>
                            )}
                            {infraSource && (
                              <a href={infraSource} target="_blank" rel="noreferrer noopener">Infra source</a>
                            )}
                          </div>
                          <a href={host.affiliateUrl} target="_blank" rel="noreferrer noopener">View deal</a>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visibleCompareRows.length ? visibleCompareRows.map((row) => (
                  <tr key={row.label} id={`compare-metric-${row.id}`} className={!row.hasDifference ? s.compareTableRowEqual : ''}>
                    <th>{row.label}</th>
                    {row.values.map((value, index) => {
                      const comparableValue = row.compareValues[index];
                      const isBest = row.canHighlightBest
                        && Number.isFinite(comparableValue)
                        && Number.isFinite(row.best)
                        && Math.abs(comparableValue - row.best) < 0.0001;
                      return (
                        <td key={`${row.label}-${compareHosts[index].id}`} className={isBest ? s.bestCell : ''}>
                          <span>{row.format(value)}</span>
                          {isBest && <small>Best</small>}
                        </td>
                      );
                    })}
                  </tr>
                )) : (
                  <tr>
                    <th colSpan={compareHosts.length + 1} className={s.compareTableEmpty}>
                      {hasActiveCompareFilters
                        ? 'No metrics match the current compare filters.'
                        : 'Selected providers are tied across the current metric set.'}
                    </th>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
  );
}
