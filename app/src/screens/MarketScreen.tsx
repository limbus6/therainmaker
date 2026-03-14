import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function useSentimentIndicators() {
  const headlines = useGameStore((s) => s.headlines);
  const week = useGameStore((s) => s.week);
  const buyers = useGameStore((s) => s.buyers);
  const resources = useGameStore((s) => s.resources);

  // Sector mood: count positive vs negative sector headlines
  const sectorHeadlines = headlines.filter((h) => h.category === 'sector' || h.category === 'comparable');
  const positiveKeywords = ['accelerat', 'surge', 'acquir', 'expand', 'high', 'strong', 'grows'];
  const negativeKeywords = ['slow', 'declin', 'contract', 'drop', 'weak', 'cool', 'fall'];
  let sectorScore = 0;
  for (const hl of sectorHeadlines) {
    const lower = hl.text.toLowerCase();
    if (positiveKeywords.some((k) => lower.includes(k))) sectorScore++;
    if (negativeKeywords.some((k) => lower.includes(k))) sectorScore--;
  }
  const sectorMood = sectorScore > 1 ? 'Positive' : sectorScore < -1 ? 'Negative' : 'Neutral';

  // Financing climate
  const macroHeadlines = headlines.filter((h) => h.category === 'macro');
  let finScore = 0;
  for (const hl of macroHeadlines) {
    const lower = hl.text.toLowerCase();
    if (['tighten', 'elevated', 'restrictive', 'pressure'].some((k) => lower.includes(k))) finScore--;
    if (['ease', 'loosen', 'abundant', 'favorable', 'raises'].some((k) => lower.includes(k))) finScore++;
  }
  const financingClimate = finScore > 0 ? 'Favorable' : finScore < 0 ? 'Tightening' : 'Stable';

  // Buyer sentiment: based on actual buyer engagement + momentum
  const activeBuyers = buyers.filter((b) => ['active', 'shortlisted', 'bidding', 'preferred'].includes(b.status)).length;
  const buyerSentiment = activeBuyers > 3 ? 'Strong' : activeBuyers > 0 ? 'Warming' :
    resources.dealMomentum > 50 ? 'Curious' : week < 4 ? 'Awaiting' : 'Neutral';

  return { sectorMood, financingClimate, buyerSentiment, sectorScore, finScore, activeBuyers };
}

const moodConfig = {
  Positive: { color: 'text-state-success', icon: TrendingUp, detail: 'Industrial IoT consolidation trend' },
  Neutral: { color: 'text-text-secondary', icon: Minus, detail: 'Mixed signals from the sector' },
  Negative: { color: 'text-state-danger', icon: TrendingDown, detail: 'Sector headwinds emerging' },
} as const;

const finConfig = {
  Favorable: { color: 'text-state-success', icon: TrendingUp, detail: 'Ample capital chasing deals' },
  Stable: { color: 'text-text-secondary', icon: Minus, detail: 'Financing conditions steady' },
  Tightening: { color: 'text-state-warning', icon: TrendingDown, detail: 'PE spreads elevated across Europe' },
} as const;

const buyerConfig: Record<string, { color: string; detail: string }> = {
  Strong: { color: 'text-state-success', detail: 'Multiple buyers actively engaged' },
  Warming: { color: 'text-state-info', detail: 'Early engagement underway' },
  Curious: { color: 'text-text-accent', detail: 'Momentum building interest' },
  Awaiting: { color: 'text-text-muted', detail: 'Awaiting market positioning' },
  Neutral: { color: 'text-text-secondary', detail: 'No buyer engagement yet' },
};

export default function MarketScreen() {
  const headlines = useGameStore((s) => s.headlines);
  const week = useGameStore((s) => s.week);
  const { sectorMood, financingClimate, buyerSentiment } = useSentimentIndicators();

  const mc = moodConfig[sectorMood as keyof typeof moodConfig];
  const fc = finConfig[financingClimate as keyof typeof finConfig];
  const bc = buyerConfig[buyerSentiment] ?? buyerConfig.Neutral;

  // Show latest headlines first
  const sortedHeadlines = [...headlines].sort((a, b) => b.week - a.week);

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-display font-semibold text-text-primary">Market & Signals</h1>
        <p className="text-[12px] text-text-muted mt-1">External environment and market intelligence</p>
      </div>

      {/* Sentiment Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Panel title="Sector Mood">
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2">
              <mc.icon size={20} className={mc.color} />
              <span className={`text-2xl font-mono font-bold ${mc.color}`}>{sectorMood}</span>
            </div>
            <div className="text-[11px] text-text-muted mt-1">{mc.detail}</div>
          </div>
        </Panel>
        <Panel title="Financing Climate">
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2">
              <fc.icon size={20} className={fc.color} />
              <span className={`text-2xl font-mono font-bold ${fc.color}`}>{financingClimate}</span>
            </div>
            <div className="text-[11px] text-text-muted mt-1">{fc.detail}</div>
          </div>
        </Panel>
        <Panel title="Buyer Sentiment">
          <div className="text-center py-4">
            <span className={`text-2xl font-mono font-bold ${bc.color}`}>{buyerSentiment}</span>
            <div className="text-[11px] text-text-muted mt-1">{bc.detail}</div>
          </div>
        </Panel>
      </div>

      {/* News Feed */}
      <Panel title="News Feed" subtitle={`${headlines.length} items through week ${week}`}>
        {sortedHeadlines.length === 0 ? (
          <p className="text-[12px] text-text-muted py-8 text-center">No market activity this week.</p>
        ) : (
          <div className="space-y-3">
            {sortedHeadlines.map((hl) => (
              <div key={hl.id} className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-surface-default border border-border-subtle">
                <span className="w-2 h-2 rounded-full bg-accent-primary/60 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-[13px] text-text-secondary leading-relaxed">{hl.text}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StatusChip label={hl.category.replace('_', ' ')} />
                    <span className="text-[10px] font-mono text-text-muted">Week {hl.week}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
