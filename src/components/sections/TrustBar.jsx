function TrustBar({ badges }) {
  return (
    <div className="trust-bar" role="list" aria-label="Trust signals">
      {badges.map((badge) => (
        <article key={badge.title} className="trust-item" role="listitem">
          <h3>{badge.title}</h3>
          <p>{badge.description}</p>
        </article>
      ))}
    </div>
  )
}

export default TrustBar
