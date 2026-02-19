import {
  CompareExperiencePanel,
  CompareRadarPanel,
  CompareTableControlsPanel,
  CompareTableGridPanel,
} from './compare';

export default function CompareSection({ app }) {
  const {
    activeHostingTypeLabel,
    compareExtraSlotEnabled,
    compareHosts,
    compareLeader,
    compareMinimumRequired,
    compareRecommendationNote,
    hasActiveCompareFilters,
    jumpToSection,
    openSavingsForHost,
    renderHostInline,
    renderHostText,
    resetCompareFilters,
    s,
    visibleCompareRows,
  } = app;

  return (
    <section className={`${s.section} ${s.sectionShell}`} id="compare">
      <div className={s.sectionHeader}>
        <div>
          <p className={s.kicker}>Compare <span className={s.typeBadge}>{activeHostingTypeLabel}</span></p>
          <h2>{activeHostingTypeLabel} decision table for your shortlisted hosts</h2>
        </div>
        <p className={s.sectionNote}>
          Keep at least {compareMinimumRequired} {activeHostingTypeLabel.toLowerCase()} provider{compareMinimumRequired === 1 ? '' : 's'} selected.
          {compareExtraSlotEnabled
            ? ' Add a third from rankings or finder results to pressure-test tradeoffs.'
            : ' This type has a focused two-provider compare stack.'}
        </p>
      </div>

      <div className={s.compareVerdict}>
        <div className={s.compareVerdictMain}>
          <p>Current recommendation</p>
          <strong>{renderHostInline(compareLeader)} leads your compare stack.</strong>
          <span>{compareRecommendationNote}</span>
        </div>
        <div className={s.compareVerdictActions}>
          <button type="button" onClick={() => openSavingsForHost(compareLeader, 'compare')}>
            <span className={s.compareVerdictActionKicker}>Savings model</span>
            {renderHostText(compareLeader)}
          </button>
          <a href={compareLeader.affiliateUrl} target="_blank" rel="noreferrer noopener">
            <span className={s.compareVerdictActionKicker}>Open deal</span>
            {renderHostText(compareLeader)}
          </a>
        </div>
      </div>

      {compareHosts.length >= 2 && (
        <CompareRadarPanel app={app} />
      )}

      <CompareExperiencePanel app={app} />
      <CompareTableControlsPanel app={app} />
      <CompareTableGridPanel app={app} />

      {!visibleCompareRows.length && hasActiveCompareFilters && (
        <div className={s.compareNoMatchActions}>
          <button type="button" onClick={resetCompareFilters}>Reset compare filters</button>
        </div>
      )}

      <div className={s.sectionFlowCta}>
        <p>Ready to validate costs before you commit?</p>
        <button type="button" onClick={() => jumpToSection('calculator')} className={s.sectionFlowCtaPrimary}>Run savings calculator</button>
      </div>
    </section>
  );
}
