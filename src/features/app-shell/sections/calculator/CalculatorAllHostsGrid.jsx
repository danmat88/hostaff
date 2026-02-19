export default function CalculatorAllHostsGrid({ app }) {
  const {
    activeHostingTypeLabel,
    annualCurrent,
    calculatorHostId,
    currency,
    hostsForActiveType,
    renderHostText,
    s,
    setCalculatorHostId,
    threeYearCurrent,
  } = app;

  return (
    <div className={s.calculatorAllHosts}>
      <p className={s.calculatorAllHostsLabel}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        All {activeHostingTypeLabel.toLowerCase()} providers at {currency.format(app.monthlySpend)}/mo
      </p>
      <div className={s.calculatorAllHostsGrid}>
        {[...hostsForActiveType]
          .map((host) => ({
            host,
            yr1: annualCurrent - host.priceIntro * 12,
            yr3: threeYearCurrent - (host.priceIntro * 12 + host.priceRenewal * 24),
          }))
          .sort((a, b) => b.yr3 - a.yr3)
          .map(({ host, yr1, yr3 }, idx) => {
            const isActive = host.id === calculatorHostId;
            return (
              <button
                key={`calc-all-${host.id}`}
                type="button"
                className={`${s.calculatorHostRow} ${isActive ? s.calculatorHostRowActive : ''} ${yr3 >= 0 ? s.calculatorHostRowGain : s.calculatorHostRowLoss}`}
                onClick={() => setCalculatorHostId(host.id)}
              >
                <div className={s.calculatorHostRowTop}>
                  <img
                    src={app.hostFaviconImages[host.id]}
                    alt=""
                    width="18"
                    height="18"
                    className={s.calcHostRowFavicon}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  {idx === 0 && <span className={s.calculatorHostRowBadge}>Best 3yr</span>}
                  <strong>{renderHostText(host)}</strong>
                  <span>{currency.format(host.priceIntro)}/mo</span>
                </div>
                <div className={s.calculatorHostRowMetrics}>
                  <div>
                    <small>Year 1</small>
                    <span className={yr1 >= 0 ? s.calcPositive : s.calcNegative}>
                      {yr1 >= 0 ? `${currency.format(yr1)} saved` : `${currency.format(Math.abs(yr1))} more`}
                    </span>
                  </div>
                  <div>
                    <small>3 yrs</small>
                    <span className={yr3 >= 0 ? s.calcPositive : s.calcNegative}>
                      {yr3 >= 0 ? `${currency.format(yr3)} saved` : `${currency.format(Math.abs(yr3))} more`}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
