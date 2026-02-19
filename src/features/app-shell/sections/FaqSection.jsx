export default function FaqSection({ app }) {
  const {
    FAQ_TOPIC_CHIPS,
    faqQuery,
    filteredFaqItems,
    jumpToSection,
    normalizedFaqQuery,
    s,
    setFaqQuery,
  } = app;

  return (
<section className={`${s.section} ${s.sectionShell}`} id="faq">
          <div className={s.sectionHeader}>
            <div>
              <p className={s.kicker}>FAQ</p>
              <h2>Questions users ask before choosing hosting</h2>
            </div>
            <p className={s.sectionNote}>
              Search by topic or jump straight to the right tool so you can decide faster.
            </p>
          </div>

          <div className={s.faqQuickActions}>
            <button type="button" className={s.faqQuickActionPrimary} onClick={() => jumpToSection('finder')}>Start in Finder</button>
            <button type="button" onClick={() => jumpToSection('workspace')}>Workspace</button>
            <button type="button" onClick={() => jumpToSection('compare')}>Compare</button>
            <button type="button" onClick={() => jumpToSection('calculator')}>Savings Estimator</button>
          </div>

          <div className={s.faqToolbar}>
            <label className={s.faqSearch}>
              <span>Search answers</span>
              <input
                type="search"
                value={faqQuery}
                onChange={(event) => setFaqQuery(event.target.value)}
                placeholder="Search pricing, ranking, migration, or policy"
              />
            </label>
            <p className={s.faqResultsCount}>
              {filteredFaqItems.length} answer{filteredFaqItems.length === 1 ? '' : 's'} shown
            </p>
            {faqQuery && (
              <button type="button" className={s.faqClearButton} onClick={() => setFaqQuery('')}>
                Clear
              </button>
            )}
          </div>

          {normalizedFaqQuery && (
            <p className={s.faqQueryHint}>
              Showing results for "{normalizedFaqQuery}".
            </p>
          )}

          <div className={s.faqTopicRow}>
            <span>Popular topics:</span>
            <div className={s.faqTopicChips}>
              {FAQ_TOPIC_CHIPS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  className={normalizedFaqQuery.includes(topic.query) ? s.faqTopicChipActive : ''}
                  onClick={() => setFaqQuery((current) => (
                    current.trim().toLowerCase() === topic.query ? '' : topic.query
                  ))}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>

          <div className={s.faqList}>
            {filteredFaqItems.length ? (
              filteredFaqItems.map((item) => (
                <details key={item.question} className={s.faqItem}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))
            ) : (
              <article className={s.faqEmpty}>
                <h3>No FAQ matches this query.</h3>
                <p>Clear or broaden your search to see all methodology answers.</p>
                <button type="button" onClick={() => setFaqQuery('')}>Reset FAQ search</button>
              </article>
            )}
          </div>
        </section>
  );
}
