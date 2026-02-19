export default function FinderControls({ app }) {
  const {
    HOSTING_TYPE_DESCRIPTIONS,
    HOSTING_TYPE_OPTIONS,
    LAB_PRIORITIES,
    activeHostingType,
    compareSlotCapacity,
    currency,
    finderBudgetConfig,
    finderBudgetMidpoint,
    finderProjectOptions,
    finderTrafficOptions,
    labProfile,
    resetLabProfile,
    s,
    setHostingType,
    setLabProfile,
    syncFinderToCompare,
  } = app;

  return (
    <article className={s.finderControls}>
      <div className={s.finderControlGroup}>
        <h3>Workload profile</h3>

        <div className={s.finderPillGroup}>
          <span>Hosting type</span>
          <div>
            {HOSTING_TYPE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setHostingType(option.id, { clearPreset: true })}
                className={activeHostingType === option.id ? s.finderPillActive : ''}
                title={HOSTING_TYPE_DESCRIPTIONS[option.id]}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <label className={s.finderLabel}>
          <span>Project type</span>
          <select
            value={labProfile.projectType}
            onChange={(event) => setLabProfile((current) => ({ ...current, projectType: event.target.value }))}
          >
            {finderProjectOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>

        <div className={s.finderPillGroup}>
          <span>Traffic stage</span>
          <div>
            {finderTrafficOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setLabProfile((current) => ({ ...current, traffic: option.id }))}
                className={labProfile.traffic === option.id ? s.finderPillActive : ''}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={s.finderControlGroup}>
        <h3>Budget target</h3>

        <label className={s.finderLabel}>
          <span>Target monthly budget</span>
          <output>{currency.format(labProfile.budget)}</output>
        </label>
        <input
          className={s.finderBudget}
          type="range"
          min={finderBudgetConfig.min}
          max={finderBudgetConfig.max}
          step={finderBudgetConfig.step}
          value={labProfile.budget}
          onChange={(event) => setLabProfile((current) => ({ ...current, budget: Number(event.target.value) }))}
        />
        <div className={s.finderBudgetTicks} aria-hidden="true">
          <span>{currency.format(finderBudgetConfig.min)}</span>
          <span>{currency.format(finderBudgetMidpoint)}</span>
          <span>{currency.format(finderBudgetConfig.max)}</span>
        </div>
      </div>

      <div className={s.finderControlGroup}>
        <h3>Decision priority</h3>

        <div className={s.finderPillGroup}>
          <span>Priority mode</span>
          <div>
            {LAB_PRIORITIES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setLabProfile((current) => ({ ...current, priority: option.id }))}
                className={labProfile.priority === option.id ? s.finderPillActive : ''}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={s.finderControlActions}>
        <button className={s.finderReset} type="button" onClick={resetLabProfile}>
          Reset profile
        </button>
        <button className={s.finderSync} type="button" onClick={syncFinderToCompare}>
          Sync top {compareSlotCapacity} to compare
        </button>
      </div>
      <p className={s.finderControlHint}>Profile saves automatically in this browser.</p>
    </article>
  );
}
