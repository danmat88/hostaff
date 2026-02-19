/* eslint-disable react-refresh/only-export-components */
import s from '../../App.module.css';
import { clamp } from './utils';

const RADAR_COLORS = ['#f26b1d', '#1499a8', '#6a57d6', '#157a67', '#ae5a18'];
const RADAR_DIMS = [
  { key: 'performance', label: 'Performance', shortLabel: 'Perf' },
  { key: 'support', label: 'Support', shortLabel: 'Support' },
  { key: 'value', label: 'Value', shortLabel: 'Value' },
  { key: 'uptime', label: 'Uptime', shortLabel: 'Uptime' },
  { key: 'speed', label: 'Speed', shortLabel: 'Speed' },
];

function getRadarScore(host, key) {
  if (key === 'uptime') {
    return Math.round(clamp((host.uptimePercent - 99) / 0.01, 0, 100));
  }
  if (key === 'speed') {
    return Math.round(clamp(100 - (host.ttfbMs - 200) / 8, 0, 100));
  }
  return host[key] ?? 0;
}

function getRadarCompositeScore(host) {
  const total = RADAR_DIMS.reduce((sum, dim) => sum + getRadarScore(host, dim.key), 0);
  return Math.round(total / RADAR_DIMS.length);
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function RadarChart({ hosts }) {
  const cx = 120;
  const cy = 120;
  const maxR = 90;
  const dimCount = RADAR_DIMS.length;
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

  const dimAngles = RADAR_DIMS.map((_, i) => (360 / dimCount) * i);

  const gridPoints = (fraction) =>
    dimAngles.map((angle) => {
      const pt = polarToCartesian(cx, cy, maxR * fraction, angle);
      return `${pt.x},${pt.y}`;
    }).join(' ');

  const hostPointSets = hosts.map((host) => (
    RADAR_DIMS.map((dim, i) => {
      const score = getRadarScore(host, dim.key);
      const point = polarToCartesian(cx, cy, maxR * (score / 100), dimAngles[i]);
      return { ...point, score };
    })
  ));

  const hostNames = hosts.map((host) => host.name).join(', ');
  const metricNames = RADAR_DIMS.map((dim) => dim.label).join(', ');

  return (
    <svg
      className={s.radarChart}
      viewBox="0 0 240 240"
      width="240"
      height="240"
      aria-label={`Radar comparison chart for ${hostNames} across ${metricNames}`}
      role="img"
    >
      <defs>
        {hosts.map((host, hostIndex) => {
          const color = RADAR_COLORS[hostIndex % RADAR_COLORS.length];
          return (
            <linearGradient
              key={`radar-gradient-${host.id}`}
              id={`radar-gradient-${host.id}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.08" />
            </linearGradient>
          );
        })}
      </defs>

      <circle
        cx={cx}
        cy={cy}
        r={maxR + 6}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.08"
      />

      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={gridPoints(level)}
          fill="currentColor"
          fillOpacity={Math.round(level * 100) % 40 === 0 ? 0.035 : 0}
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="1"
        />
      ))}
      {dimAngles.map((angle, i) => {
        const outer = polarToCartesian(cx, cy, maxR, angle);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke="currentColor"
            strokeOpacity="0.15"
            strokeWidth="1"
          />
        );
      })}
      {gridLevels.map((level) => {
        const scalePoint = polarToCartesian(cx, cy, maxR * level, 0);
        return (
          <text
            key={`radar-scale-${level}`}
            x={scalePoint.x + 5}
            y={scalePoint.y + 3}
            fontSize="7"
            fontWeight="700"
            fill="currentColor"
            opacity="0.48"
          >
            {Math.round(level * 100)}
          </text>
        );
      })}

      {hosts.map((host, hostIndex) => {
        const color = RADAR_COLORS[hostIndex % RADAR_COLORS.length];
        const points = hostPointSets[hostIndex];
        const polygonPoints = points.map((point) => `${point.x},${point.y}`).join(' ');
        const closedPolylinePoints = points.length
          ? `${polygonPoints} ${points[0].x},${points[0].y}`
          : polygonPoints;

        return (
          <g
            key={host.id}
            className={s.radarSeries}
            style={{ '--radar-color': color }}
          >
            <polygon
              points={polygonPoints}
              className={s.radarSeriesFill}
              fill={`url(#radar-gradient-${host.id})`}
            />
            <polyline
              points={closedPolylinePoints}
              className={s.radarSeriesStroke}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {points.map((point, dimIndex) => (
              <circle
                key={`${host.id}-radar-point-${RADAR_DIMS[dimIndex].key}`}
                className={s.radarSeriesPoint}
                cx={point.x}
                cy={point.y}
                r="3.1"
                fill="white"
                stroke={color}
                strokeWidth="1.7"
              />
            ))}
          </g>
        );
      })}

      <circle cx={cx} cy={cy} r="2.8" fill="currentColor" opacity="0.35" />

      {RADAR_DIMS.map((dim, i) => {
        const labelPt = polarToCartesian(cx, cy, maxR + 16, dimAngles[i]);
        return (
          <text
            key={dim.key}
            x={labelPt.x}
            y={labelPt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8.2"
            fontWeight="700"
            fill="currentColor"
            opacity="0.7"
            style={{
              paintOrder: 'stroke',
              stroke: 'rgba(255, 255, 255, 0.82)',
              strokeWidth: 2.2,
            }}
          >
            {dim.shortLabel}
          </text>
        );
      })}
    </svg>
  );
}

function MetricBar({ label, value }) {
  return (
    <div className={s.metricRow}>
      <span>{label}</span>
      <div className={s.metricTrack} aria-hidden="true">
        <div className={s.metricFill} style={{ width: `${value}%` }} />
      </div>
      <strong>{value}</strong>
    </div>
  );
}

export {
  RADAR_COLORS,
  RADAR_DIMS,
  getRadarScore,
  getRadarCompositeScore,
  polarToCartesian,
  RadarChart,
  MetricBar,
};
