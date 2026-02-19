import { memo } from 'react';
import s from '../../App.module.css';
import { JOURNEY_STEPS } from './constants';

const CompareDock = memo(function CompareDock({
  dockState,
  compareHosts,
  compareSlotCapacity,
  activeHostingTypeLabel,
  activeJourneyIndex,
  isJourneyFlowComplete,
  nextJourneyStep,
  hostFaviconImages,
  hostAvatarFallbackImages,
  showDock,
  hideDock,
  toggleCompare,
  onSectionNavClick,
  toggleDockCollapsed,
  jumpToSection,
}) {
  if (dockState.hidden) {
    return (
      <button
        type="button"
        className={s.compareDockReveal}
        onClick={showDock}
        aria-label="Show compare dock"
      >
        {compareHosts.length > 0 ? (
          <div className={s.dockRevealAvatarStack}>
            {compareHosts.map((host) => (
              <img
                key={host.id}
                src={hostFaviconImages[host.id]}
                className={s.dockRevealAvatar}
                onError={(e) => { e.currentTarget.src = hostAvatarFallbackImages[host.id]; }}
                alt={host.name}
                width="22"
                height="22"
              />
            ))}
          </div>
        ) : (
          <span className={s.compareDockRevealBadge}>0</span>
        )}
        <div className={s.dockRevealLabel}>
          <strong>Compare</strong>
          <span>{compareHosts.length}/{compareSlotCapacity} hosts selected</span>
        </div>
      </button>
    );
  }

  return (
    <aside
      className={`${s.compareDock} ${dockState.collapsed ? s.compareDockCollapsed : ''}`}
      aria-label="Comparison dock"
    >
      <div className={s.dockSlots}>
        <p className={s.dockSlotLabel}>Comparing {activeHostingTypeLabel}</p>
        {Array.from({ length: compareSlotCapacity }, (_, slotIndex) => {
          const host = compareHosts[slotIndex];
          return host ? (
            <span key={host.id} className={s.dockSlotFilled}>
              <img
                src={hostFaviconImages[host.id]}
                className={s.dockSlotFavicon}
                width="16"
                height="16"
                onError={(e) => { e.currentTarget.src = hostAvatarFallbackImages[host.id]; }}
                alt=""
              />
              <span className={s.dockSlotName}>{host.name}</span>
              <button
                type="button"
                className={s.dockSlotRemove}
                onClick={() => toggleCompare(host.id)}
                aria-label={`Remove ${host.name} from compare`}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M2 2l6 6M8 2l-6 6" />
                </svg>
              </button>
            </span>
          ) : (
            <a
              key={`empty-${slotIndex}`}
              href="#rankings"
              className={s.dockSlotEmpty}
              onClick={(event) => onSectionNavClick(event, 'rankings')}
              title="Go to Rankings to add a host"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 1v6M1 4h6" />
              </svg>
              Add host
            </a>
          );
        })}
      </div>

      {!dockState.collapsed && (
        <div className={s.dockStepper}>
          {JOURNEY_STEPS.map((step, i) => (
            <button
              key={step.id}
              type="button"
              className={`${s.dockStep} ${i < activeJourneyIndex ? s.dockStepDone : ''} ${i === activeJourneyIndex ? s.dockStepActive : ''}`}
              onClick={() => jumpToSection(step.id)}
              title={step.label}
            >
              <span className={s.dockStepDot}>
                {i < activeJourneyIndex ? (
                  <svg width="7" height="7" viewBox="0 0 7 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1.5 3.5l1.4 1.4 2.6-2.6" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </span>
              <span className={s.dockStepLabel}>{step.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className={s.dockActions}>
        {!dockState.collapsed && (
          <button
            type="button"
            className={s.dockContinue}
            onClick={() => jumpToSection(nextJourneyStep.id)}
          >
            {isJourneyFlowComplete ? 'View proof' : `${nextJourneyStep.label} ->`}
          </button>
        )}
        <a
          href="#compare"
          className={s.dockCompareCta}
          onClick={(event) => onSectionNavClick(event, 'compare')}
        >
          Compare
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" />
          </svg>
        </a>
        <div className={s.dockDivider} aria-hidden="true" />
        <button
          type="button"
          className={s.dockControl}
          onClick={toggleDockCollapsed}
          aria-label={dockState.collapsed ? 'Expand dock' : 'Minimize dock'}
          title={dockState.collapsed ? 'Expand' : 'Minimize'}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {dockState.collapsed
              ? <path d="M2 8l4-4 4 4" />
              : <path d="M2 4l4 4 4-4" />}
          </svg>
        </button>
        <button
          type="button"
          className={`${s.dockControl} ${s.dockControlClose}`}
          onClick={hideDock}
          aria-label="Hide dock"
          title="Hide dock"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M2 2l6 6M8 2l-6 6" />
          </svg>
        </button>
      </div>
    </aside>
  );
});

export {
  CompareDock,
};
