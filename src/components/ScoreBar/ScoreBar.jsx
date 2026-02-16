import s from './ScoreBar.module.css';

export default function ScoreBar({ value, color, label }) {
  return (
    <div className={s.row}>
      <span className={s.label}>{label}</span>
      <div className={s.track}>
        <div
          className={s.fill}
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>
      <span className={s.val} style={{ color }}>{value}<span className={s.pct}>%</span></span>
    </div>
  );
}
