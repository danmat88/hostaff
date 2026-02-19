export default function RankingsHostGrid({ app }) {
  const {
    HOST_PLACEHOLDER_PALETTES,
    activeCategory,
    activeHostIds,
    activeHostingType,
    compactNumber,
    compareIds,
    compareSlotCapacity,
    copyPromoCode,
    currency,
    FeatureIcon,
    formatSiteLimit,
    formatVerifiedDate,
    getFeatureIconType,
    getHostReviewSignal,
    getPromoCode,
    hashSeed,
    labProfile,
    labRecommendations,
    normalizeCompareIds,
    normalizedCompareIds,
    openSavingsForHost,
    MetricBar,
    rankedHosts,
    RatingStars,
    renderHostInline,
    resetRankingControls,
    s,
    scoreLabHost,
    shortlistIds,
    SpecIcon,
    sortKey,
    toggleCompare,
    toggleShortlist,
  } = app;

  return (
<div className={s.hostGrid}>
            {rankedHosts.length === 0 ? (
              <article className={s.emptyState}>
                <h3>No hosts match this filter set.</h3>
                <p>Try a wider category, switch hosting type, or clear your search phrase.</p>
                <button
                  type="button"
                  onClick={resetRankingControls}
                >
                  Reset filters
                </button>
              </article>
            ) : (
              rankedHosts.map((host, index) => {
                const isSaved = shortlistIds.includes(host.id);
                const inCompare = normalizedCompareIds.includes(host.id);
                const hostSignal = getHostReviewSignal(host.id);
                const hostRating = hostSignal.weightedScore || host.rating;
                const hostReviewTotal = hostSignal.totalReviewCount || host.reviewCount;
                const hostPlans = Array.isArray(host.plans) ? host.plans : [];
                const hostFeatureHighlights = host.features?.length > 0
                  ? host.features
                  : [
                      `${host.storageGb} GB NVMe storage`,
                      `${formatSiteLimit(host.siteLimit)} included`,
                      host.backupPolicy,
                    ];

                const cardPalette = HOST_PLACEHOLDER_PALETTES[hashSeed(host.id) % HOST_PLACEHOLDER_PALETTES.length];
                const renewalSpikePercent = Math.round((host.priceRenewal - host.priceIntro) / host.priceIntro * 100);
                const fitScore = scoreLabHost(host, labProfile);
                const isTopFinderPick = labRecommendations[0]?.host.id === host.id && labRecommendations[0]?.score >= 75;
                const normalizedCompare = normalizeCompareIds(compareIds, activeHostIds);
                const compareIsFull = normalizedCompare.length >= compareSlotCapacity;
                const replacementSlotIndex = Math.max(0, compareSlotCapacity - 1);
                const isReplacementSlot = compareIsFull && normalizedCompare[replacementSlotIndex] === host.id;
                const promoCode = getPromoCode(host);
                const pricingSource = host.dataSources?.pricing || '';
                const infraSource = host.dataSources?.infrastructure || '';
                const reviewsSource = host.dataSources?.reviews || '';
                const verifiedDateLabel = formatVerifiedDate(host.lastVerified);

                return (
                  <article
                    key={`${host.id}-${activeHostingType}-${sortKey}-${activeCategory}`}
                    className={`${s.hostCard} ${inCompare ? s.hostCardInCompare : ''} ${isTopFinderPick ? s.hostCardTopPick : ''}`}
                    style={{
                      '--delay': `${index * 55}ms`,
                      '--card-accent-start': isTopFinderPick ? '#d4a017' : cardPalette.start,
                      '--card-accent-end': isTopFinderPick ? '#f26b1d' : cardPalette.end,
                    }}
                  >
                    {isTopFinderPick && (
                      <div className={s.topPickBanner}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        Best for your profile
                      </div>
                    )}
                    <header className={s.hostTop}>
                      <div className={s.hostIdentity}>
                        <span className={s.rankNumber}>#{index + 1}</span>
                        <div>
                          <h3>{renderHostInline(host)}</h3>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`${s.saveChip} ${isSaved ? s.saveChipActive : ''}`}
                        onClick={() => toggleShortlist(host.id)}
                        aria-pressed={isSaved}
                      >
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                    </header>

                    <div className={s.hostMeta}>
                      <RatingStars rating={hostRating} />
                      <span className={s.hostMetaScore}>{hostRating.toFixed(1)}</span>
                      <small className={s.hostMetaReviews}>{compactNumber.format(hostReviewTotal)} reviews</small>
                      <span className={s.hostMetaDot} aria-hidden="true">·</span>
                      <span className={`${s.fitBadge} ${fitScore >= 80 ? s.fitBadgeHigh : fitScore >= 62 ? s.fitBadgeMed : ''}`}>
                        {fitScore}% fit
                      </span>
                      <span className={s.badge}>{host.editorBadge}</span>
                      <span className={s.hostCategory}>{host.category}</span>
                    </div>

                    {hostSignal.averageUserSavings > 0 && (
                      <div className={s.avgSavingsBadge}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2v20M17 7H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        <span>Users save avg</span>
                        <strong>{currency.format(hostSignal.averageUserSavings)}/mo</strong>
                      </div>
                    )}

                    {host.typeSpecs?.length > 0 && (
                      <div className={s.specGrid}>
                        {host.typeSpecs.slice(0, 3).map((spec) => (
                          <div key={spec.label} className={s.specCell}>
                            <span className={s.specCellIcon}>
                              <SpecIcon label={spec.label} />
                            </span>
                            <span className={s.specCellValue}>{spec.value}</span>
                            <span className={s.specCellLabel}>{spec.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={s.offerStrip}>
                      <div className={s.offerMain}>
                        <div className={s.offerPriceRow}>
                          <strong>
                            {currency.format(host.priceIntro)}
                            {' '}
                            <em>/ month</em>
                          </strong>
                          <span className={s.offerYearOne}>Year 1 {currency.format(host.priceIntro * 12)}</span>
                        </div>
                        <span className={s.offerRenewal}>
                          Renews at {currency.format(host.priceRenewal)} / month
                          {renewalSpikePercent > 10 && (
                            <span className={s.renewalSpike}>&#8593;{renewalSpikePercent}%</span>
                          )}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={s.promoCodeButton}
                        onClick={() => { if (promoCode) { void copyPromoCode(host); } }}
                        aria-label={promoCode ? `Copy promo code ${promoCode} for ${host.name}` : `No promo code listed for ${host.name}`}
                        disabled={!promoCode}
                      >
                        <span>Promo</span>
                        <b>{promoCode || 'No code'}</b>
                      </button>
                    </div>

                    <div className={s.metricBlock}>
                      <MetricBar label="Performance" value={host.performance} />
                      <MetricBar label="Support" value={host.support} />
                      <MetricBar label="Value" value={host.value} />
                    </div>

                    <p className={s.featuresLabel}>What&apos;s included</p>
                    {host.shortFeatures?.length > 0 ? (
                      <ul className={s.featureGrid}>
                        {host.shortFeatures.map((feature) => (
                          <li key={feature} className={s.featureGridItem}>
                            <span className={s.featureIcon} aria-hidden="true">
                              <FeatureIcon type={getFeatureIconType(feature)} />
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className={s.featureList}>
                        {hostFeatureHighlights.slice(0, 4).map((feature) => (
                          <li key={feature} className={s.featureListItem}>
                            <span className={s.featureIcon} aria-hidden="true">
                              <FeatureIcon type={getFeatureIconType(feature)} />
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {hostPlans.length > 0 && (
                      <div className={s.hostPlanGrid}>
                        {hostPlans.slice(0, 2).map((plan) => (
                          <article key={`${host.id}-${plan.name}`} className={s.hostPlanCard}>
                            <strong>{plan.name}</strong>
                            <span>{currency.format(plan.introMonthly)} intro</span>
                            <small>{plan.summary}</small>
                          </article>
                        ))}
                      </div>
                    )}

                    <p className={s.tagline}>{host.tagline}</p>

                    <p className={s.caveat}>Watch-out: {host.caveat}</p>
                    <div className={s.hostProofRow}>
                      <span>Verified {verifiedDateLabel}</span>
                      <div className={s.hostProofLinks}>
                        {pricingSource && (
                          <a href={pricingSource} target="_blank" rel="noreferrer noopener">Pricing</a>
                        )}
                        {infraSource && (
                          <a href={infraSource} target="_blank" rel="noreferrer noopener">Infra</a>
                        )}
                        {reviewsSource && (
                          <a href={reviewsSource} target="_blank" rel="noreferrer noopener">Reviews</a>
                        )}
                      </div>
                    </div>

                    <div className={s.hostActions}>
                      <div className={s.actionRow}>
                        <button
                          type="button"
                          onClick={() => toggleCompare(host.id)}
                          className={`${s.actionCompareButton} ${isReplacementSlot ? s.compareWillReplace : inCompare ? s.compareButtonActive : ''}`}
                          aria-pressed={inCompare}
                          title={isReplacementSlot ? `Slot ${compareSlotCapacity} will be replaced if you add another host` : undefined}
                        >
                          {isReplacementSlot
                            ? `Slot ${compareSlotCapacity} — will swap`
                            : inCompare
                              ? 'In compare'
                              : compareIsFull
                                ? 'Swap in'
                                : 'Add to compare'}
                        </button>
                      </div>

                      <div className={s.ctaRow}>
                        <button type="button" className={s.actionModelButton} onClick={() => openSavingsForHost(host, 'rankings')}>
                          Model savings
                        </button>
                        <a className={s.actionDealButton} href={host.affiliateUrl} target="_blank" rel="noreferrer noopener">
                          Claim deal
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
  );
}
