export default function TrustStripSection({ app }) {
  const {
    TRUST_METRICS,
    s,
  } = app;

  return (
<section className={s.heroTrustStrip} aria-label="Trust and transparency">
          {TRUST_METRICS.map((item) => (
            <article key={item.label} className={s.heroTrustItem}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </section>
  );
}
