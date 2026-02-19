export default function FinderQuickStart({ app }) {
  const {
    HERO_INTENTS,
    activeIntentId,
    applyIntent,
    s,
  } = app;

  return (
    <div className={s.finderQuickStart}>
      <p className={s.finderQuickStartLabel}>Jump-start with a goal:</p>
      <div className={s.finderQuickStartGrid}>
        {HERO_INTENTS.map((intent) => (
          <button
            key={intent.id}
            type="button"
            className={`${s.finderQuickStartPill} ${activeIntentId === intent.id ? s.finderQuickStartPillActive : ''}`}
            onClick={() => applyIntent(intent)}
          >
            <strong>{intent.label}</strong>
            <span>{intent.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
