import s from '../../App.module.css';

function FeatureIcon({ type }) {
  if (type === 'security') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3 5 6v5c0 4.2 2.5 8 7 10 4.5-2 7-5.8 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="m9.3 11.8 1.8 1.8 3.7-3.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'backup') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <ellipse cx="12" cy="6.5" rx="6.8" ry="3.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5.2 6.5v7.3c0 1.8 3 3.2 6.8 3.2s6.8-1.4 6.8-3.2V6.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 10.1V14m0 0-1.7-1.7M12 14l1.7-1.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'speed') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M13.5 2 6 13h5l-1 9 8-12h-5.2L13.5 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'support') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 10a6 6 0 1 1 12 0v4.5a1.5 1.5 0 0 1-1.5 1.5H15" stroke="currentColor" strokeWidth="1.7" />
        <rect x="4" y="10.5" width="3.4" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
        <rect x="16.6" y="10.5" width="3.4" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (type === 'scale') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4.5 8.5h15M4.5 12h15M4.5 15.5h15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <rect x="3.5" y="5" width="17" height="14" rx="2.4" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (type === 'migration') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 8h12m0 0-3-3m3 3-3 3M18 16H6m0 0 3 3m-3-3 3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'commerce') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4.5 7h15l-1.1 6.1a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5.9 6.9" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="10" cy="18.5" r="1.3" fill="currentColor" />
        <circle cx="16" cy="18.5" r="1.3" fill="currentColor" />
        <path d="M3.5 5.1h2.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8.7 12.1 2.1 2.1 4.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function SpecIcon({ label }) {
  const l = label.toLowerCase();
  if (l.includes('vcpu') || l.includes('cpu')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="6" y="6" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (l.includes('ram')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="8" width="16" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 8V5m3 3V5m3 3V5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4 14h16" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (l.includes('storage') || l.includes('disk')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <ellipse cx="12" cy="7" rx="7" ry="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5 7v10c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V7" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (l.includes('site') || l.includes('wp install')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 4c-2.2 2.8-3.4 5.3-3.4 8s1.2 5.2 3.4 8M12 4c2.2 2.8 3.4 5.3 3.4 8S14.2 17.2 12 20" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4.3 9.5h15.4M4.3 14.5h15.4" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (l.includes('email')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3.5" y="6.5" width="17" height="12" rx="1.8" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3.5 8.5l8.5 5.5 8.5-5.5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (l.includes('ssh') || l.includes('root')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="14" rx="1.8" stroke="currentColor" strokeWidth="1.7" />
        <path d="M7 10.5l3.2 2-3.2 2M13 14.5h4" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (l.includes('white') || l.includes('client') || l.includes('cpanel') || l.includes('whm')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 19.5c0-3.6 2.7-6.5 6-6.5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="16" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M13.5 19.5c0-3 2-5.3 4.5-5.5h2" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (l.includes('staging')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="18" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.5 6h7M7.2 8l-1.7 7.5M16.8 8l1.7 7.5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (l.includes('update') || l.includes('auto') || l.includes('sync')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.5 12a7.5 7.5 0 1 1 1.4 4.3" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4.5 18.5V14h4.5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (l.includes('control') || l.includes('panel')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="4" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.7" />
        <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.7" />
        <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.7" />
        <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (l.includes('backup')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <ellipse cx="12" cy="6.5" rx="6.8" ry="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5.2 6.5v7.3c0 1.4 3 2.5 6.8 2.5s6.8-1.1 6.8-2.5V6.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 11v4m0 0-1.8-1.8M12 15l1.8-1.8" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (l.includes('cloud') || l.includes('cdn')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 10.5a4.5 4.5 0 0 0-4.5-4.5 4.5 4.5 0 0 0-4.3 3.1A3.5 3.5 0 1 0 7.5 16h9a3.5 3.5 0 0 0 1.5-6.7" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (l.includes('scal')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 4h5v5M9 20H4v-5M20 4l-6 6M4 20l6-6" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (l.includes('apm') || l.includes('monitor') || l.includes('http') || l.includes('security') || l.includes('shield') || l.includes('dedicated') || l.includes('server')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3.5" y="6" width="17" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="3.5" y="14" width="17" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="7.5" cy="8.75" r="1" fill="currentColor" stroke="none" />
        <circle cx="7.5" cy="16.75" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function RatingStars({ rating }) {
  const floor = Math.floor(rating);
  const fraction = rating - floor;

  return (
    <div className={s.stars} aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < floor;
        const half = !filled && index === floor && fraction >= 0.25;
        const uid = `star-half-${index}`;
        return (
          <svg
            key={`star-${index + 1}`}
            className={`${s.star} ${filled ? s.starFilled : ''} ${half ? s.starHalfFilled : ''}`}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {half && (
              <defs>
                <linearGradient id={uid} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="50%" stopColor="#f5a524" />
                  <stop offset="50%" stopColor="#f5a524" stopOpacity={0} />
                </linearGradient>
              </defs>
            )}
            <path
              d="M12 2.5l2.87 5.8 6.4.93-4.63 4.5 1.09 6.37L12 17.07 6.27 20.1l1.09-6.37-4.63-4.5 6.4-.93L12 2.5z"
              fill={half ? `url(#${uid})` : undefined}
            />
          </svg>
        );
      })}
    </div>
  );
}

export {
  FeatureIcon,
  SpecIcon,
  RatingStars,
};
