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

function HostCardGrid({ providers }) {
  return (
    <div className="host-grid">
      {providers.map((provider, index) => (
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
            <span className="rating-pill">{provider.rating.toFixed(1)} / 5</span>
          </header>

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
      ))}
    </div>
  )
}

export default HostCardGrid
