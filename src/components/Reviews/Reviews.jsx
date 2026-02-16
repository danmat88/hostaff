import { useState } from 'react';
import { HOSTS } from '../../data/hosts';
import StarRating from '../StarRating/StarRating';
import s from './Reviews.module.css';

export default function Reviews({ reviews = [] }) {
  const [hostFilter, setHostFilter] = useState(0);
  const [sort, setSort] = useState('recent');

  let list = hostFilter ? reviews.filter((r) => r.hostId === hostFilter) : [...reviews];
  if (sort === 'helpful') list.sort((a, b) => b.helpful - a.helpful);
  else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
  else list.sort((a, b) => new Date(b.date) - new Date(a.date));

  const avgRating = list.length
    ? (list.reduce((a, r) => a + r.rating, 0) / list.length).toFixed(1)
    : '—';

  return (
    <section className={s.section}>
      <div className={s.header}>
        <h2 className={s.title}>Community Reviews</h2>
        <p className={s.subtitle}>Verified experiences from real developers</p>
      </div>

      {/* Stats bar */}
      <div className={s.statsBar}>
        <div className={s.statBlock}>
          <span className={s.statNum}>{list.length}</span>
          <span className={s.statLbl}>Reviews</span>
        </div>
        <div className={s.statDivider} />
        <div className={s.statBlock}>
          <span className={s.statNum}>{avgRating}</span>
          <span className={s.statLbl}>Avg Rating</span>
        </div>
        <div className={s.statDivider} />
        <div className={s.statBlock}>
          <span className={s.statNum}>{list.filter((r) => r.verified).length}</span>
          <span className={s.statLbl}>Verified</span>
        </div>
      </div>

      {/* Filters */}
      <div className={s.toolbar}>
        <div className={s.filters}>
          <button className={`${s.chip} ${!hostFilter ? s.chipOn : ''}`} onClick={() => setHostFilter(0)}>All Hosts</button>
          {HOSTS.map((h) => (
            <button
              key={h.id}
              className={`${s.chip} ${hostFilter === h.id ? s.chipOn : ''}`}
              style={hostFilter === h.id ? { color: h.color, borderColor: h.color, background: `${h.color}10` } : {}}
              onClick={() => setHostFilter(h.id)}
            >{h.logo} {h.name}</button>
          ))}
        </div>
        <div className={s.sortGroup}>
          {[
            { id: 'recent', label: 'Recent' },
            { id: 'helpful', label: 'Most Helpful' },
            { id: 'rating', label: 'Top Rated' },
          ].map((opt) => (
            <button
              key={opt.id}
              className={`${s.sortBtn} ${sort === opt.id ? s.sortOn : ''}`}
              onClick={() => setSort(opt.id)}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Review list */}
      <div className={s.list}>
        {list.map((r, i) => {
          const host = HOSTS.find((h) => h.id === r.hostId);
          return (
            <article key={r.id} className={s.card} style={{ animationDelay: `${i * 50}ms` }}>
              <div className={s.cardTop}>
                <div className={s.cardAvatar} style={{ borderColor: `${host?.color}33` }}>{r.avatar}</div>
                <div className={s.cardMeta}>
                  <div className={s.cardUser}>
                    <span className={s.userName}>{r.user}</span>
                    {r.verified && <span className={s.verified}>✓ Verified</span>}
                  </div>
                  <div className={s.cardSub}>
                    <StarRating rating={r.rating} size={12} />
                    <span className={s.hostChip} style={{ color: host?.color, borderColor: `${host?.color}33` }}>{host?.logo} {host?.name}</span>
                    <span className={s.date}>{r.date}</span>
                  </div>
                </div>
              </div>
              <h4 className={s.cardTitle}>{r.title}</h4>
              <p className={s.cardText}>{r.text}</p>
              <div className={s.cardFooter}>
                <button className={s.helpBtn}>👍 Helpful ({r.helpful})</button>
                <button className={s.reportBtn}>Report</button>
              </div>
            </article>
          );
        })}
      </div>

      {list.length === 0 && (
        <div className={s.empty}>
          <p>No reviews found for this filter.</p>
        </div>
      )}
    </section>
  );
}
