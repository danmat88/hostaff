import { useMemo, useState } from 'react'
import './App.css'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import ComparisonTable from './components/sections/ComparisonTable'
import FaqSection from './components/sections/FaqSection'
import FeatureMatrix from './components/sections/FeatureMatrix'
import FilterBar from './components/sections/FilterBar'
import HeroSection from './components/sections/HeroSection'
import HostCardGrid from './components/sections/HostCardGrid'
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
  reviewHighlights,
  sortOptions,
  trustBadges,
} from './data/hostingData'

const SORT_HANDLERS = {
  'best-value': (left, right) => right.valueScore - left.valueScore,
  'top-rated': (left, right) => right.rating - left.rating,
  'lowest-price': (left, right) => left.startingPrice - right.startingPrice,
  fastest: (left, right) => left.speedMs - right.speedMs,
}

function App() {
  const [activeSegment, setActiveSegment] = useState('all')
  const [activeSort, setActiveSort] = useState('best-value')

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
    const segmentFiltered =
      activeSegment === 'all'
        ? hostingProviders
        : hostingProviders.filter((provider) =>
            provider.bestFor.includes(activeSegment),
          )

    return [...segmentFiltered].sort(
      SORT_HANDLERS[activeSort] ?? SORT_HANDLERS['best-value'],
    )
  }, [activeSegment, activeSort])

  const topProvider = visibleProviders[0] ?? hostingProviders[0]
  const matrixProviders = visibleProviders.slice(0, 4)

  return (
    <div className="app-shell">
      <div className="page-glow page-glow-1" />
      <div className="page-glow page-glow-2" />

      <Navbar topProvider={topProvider} />

      <main>
        <HeroSection topProvider={topProvider} stats={heroStats} />

        <section className="section-shell">
          <TrustBar badges={trustBadges} />
        </section>

        <section className="section-shell" id="compare">
          <SectionHeader
            eyebrow="Live Comparison"
            title="Compare Hosting Plans Without Spreadsheet Chaos"
            description="Filter by project type and sort by real buying priorities. Pricing, speed, support, and renewal terms are all visible in one view."
          />
          <FilterBar
            activeSegment={activeSegment}
            activeSort={activeSort}
            segments={audienceSegments}
            sortOptions={sortOptions}
            onSegmentChange={setActiveSegment}
            onSortChange={setActiveSort}
          />
          <ComparisonTable providers={visibleProviders} />
          <p className="disclosure-note">{affiliateDisclosure}</p>
        </section>

        <section className="section-shell" id="reviews">
          <SectionHeader
            eyebrow="Editorial Reviews"
            title="Direct Pros And Tradeoffs For Every Recommended Host"
            description="Each card shows who the host is best for, where it wins, and where you should be careful before signing up."
          />
          <HostCardGrid providers={visibleProviders} />
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
