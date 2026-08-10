// ============================================
// Golden Mandate — V1 authored setup/payoff path
// ============================================
// A deliberately small Phase 5–7 arc used to prove the wider people, teaser
// and offer-reveal systems before they are spread across the whole game.

import type { Email, GameEvent, PhaseId, PlayerResources, UpcomingBeat } from '../types/game';

export const GOLDEN_MANDATE_CHAIN = 'golden-mandate';
export const GOLDEN_RICARDO_DECISION = 'golden-ricardo-stance';

interface GoldenMandateState {
  phase: PhaseId;
  day: number;
  week: number;
  client: { name: string; companyName: string };
  events: GameEvent[];
  emails: Email[];
  eventDirectorState: { storyFlags: Record<string, string> };
}

export interface GoldenMandateResult {
  event: GameEvent;
  email?: Email;
  resourceEffects?: Partial<PlayerResources>;
}

function hasStep(state: GoldenMandateState, step: number): boolean {
  return state.events.some((event) => event.chainId === GOLDEN_MANDATE_CHAIN && event.chainStep === step);
}

function crisisResolved(state: GoldenMandateState): boolean {
  return state.emails.some((email) => email.id.startsWith('email-golden-ricardo-') && email.state === 'resolved');
}

/**
 * Only returns developments that are already implied by this arc's current
 * state. Nothing is created merely to keep the tape populated.
 */
export function getGoldenMandateUpcomingBeat(state: GoldenMandateState): UpcomingBeat | null {
  if (state.phase < 5 || state.phase > 7) return null;

  if (state.phase === 5 && !hasStep(state, 1)) {
    return {
      id: 'golden-signal',
      dueDay: state.day + 1,
      label: "Tomorrow: Vektor's investment committee meets on Solara.",
      source: 'event_chain',
    };
  }

  if (!hasStep(state, 2) && hasStep(state, 1)) {
    return {
      id: 'golden-ricardo-crisis',
      dueDay: state.day + 1,
      label: 'Tomorrow: Ricardo wants to decide before Vektor calls.',
      source: 'decision',
    };
  }

  if (hasStep(state, 2) && crisisResolved(state) && !hasStep(state, 3)) {
    return {
      id: 'golden-buyer-conflict',
      dueDay: state.day + 1,
      label: 'Tomorrow: Vektor and Kestrel force a choice about process discipline.',
      source: 'buyer',
    };
  }

  if (hasStep(state, 3) && !hasStep(state, 4)) {
    return {
      id: 'golden-beacon-intervention',
      dueDay: state.day + 1,
      label: 'Tomorrow: Beacon Partners makes its move with Ricardo.',
      source: 'event_chain',
    };
  }

  return null;
}

