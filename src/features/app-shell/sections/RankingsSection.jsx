import { RankingsControls, RankingsHighlights, RankingsHostGrid } from './rankings';

export default function RankingsSection({ app }) {
  const {
    DEFAULT_HOSTING_TYPE,
    RANK_PRESETS,
    activeHostingTypeLabel,
    activePreset,
    compactNumber,
    compareHosts,
    jumpToSection,
    rankedHosts,
    s,
    setActiveCategory,
    setActivePreset,
    setHostingType,
    setSearchTerm,
    setSortKey,
    shortlistedHosts,
    totalReviewSignalCount,
  } = app;

  return (
    <section className={`${s.section} ${s.sectionShell}`} id="rankings">
      <div className={s.sectionHeader}>
        <div>
          <p className={s.kicker}>Ranked list <span className={s.typeBadge}>{activeHostingTypeLabel}</span></p>
          <h2>Top {activeHostingTypeLabel} hosting providers right now</h2>
        </div>
        <p className={s.sectionNote}>
          Filter by category and sort by score, intro pricing, support speed, or payout potential for the selected hosting type.
        </p>
      </div>

      <RankingsHighlights app={app} />

      <div className={s.presetRow}>
        <p>Quick picks:</p>
        {RANK_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`${s.presetChip} ${activePreset === preset.id ? s.presetChipActive : ''}`}
            onClick={() => {
              if (activePreset === preset.id) {
                setActivePreset(null);
                setHostingType(DEFAULT_HOSTING_TYPE, { silent: true, clearPreset: false });
                setSortKey('overall');
                setActiveCategory('All');
                setSearchTerm('');
              } else {
                setActivePreset(preset.id);
                setHostingType(preset.type, { silent: true, clearPreset: false });
                setSortKey(preset.sort);
                setActiveCategory(preset.cat);
                setSearchTerm('');
              }
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <RankingsControls app={app} />

      <div className={s.resultsMeta}>
        <span>Showing {rankedHosts.length} host{rankedHosts.length === 1 ? '' : 's'}</span>
        <span>{compareHosts.length} in compare</span>
        <span>{shortlistedHosts.length} saved to workspace</span>
        <span>{compactNumber.format(totalReviewSignalCount)} review signals synced</span>
        <span>Only providers with real {activeHostingTypeLabel.toLowerCase()} data are shown</span>
      </div>

      <RankingsHostGrid app={app} />

      <div className={s.sectionFlowCta}>
        <p>Saved your top picks? Head to your workspace to build the final shortlist.</p>
        <button type="button" onClick={() => jumpToSection('workspace')}>Go to workspace</button>
      </div>
    </section>
  );
}
