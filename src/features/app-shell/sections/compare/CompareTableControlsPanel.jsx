export default function CompareTableControlsPanel({ app }) {
  const {
    COMPARE_METRIC_GROUPS,
    COMPARE_TABLE_VIEWS,
    compareHiddenMetricCount,
    compareKeyMetricsOnly,
    compareMetricGroup,
    compareMetricGroupCounts,
    compareMetricQuery,
    compareRowsBase,
    compareRowsHiddenByMode,
    compareTableView,
    hasActiveCompareFilters,
    resetCompareFilters,
    s,
    setCompareKeyMetricsOnly,
    setCompareMetricGroup,
    setCompareMetricQuery,
    setCompareTableViewMode,
    visibleCompareRows,
  } = app;

  return (
<div className={s.compareTableControls}>
            <div className={s.compareTableControlRow}>
              <div className={s.compareTableModes} aria-label="Compare table visibility">
                {COMPARE_TABLE_VIEWS.map((view) => (
                  <button
                    key={view.id}
                    type="button"
                    aria-pressed={compareTableView === view.id}
                    className={compareTableView === view.id ? s.compareTableModeActive : ''}
                    onClick={() => setCompareTableViewMode(view.id)}
                  >
                    {view.label}
                  </button>
                ))}
              </div>
              <p className={s.compareTableMeta}>
                {compareTableView === 'differences'
                  ? `${visibleCompareRows.length} differentiators shown.`
                  : `${visibleCompareRows.length} metrics shown.`}
                {compareRowsHiddenByMode > 0 && ` ${compareRowsHiddenByMode} equal metrics hidden by view mode.`}
                {compareHiddenMetricCount > 0 && ` ${compareHiddenMetricCount} hidden by metric filters.`}
              </p>
            </div>

            <div className={s.compareTableFilters}>
              <label className={s.compareMetricSearch}>
                <span>Find metric</span>
                <input
                  type="search"
                  value={compareMetricQuery}
                  onChange={(event) => setCompareMetricQuery(event.target.value)}
                  placeholder="Search pricing, support, uptime..."
                />
              </label>

              <div className={s.compareMetricGroups} role="tablist" aria-label="Filter compare metrics by group">
                {COMPARE_METRIC_GROUPS.map((group) => {
                  const groupCount = group.id === 'all'
                    ? compareRowsBase.length
                    : (compareMetricGroupCounts.get(group.id) || 0);
                  const isDisabled = group.id !== 'all' && groupCount === 0;
                  const isActive = compareMetricGroup === group.id;

                  return (
                    <button
                      key={`compare-group-${group.id}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      disabled={isDisabled}
                      className={isActive ? s.compareMetricGroupActive : ''}
                      onClick={() => setCompareMetricGroup(group.id)}
                    >
                      {group.label}
                      <span>{groupCount}</span>
                    </button>
                  );
                })}
              </div>

              <div className={s.compareFilterActions}>
                <button
                  type="button"
                  className={compareKeyMetricsOnly ? s.compareFilterActionActive : ''}
                  onClick={() => setCompareKeyMetricsOnly((current) => !current)}
                >
                  {compareKeyMetricsOnly ? 'Showing key metrics' : 'Focus key metrics'}
                </button>
                {hasActiveCompareFilters && (
                  <button type="button" onClick={resetCompareFilters}>
                    Reset filters
                  </button>
                )}
              </div>
            </div>
          </div>
  );
}
