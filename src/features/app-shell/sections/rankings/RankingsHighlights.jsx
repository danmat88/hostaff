export default function RankingsHighlights({ app }) {
  const {
    currency,
    rankingBudgetHost,
    rankingLeader,
    rankingPayoutHost,
    rankingSupportHost,
    renderHostText,
    s,
    scoreHost,
  } = app;

  return (
<div className={s.rankingsHighlights}>
            <article className={s.rankingsHighlightCard}>
              <span>Top overall</span>
              <strong>{renderHostText(rankingLeader)}</strong>
              <small>{scoreHost(rankingLeader)} composite score</small>
            </article>
            <article className={s.rankingsHighlightCard}>
              <span>Best intro price</span>
              <strong>{renderHostText(rankingBudgetHost)}</strong>
              <small>{currency.format(rankingBudgetHost.priceIntro)} / month</small>
            </article>
            <article className={s.rankingsHighlightCard}>
              <span>Fastest support</span>
              <strong>{renderHostText(rankingSupportHost)}</strong>
              <small>{rankingSupportHost.supportResponseMinutes} min response</small>
            </article>
            <article className={s.rankingsHighlightCard}>
              <span>Highest affiliate payout</span>
              <strong>{renderHostText(rankingPayoutHost)}</strong>
              <small>{currency.format(rankingPayoutHost.affiliatePayout)} payout</small>
            </article>
          </div>
  );
}
