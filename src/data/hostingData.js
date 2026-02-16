export const audienceSegments = [
  { id: 'all', label: 'All Projects' },
  { id: 'beginners', label: 'Beginners' },
  { id: 'wordpress', label: 'WordPress' },
  { id: 'ecommerce', label: 'Ecommerce' },
  { id: 'developers', label: 'Developers' },
  { id: 'agencies', label: 'Agencies' },
]

export const sortOptions = [
  { id: 'best-value', label: 'Best Value' },
  { id: 'top-rated', label: 'Top Rated' },
  { id: 'lowest-price', label: 'Lowest Price' },
  { id: 'fastest', label: 'Fastest Stack' },
]

export const trustBadges = [
  {
    title: 'Pricing Audited Weekly',
    description: 'Intro and renewal pricing are re-checked every week.',
  },
  {
    title: 'Performance Lab Tested',
    description: 'TTFB and uptime are measured in a neutral sandbox stack.',
  },
  {
    title: 'Affiliate Disclosure Built In',
    description: 'Commissions are visible and never affect negative reviews.',
  },
  {
    title: 'Migration Reality Scored',
    description: 'Each host is rated on how difficult migration really is.',
  },
]

export const reviewHighlights = [
  {
    quote:
      'The filter by project type cut research time from a weekend to under an hour.',
    author: 'Nina Patel',
    project: 'Freelance web studio',
  },
  {
    quote:
      'Renewal pricing is shown up front, which stopped us from choosing a misleading deal.',
    author: 'Marcus Lowell',
    project: 'Bootstrapped SaaS launch',
  },
  {
    quote:
      'The pros and tradeoffs on each card felt practical, not generic marketing language.',
    author: 'Tasha Nguyen',
    project: 'Content-led ecommerce brand',
  },
]

export const faqItems = [
  {
    question: 'How often do affiliate prices change?',
    answer:
      'Promotions can change daily. We check listed prices every week and flag time-limited campaigns directly in each card.',
  },
  {
    question: 'What does Best Value rank by?',
    answer:
      'Best Value balances starting price, renewal cost, tested speed, uptime confidence, and support response speed. It is not a pure price sort.',
  },
  {
    question: 'Can I trust the top pick if my use case is different?',
    answer:
      'Use the segment filters first. The top pick changes based on your selected audience profile, so agency and beginner recommendations do not share identical weighting.',
  },
  {
    question: 'Are these hosts only for WordPress?',
    answer:
      'No. WordPress is a common path, but each provider includes notes about non-WordPress use, such as custom stacks, staging workflows, and API tooling.',
  },
  {
    question: 'Do you include hosts that did not pass review?',
    answer:
      'Only reviewed hosts with acceptable reliability and support standards are listed. Failed candidates are excluded from the public table.',
  },
  {
    question: 'How should I compare intro and renewal pricing?',
    answer:
      'Treat intro pricing as short-term acquisition cost and renewal pricing as your true operating cost. For long projects, renewal has more impact than launch discounts.',
  },
]

export const featureCatalog = [
  { key: 'freeDomain', label: 'Free Domain', type: 'boolean' },
  { key: 'ssl', label: 'Managed SSL', type: 'boolean' },
  { key: 'cdn', label: 'Global CDN', type: 'boolean' },
  { key: 'backups', label: 'Backups', type: 'text' },
  { key: 'staging', label: 'Staging', type: 'boolean' },
  { key: 'nvme', label: 'NVMe Storage', type: 'boolean' },
  { key: 'migrations', label: 'Migration Support', type: 'text' },
  { key: 'datacenters', label: 'Data Centers', type: 'number' },
]

export const mustHaveFeatureOptions = [
  { key: 'ssl', label: 'Managed SSL' },
  { key: 'cdn', label: 'Global CDN' },
  { key: 'staging', label: 'Staging Environment' },
  { key: 'nvme', label: 'NVMe Storage' },
  { key: 'freeDomain', label: 'Free Domain' },
]

export const affiliateDisclosure =
  'Disclosure: This prototype uses affiliate links. We may earn a commission if you purchase through featured providers at no additional cost to you.'

