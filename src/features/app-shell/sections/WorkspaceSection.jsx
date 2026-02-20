export default function WorkspaceSection({ app }) {
  const {
    activeHostingTypeLabel,
    clearShortlist,
    compareExtraSlotEnabled,
    compareMinimumRequired,
    compareSlotCapacity,
    currency,
    formatVerifiedDate,
    jumpToSection,
    normalizedCompareIds,
    openSavingsForHost,
    renderHostInline,
    renderHostText,
    s,
    shortlistRenewalIncrease,
    shortlistedHosts,
    syncAndCompare,
    syncShortlistToCompare,
    toggleCompare,
    toggleShortlist,
    workspaceAverageIntro,
    workspaceAverageScore,
    workspaceCheapestHost,
    workspaceNeedsMoreToCompare,
    workspacePrimaryAction,
    workspaceReadiness,
    workspaceTopHost,
  } = app;

  return (
<section className={`${s.section} ${s.sectionShell}`} id="workspace">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>Workspace <span className={s.typeBadge}>{activeHostingTypeLabel}</span></p>
              <h2>Your saved {activeHostingTypeLabel} shortlist and next best action</h2>
            </div>
            <p className={s.sectionNote}>
              Use this as your decision queue for {activeHostingTypeLabel.toLowerCase()} offers: save providers, sync them to compare, then validate costs before opening deals.
            </p>
          </div>

          <div className={s.workspaceSignals}>
            <article className={s.workspaceSignalCard}>
              <span>Decision readiness</span>
              <strong>{workspaceReadiness}%</strong>
              <div className={s.workspaceReadinessBar}>
                <div className={s.workspaceReadinessFill} style={{ width: `${workspaceReadiness}%` }} />
              </div>
              <small>{shortlistedHosts.length}/{compareSlotCapacity} hosts added for compare confidence</small>
            </article>
            <article className={s.workspaceSignalCard}>
              <span>Average shortlist score</span>
              <strong>{workspaceAverageScore ? `${workspaceAverageScore}/100` : 'No data yet'}</strong>
              <small>
                {workspaceTopHost ? (
                  <>
                    Best current fit: {renderHostText(workspaceTopHost)}
                  </>
                ) : 'Save hosts to start scoring'}
              </small>
            </article>
            <article className={s.workspaceSignalCard}>
              <span>Price anchor</span>
              <strong>{workspaceAverageIntro ? `${currency.format(workspaceAverageIntro)} / mo avg` : 'No shortlist yet'}</strong>
              <small>
                {workspaceCheapestHost ? (
                  <>
                    Lowest intro: {renderHostText(workspaceCheapestHost)}
                  </>
                ) : 'Find low-intro options in rankings'}
              </small>
            </article>
          </div>

          <div className={s.workspaceGuide}>
            <article>
              <span>Step 1</span>
              <strong>Save hosts while browsing</strong>
              <p>Use the Save button in Finder and Rankings to build your shortlist in one place.</p>
            </article>
            <article>
              <span>Step 2</span>
              <strong>Sync shortlist into compare</strong>
              <p>
                {compareExtraSlotEnabled
                  ? `Keep 2-${compareSlotCapacity} providers in compare so key metrics stay side by side.`
                  : `Keep ${compareMinimumRequired} provider${compareMinimumRequired === 1 ? '' : 's'} in compare so key metrics stay side by side.`}
              </p>
            </article>
            <article>
              <span>Step 3</span>
              <strong>Validate cost before clicking out</strong>
              <p>Open Savings to check first-year and renewal impact before you choose a host.</p>
            </article>
          </div>

          <div className={s.workspaceHintBar}>
            <p>{workspacePrimaryAction.label}</p>
            <button
              type="button"
              onClick={() => {
                if (workspacePrimaryAction.actionId === 'sync-shortlist') {
                  syncShortlistToCompare();
                  return;
                }

                if (workspacePrimaryAction.actionId === 'open-compare') {
                  jumpToSection('compare');
                  return;
                }

                if (workspacePrimaryAction.actionId === 'open-finder') {
                  jumpToSection('finder');
                  return;
                }

                jumpToSection('rankings');
              }}
            >
              {workspacePrimaryAction.button}
            </button>
            {workspaceNeedsMoreToCompare > 0 && (
              <small className={s.workspaceActionHint}>
                Use the Finder to get profile-matched recommendations, or browse Rankings manually.
              </small>
            )}
          </div>

          {shortlistedHosts.length === 0 ? (
            <article className={s.workspaceEmpty}>
              <h3>No saved hosts yet</h3>
              <p>
                Save hosts from Finder or Rankings and they will appear here. This helps you track serious options without losing context.
              </p>
              <div className={s.workspaceEmptyActions}>
                <button type="button" onClick={() => jumpToSection('finder')}>Open finder</button>
                <button type="button" onClick={() => jumpToSection('rankings')}>Browse rankings</button>
              </div>
            </article>
          ) : (
            <div className={s.workspaceShell}>
              <header className={s.workspaceSummary}>
                <div>
                  <h3>{shortlistedHosts.length} host{shortlistedHosts.length === 1 ? '' : 's'} saved</h3>
                  <p>
                    {shortlistRenewalIncrease > 0
                      ? <>Renewal price increase across shortlist: <strong>+{currency.format(shortlistRenewalIncrease)}/mo</strong> after intro periods end</>
                      : 'No renewal price increases in your shortlist'}
                  </p>
                </div>
                <div className={s.workspaceActions}>
                  <button
                    type="button"
                    className={s.workspaceActionPrimary}
                    onClick={syncAndCompare}
                    disabled={shortlistedHosts.length < compareMinimumRequired}
                  >
                    Sync &amp; compare
                  </button>
                  <button type="button" className={s.workspaceActionDanger} onClick={clearShortlist}>
                    Clear shortlist
                  </button>
                </div>
              </header>

              <div className={s.workspaceGrid}>
                {shortlistedHosts.map((host) => {
                  const starterPlan = host.plans?.[0] || null;
                  const verifiedDateLabel = formatVerifiedDate(host.lastVerified);

                  return (
                    <article key={host.id} className={s.workspaceCard}>
                      <div>
                        <strong>{renderHostInline(host)}</strong>
                        <span>{host.category}</span>
                      </div>
                      <p>{host.bestFor}</p>
                      {starterPlan && (
                        <p className={s.workspacePlanMeta}>
                          Starter: <strong>{starterPlan.name}</strong> ({currency.format(starterPlan.introMonthly)}/mo)
                        </p>
                      )}
                      {(() => {
                        const renewalPct = host.priceRenewal > host.priceIntro
                          ? Math.round((host.priceRenewal / host.priceIntro - 1) * 100)
                          : 0;
                        const isSevere = renewalPct >= 40;
                        const isModerate = renewalPct >= 10 && renewalPct < 40;
                        return (
                          <div className={s.workspacePriceMeta}>
                            <small className={s.workspacePriceIntro}>{currency.format(host.priceIntro)} intro</small>
                            <small className={s.workspacePriceRenewal}>Renews at {currency.format(host.priceRenewal)}/mo</small>
                            {(isSevere || isModerate) && (
                              <span className={`${s.workspaceRenewalWarn} ${isSevere ? s.workspaceRenewalWarnSevere : s.workspaceRenewalWarnModerate}`}>
                                +{renewalPct}% at renewal
                              </span>
                            )}
                          </div>
                        );
                      })()}
                      <small className={s.workspaceVerifiedMeta}>Verified {verifiedDateLabel}</small>
                      <div className={s.workspaceCardActions}>
                        <button type="button" className={s.workspaceCardCompare} onClick={() => toggleCompare(host.id)}>
                          {normalizedCompareIds.includes(host.id) ? 'In compare' : 'Add compare'}
                        </button>
                        <button type="button" className={s.workspaceCardSavings} onClick={() => openSavingsForHost(host, 'workspace')}>
                          Savings
                        </button>
                        <button type="button" className={s.workspaceCardRemove} onClick={() => toggleShortlist(host.id)}>
                          Remove
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
  );
}
