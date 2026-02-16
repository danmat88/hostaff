import StarRating from '../StarRating/StarRating';
import ScoreBar from '../ScoreBar/ScoreBar';
import s from './HostCard.module.css';

export default function HostCard({ host, rank }) {
  const overall = Math.round((host.speed + host.uptime + host.support + host.value) / 4);

  return (
    <article className={s.card} style={{ '--c': host.color }}>
      {/* Rank & Badge */}
      <div className={s.rankCol}>
        <span className={s.rank}>#{rank}</span>
        <div className={s.overall} style={{ borderColor: `${host.color}44` }}>
          <span className={s.overallVal} style={{ color: host.color }}>{overall}</span>
          <span className={s.overallLabel}>score</span>
        </div>
      </div>

      {/* Main info */}
      <div className={s.main}>
        <div className={s.topRow}>
          <div className={s.identity}>
            <div className={s.logo} style={{ background: `${host.color}0a`, borderColor: `${host.color}20` }}>{host.logo}</div>
            <div>
              <div className={s.nameRow}>
                <h3 className={s.name}>{host.name}</h3>
                <span className={s.badge} style={{ color: host.color, borderColor: `${host.color}30` }}>{host.badge}</span>
              </div>
              <p className={s.tagline}>{host.tagline}</p>
            </div>
          </div>
          <div className={s.ratingBlock}>
            <StarRating rating={Math.round(host.rating)} size={13} />
            <span className={s.ratingInfo}>
              <strong>{host.rating}</strong> · {host.reviews.toLocaleString()} reviews
            </span>
          </div>
        </div>

        <p className={s.desc}>{host.description}</p>

        <div className={s.metricsRow}>
          <div className={s.bars}>
            <ScoreBar value={host.speed} color={host.color} label="Speed" />
            <ScoreBar value={host.uptime} color={host.color} label="Uptime" />
          </div>
          <div className={s.bars}>
            <ScoreBar value={host.support} color={host.color} label="Support" />
            <ScoreBar value={host.value} color={host.color} label="Value" />
          </div>
        </div>

        <div className={s.features}>
          {host.features.map((f) => (
            <span key={f} className={s.feat}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill={host.color}><path d="M8 0a8 8 0 110 16A8 8 0 018 0zm3.4 5.3a.6.6 0 00-.8 0L7 8.9 5.4 7.3a.6.6 0 00-.8.8l2 2a.6.6 0 00.8 0l4-4a.6.6 0 000-.8z"/></svg>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* CTA column */}
      <div className={s.ctaCol}>
        <div className={s.pricing}>
          <span className={s.oldPrice}>${host.originalPrice}/mo</span>
          <span className={s.price} style={{ color: host.color }}>${host.price}<span className={s.mo}>/mo</span></span>
          <span className={s.save}>Save {Math.round((1 - host.price / host.originalPrice) * 100)}%</span>
        </div>
        <a href={host.affiliate} className={s.cta} style={{ background: host.color }}>Visit Site →</a>
      </div>
    </article>
  );
}
