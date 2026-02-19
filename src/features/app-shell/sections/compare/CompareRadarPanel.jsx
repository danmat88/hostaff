export default function CompareRadarPanel({ app }) {
  const {
    RADAR_COLORS,
    RADAR_DIMS,
    compareHosts,
    getRadarCompositeScore,
    getRadarScore,
    renderHostInline,
    RadarChart,
    s,
  } = app;

  return (
<div className={s.radarWrap}>
              <div className={s.radarWrapHeader}>
                <div>
                  <p>Performance radar</p>
                  <strong>5-dimension visual comparison</strong>
                </div>
                <div className={s.radarLegend}>
                  {compareHosts.map((host, i) => {
                    const composite = getRadarCompositeScore(host);
                    return (
                      <span key={host.id} className={s.radarLegendItem}>
                        <span
                          className={s.radarLegendSwatch}
                          style={{ background: RADAR_COLORS[i % RADAR_COLORS.length] }}
                        />
                        <span>{host.name}</span>
                        <strong>{composite}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className={s.radarBody}>
                <div className={s.radarChartPanel}>
                  <RadarChart hosts={compareHosts} />
                  <p className={s.radarChartHint}>
                    Normalized 0-100 scores. Higher is better on every spoke.
                  </p>
                </div>
                <div className={s.radarDimGrid}>
                  {RADAR_DIMS.map((dim) => {
                    const ranked = compareHosts
                      .map((host, index) => ({
                        host,
                        score: getRadarScore(host, dim.key),
                        color: RADAR_COLORS[index % RADAR_COLORS.length],
                      }))
                      .sort((a, b) => b.score - a.score);
                    const leader = ranked[0] || null;
                    const runnerUpScore = ranked[1]?.score ?? leader?.score ?? 0;
                    const leadMargin = Math.max(0, (leader?.score || 0) - runnerUpScore);

                    return (
                      <article key={`radar-dim-${dim.key}`} className={s.radarDimCard}>
                        <div className={s.radarDimCardHead}>
                          <strong>{dim.label}</strong>
                          {leader && (
                            <span>
                              {renderHostInline(leader.host)}
                              <b>{leader.score}</b>
                            </span>
                          )}
                        </div>
                        <div className={s.radarDimBars}>
                          {ranked.map((item) => (
                            <div key={`radar-dim-${dim.key}-${item.host.id}`} className={s.radarDimBarRow}>
                              <span>
                                <i style={{ background: item.color }} aria-hidden="true" />
                                {item.host.name}
                              </span>
                              <div className={s.radarDimBarTrack} aria-hidden="true">
                                <div
                                  className={s.radarDimBarFill}
                                  style={{
                                    width: `${item.score}%`,
                                    background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`,
                                  }}
                                />
                              </div>
                              <strong>{item.score}</strong>
                            </div>
                          ))}
                        </div>
                        <small>
                          {leader
                            ? `${leader.host.name} leads by ${leadMargin} point${leadMargin === 1 ? '' : 's'}.`
                            : 'No data available.'}
                        </small>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
  );
}
