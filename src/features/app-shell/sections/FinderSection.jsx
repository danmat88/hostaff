import {
  FinderControls,
  FinderFlowCta,
  FinderHeaderInsights,
  FinderQuickStart,
  FinderResults,
  FinderTypeSuggestion,
} from './finder';

export default function FinderSection({ app }) {
  const {
    finderFlash,
    s,
  } = app;

  return (
    <section className={`${s.section} ${s.finderSection} ${finderFlash ? s.finderFlash : ''}`} id="finder">
      <FinderHeaderInsights app={app} />
      <FinderTypeSuggestion app={app} />
      <FinderQuickStart app={app} />

      <div className={s.finderLayout}>
        <FinderControls app={app} />
        <FinderResults app={app} />
      </div>

      <FinderFlowCta app={app} />
    </section>
  );
}
