import { useState } from 'react';
import { HOSTS } from '../../data/hosts';
import StarRating from '../StarRating/StarRating';
import s from './Compare.module.css';

export default function Compare() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(2);
  const ha = HOSTS.find((h) => h.id === a);
  const hb = HOSTS.find((h) => h.id === b);
  const metrics = [
    { k: 'speed', l: 'Speed' }, { k: 'uptime', l: 'Uptime' },
    { k: 'support', l: 'Support' }, { k: 'value', l: 'Value' },
  ];

  const oa = Math.round((ha.speed + ha.uptime + ha.support + ha.value) / 4);
  const ob = Math.round((hb.speed + hb.uptime + hb.support + hb.value) / 4);

  return (
    <section className={s.section}>
      <div className={s.header}>
        <h2 className={s.title}>Compare Hosts</h2>
        <p className={s.subtitle}>Side-by-side performance analysis</p>
      </div>

      {/* Selectors */}
      <div className={s.selectors}>
        <div className={s.selBox}>
          <label className={s.selLabel}>Host A</label>
          <select className={s.sel} value={a} onChange={(e) => setA(+e.target.value)} style={{ borderColor: `${ha.color}33` }}>
            {HOSTS.map((h) => <option key={h.id} value={h.id}>{h.logo} {h.name}</option>)}
          </select>
        </div>
        <div className={s.vs}>VS</div>
        <div className={s.selBox}>
          <label className={s.selLabel}>Host B</label>
          <select className={s.sel} value={b} onChange={(e) => setB(+e.target.value)} style={{ borderColor: `${hb.color}33` }}>
            {HOSTS.map((h) => <option key={h.id} value={h.id}>{h.logo} {h.name}</option>)}
          </select>
        </div>
      </div>

      <div className={s.grid}>
        {/* Host A card */}
        <div className={s.hostCard} style={{ borderColor: `${ha.color}22` }}>
          <div className={s.hcLogo} style={{ background: `${ha.color}0c`, borderColor: `${ha.color}22` }}>{ha.logo}</div>
          <h3 className={s.hcName}>{ha.name}</h3>
          <p className={s.hcTag}>{ha.tagline}</p>
          <div className={s.hcRating}><StarRating rating={Math.round(ha.rating)} size={13} /><span style={{ color: 'var(--amber)' }}>{ha.rating}</span></div>
          <div className={s.hcScore} style={{ borderColor: `${ha.color}33`, color: ha.color }}>{oa}<span>score</span></div>
          <div className={s.hcPrice}><s>${ha.originalPrice}</s><strong style={{ color: ha.color }}>${ha.price}</strong>/mo</div>
        </div>

        {/* Metrics center */}
        <div className={s.metricsPanel}>
          {metrics.map((m) => {
            const va = ha[m.k], vb = hb[m.k];
            const win = va > vb ? 'a' : vb > va ? 'b' : 'tie';
            return (
              <div key={m.k} className={s.metricRow}>
                <span className={`${s.mVal} ${win === 'a' ? s.mWin : ''}`} style={win === 'a' ? { color: ha.color } : {}}>{va}%</span>
                <div className={s.mCenter}>
                  <div className={s.mBars}>
                    <div className={s.mBarL}><div className={s.mFillL} style={{ width: `${va}%`, background: ha.color }} /></div>
                    <div className={s.mBarR}><div className={s.mFillR} style={{ width: `${vb}%`, background: hb.color }} /></div>
                  </div>
                  <span className={s.mLabel}>{m.l}</span>
                </div>
                <span className={`${s.mVal} ${win === 'b' ? s.mWin : ''}`} style={win === 'b' ? { color: hb.color } : {}}>{vb}%</span>
              </div>
            );
          })}

          {/* Features comparison */}
          <div className={s.featSection}>
            <span className={s.featTitle}>Key Features</span>
            <div className={s.featGrid}>
              <div className={s.featCol}>
                {ha.features.map((f) => <span key={f} className={s.featItem} style={{ color: ha.color, borderColor: `${ha.color}25` }}>✓ {f}</span>)}
              </div>
              <div className={s.featCol}>
                {hb.features.map((f) => <span key={f} className={s.featItem} style={{ color: hb.color, borderColor: `${hb.color}25` }}>✓ {f}</span>)}
              </div>
            </div>
          </div>

          {/* Pros comparison */}
          <div className={s.featSection}>
            <span className={s.featTitle}>Pros</span>
            <div className={s.featGrid}>
              <div className={s.featCol}>
                {ha.pros.map((p) => <span key={p} className={s.proItem}>+ {p}</span>)}
              </div>
              <div className={s.featCol}>
                {hb.pros.map((p) => <span key={p} className={s.proItem}>+ {p}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Host B card */}
        <div className={s.hostCard} style={{ borderColor: `${hb.color}22` }}>
          <div className={s.hcLogo} style={{ background: `${hb.color}0c`, borderColor: `${hb.color}22` }}>{hb.logo}</div>
          <h3 className={s.hcName}>{hb.name}</h3>
          <p className={s.hcTag}>{hb.tagline}</p>
          <div className={s.hcRating}><StarRating rating={Math.round(hb.rating)} size={13} /><span style={{ color: 'var(--amber)' }}>{hb.rating}</span></div>
          <div className={s.hcScore} style={{ borderColor: `${hb.color}33`, color: hb.color }}>{ob}<span>score</span></div>
          <div className={s.hcPrice}><s>${hb.originalPrice}</s><strong style={{ color: hb.color }}>${hb.price}</strong>/mo</div>
        </div>
      </div>
    </section>
  );
}
