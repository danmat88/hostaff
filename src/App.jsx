import { useMemo, useState } from 'react'
import './App.css'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import AdvancedFilters from './components/sections/AdvancedFilters'
import CompareDrawer from './components/sections/CompareDrawer'
import ComparisonTable from './components/sections/ComparisonTable'
import FaqSection from './components/sections/FaqSection'
import FeatureMatrix from './components/sections/FeatureMatrix'
import FilterBar from './components/sections/FilterBar'
import HeroSection from './components/sections/HeroSection'
import HostCardGrid from './components/sections/HostCardGrid'
import InsightsPanel from './components/sections/InsightsPanel'
import NewsletterCta from './components/sections/NewsletterCta'
import ReviewHighlights from './components/sections/ReviewHighlights'
import TrustBar from './components/sections/TrustBar'
import SectionHeader from './components/ui/SectionHeader'
import {
  affiliateDisclosure,
  audienceSegments,
  faqItems,
  featureCatalog,
  hostingProviders,
  mustHaveFeatureOptions,
  reviewHighlights,
  sortOptions,
  trustBadges,
} from './data/hostingData'
import usePersistentState from './hooks/usePersistentState'

const DEFAULT_SORT = 'best-value'
const DEFAULT_MIN_RATING = 4.0
const COMPARE_LIMIT = 3
const DEFAULT_MAX_PRICE = Math.max(
  ...hostingProviders.map((provider) => provider.startingPrice),
)

const SORT_HANDLERS = {
  'best-value': (left, right) => right.valueScore - left.valueScore,
  'top-rated': (left, right) => right.rating - left.rating,
  'lowest-price': (left, right) => left.startingPrice - right.startingPrice,
  fastest: (left, right) => left.speedMs - right.speedMs,
}

function getSearchableContent(provider) {
  return [
    provider.name,
    provider.tagline,
    provider.promotion,
    provider.bestFor.join(' '),
    provider.strengths.join(' '),
    provider.tradeoffs.join(' '),
    Object.values(provider.features).join(' '),
  ]
    .join(' ')
    .toLowerCase()
}

