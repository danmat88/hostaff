import VsBattle from '../VsBattle/VsBattle';
import s from './Hero.module.css';

export default function Hero({ onNav }) {
  return (
    <section className={s.hero}>
      {/* Ambient bg effects */}
      <div className={s.orb1} />
      <div className={s.orb2} />

      <div className={s.grid}>
        <div className={s.left}>
          <div className={s.pill}>
            <span className={s.pillDot} />
            Trusted by 50,000+ developers worldwide
          </div>

          <h1 className={s.h1}>
            <span className={s.line1}>Put hosts</span>
            <span className={s.highlight}>Head to Head</span>
            <span className={s.line3}>and pick your winner.</span>
          </h1>

          <p className={s.sub}>
            Real benchmarks. Verified developer reviews. Side-by-side battle mode.
            Watch hosts compete on the metrics that actually matter.
          </p>

          <div className={s.ctas}>
            <button className={s.primary} onClick={() => onNav('compare')}>
              Compare All Hosts
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
            <button className={s.secondary} onClick={() => onNav('reviews')}>
              Read Reviews
            </button>
          </div>

          <div className={s.stats}>
            {[
              { val: '5,200+', label: 'Reviews' },
              { val: '99.9%', label: 'Accuracy' },
              { val: '24/7', label: 'Monitoring' },
            ].map((item) => (
              <div key={item.label} className={s.stat}>
                <span className={s.statVal}>{item.val}</span>
                <span className={s.statLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={s.right}>
          <VsBattle />
        </div>
      </div>
    </section>
  );
}
