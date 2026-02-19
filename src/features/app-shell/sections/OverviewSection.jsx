import { OverviewHeroCopy, OverviewHeroPanel } from './overview';

export default function OverviewSection({ app }) {
  const { s } = app;

  return (
    <section className={s.hero} id="overview">
      <OverviewHeroCopy app={app} />
      <OverviewHeroPanel app={app} />
    </section>
  );
}
