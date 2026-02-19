export default function RankingsControls({ app }) {
  const {
    DEFAULT_HOSTING_TYPE,
    HOSTING_TYPE_OPTIONS,
    SORT_OPTIONS,
    activeCategory,
    activeHostingType,
    rankedHosts,
    rankingCategories,
    resetRankingControls,
    s,
    searchInputRef,
    searchTerm,
    setActiveCategory,
    setHostingType,
    setSearchTerm,
    setSortKey,
    sortKey,
  } = app;

  return (
<div className={s.controlBar}>
            <div className={s.controlSegments}>
              <div className={s.segmentControl}>
                {HOSTING_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setHostingType(option.id)}
                    className={`${s.segmentButton} ${activeHostingType === option.id ? s.segmentButtonActive : ''}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className={s.segmentControl}>
                {rankingCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`${s.segmentButton} ${activeCategory === category ? s.segmentButtonActive : ''}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className={s.controlRight}>
              <label className={s.searchControl}>
                <span>Quick finder</span>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search host, category, or use case"
                />
                <small>Tip: press / to focus instantly</small>
                {searchTerm.trim() && (
                  <span className={s.searchFeedback}>
                    {rankedHosts.length === 0
                      ? `No results for "${searchTerm}"`
                      : `${rankedHosts.length} result${rankedHosts.length === 1 ? '' : 's'}`}
                  </span>
                )}
              </label>

              <label className={s.sortControl}>
                <span>Sort by</span>
                <select value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </label>

              {(searchTerm.trim() || activeCategory !== 'All' || sortKey !== 'overall' || activeHostingType !== DEFAULT_HOSTING_TYPE) && (
                <div className={s.controlActions}>
                  {searchTerm.trim() && (
                    <button type="button" onClick={() => setSearchTerm('')}>Clear search</button>
                  )}
                  <button type="button" onClick={resetRankingControls}>Reset all</button>
                </div>
              )}
            </div>
          </div>
  );
}
