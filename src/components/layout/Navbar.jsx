function Navbar({ topProvider, favoriteCount, compareCount }) {
  return (
    <header className="site-navbar">
      <div className="nav-inner">
        <a className="brand" href="#">
          HostAff <span>Pro</span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          <a href="#compare">Compare</a>
          <a href="#decision-lab">Decision Lab</a>
          <a href="#reviews">Reviews</a>
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="nav-actions">
          <p className="nav-pick">
            Editor&apos;s pick: <strong>{topProvider.name}</strong>
          </p>
          <div className="nav-status">
            <span className="status-pill">Saved: {favoriteCount}</span>
            <span className="status-pill">Compare: {compareCount}</span>
          </div>
          <a className="button primary compact" href="#compare">
            Find Your Match
          </a>
        </div>
      </div>
    </header>
  )
}

export default Navbar
