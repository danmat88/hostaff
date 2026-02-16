const MIN_RATING_FLOOR = 3.5
const MIN_PRICE_FLOOR = 1.0

function AdvancedFilters({
  searchQuery,
  minRating,
  maxStartingPrice,
  maxAvailablePrice,
  selectedFeatures,
  featureOptions,
  showOnlyFavorites,
  resultsCount,
  onSearchChange,
  onMinRatingChange,
  onMaxPriceChange,
  onToggleFeature,
  onToggleFavorites,
  onReset,
}) {
  return (
    <section className="advanced-filters" aria-label="Advanced provider filters">
      <div className="advanced-filters-head">
        <label className="search-control" htmlFor="provider-search">
          <span>Search hosts</span>
          <input
            id="provider-search"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by provider, feature, or use case"
          />
        </label>

        <div className="advanced-filter-actions">
          <button
            type="button"
            className={`toggle-pill ${showOnlyFavorites ? 'is-active' : ''}`}
            onClick={onToggleFavorites}
          >
            Favorites Only
          </button>
          <button type="button" className="button secondary compact" onClick={onReset}>
            Reset Filters
          </button>
        </div>
      </div>

      <div className="slider-grid">
        <label className="range-control" htmlFor="min-rating">
          <span>Minimum Rating</span>
          <div className="range-meta">
            <strong>{minRating.toFixed(1)}+</strong>
            <small>out of 5</small>
          </div>
          <input
            id="min-rating"
            type="range"
            min={MIN_RATING_FLOOR}
            max={5}
            step={0.1}
            value={minRating}
            onChange={(event) => onMinRatingChange(Number(event.target.value))}
          />
        </label>

        <label className="range-control" htmlFor="max-price">
          <span>Max Intro Price</span>
          <div className="range-meta">
            <strong>${maxStartingPrice.toFixed(2)}</strong>
            <small>per month</small>
          </div>
          <input
            id="max-price"
            type="range"
            min={MIN_PRICE_FLOOR}
            max={maxAvailablePrice}
            step={0.1}
            value={maxStartingPrice}
            onChange={(event) => onMaxPriceChange(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="must-have-row">
        <p>Must-have features</p>
        <div className="feature-chip-set" role="list" aria-label="Must-have features">
          {featureOptions.map((feature) => {
            const isActive = selectedFeatures.includes(feature.key)

            return (
              <button
                key={feature.key}
                type="button"
                className={`feature-chip ${isActive ? 'is-active' : ''}`}
                onClick={() => onToggleFeature(feature.key)}
                role="listitem"
              >
                {feature.label}
              </button>
            )
          })}
        </div>
      </div>

      <p className="filters-summary">
        {resultsCount} provider{resultsCount === 1 ? '' : 's'} match the current
        filter stack.
      </p>
    </section>
  )
}

export default AdvancedFilters
