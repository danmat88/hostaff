export default function CommandOverlay({ app }) {
  const {
    closeCommandCenter,
    commandInputRef,
    commandQuery,
    isCommandOpen,
    runCommandAction,
    s,
    setCommandQuery,
    visibleCommandActions,
  } = app;

  return (
isCommandOpen && (
        <div className={s.commandOverlay} onClick={closeCommandCenter}>
          <section
            className={s.commandPanel}
            role="dialog"
            aria-modal="true"
            aria-label="Quick actions"
            onClick={(event) => event.stopPropagation()}
          >
            <header className={s.commandHeader}>
              <strong>Quick Actions</strong>
              <button type="button" onClick={closeCommandCenter} aria-label="Close quick actions">
                Close
              </button>
            </header>

            <label className={s.commandSearch}>
              <span>Search actions</span>
              <input
                ref={commandInputRef}
                type="search"
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                placeholder="Type an action, section, or keyword"
              />
            </label>

            <div className={s.commandList}>
              {visibleCommandActions.length ? (
                visibleCommandActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={s.commandAction}
                    onClick={() => {
                      if (action.disabled) {
                        return;
                      }
                      runCommandAction(action.id);
                      closeCommandCenter();
                    }}
                    disabled={Boolean(action.disabled)}
                  >
                    <strong>{action.label}</strong>
                    <span>{action.hint}</span>
                  </button>
                ))
              ) : (
                <p className={s.commandEmpty}>No actions match this search.</p>
              )}
            </div>

            <p className={s.commandHint}>Shortcuts: Ctrl/Cmd + K open · ? open · Esc close · Shift + L theme · Shift + S share · Shift + V compare view</p>
          </section>
        </div>
      )
  );
}
