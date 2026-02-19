import {
  CalculatorControlsPanel,
  CalculatorResultsPanel,
} from './calculator';

export default function CalculatorSection({ app }) {
  const {
    activeHostingTypeLabel,
    s,
  } = app;

  return (
    <section className={`${s.section} ${s.sectionShell}`} id="calculator">
      <div className={s.sectionHeader}>
        <div>
          <p className={s.kicker}>Savings estimator <span className={s.typeBadge}>{activeHostingTypeLabel}</span></p>
          <h2>Understand {activeHostingTypeLabel.toLowerCase()} cost impact before you buy</h2>
        </div>
        <p className={s.sectionNote}>
          Move the slider to your current monthly bill, choose a provider, then compare year-1 promo costs against renewal years.
        </p>
      </div>

      <div className={s.calcLayout}>
        <CalculatorControlsPanel app={app} />
        <CalculatorResultsPanel app={app} />
      </div>
    </section>
  );
}
