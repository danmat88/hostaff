function SectionHeader({ eyebrow, title, description }) {
  return (
    <header className="section-header">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="section-description">{description}</p>
    </header>
  )
}

export default SectionHeader
