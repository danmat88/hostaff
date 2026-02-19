import OverviewPanelSlideCompare from './OverviewPanelSlideCompare';
import OverviewPanelSlideLeaders from './OverviewPanelSlideLeaders';
import OverviewPanelSlideVerdict from './OverviewPanelSlideVerdict';

export default function OverviewPanelWorkspace({ app }) {
  const {
    HERO_PANEL_VIEWS,
    heroPanelIndex,
    heroPanelProgress,
    heroPanelView,
    onHeroPanelTabKeyDown,
    s,
    showHeroPanelView,
  } = app;

  return (
    <div className={s.panelWorkspace}>
      <div className={s.panelStepper} role="tablist" aria-label="Hero panel views">
        {HERO_PANEL_VIEWS.map((view) => (
          <button
            key={view.id}
            id={`hero-tab-${view.id}`}
            type="button"
            role="tab"
            aria-selected={heroPanelView === view.id}
            aria-controls={`hero-panel-${view.id}`}
            tabIndex={heroPanelView === view.id ? 0 : -1}
            className={`${s.panelStepButton} ${heroPanelView === view.id ? s.panelStepButtonActive : ''}`}
            onKeyDown={onHeroPanelTabKeyDown}
            onClick={() => showHeroPanelView(view.id, true)}
          >
            <span className={s.panelStepNumber}>{view.step}</span>
            <strong>{view.label}</strong>
            <span className={s.panelStepHint}>{view.hint}</span>
          </button>
        ))}
      </div>

      <div className={s.panelWorkspaceMain}>
        <div className={s.panelProgress} aria-hidden="true">
          <span style={{ width: `${heroPanelProgress}%` }} />
        </div>

        <div className={s.heroPanelViewport}>
          <div
            className={s.heroPanelSlider}
            style={{ transform: `translateX(-${heroPanelIndex * 100}%)` }}
          >
            <OverviewPanelSlideLeaders app={app} />
            <OverviewPanelSlideCompare app={app} />
            <OverviewPanelSlideVerdict app={app} />
          </div>
        </div>
      </div>
    </div>
  );
}
