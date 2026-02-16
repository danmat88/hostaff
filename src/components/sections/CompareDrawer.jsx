const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

const COMPARISON_ROWS = [
  {
    key: 'startingPrice',
    label: 'Starting Price',
    formatter: (provider) => `${currency.format(provider.startingPrice)} / mo`,
  },
  {
    key: 'renewalPrice',
    label: 'Renewal Price',
    formatter: (provider) => `${currency.format(provider.renewalPrice)} / mo`,
  },
  {
    key: 'rating',
    label: 'Editorial Rating',
    formatter: (provider) => `${provider.rating.toFixed(1)} / 5`,
  },
  {
    key: 'speedMs',
    label: 'Tested TTFB',
    formatter: (provider) => `${provider.speedMs} ms`,
  },
  {
    key: 'uptime',
    label: 'Observed Uptime',
    formatter: (provider) => `${provider.uptime.toFixed(2)}%`,
  },
  {
    key: 'supportReplyMinutes',
    label: 'Support Response',
    formatter: (provider) => `~${provider.supportReplyMinutes} min`,
  },
  {
    key: 'moneyBackDays',
    label: 'Money-back Window',
    formatter: (provider) => `${provider.moneyBackDays} days`,
  },
]

function CompareDrawer({ providers, compareLimit, onRemoveProvider, onClear }) {
  if (!providers.length) {
    return null
  }

  return (
    <section className="compare-drawer" aria-label="Selected providers comparison">
      <div className="compare-drawer-head">
        <div>
          <p className="section-eyebrow">Live Shortlist</p>
          <h3>Compare Your Selected Providers</h3>
          <p>
            Pick up to {compareLimit} hosts. Remove any item to free another slot.
          </p>
        </div>
        <button type="button" className="button secondary compact" onClick={onClear}>
          Clear Shortlist
        </button>
      </div>

      <div className="compare-picks" role="list" aria-label="Selected providers">
        {providers.map((provider) => (
          <article key={provider.id} className="compare-pick" role="listitem">
            <div>
              <p>{provider.name}</p>
              <span>{provider.tagline}</span>
            </div>
            <button
              type="button"
              className="inline-action"
              onClick={() => onRemoveProvider(provider.id)}
            >
              Remove
            </button>
          </article>
        ))}
      </div>

      <div className="compare-drawer-table-wrap">
        <table className="compare-drawer-table">
          <thead>
            <tr>
              <th>Metric</th>
              {providers.map((provider) => (
                <th key={provider.id}>{provider.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.key}>
                <td>{row.label}</td>
                {providers.map((provider) => (
                  <td key={`${provider.id}-${row.key}`}>{row.formatter(provider)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default CompareDrawer
