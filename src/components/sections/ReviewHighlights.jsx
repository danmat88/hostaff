function ReviewHighlights({ items }) {
  return (
    <div className="review-highlights">
      {items.map((item) => (
        <article key={`${item.author}-${item.project}`} className="quote-card">
          <p className="quote-text">"{item.quote}"</p>
          <p className="quote-author">{item.author}</p>
          <p className="quote-project">{item.project}</p>
        </article>
      ))}
    </div>
  )
}

export default ReviewHighlights
