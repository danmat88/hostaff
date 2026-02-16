function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <p className="footer-brand">HostAff Pro</p>
          <p className="footer-note">
            Hosting affiliate comparison and review framework.
          </p>
        </div>

        <div className="footer-links">
          <a href="#compare">Compare</a>
          <a href="#reviews">Reviews</a>
          <a href="#faq">FAQ</a>
          <a href="#">Disclosure</a>
        </div>

        <p className="footer-copy">(c) {currentYear} HostAff Pro</p>
      </div>
    </footer>
  )
}

export default Footer
