function Navbar({ topProvider }) {
  return (
    <header className="site-navbar">
      <div className="nav-inner">
        <a className="brand" href="#">
          HostAff <span>Pro</span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          <a href="#compare">Compare</a>
          <a href="#reviews">Reviews</a>
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="nav-actions">
          <p className="nav-pick">
            Editor&apos;s pick: <strong>{topProvider.name}</strong>
          </p>
          <a className="button primary compact" href="#compare">
            Find Your Match
          </a>
        </div>
      </div>
    </header>
  )
}

export default Navbar
