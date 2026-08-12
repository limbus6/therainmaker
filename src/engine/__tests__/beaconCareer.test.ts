import { describe, expect, it } from 'vitest';
import {
  buildBeaconMarketTombstone,
  buildBeaconRunTombstone,
  buildBeaconSummary,
  selectBeaconDeclinedMandate,
} from '../beaconCareer';

describe('Beacon career rules', () => {
  it('takes the highest-difficulty mandate Clearwater declines', () => {
    expect(selectBeaconDeclinedMandate('solara-flagship')?.id).toBe('solara-headwinds');
    expect(selectBeaconDeclinedMandate('solara-headwinds')?.id).toBe('solara-flagship');
    expect(selectBeaconDeclinedMandate('solara-tailwinds')?.id).toBe('solara-headwinds');
  });

  it('reproduces a market result from the same career step', () => {
    const first = buildBeaconMarketTombstone('solara-flagship', 4, '2026-08-12T00:00:00.000Z');
    const replay = buildBeaconMarketTombstone('solara-flagship', 4, '2026-08-12T00:00:00.000Z');
    expect(replay).toEqual(first);
    expect(first).toMatchObject({
      mandateId: 'solara-headwinds',
      outcome: 'beacon_win',
      trigger: 'player_declined',
    });
  });

  it('records a collapse as a visible Beacon win and a close as a Clearwater win', () => {
    const loss = buildBeaconRunTombstone({
      playerRunKey: 'loss-1', mandateId: 'solara-headwinds', playerOutcome: 'collapsed', seed: 123, completedAt: '2026-08-12T00:00:00.000Z',
    });
    const win = buildBeaconRunTombstone({
      playerRunKey: 'win-1', mandateId: 'solara-flagship', playerOutcome: 'closed', seed: 456, completedAt: '2026-08-12T00:00:00.000Z',
    });

    expect(loss).toMatchObject({ outcome: 'beacon_win', trigger: 'player_lost' });
    expect(loss!.closingValue).toBeGreaterThan(0);
    expect(win).toMatchObject({ outcome: 'beacon_beaten', trigger: 'player_closed', closingValue: 0 });
    expect(buildBeaconSummary([loss!, win!])).toEqual({
      beaconWins: 1,
      clearwaterWins: 1,
      declinedMandatesWon: 0,
      rescuedProcesses: 1,
    });
  });
});
