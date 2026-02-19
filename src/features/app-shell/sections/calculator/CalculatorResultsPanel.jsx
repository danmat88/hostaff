export default function CalculatorResultsPanel({ app }) {
  const {
    annualDelta,
    calculatorHost,
    calculatorPolicySource,
    calculatorPricingSource,
    calculatorPromoCode,
    calculatorVerifiedLabel,
    copyPromoCode,
    currency,
    hostAvatarFallbackImages,
    hostFaviconImages,
    monthlySpend,
    s,
    SavingsLineChart,
    threeYearDelta,
    twoYearDelta,
  } = app;

  return (
    <div className={s.calcResultsCol}>
      <div className={`${s.calcHostCard} ${threeYearDelta >= 0 ? s.calcHostCardGain : s.calcHostCardLoss}`}>
        <div className={s.calcHostCardHeader}>
          <div className={s.calcHostCardLogoWrap}>
            <img
              src={hostFaviconImages[calculatorHost.id]}
              alt=""
              width="44"
              height="44"
              className={s.calcHostCardLogo}
              onError={(e) => { e.currentTarget.src = hostAvatarFallbackImages[calculatorHost.id]; }}
            />
          </div>
          <div className={s.calcHostCardMeta}>
            <strong className={s.calcHostCardName}>{calculatorHost.name}</strong>
            {calculatorHost.editorBadge && (
              <span className={s.calcHostCardBadge}>{calculatorHost.editorBadge}</span>
            )}
            <small className={s.calcHostCardTagline}>{calculatorHost.tagline}</small>
          </div>
        </div>
        <div className={s.calcHostCardSavings}>
          <p className={s.calcHostCardSavingsLabel}>
            {threeYearDelta >= 0 ? 'Potential 3-year savings' : 'Extra cost over 3 years'}
          </p>
          <span className={s.calcHostCardAmount}>{currency.format(Math.abs(threeYearDelta))}</span>
          <p className={s.calcHostCardSub}>
            vs staying at {currency.format(monthlySpend)}/mo - intro {currency.format(calculatorHost.priceIntro)}/mo
            {calculatorHost.priceRenewal !== calculatorHost.priceIntro && ` -> renewal ${currency.format(calculatorHost.priceRenewal)}/mo`}
          </p>
        </div>
      </div>

      <SavingsLineChart
        monthlySpend={monthlySpend}
        introPrice={calculatorHost.priceIntro}
        renewalPrice={calculatorHost.priceRenewal}
      />

      <div className={s.calcMetricsRow}>
        <div className={`${s.calcMetric} ${annualDelta >= 0 ? s.calcMetricGain : s.calcMetricLoss}`}>
          <small>Year 1</small>
          <strong>{currency.format(Math.abs(annualDelta))}</strong>
          <span>{annualDelta >= 0 ? 'saved' : 'extra'}</span>
        </div>
        <div className={`${s.calcMetric} ${twoYearDelta >= 0 ? s.calcMetricGain : s.calcMetricLoss}`}>
          <small>2 years</small>
          <strong>{currency.format(Math.abs(twoYearDelta))}</strong>
          <span>{twoYearDelta >= 0 ? 'saved' : 'extra'}</span>
        </div>
        <div className={`${s.calcMetric} ${threeYearDelta >= 0 ? s.calcMetricGain : s.calcMetricLoss}`}>
          <small>3 years</small>
          <strong>{currency.format(Math.abs(threeYearDelta))}</strong>
          <span>{threeYearDelta >= 0 ? 'saved' : 'extra'}</span>
        </div>
      </div>

      <div className={s.calcDealCard}>
        <div className={s.calcDealCardTop}>
          <img
            src={hostFaviconImages[calculatorHost.id]}
            alt={calculatorHost.name}
            width="26"
            height="26"
            className={s.calcDealLogo}
            onError={(e) => { e.currentTarget.src = hostAvatarFallbackImages[calculatorHost.id]; }}
          />
          <div className={s.calcDealInfo}>
            <strong>{calculatorHost.promoLabel}</strong>
            {calculatorPromoCode && (
              <button type="button" className={s.calculatorPromoBtn} onClick={() => void copyPromoCode(calculatorHost)}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                {calculatorPromoCode}
                <small>tap to copy</small>
              </button>
            )}
          </div>
        </div>
        <div className={s.calcDealStats}>
          <span>
            <small>Intro price</small>
            {currency.format(calculatorHost.priceIntro)}/mo
          </span>
          <span>
            <small>Renewal</small>
            {currency.format(calculatorHost.priceRenewal)}/mo
          </span>
          <span>
            <small>Money-back</small>
            {calculatorHost.moneyBackDays} days
          </span>
        </div>
        <a
          className={s.calcDealBtn}
          href={calculatorHost.affiliateUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          Claim deal - {calculatorHost.name}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
        <p className={s.calculatorSourceRow}>
          Verified {calculatorVerifiedLabel}
          {calculatorPricingSource && (
            <>{' · '}<a href={calculatorPricingSource} target="_blank" rel="noreferrer noopener">Pricing source</a></>
          )}
          {calculatorPolicySource && (
            <>{' · '}<a href={calculatorPolicySource} target="_blank" rel="noreferrer noopener">Policy</a></>
          )}
        </p>
      </div>
    </div>
  );
}
