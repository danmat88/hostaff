import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import s from './VsBattle.module.css';
import { buildHostGoogleFaviconUrl, buildHostAvatarPlaceholder } from '../../app/support/utils';

/* ── Host brand colours (not in HOSTS data) ── */
const HOST_COLORS = {
  hostinger:    { bg: '#6741d9', accent: '#9775fa', glow: 'rgba(103,65,217,0.18)' },
  siteground:   { bg: '#49a46c', accent: '#8dd3a0', glow: 'rgba(73,164,108,0.18)' },
  cloudways:    { bg: '#2f9e9e', accent: '#63d2d2', glow: 'rgba(47,158,158,0.18)' },
  kinsta:       { bg: '#5b21b6', accent: '#a78bfa', glow: 'rgba(91,33,182,0.18)' },
  a2:           { bg: '#e85d2a', accent: '#ff8a5c', glow: 'rgba(232,93,42,0.18)' },
  scalahosting: { bg: '#0d74b8', accent: '#5db7e8', glow: 'rgba(13,116,184,0.18)' },
};

const FALLBACK_COLOR = { bg: '#607d8b', accent: '#90a4ae', glow: 'rgba(96,125,139,0.18)' };

/* ── 5 battle dimensions ── */
const METRICS = [
  { key: 'performance', label: 'Performance', max: 100, lower: false },
  { key: 'support',     label: 'Support',     max: 100, lower: false },
  { key: 'value',       label: 'Value',       max: 100, lower: false },
  { key: 'uptimePercent', label: 'Uptime',    max: 100, lower: false },
  { key: 'ttfbMs',      label: 'Speed',       max: 500, lower: true },
];

/* ── Feature chip fields ── */
const CHIP_FIELDS = [
  { key: 'freeDomain',    label: 'Free Domain' },
  { key: 'freeSsl',       label: 'Free SSL' },
  { key: 'cdnIncluded',   label: 'CDN' },
  { key: 'freeMigration', label: 'Migration' },
];

/* ── Bonus stats shown after battle ── */
const BONUS_STATS = [
  { key: 'moneyBackDays',       label: 'Money-Back',  fmt: v => v > 0 ? `${v} days` : 'None', higher: true },
  { key: 'visitCapacityMonthly', label: 'Visitors/mo', fmt: v => v >= 1000 ? `${Math.round(v / 1000)}k` : v, higher: true },
  { key: 'setupMinutes',        label: 'Setup Time',   fmt: v => `${v} min`, higher: false },
];

/* ── Helpers ── */
function fmtVal(v, m) {
  if (m.key === 'uptimePercent') return `${v}%`;
  if (m.key === 'ttfbMs') return `${v}ms`;
  return v;
}

function computeResults(a, b) {
  return METRICS.map((m) => {
    const va = a[m.key], vb = b[m.key];
    const winner = m.lower
      ? (va < vb ? 'a' : vb < va ? 'b' : 'tie')
      : (va > vb ? 'a' : vb > va ? 'b' : 'tie');
    return { ...m, va, vb, winner };
  });
}

function barPct(val, m) {
  if (m.lower) return Math.max(5, ((m.max - val) / m.max) * 100);
  return Math.max(5, (val / m.max) * 100);
}

function getColor(id) {
  return HOST_COLORS[id] || FALLBACK_COLOR;
}

function hostBadgeLabel(host) {
  return host.planType || host.activeHostingTypeLabel || host.category;
}

function getChips(host) {
  return CHIP_FIELDS.filter(f => host[f.key]).slice(0, 3).map(f => f.label);
}

function renewalSpikePct(host) {
  if (!host.priceRenewal || !host.priceIntro || host.priceRenewal <= host.priceIntro) return 0;
  return Math.round((host.priceRenewal - host.priceIntro) / host.priceIntro * 100);
}

/* ── Icons ── */
function Crown() {
  return (
    <svg className={s.crown} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20M4 16l2-12 5 5 3-7 3 7 5-5 2 12"/>
    </svg>
  );
}

function SwordIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m14.5 17.5 3 3 4-4-3-3"/>
      <path d="m3 3 7.07 7.07"/>
      <path d="m6 6 3 3"/>
      <path d="m14.5 6.5 1-1"/>
      <path d="M3 21 21 3"/>
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
      <path d="M16 21h5v-5"/>
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 3 4 4-4 4"/>
      <path d="M20 7H4"/>
      <path d="m8 21-4-4 4-4"/>
      <path d="M4 17h16"/>
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

function HddIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12H2"/>
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
      <line x1="6" y1="16" x2="6.01" y2="16"/>
      <line x1="10" y1="16" x2="10.01" y2="16"/>
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════
   VS BATTLE
   Parent sets key={activeHostingType} so the
   component fully remounts on type switch.
   ═══════════════════════════════════════════ */
export default function VsBattle({ hosts }) {
  const [hostAId, setHostAId] = useState(() => hosts[0]?.id);
  const [hostBId, setHostBId] = useState(() => hosts[1]?.id ?? hosts[0]?.id);
  const [phase, setPhase]     = useState('idle');
  const [round, setRound]     = useState(-1);
  const [pickerSide, setPickerSide] = useState(null);
  const [showFlash, setShowFlash] = useState(false);
  const timerRef = useRef([]);

  const hostA   = useMemo(() => hosts.find(h => h.id === hostAId), [hosts, hostAId]);
  const hostB   = useMemo(() => hosts.find(h => h.id === hostBId), [hosts, hostBId]);
  const colA    = getColor(hostAId);
  const colB    = getColor(hostBId);
  const results = useMemo(() => hostA && hostB ? computeResults(hostA, hostB) : [], [hostA, hostB]);

  /* ── Host images (favicon with SVG fallback) ── */
  const imgMap = useMemo(() => {
    const m = {};
    hosts.forEach(h => {
      m[h.id] = { src: buildHostGoogleFaviconUrl(h), fallback: buildHostAvatarPlaceholder(h) };
    });
    return m;
  }, [hosts]);

  const overall = useMemo(() => {
    if (!results.length) return 'tie';
    const wa = results.filter(r => r.winner === 'a').length;
    const wb = results.filter(r => r.winner === 'b').length;
    return wa > wb ? 'a' : wb > wa ? 'b' : 'tie';
  }, [results]);

  /* ── Live tally (computed from revealed rounds) ── */
  const tallyA = results.filter((r, i) => i <= round && r.winner === 'a').length;
  const tallyB = results.filter((r, i) => i <= round && r.winner === 'b').length;

  /* ── Round commentary ── */
  const commentary = useMemo(() => {
    if (round < 0 || !results[round]) return null;
    const r = results[round];
    if (r.winner === 'a') return `${hostA.name} wins ${r.label}!`;
    if (r.winner === 'b') return `${hostB.name} wins ${r.label}!`;
    return `Tied on ${r.label}!`;
  }, [round, results, hostA, hostB]);

  const commentaryColor = useMemo(() => {
    if (round < 0 || !results[round]) return null;
    const w = results[round].winner;
    return w === 'a' ? colA.bg : w === 'b' ? colB.bg : null;
  }, [round, results, colA, colB]);

  /* ── Advantage chips for winner summary ── */
  const advantageChips = useMemo(() => {
    if (!hostA || !hostB || !results.length) return [];
    const chips = [];
    const wa = results.filter(r => r.winner === 'a').length;
    const wb = results.filter(r => r.winner === 'b').length;
    const w = wa > wb ? 'a' : wb > wa ? 'b' : null;
    if (!w) return [];

    chips.push(`${Math.max(wa, wb)}/5 rounds won`);

    const winner = w === 'a' ? hostA : hostB;
    const loser = w === 'a' ? hostB : hostA;
    if (winner.priceIntro < loser.priceIntro) {
      const diff = (loser.priceIntro - winner.priceIntro).toFixed(2).replace(/\.00$/, '');
      chips.push(`Saves $${diff}/mo`);
    }

    const biggest = results
      .filter(r => r.winner === w)
      .reduce((best, r) => {
        const margin = r.lower
          ? (r.winner === 'a' ? r.vb - r.va : r.va - r.vb)
          : (r.winner === 'a' ? r.va - r.vb : r.vb - r.va);
        return margin > best.margin ? { label: r.label, margin } : best;
      }, { label: '', margin: -1 });
    if (biggest.label) {
      chips.push(`${biggest.label} leader`);
    }

    return chips.slice(0, 3);
  }, [hostA, hostB, results]);

  const clearTimers = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  const startBattle = useCallback(() => {
    clearTimers();
    setPhase('fighting');
    setRound(-1);
    setPickerSide(null);
    setShowFlash(true);
    timerRef.current.push(setTimeout(() => setShowFlash(false), 600));

    let i = 0;
    const tick = () => {
      setRound(i);
      i++;
      if (i < METRICS.length) {
        timerRef.current.push(setTimeout(tick, 600));
      } else {
        timerRef.current.push(setTimeout(() => setPhase('result'), 700));
      }
    };
    timerRef.current.push(setTimeout(tick, 650));
  }, [clearTimers]);

  /* Clean up timers on unmount */
  useEffect(() => clearTimers, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rematch = useCallback(() => {
    setPhase('idle');
    setRound(-1);
    setTimeout(startBattle, 400);
  }, [startBattle]);

  const newChallenger = useCallback(() => {
    const others = hosts.filter(h => h.id !== hostAId && h.id !== hostBId);
    if (!others.length) return;
    const pick = others[Math.floor(Math.random() * others.length)];
    clearTimers();
    setHostBId(pick.id);
    setPhase('idle');
    setRound(-1);
  }, [hosts, hostAId, hostBId, clearTimers]);

  const pickHost = useCallback((side, id) => {
    clearTimers();
    if (side === 'a') setHostAId(id);
    else setHostBId(id);
    setPickerSide(null);
    setPhase('idle');
    setRound(-1);
  }, [clearTimers]);

  const swapHosts = useCallback(() => {
    clearTimers();
    setHostAId(hostBId);
    setHostBId(hostAId);
    setPhase('idle');
    setRound(-1);
  }, [clearTimers, hostAId, hostBId]);

  useEffect(() => {
    if (!pickerSide) return;
    const close = (e) => {
      if (!e.target.closest(`.${s.picker}`)) setPickerSide(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [pickerSide]);

  if (!hostA || !hostB || hosts.length < 2) {
    return (
      <div className={s.wrap}>
        <p className={s.prompt}>Not enough providers for this hosting type to battle.</p>
      </div>
    );
  }

  const winnerHost = overall === 'a' ? hostA : overall === 'b' ? hostB : null;
  const winnerCol  = overall === 'a' ? colA  : overall === 'b' ? colB  : null;
  const loserHost  = overall === 'a' ? hostB : overall === 'b' ? hostA : null;
  const isIdle     = phase === 'idle';
  const isFighting = phase === 'fighting';
  const isResult   = phase === 'result';

  const chipsA = getChips(hostA);
  const chipsB = getChips(hostB);
  const spikeA = renewalSpikePct(hostA);
  const spikeB = renewalSpikePct(hostB);

  /* ── Glow class helpers ── */
  const glowAClass = [
    s.glowA,
    isFighting ? s.glowFight : '',
    isResult && overall === 'a' ? s.glowWin : '',
    isResult && overall === 'b' ? s.glowLose : '',
  ].filter(Boolean).join(' ');

  const glowBClass = [
    s.glowB,
    isFighting ? s.glowFight : '',
    isResult && overall === 'b' ? s.glowWin : '',
    isResult && overall === 'a' ? s.glowLose : '',
  ].filter(Boolean).join(' ');

  /* ── Card class helpers ── */
  const cardAClass = [
    s.card,
    isFighting ? s.fighting : '',
    isResult ? (overall === 'a' ? s.winner : overall === 'b' ? s.loser : '') : '',
  ].filter(Boolean).join(' ');

  const cardBClass = [
    s.card,
    isFighting ? s.fighting : '',
    isResult ? (overall === 'b' ? s.winner : overall === 'a' ? s.loser : '') : '',
  ].filter(Boolean).join(' ');

  /* ── Card renderer (DRY) ── */
  function renderCard(host, col, chips, spike, side) {
    const id = host.id;
    const isA = side === 'a';
    const showCrown = isResult && ((isA && overall === 'a') || (!isA && overall === 'b'));
    const cardCls = isA ? cardAClass : cardBClass;
    const otherHostId = isA ? hostBId : hostAId;
    const pickSideId = isA ? 'a' : 'b';

    return (
      <div className={cardCls} style={{ '--card-c': col.bg, '--card-glow': col.glow }}>
        {showCrown && <Crown />}
        <div className={s.cardTop}>
          <div className={s.avatar} style={{ borderColor: `${col.bg}30`, boxShadow: `0 0 0 3px ${col.bg}10, 0 2px 8px ${col.glow}` }}>
            <img
              className={s.avatarImg}
              src={imgMap[id]?.src}
              alt=""
              width="48"
              height="48"
              onError={(e) => { e.currentTarget.src = imgMap[id]?.fallback; }}
            />
          </div>
          <button className={s.nameBtn} onClick={() => setPickerSide(pickerSide === pickSideId ? null : pickSideId)}>
            {host.name}
            <ChevronDown />
          </button>
          <span className={s.catBadge} style={{ color: col.bg, background: `${col.bg}10`, borderColor: `${col.bg}20` }}>
            {hostBadgeLabel(host)}
          </span>
        </div>

        <div className={s.scoreRow}>
          <div className={s.scoreCircle} style={{ background: col.bg }}>
            {host.overallScore}
            <span className={s.scoreUnit}>pts</span>
          </div>
          <div className={s.priceMini}>
            <span className={s.priceVal} style={{ color: col.bg }}>${host.priceIntro}</span>
            <span className={s.priceMo}>/mo</span>
            <span className={s.renewalRow}>
              Renews ${host.priceRenewal}/mo
              {spike > 10 && <span className={s.renewalSpike}>&uarr;{spike}%</span>}
            </span>
          </div>
        </div>

        <div className={s.ratingMini}>
          <span className={s.starIcon}>★</span>
          <span className={s.ratingVal}>{host.rating}</span>
          <span className={s.ratingCnt}>({host.reviewCount.toLocaleString()})</span>
        </div>

        {host.bestFor && (
          <p className={s.bestFor}>{host.bestFor}</p>
        )}

        {host.editorBadge && (
          <span className={s.editorBadge} style={{ color: col.bg, background: `${col.bg}0a` }}>{host.editorBadge}</span>
        )}

        {chips.length > 0 && (
          <div className={s.featureChips}>
            {chips.map(chip => (
              <span key={chip} className={s.featureChip} style={{ borderColor: `${col.bg}25`, color: col.bg }}>{chip}</span>
            ))}
          </div>
        )}

        <div className={s.quickStats}>
          <div className={s.stat}>
            <span className={s.statIcon} style={{ color: col.bg, background: `${col.bg}0d` }}><GlobeIcon /></span>
            <span className={s.statVal}>{host.dataCenters}</span>
            <span className={s.statLabel}>Data Centers</span>
          </div>
          <div className={s.stat}>
            <span className={s.statIcon} style={{ color: col.bg, background: `${col.bg}0d` }}><HddIcon /></span>
            <span className={s.statVal}>{host.storageGb} GB</span>
            <span className={s.statLabel}>Storage</span>
          </div>
          <div className={s.stat}>
            <span className={s.statIcon} style={{ color: col.bg, background: `${col.bg}0d` }}><HeadsetIcon /></span>
            <span className={s.statVal}>{host.supportResponseMinutes} min</span>
            <span className={s.statLabel}>Support</span>
          </div>
        </div>

        {pickerSide === pickSideId && (
          <div className={s.picker}>
            {hosts.filter(h => h.id !== otherHostId).map(h => (
              <button key={h.id} className={`${s.pickItem} ${h.id === id ? s.pickActive : ''}`}
                      onClick={() => pickHost(pickSideId, h.id)}>
                <span className={s.pickAvatar}>
                  <img
                    className={s.pickAvatarImg}
                    src={imgMap[h.id]?.src}
                    alt=""
                    width="26"
                    height="26"
                    onError={(e) => { e.currentTarget.src = imgMap[h.id]?.fallback; }}
                  />
                </span>
                <span className={s.pickName}>{h.name}</span>
                <span className={s.pickScore}>{h.overallScore}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={s.wrap}>
      <div className={glowAClass} style={{ background: `radial-gradient(circle at 30% 30%, ${colA.glow}, transparent 70%)` }} />
      <div className={glowBClass} style={{ background: `radial-gradient(circle at 70% 30%, ${colB.glow}, transparent 70%)` }} />

      <div className={s.arena}>
        {/* ── HOST A CARD ── */}
        {renderCard(hostA, colA, chipsA, spikeA, 'a')}

        {/* ── CENTER COLUMN ── */}
        <div className={s.center}>
          <div className={s.vsWrap}>
            <div className={`${s.vsCircle} ${isFighting ? s.vsPulse : ''} ${isIdle ? s.vsIdle : ''}`}>
              <span className={s.vsText}>VS</span>
            </div>
            {showFlash && <span className={s.fightFlash}>FIGHT!</span>}
          </div>

          {/* Live score tally — always rendered to reserve height */}
          <div className={`${s.tally} ${(isFighting || isResult) && round >= 0 ? '' : s.tallyHidden}`}>
            <span
              className={`${s.tallyNum} ${tallyA > tallyB ? s.tallyLead : ''}`}
              style={tallyA > tallyB ? { color: colA.bg } : {}}
            >
              {tallyA}
            </span>
            <span className={s.tallyDash}>&mdash;</span>
            <span
              className={`${s.tallyNum} ${tallyB > tallyA ? s.tallyLead : ''}`}
              style={tallyB > tallyA ? { color: colB.bg } : {}}
            >
              {tallyB}
            </span>
          </div>

          {/* Progress dots */}
          <div className={`${s.progressDots} ${isIdle ? s.dotsIdle : ''}`}>
            {METRICS.map((m, i) => {
              const revealed = i <= round && (isFighting || isResult);
              const r = results[i];
              let dotCls = s.dot;
              if (revealed) {
                if (r?.winner === 'a') dotCls += ` ${s.dotA}`;
                else if (r?.winner === 'b') dotCls += ` ${s.dotB}`;
                else dotCls += ` ${s.dotTie}`;
              }
              return (
                <span
                  key={m.key}
                  className={dotCls}
                  style={
                    revealed && r?.winner === 'a' ? { background: colA.bg, borderColor: colA.bg }
                    : revealed && r?.winner === 'b' ? { background: colB.bg, borderColor: colB.bg }
                    : {}
                  }
                />
              );
            })}
          </div>

          {/* Round commentary */}
          <div className={s.commentaryWrap}>
            {(isFighting || isResult) && round >= 0 && commentary && (
              <span
                className={s.commentary}
                key={round}
                style={commentaryColor ? { color: commentaryColor } : {}}
              >
                {commentary}
              </span>
            )}
          </div>

          <div className={s.metrics}>
            {results.map((r, i) => {
              const visible = i <= round;
              return (
                <div key={r.key}
                     className={`${s.metricRow} ${visible ? s.metricVisible : ''} ${isIdle ? s.metricIdle : ''}`}
                     style={{ '--delay': `${i * 100}ms` }}>
                  <span className={`${s.mVal} ${s.mValL} ${visible && r.winner === 'a' ? s.mWin : ''}`}
                        style={visible && r.winner === 'a' ? { color: colA.bg } : {}}>
                    {visible && r.winner === 'a' && <span className={s.mPip} style={{ background: colA.bg }} />}
                    {visible ? fmtVal(r.va, r) : '\u2014'}
                  </span>
                  <div className={s.mCenter}>
                    <div className={s.mBars}>
                      <div className={s.mTrackL}>
                        <div className={s.mFillL}
                             style={{
                               width: visible ? `${barPct(r.va, r)}%` : '0%',
                               background: `linear-gradient(270deg, ${colA.bg}, ${colA.accent})`,
                               boxShadow: visible ? `0 0 6px ${colA.glow}` : 'none',
                             }} />
                      </div>
                      <div className={s.mTrackR}>
                        <div className={s.mFillR}
                             style={{
                               width: visible ? `${barPct(r.vb, r)}%` : '0%',
                               background: `linear-gradient(90deg, ${colB.bg}, ${colB.accent})`,
                               boxShadow: visible ? `0 0 6px ${colB.glow}` : 'none',
                             }} />
                      </div>
                    </div>
                    <span className={s.mLabel}>{r.label}</span>
                  </div>
                  <span className={`${s.mVal} ${s.mValR} ${visible && r.winner === 'b' ? s.mWin : ''}`}
                        style={visible && r.winner === 'b' ? { color: colB.bg } : {}}>
                    {visible ? fmtVal(r.vb, r) : '\u2014'}
                    {visible && r.winner === 'b' && <span className={s.mPip} style={{ background: colB.bg }} />}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bonus stats — post-battle comparison */}
          {isResult && (
            <div className={s.bonusStats}>
              {BONUS_STATS.map((bs, i) => {
                const va = hostA[bs.key];
                const vb = hostB[bs.key];
                const aWins = bs.higher ? va > vb : va < vb;
                const bWins = bs.higher ? vb > va : vb < va;
                return (
                  <div key={bs.key} className={s.bonusRow} style={{ '--delay': `${i * 80}ms` }}>
                    <span className={`${s.bonusVal} ${aWins ? s.bonusWin : ''}`} style={aWins ? { color: colA.bg } : {}}>
                      {bs.fmt(va)}
                    </span>
                    <span className={s.bonusLabel}>{bs.label}</span>
                    <span className={`${s.bonusVal} ${bWins ? s.bonusWin : ''}`} style={bWins ? { color: colB.bg } : {}}>
                      {bs.fmt(vb)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className={s.bottomSlot}>
            <div className={s.actions}>
              {phase === 'idle' && (
                <>
                  <button className={s.battleBtn} onClick={startBattle}>
                    <SwordIcon />
                    Battle
                  </button>
                  <button className={s.swapBtn} onClick={swapHosts} title="Swap hosts">
                    <SwapIcon />
                  </button>
                </>
              )}
              {isResult && (
                <div className={s.resultActions}>
                  <button className={s.rematchBtn} onClick={rematch}>
                    <RefreshIcon />
                    Rematch
                  </button>
                  {hosts.length > 2 && (
                    <button className={s.challengerBtn} onClick={newChallenger}>
                      <LightningIcon />
                      New Challenger
                    </button>
                  )}
                  <button className={s.swapBtn} onClick={swapHosts} title="Swap hosts">
                    <SwapIcon />
                  </button>
                </div>
              )}
            </div>

            {isResult && winnerHost && (
              <div className={s.winnerBanner}>
                <span className={s.winnerLabel}>Winner</span>
                <span className={s.winnerName} style={{ '--wc': winnerCol.bg, '--wa': winnerCol.accent }}>
                  {winnerHost.name}
                </span>
                {advantageChips.length > 0 && (
                  <div className={s.advantageChips}>
                    {advantageChips.map(chip => (
                      <span key={chip} className={s.advantageChip} style={{ color: winnerCol.bg, background: `${winnerCol.bg}0d`, borderColor: `${winnerCol.bg}20` }}>
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
                <a
                  className={s.dealBtn}
                  href={winnerHost.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View {winnerHost.name} Deal
                  <ExternalLinkIcon />
                </a>
              </div>
            )}
            {isResult && !winnerHost && (
              <div className={s.winnerBanner}>
                <span className={s.winnerLabel}>Result</span>
                <span className={s.tieName}>It&apos;s a tie!</span>
              </div>
            )}
          </div>
        </div>

        {/* ── HOST B CARD ── */}
        {renderCard(hostB, colB, chipsB, spikeB, 'b')}
      </div>

    </div>
  );
}
