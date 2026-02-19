export default function ProofMain({ app }) {
  const {
    HOST_BY_ID,
    HOST_PLACEHOLDER_PALETTES,
    REVIEW_DIMENSIONS,
    REVIEW_PAGE_SIZE,
    REVIEW_PREVIEW_LIMIT,
    REVIEW_SORT_OPTIONS,
    activeHostingTypeLabel,
    activeReviewFilterCount,
    activeReviewHost,
    applyReviewPreset,
    clamp,
    currency,
    displayedReviews,
    expandedReviewIds,
    featuredReview,
    featuredReviewDateLabel,
    featuredReviewHelpful,
    featuredReviewHost,
    featuredReviewHostSignal,
    filteredReviews,
    hasMoreReviews,
    hashSeed,
    hiddenReviewCount,
    hostByIdForActiveType,
    hostSelectOptions,
    isReviewComposerOpen,
    isReviewDraftReady,
    jumpToReview,
    markReviewHelpful,
    noReviewsForType,
    pushToast,
    renderHostInline,
    resetReviewFilters,
    reviewDateFormatter,
    reviewDraft,
    reviewFormError,
    reviewFormRef,
    reviewHelpfulCounts,
    reviewHelpfulVotedSet,
    reviewHostFilter,
    reviewHostOptions,
    reviewMinScore,
    reviewQuery,
    reviewQueryChipLabel,
    reviewQueryNormalized,
    reviewQuoteLength,
    reviewQuoteRemaining,
    reviewSortKey,
    reviewSortLabel,
    RatingStars,
    s,
    setReviewHostFilter,
    setReviewMinScore,
    setReviewQuery,
    setReviewSortKey,
    showMoreReviews,
    submitReview,
    toggleReviewComposer,
    toggleReviewExpanded,
    updateReviewDraft,
  } = app;

  return (
<div className={s.reviewMain}>
              <div className={s.reviewControlPanel}>
              <div className={s.reviewTools}>
                <div className={s.reviewToolActions}>
                  <button type="button" className={s.reviewWriteButton} onClick={toggleReviewComposer}>
                    {isReviewComposerOpen ? 'Close review form' : 'Write review'}
                  </button>
                  {activeReviewFilterCount > 0 && (
                    <button type="button" className={s.reviewResetButton} onClick={resetReviewFilters}>
                      Reset filters
                    </button>
                  )}
                </div>
                <div className={s.reviewPresetRow} role="group" aria-label="Quick review presets">
                  <button
                    type="button"
                    className={`${s.reviewPresetButton} ${reviewSortKey === 'recent' && reviewMinScore === 0 ? s.reviewPresetButtonActive : ''}`}
                    onClick={() => applyReviewPreset('recent')}
                  >
                    Recent
                  </button>
                  <button
                    type="button"
                    className={`${s.reviewPresetButton} ${reviewSortKey === 'score' && reviewMinScore >= 4.5 ? s.reviewPresetButtonActive : ''}`}
                    onClick={() => applyReviewPreset('top')}
                  >
                    Top rated
                  </button>
                  <button
                    type="button"
                    className={`${s.reviewPresetButton} ${reviewSortKey === 'helpful' ? s.reviewPresetButtonActive : ''}`}
                    onClick={() => applyReviewPreset('helpful')}
                  >
                    Helpful
                  </button>
                  <button
                    type="button"
                    className={`${s.reviewPresetButton} ${reviewSortKey === 'savings' ? s.reviewPresetButtonActive : ''}`}
                    onClick={() => applyReviewPreset('savings')}
                  >
                    Savings
                  </button>
                </div>
                <p>Share your experience here. Reviews publish instantly, and your draft auto-saves in this browser.</p>
              </div>

              <div className={s.reviewFilters}>
                <div className={s.reviewHostFilters} role="tablist" aria-label="Filter reviews by provider">
                  {reviewHostOptions.map((option) => {
                    const filterHost = option.id === 'all' ? null : hostByIdForActiveType.get(option.id);

                    return (
                      <button
                        key={`review-filter-${option.id}`}
                        type="button"
                        role="tab"
                        aria-selected={reviewHostFilter === option.id}
                        className={reviewHostFilter === option.id ? s.reviewFilterActive : ''}
                        onClick={() => setReviewHostFilter(option.id)}
                      >
                        <strong>{filterHost ? filterHost.name : option.label}</strong>
                        <span>{option.count}</span>
                      </button>
                    );
                  })}
                </div>

                <label className={s.reviewFilterField}>
                  <span>Sort</span>
                  <select value={reviewSortKey} onChange={(event) => setReviewSortKey(event.target.value)}>
                    {REVIEW_SORT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label className={s.reviewFilterField}>
                  <span>Minimum rating</span>
                  <select
                    value={reviewMinScore}
                    onChange={(event) => setReviewMinScore(Number(event.target.value))}
                  >
                    <option value={0}>All ratings</option>
                    <option value={4.5}>4.5+</option>
                    <option value={4}>4.0+</option>
                    <option value={3.5}>3.5+</option>
                    <option value={3}>3.0+</option>
                  </select>
                </label>

                <label className={`${s.reviewFilterField} ${s.reviewSearchField}`}>
                  <span>Search reviews</span>
                  <input
                    type="search"
                    value={reviewQuery}
                    onChange={(event) => setReviewQuery(event.target.value)}
                    placeholder="Search by quote, role, provider, or reviewer"
                  />
                  {reviewQuery.trim() && (
                    <button
                      type="button"
                      className={s.reviewSearchClear}
                      onClick={() => setReviewQuery('')}
                    >
                      Clear search
                    </button>
                  )}
                </label>
              </div>
            </div>

          {featuredReview && (
            <article className={s.reviewFeatured}>
              <div className={s.reviewFeaturedMain}>
                <span className={s.reviewFeaturedKicker}>Featured voice</span>
                <strong>
                  {featuredReviewHost
                    ? renderHostInline(featuredReviewHost, `${featuredReview.name} on ${featuredReviewHost.name}`)
                    : featuredReview.name}
                </strong>
                <p>
                  {featuredReview.quote.length > 260
                    ? `${featuredReview.quote.slice(0, 260).trim()}...`
                    : featuredReview.quote}
                </p>
              </div>
              <div className={s.reviewFeaturedMeta}>
                <span>{Number(featuredReview.score).toFixed(1)}/5 rating</span>
                <span>
                  {featuredReviewHost
                    ? `${(featuredReviewHostSignal.weightedScore || featuredReviewHost.rating).toFixed(1)}★ host avg`
                    : 'Host average unavailable'}
                </span>
                <span>{currency.format(featuredReview.monthlySavings)} monthly savings</span>
                <span>
                  {featuredReviewHelpful > 0
                    ? `${featuredReviewHelpful} helpful vote${featuredReviewHelpful === 1 ? '' : 's'}`
                    : 'No helpful votes yet'}
                </span>
                <span>{featuredReviewDateLabel}</span>
              </div>
              <div className={s.reviewFeaturedActions}>
                <button type="button" onClick={() => jumpToReview(featuredReview.id)}>
                  Jump to review
                </button>
                {featuredReviewHost && (
                  <button
                    type="button"
                    onClick={() => {
                      setReviewHostFilter(featuredReviewHost.id);
                      pushToast(`Showing ${featuredReviewHost.name} reviews.`);
                    }}
                  >
                    Filter {featuredReviewHost.name}
                  </button>
                )}
              </div>
            </article>
          )}

          <div className={s.reviewListBar}>
            <p className={s.reviewListCount}>
              Showing
              {' '}
              <strong>{displayedReviews.length}</strong>
              {' '}
              of
              {' '}
              <strong>{filteredReviews.length}</strong>
              {' '}
              matching reviews
            </p>
            <div className={s.reviewListMeta}>
              <span className={s.reviewMetaChip}>Sort: {reviewSortLabel}</span>
              <span className={s.reviewMetaChip}>
                Provider: {activeReviewHost ? activeReviewHost.name : `All ${activeHostingTypeLabel.toLowerCase()} hosts`}
              </span>
              <span className={s.reviewMetaChip}>
                Rating: {reviewMinScore > 0 ? `${reviewMinScore.toFixed(1)}+` : 'All'}
              </span>
              {reviewQueryNormalized && (
                <span className={s.reviewMetaChip}>Query: {reviewQueryChipLabel}</span>
              )}
            </div>
          </div>

          {isReviewComposerOpen && (
            <form ref={reviewFormRef} className={s.reviewForm} onSubmit={submitReview}>
              <div className={s.reviewFormGrid}>
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    value={reviewDraft.name}
                    onChange={(event) => updateReviewDraft('name', event.target.value)}
                    placeholder="Full name"
                    autoComplete="name"
                    required
                  />
                </label>

                <label>
                  <span>Role / company</span>
                  <input
                    type="text"
                    value={reviewDraft.role}
                    onChange={(event) => updateReviewDraft('role', event.target.value)}
                    placeholder="Role and company"
                    required
                  />
                </label>

                <label>
                  <span>Provider</span>
                  <select
                    value={reviewDraft.hostId}
                    onChange={(event) => updateReviewDraft('hostId', event.target.value)}
                  >
                    {hostSelectOptions.map((host) => (
                      <option key={`review-host-${host.id}`} value={host.id}>{host.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Monthly savings (USD)</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={reviewDraft.monthlySavings}
                    onChange={(event) => updateReviewDraft('monthlySavings', event.target.value)}
                    required
                  />
                </label>

                <label>
                  <span>Rating</span>
                  <select
                    value={reviewDraft.score}
                    onChange={(event) => updateReviewDraft('score', Number(event.target.value))}
                  >
                    {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map((score) => (
                      <option key={`review-score-${score}`} value={score}>
                        {score.toFixed(1)} / 5
                      </option>
                    ))}
                  </select>
                </label>

                <div className={s.reviewDimensionGroup}>
                  <p className={s.reviewDimensionLabel}>Rate specific features <span>(optional)</span></p>
                  <div className={s.reviewDimensionGrid}>
                    {REVIEW_DIMENSIONS.map((dim) => (
                      <label key={dim.id} className={s.reviewDimensionField}>
                        <span>{dim.label}</span>
                        <select
                          value={reviewDraft.dimensions?.[dim.id] ?? 0}
                          onChange={(event) => updateReviewDraft('dimensions', {
                            ...reviewDraft.dimensions,
                            [dim.id]: Number(event.target.value),
                          })}
                        >
                          <option value={0}>Not rated</option>
                          {[5, 4, 3, 2, 1].map((v) => (
                            <option key={v} value={v}>{v}.0 / 5</option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                </div>

                <label className={s.reviewQuoteField}>
                  <span>Overall review</span>
                  <textarea
                    rows={4}
                    value={reviewDraft.quote}
                    onChange={(event) => updateReviewDraft('quote', event.target.value)}
                    placeholder="Share setup, support, performance, and pricing outcomes."
                    required
                  />
                  <small className={`${s.reviewQuoteMeta} ${reviewQuoteRemaining === 0 ? s.reviewQuoteMetaReady : ''}`}>
                    {reviewQuoteLength} characters
                    {' '}
                    {reviewQuoteRemaining > 0
                      ? `• ${reviewQuoteRemaining} more needed`
                      : '• Ready to publish'}
                  </small>
                </label>
              </div>

              {reviewFormError && <p className={s.reviewFormError}>{reviewFormError}</p>}

              <div className={s.reviewFormActions}>
                <button type="submit" disabled={!isReviewDraftReady}>Publish review</button>
                <button type="button" onClick={toggleReviewComposer}>Cancel</button>
              </div>
            </form>
          )}

          <div className={s.reviewGrid}>
            {filteredReviews.length ? displayedReviews.map((review) => {
              const host = hostByIdForActiveType.get(review.hostId) || HOST_BY_ID.get(review.hostId);
              const hostPalette = HOST_PLACEHOLDER_PALETTES[hashSeed(host ? host.id : 'x') % HOST_PLACEHOLDER_PALETTES.length];
              const authorInitials = review.name.split(/\s+/).map((w) => w[0] || '').join('').slice(0, 2).toUpperCase();
              const reviewScore = clamp(Number(review.score) || 5, 1, 5);
              const createdDate = review.createdAt ? new Date(review.createdAt) : null;
              const hasValidDate = Boolean(createdDate && Number.isFinite(createdDate.getTime()));
              const createdLabel = hasValidDate ? reviewDateFormatter.format(createdDate) : 'Verified reviewer';
              const helpfulCount = Number(reviewHelpfulCounts[review.id]) || 0;
              const hasMarkedHelpful = reviewHelpfulVotedSet.has(review.id);
              const normalizedReviewId = String(review.id);
              const isExpanded = expandedReviewIds.includes(normalizedReviewId);
              const isLongQuote = review.quote.length > REVIEW_PREVIEW_LIMIT;
              const quoteText = !isExpanded && isLongQuote
                ? `${review.quote.slice(0, REVIEW_PREVIEW_LIMIT).trim()}...`
                : review.quote;
              return (
                <article
                  key={review.id}
                  id={`review-${normalizedReviewId}`}
                  className={s.reviewCard}
                  style={{ '--review-accent': hostPalette.start, '--review-accent-end': hostPalette.end }}
                >
                  <div className={s.reviewCardTop}>
                    <div className={s.reviewCardLabels}>
                      <span className={s.reviewCardHost} style={{ color: hostPalette.start }}>{host ? renderHostInline(host) : 'Hosting provider'}</span>
                      <span className={s.reviewVerified}>Verified review</span>
                    </div>
                    <div className={s.reviewCardRating}>
                      <RatingStars rating={reviewScore} />
                      <span className={s.reviewCardScore}>{reviewScore.toFixed(1)}</span>
                    </div>
                  </div>
                  {review.monthlySavings > 0 && (
                    <div className={s.reviewSavingsBadge}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M12 2v20M17 7H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      <strong>{currency.format(review.monthlySavings)}</strong>
                      <small>saved per month</small>
                    </div>
                  )}
                  <span className={s.reviewQuoteMark} aria-hidden="true">"</span>
                  <p className={s.reviewQuote}>{quoteText}</p>
                  {isLongQuote && (
                    <button
                      type="button"
                      className={s.reviewQuoteToggle}
                      onClick={() => toggleReviewExpanded(normalizedReviewId)}
                    >
                      {isExpanded ? 'Show less' : 'Read full review'}
                    </button>
                  )}
                  {review.dimensions && REVIEW_DIMENSIONS.some((d) => (review.dimensions[d.id] || 0) > 0) && (
                    <div className={s.reviewDimBadges}>
                      {REVIEW_DIMENSIONS.filter((d) => (review.dimensions[d.id] || 0) > 0).map((dim) => (
                        <span key={dim.id} className={s.reviewDimBadge}>
                          <b>{dim.label}</b>
                          <RatingStars rating={review.dimensions[dim.id]} />
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={s.reviewCardEngagement}>
                    <button
                      type="button"
                      className={`${s.reviewHelpfulButton} ${hasMarkedHelpful ? s.reviewHelpfulButtonActive : ''}`}
                      onClick={() => markReviewHelpful(review.id)}
                      disabled={hasMarkedHelpful}
                    >
                      {hasMarkedHelpful ? 'Helpful saved' : 'Mark helpful'}
                    </button>
                    <small>
                      {helpfulCount > 0
                        ? `${helpfulCount} user${helpfulCount === 1 ? '' : 's'} found this helpful`
                        : 'Be the first to mark this review as helpful'}
                    </small>
                  </div>
                  <div className={s.reviewCardMeta}>
                    <div
                      className={s.reviewAuthorAvatar}
                      style={{ background: `linear-gradient(135deg, ${hostPalette.start}, ${hostPalette.end})` }}
                      aria-hidden="true"
                    >
                      {authorInitials}
                    </div>
                    <div className={s.reviewCardAuthor}>
                      <strong>{review.name}</strong>
                      <span className={s.reviewCardRole}>{review.role}</span>
                    </div>
                    <div className={s.reviewCardFooter}>
                      <time dateTime={hasValidDate ? review.createdAt : undefined}>{createdLabel}</time>
                    </div>
                  </div>
                </article>
              );
            }) : (
              <article className={s.reviewEmpty}>
                {noReviewsForType ? (
                  <>
                    <h3>No verified reviews for {activeHostingTypeLabel} hosting yet.</h3>
                    <p>Be the first to share your experience, or switch to another hosting type to see existing reviews.</p>
                  </>
                ) : (
                  <>
                    <h3>No reviews match these filters.</h3>
                    <p>Try a broader rating threshold, clear search terms, or switch back to all providers.</p>
                  </>
                )}
                <button
                  type="button"
                  onClick={resetReviewFilters}
                >
                  Reset filters
                </button>
              </article>
            )}
          </div>

          {hasMoreReviews && (
            <div className={s.reviewLoadMoreWrap}>
              <button type="button" className={s.reviewLoadMoreButton} onClick={showMoreReviews}>
                Load {Math.min(REVIEW_PAGE_SIZE, hiddenReviewCount)} more reviews
              </button>
              <small>{hiddenReviewCount} still hidden</small>
            </div>
          )}
            </div>
  );
}
