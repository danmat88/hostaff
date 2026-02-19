import CalculatorAllHostsGrid from './CalculatorAllHostsGrid';

export default function CalculatorControlsPanel({ app }) {
  const {
    calculatorHostId,
    calculatorQuickPickHosts,
    calculatorSpendConfig,
    calculatorUsesTopPickFallback,
    currency,
    hostSelectOptions,
    introMonthlyDelta,
    monthlySpend,
    renewalMonthlyDelta,
    s,
    setCalculatorHostId,
    setMonthlySpend,
  } = app;

  return (
    <div className={s.calcControlsCol}>
      <div className={s.calculatorControls}>
        <label>
          <span>Current monthly hosting spend</span>
          <output>{currency.format(monthlySpend)}</output>
        </label>
        <p className={s.calculatorControlHint}>
          Include your full monthly bill (hosting plan, add-ons, and managed services if applicable).
        </p>
        <input
          type="range"
          min={calculatorSpendConfig.min}
          max={calculatorSpendConfig.max}
          step={calculatorSpendConfig.step}
          value={monthlySpend}
          onChange={(event) => setMonthlySpend(Number(event.target.value))}
        />
        <div className={s.calculatorSliderLabels}>
          <span>{currency.format(calculatorSpendConfig.min)}/mo</span>
          <span>{currency.format(calculatorSpendConfig.max)}/mo</span>
        </div>

        <label className={s.hostSelect}>
          <span>Compare against provider</span>
          <select
            value={calculatorHostId}
            onChange={(event) => setCalculatorHostId(event.target.value)}
          >
            {hostSelectOptions.map((host) => (
              <option key={host.id} value={host.id}>{host.name}</option>
            ))}
          </select>
        </label>

        <div className={s.calculatorQuickPicks}>
          <span>{calculatorUsesTopPickFallback ? 'Top picks' : 'Quick picks from compare'}</span>
          <div>
            {calculatorQuickPickHosts.map((host) => (
              <button
                key={`calculator-quick-${host.id}`}
                type="button"
                className={calculatorHostId === host.id ? s.calculatorQuickPickActive : ''}
                onClick={() => setCalculatorHostId(host.id)}
              >
                <img
                  src={app.hostFaviconImages[host.id]}
                  alt=""
                  width="14"
                  height="14"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                {host.name}
              </button>
            ))}
          </div>
        </div>

        <p className={s.calculatorFormula}>
          Formula used: Year 1 = intro price x 12, Year 2+ = renewal price x 12.
        </p>
        {introMonthlyDelta > 0 && renewalMonthlyDelta < 0 && (
          <div className={s.calculatorBreakeven}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            Intro saves {currency.format(introMonthlyDelta)}/mo, but renewal costs {currency.format(Math.abs(renewalMonthlyDelta))}/mo more. Intro savings run out around month {Math.round(12 + (introMonthlyDelta * 12) / Math.abs(renewalMonthlyDelta))}.
          </div>
        )}
      </div>

      <CalculatorAllHostsGrid app={app} />
    </div>
  );
}
