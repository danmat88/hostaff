export function createCompareRows({
  hostReviewSignals,
  compactNumber,
  currency,
  formatSiteLimit,
}) {
  return [
    {
      label: 'Overall score',
      getValue: (host) => host.overallScore,
      format: (value) => `${value}/100`,
      higherIsBetter: true,
    },
    {
      label: 'Live user rating',
      getValue: (host) => (hostReviewSignals.get(host.id)?.weightedScore || host.rating),
      format: (value) => `${value.toFixed(2)} / 5`,
      higherIsBetter: true,
      compareValue: (value) => Number(value.toFixed(4)),
    },
    {
      label: 'Review signals',
      getValue: (host) => (hostReviewSignals.get(host.id)?.totalReviewCount || host.reviewCount),
      format: (value) => `${compactNumber.format(value)} reviews`,
      higherIsBetter: true,
    },
    {
      label: 'Avg user savings',
      getValue: (host) => (hostReviewSignals.get(host.id)?.averageUserSavings || 0),
      format: (value) => value > 0 ? `${currency.format(value)} / mo` : 'No user data yet',
      higherIsBetter: true,
    },
    {
      label: 'Intro price',
      getValue: (host) => host.priceIntro,
      format: (value) => `${currency.format(value)} / month`,
      higherIsBetter: false,
    },
    {
      label: 'Renewal price',
      getValue: (host) => host.priceRenewal,
      format: (value) => `${currency.format(value)} / month`,
      higherIsBetter: false,
    },
    {
      label: 'Starter plan',
      getValue: (host) => host.plans?.[0]?.name || host.planType,
      format: (value) => value,
      highlightBest: false,
    },
    {
      label: 'Starter plan intro',
      getValue: (host) => host.plans?.[0]?.introMonthly ?? host.priceIntro,
      format: (value) => `${currency.format(value)} / month`,
      higherIsBetter: false,
    },
    {
      label: 'Top plan',
      getValue: (host) => {
        const plans = Array.isArray(host.plans) ? host.plans : [];
        return plans.length ? plans[plans.length - 1].name : host.planType;
      },
      format: (value) => value,
      highlightBest: false,
    },
    {
      label: 'Top plan intro',
      getValue: (host) => {
        const plans = Array.isArray(host.plans) ? host.plans : [];
        return plans.length ? plans[plans.length - 1].introMonthly : host.priceIntro;
      },
      format: (value) => `${currency.format(value)} / month`,
      higherIsBetter: false,
    },
    {
      label: 'Top plan renewal',
      getValue: (host) => {
        const plans = Array.isArray(host.plans) ? host.plans : [];
        return plans.length ? plans[plans.length - 1].renewalMonthly : host.priceRenewal;
      },
      format: (value) => `${currency.format(value)} / month`,
      higherIsBetter: false,
    },
    {
      label: 'Year-1 cost',
      getValue: (host) => host.priceIntro * 12,
      format: (value) => `${currency.format(value)} / year`,
      higherIsBetter: false,
    },
    {
      label: '3-year cost',
      getValue: (host) => host.priceIntro * 12 + host.priceRenewal * 24,
      format: (value) => `${currency.format(value)} total`,
      higherIsBetter: false,
    },
    {
      label: 'Avg TTFB',
      getValue: (host) => host.ttfbMs,
      format: (value) => `${value} ms`,
      higherIsBetter: false,
    },
    {
      label: 'Performance score',
      getValue: (host) => host.performance,
      format: (value) => `${value}/100`,
      higherIsBetter: true,
    },
    {
      label: 'Support response',
      getValue: (host) => host.supportResponseMinutes,
      format: (value) => `${value} min avg`,
      higherIsBetter: false,
    },
    {
      label: 'Setup time',
      getValue: (host) => host.setupMinutes,
      format: (value) => `${value} min`,
      higherIsBetter: false,
    },
    {
      label: 'Uptime',
      getValue: (host) => host.uptimePercent,
      format: (value) => `${value.toFixed(2)}%`,
      higherIsBetter: true,
    },
    {
      label: 'Visit capacity',
      getValue: (host) => host.visitCapacityMonthly,
      format: (value) => `${compactNumber.format(value)} / mo`,
      higherIsBetter: true,
    },
    {
      label: 'Storage',
      getValue: (host) => host.storageGb,
      format: (value) => `${value} GB`,
      higherIsBetter: true,
    },
    {
      label: 'Site limit',
      getValue: (host) => host.siteLimit,
      format: (value) => formatSiteLimit(value),
      higherIsBetter: true,
    },
    {
      label: 'Money-back',
      getValue: (host) => host.moneyBackDays,
      format: (value) => `${value} days`,
      higherIsBetter: true,
    },
    {
      label: 'Data centers',
      getValue: (host) => host.dataCenters,
      format: (value) => `${value} regions`,
      higherIsBetter: true,
    },
    {
      label: 'Free domain',
      getValue: (host) => Number(Boolean(host.freeDomain)),
      format: (value) => value ? 'Included' : 'No',
      higherIsBetter: true,
    },
    {
      label: 'Free SSL',
      getValue: (host) => Number(Boolean(host.freeSsl)),
      format: (value) => value ? 'Included' : 'No',
      higherIsBetter: true,
    },
    {
      label: 'CDN included',
      getValue: (host) => Number(Boolean(host.cdnIncluded)),
      format: (value) => value ? 'Included' : 'No',
      higherIsBetter: true,
    },
    {
      label: 'Staging',
      getValue: (host) => Number(Boolean(host.stagingIncluded)),
      format: (value) => value ? 'Included' : 'No',
      higherIsBetter: true,
    },
    {
      label: 'Free migration',
      getValue: (host) => Number(Boolean(host.freeMigration)),
      format: (value) => value ? 'Included' : 'No',
      higherIsBetter: true,
    },
    {
      label: 'Malware protection',
      getValue: (host) => Number(Boolean(host.malwareProtection)),
      format: (value) => value ? 'Included' : 'No',
      higherIsBetter: true,
    },
    {
      label: 'Backup policy',
      getValue: (host) => host.backupPolicy,
      format: (value) => value,
      highlightBest: false,
    },
    {
      label: 'Support channels',
      getValue: (host) => host.supportChannels,
      format: (value) => value,
      highlightBest: false,
    },
    {
      label: 'Control panel',
      getValue: (host) => host.controlPanel,
      format: (value) => value,
      highlightBest: false,
    },
  ];
}
