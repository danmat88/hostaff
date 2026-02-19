import { OverviewHeroCopy } from './overview';
import VsBattle from '../../../components/VsBattle/VsBattle';

export default function OverviewSection({ app }) {
  const { s } = app;

  return (
    <section className={s.hero} id="overview">
      <OverviewHeroCopy app={app} />
      <div className={s.heroBattle}>
        <VsBattle />
      </div>
    </section>
  );
}
