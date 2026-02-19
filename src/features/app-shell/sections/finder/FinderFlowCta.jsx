export default function FinderFlowCta({ app }) {
  const {
    jumpToSection,
    s,
  } = app;

  return (
    <div className={s.sectionFlowCta}>
      <p>Found your matches? Save them to your workspace or go straight to compare.</p>
      <div>
        <button type="button" onClick={() => jumpToSection('workspace')}>View workspace</button>
        <button type="button" onClick={() => jumpToSection('compare')} className={s.sectionFlowCtaPrimary}>Open compare table</button>
      </div>
    </div>
  );
}
