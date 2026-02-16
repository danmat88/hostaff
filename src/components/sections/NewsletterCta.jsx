function NewsletterCta() {
  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <section className="newsletter-panel" aria-label="Newsletter call to action">
      <div>
        <p className="newsletter-kicker">Weekly Hosting Signals</p>
        <h2>Get Pricing Changes And Migration Alerts Every Monday</h2>
        <p>
          Receive short updates on discount shifts, renewal changes, and new host
          testing notes.
        </p>
      </div>

      <form className="newsletter-form" onSubmit={handleSubmit}>
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          placeholder="you@company.com"
          required
        />
        <button type="submit" className="button primary">
          Subscribe
        </button>
      </form>
    </section>
  )
}

export default NewsletterCta
