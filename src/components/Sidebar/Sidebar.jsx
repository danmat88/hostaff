import { HOSTS } from '../../data/hosts';
import s from './Sidebar.module.css';

export default function Sidebar({ onNav }) {
  const sorted = [...HOSTS].sort((a, b) => b.rating - a.rating);

  return (
    <aside className={s.sidebar}>
      {/* Nav panel */}
      <div className={s.panel}>
        <h3 className={s.panelTitle}>Navigation</h3>
        {[
          { id: 'home', icon: '⌘', label: 'Overview' },
          { id: 'reviews', icon: '✦', label: 'All Reviews' },
          { id: 'compare', icon: '⇌', label: 'Compare Hosts' },
          { id: 'write', icon: '✎', label: 'Write Review' },
        ].map((item) => (
          <button key={item.id} className={s.navBtn} onClick={() => onNav(item.id)}>
            <span className={s.navIcon}>{item.icon}</span>
            {item.label}
            <svg className={s.navArrow} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className={s.panel}>
        <h3 className={s.panelTitle}>Leaderboard</h3>
        <div className={s.board}>
          {sorted.map((h, i) => (
            <div key={h.id} className={s.boardRow}>
              <span className={s.boardRank} style={{ color: i === 0 ? 'var(--amber)' : 'var(--text-muted)' }}>
                {i === 0 ? '🏆' : `#${i + 1}`}
              </span>
              <span className={s.boardEmoji}>{h.logo}</span>
              <div className={s.boardInfo}>
                <span className={s.boardName}>{h.name}</span>
                <span className={s.boardRating}>★ {h.rating}</span>
              </div>
              <span className={s.boardPrice} style={{ color: h.color }}>${h.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Promo CTA */}
      <div className={s.promo}>
        <div className={s.promoGlow} />
        <span className={s.promoTag}>LIMITED OFFER</span>
        <h4 className={s.promoTitle}>Get 50% off NeonCloud</h4>
        <p className={s.promoDesc}>Exclusive deal for HostLab readers. Use code <strong>HOSTLAB50</strong></p>
        <a href="#" className={s.promoCta}>Claim Deal →</a>
      </div>

      {/* Status */}
      <div className={s.panel}>
        <h3 className={s.panelTitle}>System</h3>
        {[
          { label: 'API Status', val: 'Online', ok: true },
          { label: 'Benchmarks', val: 'Running', ok: true },
          { label: 'Last Sync', val: '2m ago', ok: true },
        ].map((r) => (
          <div key={r.label} className={s.statusRow}>
            <span className={s.statusLabel}>{r.label}</span>
            <span className={r.ok ? s.statusOk : s.statusVal}>{r.val}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
