const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

function toTitleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function ComparisonTable({
  providers,
  favoriteIds,
  compareIds,
  compareLimit,
  onToggleFavorite,
  onToggleCompare,
}) {
  if (!providers.length) {
    return (
      <div className="empty-state">
        No providers matched this filter stack. Reset filters or lower constraints.
      </div>
    )
  }

  return (
    <div className="compare-wrap">
      <table className="compare-table">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Rating</th>
            <th>Price</th>
            <th>Renewal</th>
            <th>Uptime</th>
            <th>Speed</th>
            <th>Best For</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((provider, index) => {
            const isFavorite = favoriteIds.includes(provider.id)
            const isCompared = compareIds.includes(provider.id)
            const isCompareDisabled = !isCompared && compareIds.length >= compareLimit

            return (
              <tr key={provider.id}>
                <td>
                  <div className="provider-cell">
                    <div>
                      <p className="provider-name">{provider.name}</p>
                      <p className="provider-tagline">{provider.tagline}</p>
                    </div>
                    {index === 0 && <span className="badge-top">Top Match</span>}
                  </div>
                </td>
                <td>{provider.rating.toFixed(1)} / 5</td>
                <td>{currency.format(provider.startingPrice)} / mo</td>
                <td>{currency.format(provider.renewalPrice)} / mo</td>
                <td>{provider.uptime.toFixed(2)}%</td>
                <td>{provider.speedMs} ms</td>
                <td className="best-for-cell">
                  {provider.bestFor.slice(0, 2).map((segment) => (
                    <span key={`${provider.id}-${segment}`}>{toTitleCase(segment)}</span>
                  ))}
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      type="button"
                      className={`inline-action ${isFavorite ? 'is-active' : ''}`}
                      onClick={() => onToggleFavorite(provider.id)}
                    >
                      {isFavorite ? 'Saved' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className={`inline-action ${isCompared ? 'is-active' : ''}`}
                      onClick={() => onToggleCompare(provider.id)}
                      disabled={isCompareDisabled}
                    >
                      {isCompared ? 'Selected' : 'Compare'}
                    </button>
                    <a
                      className="button primary compact table-cta"
                      href={provider.affiliateUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit Deal
                    </a>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ComparisonTable
