import { getMandate, isShortMandate, MANDATE_POOL, type MandateDefinition } from '../content/mandates';
import { createRng, deriveSeed } from './rng';

export type BeaconOutcome = 'beacon_win' | 'beacon_beaten';
export type BeaconTrigger = 'player_declined' | 'player_lost' | 'player_closed';

export interface BeaconTombstone {
  runKey: string;
  mandateId: string;
  mandateLabel: string;
  companyName: string;
  buyerName: string | null;
  closingValue: number;
  totalAdvisoryFee: number;
  grade: string;
  outcome: BeaconOutcome;
  trigger: BeaconTrigger;
  daysTaken: number;
  completedAt: string;
  rule: string;
}

const BEACON_BUYERS = ['Northstar Holdings', 'Axiom Industrial', 'Meridian Capital', 'Helix Automation'];

export function selectBeaconDeclinedMandate(chosenMandateId: string): MandateDefinition | null {
  return [...MANDATE_POOL]
    .filter((mandate) => mandate.id !== chosenMandateId)
    .sort((left, right) => right.difficulty.overall - left.difficulty.overall || left.id.localeCompare(right.id))[0] ?? null;
}

function simulateBeaconWin(
  mandate: MandateDefinition,
  runKey: string,
  trigger: Extract<BeaconTrigger, 'player_declined' | 'player_lost'>,
  seed: number,
  completedAt: string,
): BeaconTombstone {
  const rng = createRng(deriveSeed(seed, mandate.seedBase, 0xbeac0));
  const difficultyDrag = Math.max(0, mandate.difficulty.overall - 50) * 0.35;
  const closingValue = Math.round((90 + rng.nextInt(0, 48) - difficultyDrag) * 10) / 10;
  const daysTaken = (isShortMandate(mandate.id) ? 82 : 185) + rng.nextInt(0, isShortMandate(mandate.id) ? 38 : 70);

  return {
    runKey,
    mandateId: mandate.id,
    mandateLabel: mandate.label,
    companyName: 'Solara Systems',
    buyerName: BEACON_BUYERS[rng.nextInt(0, BEACON_BUYERS.length - 1)],
    closingValue,
    totalAdvisoryFee: Math.round(closingValue * 20),
    grade: closingValue >= 120 ? 'Strong Rival Close' : 'Disciplined Rival Close',
    outcome: 'beacon_win',
    trigger,
    daysTaken,
    completedAt,
    rule: trigger === 'player_declined'
      ? 'Market rule: Beacon takes the highest-difficulty mandate Clearwater leaves behind.'
      : 'Loss rule: Beacon enters the restarted process only after Clearwater records a collapse.',
  };
}

export function buildBeaconMarketTombstone(
  chosenMandateId: string,
  marketStep: number,
  completedAt: string,
): BeaconTombstone | null {
  const declined = selectBeaconDeclinedMandate(chosenMandateId);
  if (!declined) return null;
  return simulateBeaconWin(
    declined,
    `beacon-market-${marketStep}-${declined.id}`,
    'player_declined',
    deriveSeed(declined.seedBase, marketStep),
    completedAt,
  );
}

export function buildBeaconRunTombstone({
  playerRunKey,
  mandateId,
  playerOutcome,
  seed,
  completedAt,
}: {
  playerRunKey: string;
  mandateId: string;
  playerOutcome: 'closed' | 'collapsed';
  seed: number;
  completedAt: string;
}): BeaconTombstone | null {
  const mandate = getMandate(mandateId);
  if (!mandate) return null;
  const runKey = `beacon-run-${playerRunKey}`;

  if (playerOutcome === 'collapsed') {
    return simulateBeaconWin(mandate, runKey, 'player_lost', seed, completedAt);
  }

  return {
    runKey,
    mandateId,
    mandateLabel: mandate.label,
    companyName: 'Solara Systems',
    buyerName: null,
    closingValue: 0,
    totalAdvisoryFee: 0,
    grade: 'Outpitched by Clearwater',
    outcome: 'beacon_beaten',
    trigger: 'player_closed',
    daysTaken: 0,
    completedAt,
    rule: 'Win rule: every Clearwater close counts as a direct career win over Beacon.',
  };
}

export interface BeaconSummary {
  beaconWins: number;
  clearwaterWins: number;
  declinedMandatesWon: number;
  rescuedProcesses: number;
}

export function buildBeaconSummary(tombstones: BeaconTombstone[]): BeaconSummary {
  return {
    beaconWins: tombstones.filter((tombstone) => tombstone.outcome === 'beacon_win').length,
    clearwaterWins: tombstones.filter((tombstone) => tombstone.outcome === 'beacon_beaten').length,
    declinedMandatesWon: tombstones.filter((tombstone) => tombstone.trigger === 'player_declined').length,
    rescuedProcesses: tombstones.filter((tombstone) => tombstone.trigger === 'player_lost').length,
  };
}
