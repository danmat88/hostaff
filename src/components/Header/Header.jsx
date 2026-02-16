import { useState, useEffect } from 'react';
import s from './Header.module.css';

const NAV = [
  { id: 'home', label: 'Overview' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'compare', label: 'Compare' },
  { id: 'write', label: 'Write Review' },
];

export default function Header({ active, onNav }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header className={`${s.header} ${scrolled ? s.scrolled : ''}`}>
      <div className={s.inner}>
        <button className={s.brand} onClick={() => { onNav('home'); setOpen(false); }}>
          <div className={s.logoMark}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4h14v2H3zM3 9h10v2H3zM3 14h14v2H3z" fill="url(#g)" />
              <defs><linearGradient id="g" x1="3" y1="4" x2="17" y2="16"><stop stopColor="#3b82f6"/><stop offset="1" stopColor="#8b5cf6"/></linearGradient></defs>
            </svg>
          </div>
          <div className={s.brandText}>
            <span className={s.brandName}>HostLab</span>
            <span className={s.brandTag}>Hosting Intelligence</span>
          </div>
        </button>

        <nav className={`${s.nav} ${open ? s.navOpen : ''}`}>
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`${s.navLink} ${active === n.id ? s.active : ''}`}
              onClick={() => { onNav(n.id); setOpen(false); }}
            >
              {n.label}
              {active === n.id && <span className={s.indicator} />}
            </button>
          ))}
        </nav>

        <div className={s.actions}>
          <div className={s.status}>
            <span className={s.dot} />
            <span className={s.statusText}>Live Data</span>
          </div>
          <button className={s.cta}>Get Started</button>
          <button className={s.burger} onClick={() => setOpen(!open)}>
            <span className={`${s.line} ${open ? s.lineOpen : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
