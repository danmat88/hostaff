function InsightsPanel({ insights }) {
  if (!insights.length) {
    return null
  }

  return (
    <section className="insights-panel" id="decision-lab" aria-label="Decision lab">
      <header>
        <p className="section-eyebrow">Decision Lab</p>
        <h3>Instant Winners By Decision Criteria</h3>
      </header>

      <div className="insight-grid">
        {insights.map((insight) => (
          <article key={insight.label} className="insight-card">
            <p className="insight-label">{insight.label}</p>
            <p className="insight-provider">{insight.provider}</p>
            <p className="insight-value">{insight.value}</p>
            <p className="insight-note">{insight.note}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default InsightsPanel
