export default function FinderTypeSuggestion({ app }) {
  const {
    HOSTING_TYPE_LABELS,
    activeHostingType,
    activeHostingTypeLabel,
    recommendedHostingType,
    s,
    setHostingType,
  } = app;

  if (!recommendedHostingType || recommendedHostingType === activeHostingType) {
    return null;
  }

  return (
    <div className={s.finderTypeSuggest}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
      <span>Your profile fits <strong>{HOSTING_TYPE_LABELS[recommendedHostingType]}</strong> hosting better than {activeHostingTypeLabel}.</span>
      <button type="button" onClick={() => setHostingType(recommendedHostingType)}>
        Switch to {HOSTING_TYPE_LABELS[recommendedHostingType]}
      </button>
    </div>
  );
}
