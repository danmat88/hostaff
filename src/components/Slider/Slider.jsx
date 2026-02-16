import { useState, useEffect, useCallback, useRef } from 'react';
import { HOSTS } from '../../data/hosts';
import StarRating from '../StarRating/StarRating';
import ScoreBar from '../ScoreBar/ScoreBar';
import s from './Slider.module.css';

export default function Slider() {
  const [idx, setIdx] = useState(0);
  const autoRef = useRef(null);

  const go = useCallback((i) => {
    setIdx(i);
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setIdx((p) => (p + 1) % HOSTS.length), 5500);
  }, []);

  useEffect(() => {
    autoRef.current = setInterval(() => setIdx((p) => (p + 1) % HOSTS.length), 5500);
    return () => clearInterval(autoRef.current);
  }, []);

  const host = HOSTS[idx];

  return (
    <div className={s.wrap}>
      {/* Ambient glow */}
      <div className={s.glow} style={{ background: `radial-gradient(600px circle at 50% 40%, ${host.color}10, transparent 70%)` }} />

      <div className={s.card}>
        {/* Top bar */}
        <div className={s.topBar}>
          <span className={s.badge} style={{ color: host.color, background: `${host.color}12`, borderColor: `${host.color}25` }}>{host.badge}</span>
          <div className={s.progress}>
            {HOSTS.map((_, i) => (
              <button key={i} onClick={() => go(i)} className={`${s.pip} ${i === idx ? s.pipOn : ''}`}>
                {i === idx && <span className={s.pipFill} style={{ background: host.color }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Content - keyed for animation */}
        <div className={s.body} key={idx}>
          <div className={s.hostRow}>
            <div className={s.avatar} style={{ background: `${host.color}0c`, borderColor: `${host.color}22` }}>
              <span className={s.emoji}>{host.logo}</span>
            </div>
            <div className={s.hostInfo}>
              <h3 className={s.name}>{host.name}</h3>
              <p className={s.tag}>{host.tagline}</p>
            </div>
            <div className={s.priceBlock}>
              <span className={s.oldPrice}>${host.originalPrice}</span>
              <span className={s.price} style={{ color: host.color }}>${host.price}<span className={s.mo}>/mo</span></span>
            </div>
          </div>

          <div className={s.ratingRow}>
            <StarRating rating={Math.round(host.rating)} size={14} />
            <span className={s.ratingNum}>{host.rating}</span>
            <span className={s.ratingCount}>{host.reviews.toLocaleString()} reviews</span>
          </div>

          <p className={s.desc}>{host.description}</p>

          <div className={s.scores}>
            <ScoreBar value={host.speed} color={host.color} label="Speed" />
            <ScoreBar value={host.uptime} color={host.color} label="Uptime" />
            <ScoreBar value={host.support} color={host.color} label="Support" />
            <ScoreBar value={host.value} color={host.color} label="Value" />
          </div>

          <div className={s.tags}>
            {host.features.slice(0, 4).map((f) => (
              <span key={f} className={s.featureTag}>{f}</span>
            ))}
          </div>

          <a href={host.affiliate} className={s.ctaBtn} style={{ background: host.color }}>
            Visit {host.name} — Save {Math.round((1 - host.price / host.originalPrice) * 100)}%
            <span className={s.arrow}>→</span>
          </a>
        </div>

        {/* Nav arrows */}
        <button className={`${s.arw} ${s.arwL}`} onClick={() => go((idx - 1 + HOSTS.length) % HOSTS.length)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button className={`${s.arw} ${s.arwR}`} onClick={() => go((idx + 1) % HOSTS.length)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}