export const hostingProviders = [
  {
    id: 'atlasnode',
    name: 'AtlasNode',
    tagline: 'Balanced managed hosting for most growing sites',
    rating: 4.8,
    reviewCount: 612,
    startingPrice: 2.95,
    renewalPrice: 8.49,
    uptime: 99.99,
    speedMs: 318,
    supportReplyMinutes: 2,
    supportChannel: '24/7 chat + ticket',
    promotion: '74% off first term + free domain',
    moneyBackDays: 30,
    valueScore: 94,
    reliabilityScore: 96,
    performanceScore: 91,
    supportScore: 95,
    bestFor: ['beginners', 'wordpress', 'ecommerce'],
    strengths: [
      'Onboarding wizard handles DNS and SSL in one flow',
      'Daily backup restore available from dashboard',
      'Hands-on migration included on starter plans',
    ],
    tradeoffs: [
      'Starter storage capped at 25 GB',
      'Phone support starts at second tier',
    ],
    affiliateUrl: 'https://example.com/deals/atlasnode',
    features: {
      freeDomain: true,
      ssl: true,
      cdn: true,
      backups: 'Daily',
      staging: true,
      nvme: true,
      migrations: 'Free assisted',
      datacenters: 10,
    },
  },
  {
    id: 'harborstack',
    name: 'HarborStack',
    tagline: 'Developer-friendly stack with agency controls',
    rating: 4.7,
    reviewCount: 488,
    startingPrice: 3.6,
    renewalPrice: 9.2,
    uptime: 99.98,
    speedMs: 340,
    supportReplyMinutes: 4,
    supportChannel: '24/7 ticket + priority chat',
    promotion: 'Annual plans include team seats',
    moneyBackDays: 45,
    valueScore: 91,
    reliabilityScore: 94,
    performanceScore: 90,
    supportScore: 88,
    bestFor: ['developers', 'agencies', 'wordpress'],
    strengths: [
      'Role-based access and project-level permissions',
      'Git deploy and CLI tooling included',
      'Longer 45-day refund period than most providers',
    ],
    tradeoffs: [
      'Control panel has a steeper learning curve',
      'Best features unlock at annual billing',
    ],
    affiliateUrl: 'https://example.com/deals/harborstack',
    features: {
      freeDomain: false,
      ssl: true,
      cdn: true,
      backups: 'Daily + on-demand',
      staging: true,
      nvme: true,
      migrations: 'Paid concierge',
      datacenters: 13,
    },
  },
  {
    id: 'peakhost',
    name: 'PeakHost',
    tagline: 'Aggressive entry pricing for first-time launches',
    rating: 4.5,
    reviewCount: 1044,
    startingPrice: 1.99,
    renewalPrice: 6.99,
    uptime: 99.95,
    speedMs: 405,
    supportReplyMinutes: 6,
    supportChannel: 'Chat + knowledge base',
    promotion: '79% launch discount on 24-month plan',
    moneyBackDays: 30,
    valueScore: 92,
    reliabilityScore: 89,
    performanceScore: 82,
    supportScore: 84,
    bestFor: ['beginners', 'ecommerce'],
    strengths: [
      'Lowest intro pricing in the lineup',
      'Simple setup flow for first websites',
      'Good fit for low-traffic brochure projects',
    ],
    tradeoffs: [
      'Higher latency under heavy concurrent load',
      'No built-in staging on starter plan',
    ],
    affiliateUrl: 'https://example.com/deals/peakhost',
    features: {
      freeDomain: true,
      ssl: true,
      cdn: true,
      backups: 'Weekly',
      staging: false,
      nvme: false,
      migrations: 'Self-serve plugin',
      datacenters: 8,
    },
  },
  {
    id: 'forgecloud',
    name: 'ForgeCloud',
    tagline: 'High-performance cloud hosting for traffic spikes',
    rating: 4.9,
    reviewCount: 378,
    startingPrice: 5.4,
    renewalPrice: 11.5,
    uptime: 99.99,
    speedMs: 280,
    supportReplyMinutes: 2,
    supportChannel: '24/7 engineer chat',
    promotion: 'Free migration sprint + launch tune-up',
    moneyBackDays: 14,
    valueScore: 88,
    reliabilityScore: 97,
    performanceScore: 98,
    supportScore: 94,
    bestFor: ['developers', 'agencies', 'ecommerce'],
    strengths: [
      'Fastest tested stack with autoscaling safeguards',
      'Advanced caching controls per environment',
      'Strong support for launch windows and campaigns',
    ],
    tradeoffs: [
      'Higher baseline price than shared hosts',
      'Shorter money-back window',
    ],
    affiliateUrl: 'https://example.com/deals/forgecloud',
    features: {
      freeDomain: false,
      ssl: true,
      cdn: true,
      backups: 'Realtime + snapshots',
      staging: true,
      nvme: true,
      migrations: 'Free engineer-led',
      datacenters: 17,
    },
  },
  {
    id: 'cedarwp',
    name: 'CedarWP',
    tagline: 'WordPress-centric plans with strong editing workflows',
    rating: 4.6,
    reviewCount: 522,
    startingPrice: 4.2,
    renewalPrice: 10.2,
    uptime: 99.97,
    speedMs: 332,
    supportReplyMinutes: 3,
    supportChannel: 'WordPress specialists 24/7',
    promotion: 'Plugin hardening bundle included',
    moneyBackDays: 30,
    valueScore: 89,
    reliabilityScore: 93,
    performanceScore: 89,
    supportScore: 90,
    bestFor: ['wordpress', 'agencies', 'beginners'],
    strengths: [
      'Strong plugin and theme compatibility checks',
      'Editorial-safe staging and push-to-live workflow',
      'Performance dashboard focused on Core Web Vitals',
    ],
    tradeoffs: [
      'Less flexible for non-WordPress stacks',
      'Renewal pricing is on the premium side',
    ],
    affiliateUrl: 'https://example.com/deals/cedarwp',
    features: {
      freeDomain: false,
      ssl: true,
      cdn: true,
      backups: 'Daily',
      staging: true,
      nvme: true,
      migrations: 'Free assisted',
      datacenters: 11,
    },
  },
  {
    id: 'liftpanel',
    name: 'LiftPanel',
    tagline: 'Budget-friendly host with clean management UI',
    rating: 4.4,
    reviewCount: 683,
    startingPrice: 2.49,
    renewalPrice: 7.6,
    uptime: 99.94,
    speedMs: 392,
    supportReplyMinutes: 5,
    supportChannel: 'Chat-first support',
    promotion: 'Free email accounts on starter plan',
    moneyBackDays: 30,
    valueScore: 87,
    reliabilityScore: 87,
    performanceScore: 84,
    supportScore: 85,
    bestFor: ['beginners', 'ecommerce'],
    strengths: [
      'Intuitive dashboard with low learning overhead',
      'Fair renewal pricing for budget projects',
      'Easy domain and mailbox setup',
    ],
    tradeoffs: [
      'Limited advanced developer controls',
      'Backups are weekly by default',
    ],
    affiliateUrl: 'https://example.com/deals/liftpanel',
    features: {
      freeDomain: true,
      ssl: true,
      cdn: false,
      backups: 'Weekly',
      staging: false,
      nvme: false,
      migrations: 'Paid add-on',
      datacenters: 7,
    },
  },
]
