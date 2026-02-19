import { ProofMain, ProofSidebar } from './proof';

export default function ProofSection({ app }) {
  const { activeHostingTypeLabel, s } = app;

  return (
    <section className={`${s.section} ${s.sectionShell}`} id="proof">
      <div className={s.sectionHeader}>
        <div>
          <p className={s.kicker}>Social proof <span className={s.typeBadge}>{activeHostingTypeLabel}</span></p>
          <h2>Real operator feedback for higher {activeHostingTypeLabel.toLowerCase()} buyer confidence</h2>
        </div>
        <p className={s.sectionNote}>
          Verified testimonials with savings context help you compare providers with more confidence.
        </p>
      </div>

      <p className={s.reviewsTypeNote}>
        Showing verified reviews for <strong>{activeHostingTypeLabel}</strong> hosting plans only &mdash; switch type above to see other categories.
      </p>

      <div className={s.reviewLayout}>
        <ProofSidebar app={app} />
        <ProofMain app={app} />
      </div>
    </section>
  );
}
