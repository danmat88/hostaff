import { useState } from 'react'

function NewsletterCta() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  function handleSubmit(event) {
    event.preventDefault()

    try {
      window.localStorage.setItem('hostaff.newsletterEmail', email)
    } catch {
      // Ignore storage write issues while still confirming submit intent.
    }

    setEmail('')
    setStatus('success')
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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button type="submit" className="button primary">
          Subscribe
        </button>
      </form>

      <p className={`newsletter-note ${status === 'success' ? 'is-success' : ''}`}>
        {status === 'success'
          ? 'Subscribed. You are on the next update list.'
          : 'No spam. One concise update every Monday.'}
      </p>
    </section>
  )
}

export default NewsletterCta
