export function createCommandActions({
  activeHostingTypeLabel,
  canAddThirdCompare,
  compareExtraSlotEnabled,
  compareMinimumRequired,
  compareSlotCapacity,
  compareTableView,
  dockState,
  hasActiveCompareFilters,
  suggestedCompareHost,
  shortlistedHosts,
  theme,
  DEFAULT_THEME,
}) {
  return [
    {
      id: 'jump-finder',
      label: 'Go to smart finder',
      hint: 'Section',
    },
    {
      id: 'jump-rankings',
      label: 'Go to rankings',
      hint: 'Section',
    },
    {
      id: 'jump-workspace',
      label: 'Go to workspace',
      hint: 'Section',
    },
    {
      id: 'jump-compare',
      label: 'Go to compare studio',
      hint: 'Section',
    },
    {
      id: 'open-review-compose',
      label: 'Write a user review',
      hint: 'Proof',
    },
    {
      id: 'focus-ranking-search',
      label: 'Focus ranking search',
      hint: 'Search',
    },
    {
      id: 'reset-ranking-controls',
      label: 'Reset ranking controls',
      hint: 'Search',
    },
    {
      id: 'toggle-theme',
      label: theme === DEFAULT_THEME ? 'Switch to ocean theme' : 'Switch to sunset theme',
      hint: 'Theme',
    },
    {
      id: 'compare-top-three',
      label: `Set compare to top ${compareSlotCapacity} ${activeHostingTypeLabel.toLowerCase()} providers`,
      hint: 'Compare',
    },
    {
      id: 'compare-sync-shortlist',
      label: 'Sync compare from workspace shortlist',
      hint: 'Compare',
      disabled: shortlistedHosts.length < compareMinimumRequired,
    },
    {
      id: 'compare-add-suggested',
      label: compareExtraSlotEnabled
        ? (suggestedCompareHost ? `Add ${suggestedCompareHost.name} to compare` : 'Add suggested host to compare')
        : `No extra compare slot for ${activeHostingTypeLabel.toLowerCase()}`,
      hint: 'Compare',
      disabled: !canAddThirdCompare,
    },
    {
      id: 'toggle-compare-table-view',
      label: compareTableView === 'all' ? 'Show compare differences only' : 'Show all compare metrics',
      hint: 'Compare',
    },
    {
      id: 'reset-compare-filters',
      label: 'Reset compare metric filters',
      hint: 'Compare',
      disabled: !hasActiveCompareFilters,
    },
    {
      id: 'copy-compare-link',
      label: 'Copy compare share link',
      hint: 'Compare',
    },
    {
      id: 'toggle-dock',
      label: dockState.hidden ? 'Show compare dock' : 'Hide compare dock',
      hint: 'Dock',
    },
    {
      id: 'toggle-dock-size',
      label: dockState.collapsed ? 'Expand compare dock' : 'Minimize compare dock',
      hint: 'Dock',
      disabled: dockState.hidden,
    },
    {
      id: 'scroll-top',
      label: 'Scroll to top',
      hint: 'Utility',
    },
  ];
}