function App() {
  const [activeSegment, setActiveSegment] = useState('all')
  const [activeSort, setActiveSort] = useState(DEFAULT_SORT)
  const [searchQuery, setSearchQuery] = useState('')
  const [minRating, setMinRating] = useState(DEFAULT_MIN_RATING)
  const [maxStartingPrice, setMaxStartingPrice] = useState(DEFAULT_MAX_PRICE)
  const [mustHaveFeatures, setMustHaveFeatures] = useState([])
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [favoriteIds, setFavoriteIds] = usePersistentState('hostaff.favorites', [])
  const [compareIds, setCompareIds] = usePersistentState('hostaff.compare', [])

  const heroStats = useMemo(() => {
    const providersCount = hostingProviders.length
    const avgRating =
      hostingProviders.reduce((sum, provider) => sum + provider.rating, 0) /
      providersCount
    const avgPrice =
      hostingProviders.reduce(
        (sum, provider) => sum + provider.startingPrice,
        0,
      ) / providersCount
    const fastestTTFB = Math.min(...hostingProviders.map((provider) => provider.speedMs))
    const bestSupport = Math.min(
      ...hostingProviders.map((provider) => provider.supportReplyMinutes),
    )

    return [
      { label: 'Avg. editorial rating', value: `${avgRating.toFixed(2)} / 5` },
      { label: 'Avg. intro price', value: `$${avgPrice.toFixed(2)} / mo` },
      { label: 'Fastest tested TTFB', value: `${fastestTTFB} ms` },
      { label: 'Fastest support SLA', value: `~${bestSupport} min` },
    ]
  }, [])

  const visibleProviders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const filteredProviders = hostingProviders.filter((provider) => {
      if (activeSegment !== 'all' && !provider.bestFor.includes(activeSegment)) {
        return false
      }

      if (showOnlyFavorites && !favoriteIds.includes(provider.id)) {
        return false
      }

      if (provider.rating < minRating) {
        return false
      }

      if (provider.startingPrice > maxStartingPrice) {
        return false
      }

      if (
        mustHaveFeatures.some(
          (featureKey) => provider.features[featureKey] !== true,
        )
      ) {
        return false
      }

      if (
        normalizedQuery &&
        !getSearchableContent(provider).includes(normalizedQuery)
      ) {
        return false
      }

      return true
    })

    return [...filteredProviders].sort(
      SORT_HANDLERS[activeSort] ?? SORT_HANDLERS[DEFAULT_SORT],
    )
  }, [
    activeSegment,
    activeSort,
    favoriteIds,
    maxStartingPrice,
    minRating,
    mustHaveFeatures,
    searchQuery,
    showOnlyFavorites,
  ])

  const compareProviders = useMemo(
    () =>
      compareIds
        .map((providerId) =>
          hostingProviders.find((provider) => provider.id === providerId),
        )
        .filter(Boolean),
    [compareIds],
  )

  const decisionInsights = useMemo(() => {
    if (!visibleProviders.length) {
      return []
    }

    const cheapest = visibleProviders.reduce((currentBest, provider) =>
      provider.startingPrice < currentBest.startingPrice ? provider : currentBest,
    )
    const fastest = visibleProviders.reduce((currentBest, provider) =>
      provider.speedMs < currentBest.speedMs ? provider : currentBest,
    )
    const bestSupport = visibleProviders.reduce((currentBest, provider) =>
      provider.supportReplyMinutes < currentBest.supportReplyMinutes
        ? provider
        : currentBest,
    )
    const strongestUptime = visibleProviders.reduce((currentBest, provider) =>
      provider.uptime > currentBest.uptime ? provider : currentBest,
    )

    return [
      {
        label: 'Lowest Intro Cost',
        provider: cheapest.name,
        value: `$${cheapest.startingPrice.toFixed(2)} / mo`,
        note: 'Best for budget launch scenarios.',
      },
      {
        label: 'Fastest Tested Stack',
        provider: fastest.name,
        value: `${fastest.speedMs} ms TTFB`,
        note: 'Optimized for load speed and core web vitals.',
      },
      {
        label: 'Best Support Response',
        provider: bestSupport.name,
        value: `~${bestSupport.supportReplyMinutes} min`,
        note: 'Best pick when response time is critical.',
      },
      {
        label: 'Highest Reliability',
        provider: strongestUptime.name,
        value: `${strongestUptime.uptime.toFixed(2)}% uptime`,
        note: 'Strongest uptime profile in this filtered set.',
      },
    ]
  }, [visibleProviders])

  const fallbackTopProvider = useMemo(
    () =>
      [...hostingProviders].sort(SORT_HANDLERS[DEFAULT_SORT])[0] ??
      hostingProviders[0],
    [],
  )

  const topProvider = visibleProviders[0] ?? fallbackTopProvider
  const matrixProviders =
    compareProviders.length >= 2 ? compareProviders : visibleProviders.slice(0, 4)

  function handleToggleFavorite(providerId) {
    setFavoriteIds((previousIds) =>
      previousIds.includes(providerId)
        ? previousIds.filter((id) => id !== providerId)
        : [...previousIds, providerId],
    )
  }

  function handleToggleCompare(providerId) {
    setCompareIds((previousIds) => {
      if (previousIds.includes(providerId)) {
        return previousIds.filter((id) => id !== providerId)
      }

      if (previousIds.length >= COMPARE_LIMIT) {
        return previousIds
      }

      return [...previousIds, providerId]
    })
  }

  function handleToggleFeature(featureKey) {
    setMustHaveFeatures((previousFeatures) =>
      previousFeatures.includes(featureKey)
        ? previousFeatures.filter((key) => key !== featureKey)
        : [...previousFeatures, featureKey],
    )
  }

  function resetFilters() {
    setActiveSegment('all')
    setActiveSort(DEFAULT_SORT)
    setSearchQuery('')
    setMinRating(DEFAULT_MIN_RATING)
    setMaxStartingPrice(DEFAULT_MAX_PRICE)
    setMustHaveFeatures([])
    setShowOnlyFavorites(false)
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#compare">
        Skip to comparison
      </a>
      <div className="page-glow page-glow-1" />
      <div className="page-glow page-glow-2" />

      <Navbar
        topProvider={topProvider}
        favoriteCount={favoriteIds.length}
        compareCount={compareIds.length}
      />

      <main>
        <HeroSection topProvider={topProvider} stats={heroStats} />

        <section className="section-shell">
          <TrustBar badges={trustBadges} />
        </section>

        <section className="section-shell" id="compare">
          <SectionHeader
            eyebrow="Live Comparison"
            title="Compare Hosting Plans Without Spreadsheet Chaos"
            description="Filter by project type and tune by real buying priorities. Search, shortlist, save favorites, and evaluate final options side-by-side."
          />
          <FilterBar
            activeSegment={activeSegment}
            activeSort={activeSort}
            segments={audienceSegments}
            sortOptions={sortOptions}
            onSegmentChange={setActiveSegment}
            onSortChange={setActiveSort}
          />
          <AdvancedFilters
            searchQuery={searchQuery}
            minRating={minRating}
            maxStartingPrice={maxStartingPrice}
            maxAvailablePrice={DEFAULT_MAX_PRICE}
            selectedFeatures={mustHaveFeatures}
            featureOptions={mustHaveFeatureOptions}
            showOnlyFavorites={showOnlyFavorites}
            resultsCount={visibleProviders.length}
            onSearchChange={setSearchQuery}
            onMinRatingChange={setMinRating}
            onMaxPriceChange={setMaxStartingPrice}
            onToggleFeature={handleToggleFeature}
            onToggleFavorites={() => setShowOnlyFavorites((current) => !current)}
            onReset={resetFilters}
          />
          <InsightsPanel insights={decisionInsights} />
          <ComparisonTable
            providers={visibleProviders}
            favoriteIds={favoriteIds}
            compareIds={compareIds}
            compareLimit={COMPARE_LIMIT}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompare={handleToggleCompare}
          />
          <CompareDrawer
            providers={compareProviders}
            compareLimit={COMPARE_LIMIT}
            onRemoveProvider={(providerId) =>
              setCompareIds((previousIds) =>
                previousIds.filter((id) => id !== providerId),
              )
            }
            onClear={() => setCompareIds([])}
          />
          <p className="disclosure-note">{affiliateDisclosure}</p>
        </section>

        <section className="section-shell" id="reviews">
          <SectionHeader
            eyebrow="Editorial Reviews"
            title="Direct Pros And Tradeoffs For Every Recommended Host"
            description="Each card shows who the host is best for, where it wins, and where you should be careful before signing up."
          />
          <HostCardGrid
            providers={visibleProviders}
            favoriteIds={favoriteIds}
            compareIds={compareIds}
            compareLimit={COMPARE_LIMIT}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompare={handleToggleCompare}
          />
        </section>

        <section className="section-shell">
          <ReviewHighlights items={reviewHighlights} />
        </section>

        <section className="section-shell" id="features">
          <SectionHeader
            eyebrow="Feature Matrix"
            title="Side-By-Side Technical Breakdown"
            description="The matrix focuses on practical factors that impact migration cost, speed, and long-term maintenance."
          />
          {compareProviders.length >= 2 && (
            <p className="matrix-note">
              Matrix is synced to your shortlist for direct final comparison.
            </p>
          )}
          <FeatureMatrix providers={matrixProviders} features={featureCatalog} />
        </section>

        <section className="section-shell" id="faq">
          <SectionHeader
            eyebrow="FAQ"
            title="Common Questions Before Choosing A Host"
            description="Answers are written for affiliate buyers comparing introductory deals against long-term value."
          />
          <FaqSection items={faqItems} />
        </section>

        <section className="section-shell">
          <NewsletterCta />
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default App
