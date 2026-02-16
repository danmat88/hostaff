function ScoreMeter({ label, value }) {
  return (
    <div className="score-row">
      <div className="score-labels">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="score-track" aria-hidden="true">
        <div className="score-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function toTitleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function HostCardGrid({
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
        No providers matched this filter stack. Relax constraints to view cards.
      </div>
    )
  }

  return (
    <div className="host-grid">
      {providers.map((provider, index) => {
        const isFavorite = favoriteIds.includes(provider.id)
        const isCompared = compareIds.includes(provider.id)
        const isCompareDisabled = !isCompared && compareIds.length >= compareLimit

        return (
          <article
            key={provider.id}
            className={`host-card ${index === 0 ? 'is-top' : ''}`}
            aria-label={`${provider.name} review card`}
          >
            <header className="host-card-header">
              <div>
                <p className="host-name">{provider.name}</p>
                <p className="host-tagline">{provider.tagline}</p>
              </div>
              <div className="host-card-actions">
                <span className="rating-pill">{provider.rating.toFixed(1)} / 5</span>
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
              </div>
            </header>

            <div className="best-fit-tags">
              {provider.bestFor.map((segment) => (
                <span key={`${provider.id}-${segment}`}>{toTitleCase(segment)}</span>
              ))}
            </div>

            <div className="price-strip">
              <div>
                <span>Starts at</span>
                <strong>${provider.startingPrice.toFixed(2)} / mo</strong>
              </div>
              <div>
                <span>Renews at</span>
                <strong>${provider.renewalPrice.toFixed(2)} / mo</strong>
              </div>
              <div>
                <span>Money-back</span>
                <strong>{provider.moneyBackDays} days</strong>
              </div>
            </div>

            <div className="meta-strip">
              <span>{provider.speedMs} ms tested TTFB</span>
              <span>{provider.uptime.toFixed(2)}% uptime</span>
              <span>~{provider.supportReplyMinutes} min support</span>
            </div>

            <div className="score-grid">
              <ScoreMeter label="Value" value={provider.valueScore} />
              <ScoreMeter label="Reliability" value={provider.reliabilityScore} />
              <ScoreMeter label="Performance" value={provider.performanceScore} />
              <ScoreMeter label="Support" value={provider.supportScore} />
            </div>

            <div className="card-points">
              <div>
                <p className="points-title">Why It Wins</p>
                <ul className="point-list">
                  {provider.strengths.map((item) => (
                    <li key={`${provider.id}-strength-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="points-title">Watchouts</p>
                <ul className="point-list tradeoffs">
                  {provider.tradeoffs.map((item) => (
                    <li key={`${provider.id}-tradeoff-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <footer className="host-card-footer">
              <p>{provider.promotion}</p>
              <a
                className="button secondary compact"
                href={provider.affiliateUrl}
                target="_blank"
                rel="noreferrer"
              >
                Get Offer
              </a>
            </footer>
          </article>
        )
      })}
    </div>
  )
}

export default HostCardGrid