/** Resolves the next telegraphed V1 beat once its stated day is reached. */
export function resolveGoldenMandateBeat(
  state: GoldenMandateState,
  newDay: number,
): GoldenMandateResult | null {
  const upcoming = getGoldenMandateUpcomingBeat(state);
  if (!upcoming || upcoming.dueDay > newDay) return null;

  const eventBase = {
    week: Math.ceil(newDay / 7),
    phase: state.phase,
    resolved: false,
    chainId: GOLDEN_MANDATE_CHAIN,
  } as const;

  switch (upcoming.id) {
    case 'golden-signal':
      return {
        event: {
          ...eventBase,
          id: `evt-golden-signal-${newDay}`,
          chainStep: 1,
          type: 'passive',
          tensionCategory: 'pressure',
          title: "Vektor's IC moves up",
          description: "Vektor Industries has brought its investment-committee discussion forward to tomorrow. Their team wants an answer on whether the process will remain competitive before they commit senior operating time.",
        },
        resourceEffects: { dealMomentum: 2 },
      };

    case 'golden-ricardo-crisis':
      return {
        event: {
          ...eventBase,
          id: `evt-golden-ricardo-${newDay}`,
          chainStep: 2,
          type: 'active',
          tensionCategory: 'pressure',
          title: 'Ricardo wants certainty before the call',
          description: 'Ricardo is worried that keeping the auction open will lose Vektor. He wants a clear answer before their investment committee convenes.',
        },
        email: {
          id: `email-golden-ricardo-${newDay}`,
          week: Math.ceil(newDay / 7),
          day: newDay,
          phase: state.phase,
          sender: state.client.name,
          senderRole: `Founder & CEO, ${state.client.companyName}`,
          subject: 'Before Vektor calls: are we really holding the line?',
          body: "Vektor's people are telling me they can move quickly if we give them a clear path. I know a process is supposed to create options, but I do not want to lose a serious buyer just to prove we can run an auction.\n\nTell me plainly: do we protect the process, or give them a private lane to show their best number?",
          preview: 'Ricardo wants a decision before Vektor’s IC call.',
          category: 'client',
          state: 'unread',
          priority: 'urgent',
          timestamp: `Day ${newDay}`,
          responseOptions: [
            {
              id: 'hold-process',
              label: 'Hold the line — competition is how we protect your outcome.',
              effects: '+3 trust, +4 momentum',
              resourceEffects: { clientTrust: 3, dealMomentum: 4 },
              storyDecision: { key: GOLDEN_RICARDO_DECISION, value: 'hold-process' },
            },
            {
              id: 'private-lane',
              label: 'Give Vektor a private lane to show its best number.',
              effects: '+6 trust, -3 momentum',
              resourceEffects: { clientTrust: 6, dealMomentum: -3 },
              storyDecision: { key: GOLDEN_RICARDO_DECISION, value: 'private-lane' },
            },
          ],
        },
      };

    case 'golden-buyer-conflict': {
      const heldProcess = state.eventDirectorState.storyFlags[GOLDEN_RICARDO_DECISION] === 'hold-process';
      return {
        event: {
          ...eventBase,
          id: `evt-golden-conflict-${newDay}`,
          chainStep: 3,
          type: 'cascade',
          tensionCategory: heldProcess ? 'agency' : 'pressure',
          title: heldProcess ? 'Kestrel steps into Vektor’s shadow' : 'Vektor tests the private lane',
          description: heldProcess
            ? 'Vektor accepts the competitive timetable. Kestrel responds by accelerating its own workstream, restoring genuine pressure around the NBO round.'
            : 'Vektor appreciates the private access but asks for comfort on exclusivity. Kestrel hears the market chatter and warns that it will not remain a supporting bidder.',
        },
        resourceEffects: heldProcess
          ? { dealMomentum: 5, reputation: 2 }
          : { dealMomentum: -3, riskLevel: 3 },
      };
    }

    case 'golden-beacon-intervention': {
      const heldProcess = state.eventDirectorState.storyFlags[GOLDEN_RICARDO_DECISION] === 'hold-process';
      return {
        event: {
          ...eventBase,
          id: `evt-golden-beacon-${newDay}`,
          chainStep: 4,
          type: 'active',
          tensionCategory: 'pressure',
          title: 'Beacon Partners calls Ricardo directly',
          description: heldProcess
            ? 'Beacon tells Ricardo that a smaller bilateral process would be “cleaner”. Ricardo reports the call to you, but asks whether you can prove the auction is still creating value.'
            : 'Beacon tells Ricardo that your private lane is evidence the process has lost discipline. The message lands because Vektor now expects special treatment.',
        },
        resourceEffects: heldProcess ? { clientTrust: -1, reputation: 2 } : { clientTrust: -4, reputation: -2 },
      };
    }

    default:
      return null;
  }
}

export function getGoldenMandateOfferDriver(
  buyerId: string,
  storyFlags: Record<string, string>,
): string | null {
  if (buyerId !== 'buyer-01') return null;

  return storyFlags[GOLDEN_RICARDO_DECISION] === 'hold-process'
    ? 'You held the competitive process when Ricardo wanted certainty; Vektor kept its best terms on the table.'
    : storyFlags[GOLDEN_RICARDO_DECISION] === 'private-lane'
      ? 'You gave Vektor early access; it moved quickly, but retained more leverage in the final terms.'
      : null;
}
