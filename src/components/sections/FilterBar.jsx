function FilterBar({
  activeSegment,
  activeSort,
  segments,
  sortOptions,
  onSegmentChange,
  onSortChange,
}) {
  return (
    <div className="filter-bar">
      <div className="segment-chips" role="tablist" aria-label="Audience filter">
        {segments.map((segment) => (
          <button
            key={segment.id}
            type="button"
            className={`chip-button ${
              activeSegment === segment.id ? 'is-active' : ''
            }`}
            onClick={() => onSegmentChange(segment.id)}
            role="tab"
            aria-selected={activeSegment === segment.id}
          >
            {segment.label}
          </button>
        ))}
      </div>

      <label className="sort-control">
        Sort by
        <select
          value={activeSort}
          onChange={(event) => onSortChange(event.target.value)}
          aria-label="Sort providers"
        >
          {sortOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export default FilterBar
