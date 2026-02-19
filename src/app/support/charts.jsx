import s from '../../App.module.css';
import { currency } from './constants';

function SavingsLineChart({ monthlySpend, introPrice, renewalPrice }) {
  const W = 520;
  const H = 110;
  const MONTHS = 36;
  const PAD = { top: 18, right: 10, bottom: 22, left: 46 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const pts = Array.from({ length: MONTHS }, (_, i) => ({
    m: i + 1,
    spend: monthlySpend,
    host: i < 12 ? introPrice : renewalPrice,
  }));

  const allVals = pts.flatMap((p) => [p.spend, p.host]);
  const rawMin = Math.min(...allVals);
  const rawMax = Math.max(...allVals);
  const pad = (rawMax - rawMin) * 0.22 || rawMax * 0.15 || 1;
  const minVal = Math.max(0, rawMin - pad);
  const maxVal = rawMax + pad;
  const range = maxVal - minVal;

  const xs = (m) => ((m - 1) / (MONTHS - 1)) * chartW;
  const ys = (v) => chartH - ((v - minVal) / range) * chartH;

  const spendPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${xs(p.m).toFixed(1)},${ys(p.spend).toFixed(1)}`).join(' ');
  const hostPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${xs(p.m).toFixed(1)},${ys(p.host).toFixed(1)}`).join(' ');
  const hostFillPath = `${hostPath} L${xs(MONTHS).toFixed(1)},${ys(minVal).toFixed(1)} L${xs(1).toFixed(1)},${ys(minVal).toFixed(1)} Z`;

  const divX = xs(12.5);
  const midTick = minVal + range * 0.5;

  return (
    <div className={s.savingsChart}>
      <div className={s.savingsChartHeader}>
        <span>Cost trajectory - 36 months</span>
        <div className={s.savingsChartLegend}>
          <span><i className={s.savingsChartLegendSpend} />Current</span>
          <span><i className={s.savingsChartLegendHost} />Host</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className={s.savingsChartSvg} aria-label="36-month cost comparison chart" role="img">
        <defs>
          <linearGradient id="hostAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1499a8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1499a8" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          <line x1={0} y1={ys(midTick).toFixed(1)} x2={chartW} y2={ys(midTick).toFixed(1)} stroke="#ede8e1" strokeWidth="1" />
          <text x={-4} y={(ys(midTick) + 3.5).toFixed(1)} textAnchor="end" fontSize="9" fill="#b0a090" fontFamily="Manrope, sans-serif">{currency.format(midTick)}</text>

          <line x1={divX.toFixed(1)} y1={0} x2={divX.toFixed(1)} y2={chartH} stroke="#ede8e1" strokeWidth="1" strokeDasharray="3 3" />
          <text x={(divX / 2).toFixed(1)} y={-5} textAnchor="middle" fontSize="8.5" fill="#b0a090" fontFamily="Manrope, sans-serif">Intro</text>
          <text x={((divX + chartW) / 2).toFixed(1)} y={-5} textAnchor="middle" fontSize="8.5" fill="#b0a090" fontFamily="Manrope, sans-serif">Renewal</text>

          <path d={hostFillPath} fill="url(#hostAreaGrad)" />
          <path d={spendPath} fill="none" stroke="#c4b8a8" strokeWidth="1.5" strokeDasharray="5 3" />
          <path d={hostPath} fill="none" stroke="#1499a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          <text x={0} y={(chartH + 14).toFixed(1)} fontSize="8.5" fill="#b0a090" fontFamily="Manrope, sans-serif">Mo 1</text>
          <text x={xs(12).toFixed(1)} y={(chartH + 14).toFixed(1)} textAnchor="middle" fontSize="8.5" fill="#b0a090" fontFamily="Manrope, sans-serif">12</text>
          <text x={chartW} y={(chartH + 14).toFixed(1)} textAnchor="end" fontSize="8.5" fill="#b0a090" fontFamily="Manrope, sans-serif">36</text>

          <circle cx={xs(12).toFixed(1)} cy={ys(introPrice).toFixed(1)} r="3" fill="#1499a8" />
          <circle cx={xs(13).toFixed(1)} cy={ys(renewalPrice).toFixed(1)} r="3" fill="#e07b35" />
        </g>
      </svg>
    </div>
  );
}

export {
  SavingsLineChart,
};
