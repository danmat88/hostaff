function formatValue(value, type) {
  if (type === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (type === 'number') {
    return `${value}`
  }

  return value
}

function FeatureMatrix({ providers, features }) {
  if (!providers.length) {
    return <div className="empty-state">No providers available for this matrix.</div>
  }

  return (
    <div className="feature-wrap">
      <table className="feature-table">
        <thead>
          <tr>
            <th>Capability</th>
            {providers.map((provider) => (
              <th key={provider.id}>{provider.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr key={feature.key}>
              <td>{feature.label}</td>
              {providers.map((provider) => (
                <td key={`${provider.id}-${feature.key}`}>
                  {formatValue(provider.features[feature.key], feature.type)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default FeatureMatrix
