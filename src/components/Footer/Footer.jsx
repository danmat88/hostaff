import s from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.top}>
          <div className={s.brand}>
            <div className={s.logoRow}>
              <div className={s.mark}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M3 4h14v2H3zM3 9h10v2H3zM3 14h14v2H3z" fill="url(#fg)" />
                  <defs><linearGradient id="fg" x1="3" y1="4" x2="17" y2="16"><stop stopColor="#3b82f6"/><stop offset="1" stopColor="#8b5cf6"/></linearGradient></defs>
                </svg>
              </div>
              <span className={s.brandName}>HostLab</span>
            </div>
            <p className={s.brandDesc}>AI-powered hosting intelligence. Real benchmarks, verified reviews, unbiased analysis.</p>
          </div>

          <div className={s.col}>
            <h4 className={s.colTitle}>Platform</h4>
            <a href="#" className={s.link}>Compare Hosts</a>
            <a href="#" className={s.link}>Reviews</a>
            <a href="#" className={s.link}>Benchmarks</a>
            <a href="#" className={s.link}>API</a>
          </div>
          <div className={s.col}>
            <h4 className={s.colTitle}>Resources</h4>
            <a href="#" className={s.link}>Documentation</a>
            <a href="#" className={s.link}>Changelog</a>
            <a href="#" className={s.link}>Status</a>
            <a href="#" className={s.link}>Blog</a>
          </div>
          <div className={s.col}>
            <h4 className={s.colTitle}>Company</h4>
            <a href="#" className={s.link}>About</a>
            <a href="#" className={s.link}>Affiliates</a>
            <a href="#" className={s.link}>Privacy</a>
            <a href="#" className={s.link}>Terms</a>
          </div>
        </div>

        <div className={s.bottom}>
          <span className={s.copy}>© {new Date().getFullYear()} HostLab · All rights reserved</span>
          <span className={s.disc}>Affiliate disclosure: We may earn commissions from qualifying purchases.</span>
          <div className={s.terminal}>
            <span className={s.prompt}>$</span> v2.4.1 · built with ⚡
          </div>
        </div>
      </div>
    </footer>
  );
}
