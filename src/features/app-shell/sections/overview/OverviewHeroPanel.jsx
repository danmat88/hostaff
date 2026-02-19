import OverviewPanelFooter from './OverviewPanelFooter';
import OverviewPanelSummary from './OverviewPanelSummary';
import OverviewPanelWorkspace from './OverviewPanelWorkspace';

export default function OverviewHeroPanel({ app }) {
  const {
    HERO_PANEL_VIEWS,
    activeHeroPanelView,
    handleHeroPanelBlur,
    heroPanelAutoPlay,
    s,
    setHeroPanelInteracting,
    toggleHeroPanelAutoPlay,
  } = app;

  return (
    <aside
      className={s.heroPanel}
      onMouseEnter={() => setHeroPanelInteracting(true)}
      onMouseLeave={() => setHeroPanelInteracting(false)}
      onFocusCapture={() => setHeroPanelInteracting(true)}
      onBlurCapture={handleHeroPanelBlur}
    >
      <div className={s.panelHeader}>
        <div className={s.panelHeaderCopy}>
          <p className={s.panelLabel}>
            {activeHeroPanelView.step}
            <span className={s.panelLabelOf}>{' '}of {HERO_PANEL_VIEWS.length}</span>
          </p>
          <strong className={s.panelTitle}>{activeHeroPanelView.title}</strong>
          <p className={s.panelSubtext}>{activeHeroPanelView.hint}</p>
        </div>
        <button
          type="button"
          className={`${s.panelPlayPause} ${heroPanelAutoPlay ? s.panelPlayPauseActive : ''}`}
          onClick={toggleHeroPanelAutoPlay}
          aria-pressed={heroPanelAutoPlay}
          aria-label={heroPanelAutoPlay ? 'Pause auto-advance' : 'Auto-advance steps'}
          title={heroPanelAutoPlay ? 'Pause' : 'Play through steps'}
        >
          {heroPanelAutoPlay ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
              <rect x="2" y="2" width="3.5" height="10" rx="1" />
              <rect x="8.5" y="2" width="3.5" height="10" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
              <path d="M3 2.5l9 4.5-9 4.5V2.5z" />
            </svg>
          )}
        </button>
      </div>

      <OverviewPanelSummary app={app} />
      <OverviewPanelWorkspace app={app} />
      <OverviewPanelFooter app={app} />
    </aside>
  );
}
