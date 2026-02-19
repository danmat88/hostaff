export default function AppChrome({ app }) {
  const {
    ALT_THEME,
    DEFAULT_THEME,
    HOSTING_TYPE_OPTIONS,
    JOURNEY_STEPS,
    NAV_SECTIONS,
    activeHostingType,
    activeHostingTypeLabel,
    activeJourneyIndex,
    activeSection,
    activeSectionLabel,
    compareIds,
    headerRef,
    journeyProgress,
    mobileNavOpen,
    onSectionNavClick,
    openCommandCenter,
    s,
    setHostingType,
    setMobileNavOpen,
    theme,
    toggleTheme,
  } = app;

  return (
<>
<header ref={headerRef} className={s.header}>
        <div className={s.headerInner}>
          <a className={s.brand} href="#overview" onClick={(event) => onSectionNavClick(event, 'overview')}>
            <span className={s.brandMark}>HA</span>
            <span className={s.brandText}>
              <strong>HostAff Pro</strong>
              <small>Hosting comparison intelligence</small>
            </span>
          </a>

          <nav className={s.nav} aria-label="Primary">
            {NAV_SECTIONS.filter((section) => section.id !== 'overview').map((section) => {
              const compareCount = section.id === 'compare' ? compareIds.filter(Boolean).length : 0;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(event) => onSectionNavClick(event, section.id)}
                  className={`${s.navLink} ${activeSection === section.id ? s.navLinkActive : ''}`}
                >
                  {section.label}
                  {compareCount > 0 && (
                    <span className={s.navBadge} aria-label={`${compareCount} hosts queued`}>{compareCount}</span>
                  )}
                </a>
              );
            })}
          </nav>

          <button
            type="button"
            className={s.headerTypeBadge}
            onClick={(event) => onSectionNavClick(event, 'overview')}
            title="Change hosting type — scroll to top"
            aria-label={`Current hosting type: ${activeHostingTypeLabel}. Click to change.`}
          >
            {activeHostingTypeLabel}
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>

          <button
            type="button"
            className={s.mobileMenuBtn}
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileNavOpen}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          <button type="button" className={s.headerUtility} onClick={openCommandCenter}>
            Actions <span className={s.headerKbd}>Ctrl+K</span>
          </button>

          <button
            type="button"
            className={s.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === DEFAULT_THEME ? 'ocean' : 'sunset'} theme`}
            aria-pressed={theme === ALT_THEME}
            title={`Switch to ${theme === DEFAULT_THEME ? 'ocean' : 'sunset'} theme`}
          >
            {theme === DEFAULT_THEME ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2.5 14.5c2.1 0 2.1-2.3 4.2-2.3s2.1 2.3 4.2 2.3 2.1-2.3 4.2-2.3 2.1 2.3 4.2 2.3" />
                <path d="M2.5 18.5h19" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="3.8" />
                <path d="M12 3.2v2.1M12 18.7v2.1M20.8 12h-2.1M5.3 12H3.2M18.2 5.8l-1.5 1.5M7.3 16.7l-1.5 1.5M18.2 18.2l-1.5-1.5M7.3 7.3 5.8 5.8" />
              </svg>
            )}
          </button>

          <a className={s.headerCta} href="#finder" onClick={(event) => onSectionNavClick(event, 'finder')}>Start host finder</a>
        </div>

        <div className={s.pageMapWrap} aria-label="Journey map">
          <div className={s.pageMapInner}>
            <p className={s.pageMapStatus}>
              You are here:
              {' '}
              <strong>{activeSectionLabel}</strong>
            </p>
            <div className={s.pageMapTrack}>
              {JOURNEY_STEPS.map((step, index) => {
                const isActive = index === activeJourneyIndex;
                const isDone = index < activeJourneyIndex;

                return (
                  <a
                    key={step.id}
                    href={`#${step.id}`}
                    onClick={(event) => onSectionNavClick(event, step.id)}
                    className={`${s.pageMapStep} ${isActive ? s.pageMapStepActive : ''} ${isDone ? s.pageMapStepDone : ''}`}
                  >
                    <span>{index + 1}</span>
                    <b>{step.label}</b>
                  </a>
                );
              })}
            </div>
          </div>
          <div className={s.pageMapProgress} aria-hidden="true">
            <span style={{ width: `${journeyProgress}%` }} />
          </div>
        </div>
      </header>

      <div
        className={`${s.mobileNav} ${mobileNavOpen ? s.mobileNavOpen : ''}`}
        aria-hidden={!mobileNavOpen}
      >
        <div className={s.mobileBackdrop} onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
        <div className={s.mobileNavDrawer} role="dialog" aria-label="Site navigation">
          <button
            type="button"
            className={s.mobileNavClose}
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <label className={s.mobileTypeControl}>
            <span>Hosting type</span>
            <select
              value={activeHostingType}
              onChange={(event) => setHostingType(event.target.value, { clearPreset: true })}
            >
              {HOSTING_TYPE_OPTIONS.map((option) => (
                <option key={`mobile-type-${option.id}`} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
          {NAV_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(event) => {
                onSectionNavClick(event, section.id);
                setMobileNavOpen(false);
              }}
              className={`${s.mobileNavLink} ${activeSection === section.id ? s.mobileNavLinkActive : ''}`}
            >
              {section.label}
            </a>
          ))}
        </div>
      </div>
</>
  );
}
