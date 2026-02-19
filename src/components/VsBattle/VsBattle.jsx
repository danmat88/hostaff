import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import s from './VsBattle.module.css';

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
  const timerRef = useRef([]);

  const hostA   = useMemo(() => hosts.find(h => h.id === hostAId), [hosts, hostAId]);
  const hostB   = useMemo(() => hosts.find(h => h.id === hostBId), [hosts, hostBId]);
  const colA    = getColor(hostAId);
  const colB    = getColor(hostBId);
  const results = useMemo(() => hostA && hostB ? computeResults(hostA, hostB) : [], [hostA, hostB]);

  const overall = useMemo(() => {
    if (!results.length) return 'tie';
    const wa = results.filter(r => r.winner === 'a').length;
    const wb = results.filter(r => r.winner === 'b').length;
    return wa > wb ? 'a' : wb > wa ? 'b' : 'tie';
  }, [results]);

  /* ── Live tally (computed from revealed rounds) ── */
  const tallyA = results.filter((r, i) => i <= round && r.winner === 'a').length;
  const tallyB = results.filter((r, i) => i <= round && r.winner === 'b').length;

  const clearTimers = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  const startBattle = useCallback(() => {
    clearTimers();
    setPhase('fighting');
    setRound(-1);
    setPickerSide(null);

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
    timerRef.current.push(setTimeout(tick, 350));
  }, [clearTimers]);

  /* Clean up timers on unmount */
  useEffect(() => clearTimers, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rematch = useCallback(() => {
    setPhase('idle');
    setRound(-1);
    setTimeout(startBattle, 400);
  }, [startBattle]);

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
  const isIdle     = phase === 'idle';
  const isFighting = phase === 'fighting';
  const isResult   = phase === 'result';

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

  return (
    <div className={s.wrap}>
      <div className={glowAClass} style={{ background: `radial-gradient(circle at 30% 30%, ${colA.glow}, transparent 70%)` }} />
      <div className={glowBClass} style={{ background: `radial-gradient(circle at 70% 30%, ${colB.glow}, transparent 70%)` }} />

      <div className={s.arena}>
        {/* ── HOST A CARD ── */}
        <div className={cardAClass} style={{ '--card-c': colA.bg, '--card-glow': colA.glow }}>
          {isResult && overall === 'a' && <Crown />}
          <div className={s.cardTop}>
            <div className={s.avatar} style={{ background: `${colA.bg}12`, borderColor: `${colA.bg}30` }}>
              <span className={s.avatarLetter} style={{ color: colA.bg }}>{hostA.name[0]}</span>
            </div>
            <button className={s.nameBtn} onClick={() => setPickerSide(pickerSide === 'a' ? null : 'a')}>
              {hostA.name}
              <ChevronDown />
            </button>
            <span className={s.catBadge} style={{ color: colA.bg, background: `${colA.bg}10`, borderColor: `${colA.bg}20` }}>
              {hostBadgeLabel(hostA)}
            </span>
          </div>

          <div className={s.scoreRow}>
            <div className={s.scoreCircle} style={{ borderColor: `${colA.bg}40`, color: colA.bg }}>
              {hostA.overallScore}
              <span className={s.scoreUnit}>pts</span>
            </div>
            <div className={s.priceMini}>
              <span className={s.priceVal} style={{ color: colA.bg }}>${hostA.priceIntro}</span>
              <span className={s.priceMo}>/mo</span>
            </div>
          </div>

          <div className={s.ratingMini}>
            <span className={s.starIcon}>★</span>
            <span className={s.ratingVal}>{hostA.rating}</span>
            <span className={s.ratingCnt}>({hostA.reviewCount.toLocaleString()})</span>
          </div>

          {pickerSide === 'a' && (
            <div className={s.picker}>
              {hosts.filter(h => h.id !== hostBId).map(h => {
                const c = getColor(h.id);
                return (
                  <button key={h.id} className={`${s.pickItem} ${h.id === hostAId ? s.pickActive : ''}`}
                          onClick={() => pickHost('a', h.id)}>
                    <span className={s.pickAvatar} style={{ background: `${c.bg}14`, color: c.bg }}>
                      {h.name[0]}
                    </span>
                    <span className={s.pickName}>{h.name}</span>
                    <span className={s.pickScore}>{h.overallScore}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── CENTER COLUMN ── */}
        <div className={s.center}>
          <div className={`${s.vsCircle} ${isFighting ? s.vsPulse : ''} ${isIdle ? s.vsIdle : ''}`}>
            <span className={s.vsText}>VS</span>
          </div>

          {/* Live score tally — always rendered to reserve height */}
          <div className={`${s.tally} ${(isFighting || isResult) && round >= 0 ? '' : s.tallyHidden}`}>
            <span
              className={`${s.tallyNum} ${tallyA > tallyB ? s.tallyLead : ''}`}
              style={tallyA > tallyB ? { color: colA.bg } : {}}
            >
              {tallyA}
            </span>
            <span className={s.tallyDash}>—</span>
            <span
              className={`${s.tallyNum} ${tallyB > tallyA ? s.tallyLead : ''}`}
              style={tallyB > tallyA ? { color: colB.bg } : {}}
            >
              {tallyB}
            </span>
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
                    {visible ? fmtVal(r.va, r) : '—'}
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
                    {visible ? fmtVal(r.vb, r) : '—'}
                    {visible && r.winner === 'b' && <span className={s.mPip} style={{ background: colB.bg }} />}
                  </span>
                </div>
              );
            })}
          </div>

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
              </div>
            )}
            {isResult && !winnerHost && (
              <div className={s.winnerBanner}>
                <span className={s.winnerLabel}>Result</span>
                <span className={s.tieName}>It's a tie!</span>
              </div>
            )}
          </div>
        </div>

        {/* ── HOST B CARD ── */}
        <div className={cardBClass} style={{ '--card-c': colB.bg, '--card-glow': colB.glow }}>
          {isResult && overall === 'b' && <Crown />}
          <div className={s.cardTop}>
            <div className={s.avatar} style={{ background: `${colB.bg}12`, borderColor: `${colB.bg}30` }}>
              <span className={s.avatarLetter} style={{ color: colB.bg }}>{hostB.name[0]}</span>
            </div>
            <button className={s.nameBtn} onClick={() => setPickerSide(pickerSide === 'b' ? null : 'b')}>
              {hostB.name}
              <ChevronDown />
            </button>
            <span className={s.catBadge} style={{ color: colB.bg, background: `${colB.bg}10`, borderColor: `${colB.bg}20` }}>
              {hostBadgeLabel(hostB)}
            </span>
          </div>

          <div className={s.scoreRow}>
            <div className={s.scoreCircle} style={{ borderColor: `${colB.bg}40`, color: colB.bg }}>
              {hostB.overallScore}
              <span className={s.scoreUnit}>pts</span>
            </div>
            <div className={s.priceMini}>
              <span className={s.priceVal} style={{ color: colB.bg }}>${hostB.priceIntro}</span>
              <span className={s.priceMo}>/mo</span>
            </div>
          </div>

          <div className={s.ratingMini}>
            <span className={s.starIcon}>★</span>
            <span className={s.ratingVal}>{hostB.rating}</span>
            <span className={s.ratingCnt}>({hostB.reviewCount.toLocaleString()})</span>
          </div>

          {pickerSide === 'b' && (
            <div className={s.picker}>
              {hosts.filter(h => h.id !== hostAId).map(h => {
                const c = getColor(h.id);
                return (
                  <button key={h.id} className={`${s.pickItem} ${h.id === hostBId ? s.pickActive : ''}`}
                          onClick={() => pickHost('b', h.id)}>
                    <span className={s.pickAvatar} style={{ background: `${c.bg}14`, color: c.bg }}>
                      {h.name[0]}
                    </span>
                    <span className={s.pickName}>{h.name}</span>
                    <span className={s.pickScore}>{h.overallScore}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <p className={s.prompt}>Pick your fighters &mdash; click a name to swap</p>
    </div>
  );
}
