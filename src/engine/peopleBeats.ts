// ============================================
// People Beats — M2 authored relationship arc (Phases 3-6)
// ============================================
// Generalises the Golden Mandate mold: telegraphed, deterministic beats that
// put Ricardo and the buyers in front of the player as characters. Founder
// check-ins read his derived mood at resolve time; buyer beats move the
// relationship attributes that already decide the endgame (chemistry,
// credibility, DD friction), so every choice pays off through existing
// pipelines rather than bespoke modifiers.

import type { Email, GameEvent, PhaseId, PlayerResources, UpcomingBeat } from '../types/game';
import { deriveFounderMood, FOUNDER_MOOD_NOTES, type FounderMood } from './founderPulse';

export const PEOPLE_BEATS_CHAIN = 'people-beats';

export const KESTREL_APPROACH_FLAG = 'kestrel-approach';
export const SCHNEIDER_GOVERNANCE_FLAG = 'schneider-governance';
export const SCHNEIDER_DD_FLAG = 'schneider-dd';

interface PeopleBeatsState {
  phase: PhaseId;
  day: number;
  week: number;
  phaseEntryDay: Partial<Record<number, number>>;
  phaseDeadline: number | null;
  resources: Pick<PlayerResources, 'clientTrust' | 'dealMomentum' | 'riskLevel'>;
  client: { name: string; companyName: string };
  events: GameEvent[];
  buyers: { id: string; name: string; status: string }[];
}

export interface PeopleBeatResult {
  event: GameEvent;
  email: Email;
}

interface BeatDef {
  id: string;
  phase: PhaseId;
  offsetDays: number;
  teaser: (state: PeopleBeatsState) => string | null;
  build: (state: PeopleBeatsState, day: number) => PeopleBeatResult | null;
}

function fired(state: PeopleBeatsState, beatId: string): boolean {
  return state.events.some((event) => event.id.startsWith(`evt-${beatId}`));
}

function buyerActive(state: PeopleBeatsState, buyerId: string): boolean {
  const buyer = state.buyers.find((b) => b.id === buyerId);
  return !!buyer && !['dropped', 'excluded'].includes(buyer.status);
}

function founderMood(state: PeopleBeatsState): FounderMood {
  return deriveFounderMood({
    clientTrust: state.resources.clientTrust,
    dealMomentum: state.resources.dealMomentum,
    riskLevel: state.resources.riskLevel,
    daysUntilDeadline: state.phaseDeadline !== null ? state.phaseDeadline - state.day : null,
  });
}

function founderCheckIn(
  beatId: string,
  phase: PhaseId,
  offsetDays: number,
  topic: {
    calm: string;
    confident: string;
    worried: string;
    subjectCalm: string;
    subjectConfident: string;
    subjectWorried: string;
  },
): BeatDef {
  return {
    id: beatId,
    phase,
    offsetDays,
    teaser: () => 'Tomorrow: Ricardo wants a word before the week moves on.',
    build: (state, day) => {
      const mood = founderMood(state);
      const worried = mood === 'anxious' || mood === 'restless';
      const confident = mood === 'confident';
      const subject = worried ? topic.subjectWorried : confident ? topic.subjectConfident : topic.subjectCalm;
      const message = worried ? topic.worried : confident ? topic.confident : topic.calm;
      const week = Math.ceil(day / 7);
      return {
        event: {
          id: `evt-${beatId}-${day}`,
          week,
          phase: state.phase,
          type: 'active',
          title: worried ? 'Ricardo needs reassurance' : confident ? 'Ricardo sees leverage' : 'Ricardo checks in',
          description: FOUNDER_MOOD_NOTES[mood],
          resolved: false,
          chainId: PEOPLE_BEATS_CHAIN,
          tensionCategory: worried ? 'pressure' : 'recovery',
        },
        email: {
          id: `email-${beatId}-${day}`,
          week,
          day,
          phase: state.phase,
          sender: state.client.name,
          senderRole: `Founder & CEO, ${state.client.companyName}`,
          subject,
          body: `${FOUNDER_MOOD_NOTES[mood]}\n\n${message}`,
          preview: subject,
          category: 'client',
          state: 'unread',
          priority: 'urgent',
          timestamp: `Day ${day}`,
          responseOptions: worried
            ? [
                {
                  id: 'walk-through',
                  label: 'Walk him through the plan step by step — take the hour.',
                  effects: 'Trust +5, Capacity -4',
                  resourceEffects: { clientTrust: 5, teamCapacity: -4 },
                },
                {
                  id: 'hold-course',
                  label: 'Reassure him briefly and hold the course.',
                  effects: 'Risk -1, Trust -2',
                  resourceEffects: { riskLevel: -1, clientTrust: -2 },
                },
              ]
            : [
                {
                  id: 'share-read',
                  label: 'Share your candid read of where the process stands.',
                  effects: 'Trust +3',
                  resourceEffects: { clientTrust: 3 },
                },
                {
                  id: 'keep-brief',
                  label: 'Keep it brief — the work speaks for itself.',
                  effects: 'Risk -1',
                  resourceEffects: { riskLevel: -1 },
                },
              ],
        },
      };
    },
  };
}

const BEATS: BeatDef[] = [
  founderCheckIn('people-ricardo-p3', 3, 3, {
    subjectCalm: 'How is the market reading us?',
    subjectConfident: 'Which buyer should feel the pressure first?',
    subjectWorried: 'Are the right buyers actually engaging?',
    calm: 'The teaser is out and I keep imagining who is reading it. Give me your honest read — who is leaning in, and what does that tell us?',
    confident: 'The names opening the teaser are exactly the names we wanted. Tell me where we can press without looking overeager — I want the market to know this is competitive.',
    worried: 'The teaser went out and I have heard nothing I can hold on to. I need to know whether the silence is process or a verdict.',
  }),
  {
    id: 'people-kestrel-p3',
    phase: 3,
    offsetDays: 6,
    teaser: (state) => (buyerActive(state, 'buyer-03') ? "Tomorrow: Kestrel's partner wants to talk terms of engagement." : null),
    build: (state, day) => {
      if (!buyerActive(state, 'buyer-03')) return null;
      const week = Math.ceil(day / 7);
      return {
        event: {
          id: `evt-people-kestrel-p3-${day}`,
          week,
          phase: state.phase,
          type: 'active',
          title: 'Kestrel proposes a direct line',
          resolved: false,
          chainId: PEOPLE_BEATS_CHAIN,
          tensionCategory: 'agency',
          description: 'Kestrel Capital wants a standing weekly call with the founder — outside the process cadence. A relationship play, and a discipline question.',
        },
        email: {
          id: `email-people-kestrel-p3-${day}`,
          week,
          day,
          phase: state.phase,
          sender: 'Imogen Hartley',
          senderRole: 'Partner, Kestrel Capital',
          subject: 'A more direct way of working together',
          body: "We move fastest when we know the founder, not just the deck. We'd like a standing weekly call with Ricardo through the process — informal, no bankers required.\n\nWe understand if you prefer to keep everything through the process. Tell us how you want to work.",
          preview: 'Kestrel proposes direct founder access.',
          category: 'buyer',
          state: 'unread',
          priority: 'urgent',
          timestamp: `Day ${day}`,
          linkedEntityId: 'buyer-03',
          linkedEntityType: 'buyer',
          responseOptions: [
            {
              id: 'direct-partner',
              label: 'Allow a supervised monthly session — build the relationship.',
              effects: 'Kestrel chemistry +10, Risk +3',
              resourceEffects: { riskLevel: 3 },
              buyerEffects: { buyerId: 'buyer-03', chemistryDelta: 10 },
              storyDecision: { key: KESTREL_APPROACH_FLAG, value: 'direct-partner' },
            },
            {
              id: 'process-strict',
              label: 'Decline politely — every buyer works through the process.',
              effects: 'Reputation +2, Kestrel chemistry -5',
              resourceEffects: { reputation: 2 },
              buyerEffects: { buyerId: 'buyer-03', chemistryDelta: -5 },
              storyDecision: { key: KESTREL_APPROACH_FLAG, value: 'process-strict' },
            },
          ],
        },
      };
    },
  },
  founderCheckIn('people-ricardo-p4', 4, 3, {
    subjectCalm: 'The shortlist is taking shape',
    subjectConfident: 'Let us make the shortlist earn its place',
    subjectWorried: 'Are we cutting the wrong people?',
    calm: 'I looked at the shortlist draft last night. Some of these names I never expected to be real. Which of them would actually run Solara well?',
    confident: 'The shortlist is stronger than I expected. I do not want a comfortable round now — which buyers can we challenge to prove they deserve access?',
    worried: 'Every name we cut is a door that closes. I keep thinking about the one buyer we will drop who would have paid the most. Convince me the funnel is right.',
  }),
  {
    id: 'people-schneider-p4',
    phase: 4,
    offsetDays: 6,
    teaser: (state) => (buyerActive(state, 'buyer-04') ? 'Tomorrow: Schneider wants board-level access before committing.' : null),
    build: (state, day) => {
      if (!buyerActive(state, 'buyer-04')) return null;
      const week = Math.ceil(day / 7);
      return {
        event: {
          id: `evt-people-schneider-p4-${day}`,
          week,
          phase: state.phase,
          type: 'active',
          title: 'Schneider asks for the board',
          resolved: false,
          chainId: PEOPLE_BEATS_CHAIN,
          tensionCategory: 'pressure',
          description: 'Schneider Digital will not advance without a session with the Solara board. Their approvals machine wants comfort before it commits senior time.',
        },
        email: {
          id: `email-people-schneider-p4-${day}`,
          week,
          day,
          phase: state.phase,
          sender: 'Claire Fontaine',
          senderRole: 'Head of Corporate Development, Schneider Digital',
          subject: 'Board access as a condition of proceeding',
          body: 'Our internal approvals require direct exposure to governance before we allocate a diligence team. We would need one session with the Solara board and the founder before shortlist confirmation.\n\nWithout it, we can stay in the process, but our committee will treat the opportunity as unverified.',
          preview: 'Schneider conditions progress on board access.',
          category: 'buyer',
          state: 'unread',
          priority: 'urgent',
          timestamp: `Day ${day}`,
          linkedEntityId: 'buyer-04',
          linkedEntityType: 'buyer',
          responseOptions: [
            {
              id: 'grant-access',
              label: 'Arrange the board session — feed the approvals machine.',
              effects: 'Schneider chemistry +12 & smoother DD, Capacity -6',
              resourceEffects: { teamCapacity: -6 },
              buyerEffects: { buyerId: 'buyer-04', chemistryDelta: 12, ddFriction: 'medium' },
              storyDecision: { key: SCHNEIDER_GOVERNANCE_FLAG, value: 'grant-access' },
            },
            {
              id: 'hold-boundaries',
              label: 'Offer a management session instead — the board stays out of round one.',
              effects: 'Trust +3, Schneider chemistry -6',
              resourceEffects: { clientTrust: 3 },
              buyerEffects: { buyerId: 'buyer-04', chemistryDelta: -6 },
              storyDecision: { key: SCHNEIDER_GOVERNANCE_FLAG, value: 'hold-boundaries' },
            },
          ],
        },
      };
    },
  },
  founderCheckIn('people-ricardo-p5', 5, 2, {
    subjectCalm: 'First numbers are close',
    subjectConfident: 'The first number should not set the ceiling',
    subjectWorried: 'What if the numbers disappoint?',
    calm: 'Offers are days away. I told my wife last night that whatever comes in, we ran this properly. Still — what does your gut say?',
    confident: 'Offers are days away and the room feels competitive. If the first number is good, do not let me fall in love with it — show me how we keep the ceiling open.',
    worried: 'I cannot sleep. Twelve years of my life get a number this week. If it comes in low, I need to know what we do — tell me there is a plan for that.',
  }),
  founderCheckIn('people-ricardo-p6', 6, 4, {
    subjectCalm: 'The data room feels like an X-ray',
    subjectConfident: 'Diligence is proving the story',
    subjectWorried: 'They are looking for reasons to walk',
    calm: 'Strange feeling, watching strangers read twelve years of decisions. The questions are sharp but fair. Anything in there I should be worried about?',
    confident: 'The hard questions are making the company look better, not worse. Where can we use that confidence without giving buyers permission to expand the scope?',
    worried: 'Every Q&A request reads like an accusation. My CFO says that is normal. It does not feel normal. Are we losing anyone in there?',
  }),
  {
    id: 'people-schneider-p6',
    phase: 6,
    offsetDays: 7,
    teaser: (state) => (buyerActive(state, 'buyer-04') ? "Tomorrow: Schneider's diligence team asks for the founder's time." : null),
    build: (state, day) => {
      if (!buyerActive(state, 'buyer-04')) return null;
      const week = Math.ceil(day / 7);
      return {
        event: {
          id: `evt-people-schneider-p6-${day}`,
          week,
          phase: state.phase,
          type: 'active',
          title: 'Schneider wants the founder in the room',
          resolved: false,
          chainId: PEOPLE_BEATS_CHAIN,
          tensionCategory: 'pressure',
          description: 'Schneider requests a full-day technical session with Ricardo present. Their team works slowly through documents but quickly through people.',
        },
        email: {
          id: `email-people-schneider-p6-${day}`,
          week,
          day,
          phase: state.phase,
          sender: 'Claire Fontaine',
          senderRole: 'Head of Corporate Development, Schneider Digital',
          subject: 'Request: technical deep-dive with the founder',
          body: 'Our diligence has reached the architecture and roadmap layer. Written answers will take us weeks; a day with Ricardo and the CTO would take us hours, and would materially improve the confidence level our committee attaches to this asset.\n\nWe recognise founder time is the scarcest resource in the process.',
          preview: 'Schneider requests a founder deep-dive day.',
          category: 'buyer',
          state: 'unread',
          priority: 'urgent',
          timestamp: `Day ${day}`,
          linkedEntityId: 'buyer-04',
          linkedEntityType: 'buyer',
          responseOptions: [
            {
              id: 'deep-session',
              label: 'Give them the day — convert friction into conviction.',
              effects: 'Schneider credibility read +, DD friction drops, Capacity -8',
              resourceEffects: { teamCapacity: -8 },
              buyerEffects: { buyerId: 'buyer-04', chemistryDelta: 8, ddFriction: 'low' },
              storyDecision: { key: SCHNEIDER_DD_FLAG, value: 'deep-session' },
            },
            {
              id: 'written-only',
              label: 'Keep it written — protect the founder\'s bandwidth.',
              effects: 'Capacity preserved, Schneider chemistry -4, Risk +2',
              resourceEffects: { riskLevel: 2 },
              buyerEffects: { buyerId: 'buyer-04', chemistryDelta: -4 },
              storyDecision: { key: SCHNEIDER_DD_FLAG, value: 'written-only' },
            },
          ],
        },
      };
    },
  },
];

function beatDueDay(state: PeopleBeatsState, def: BeatDef): number {
  return (state.phaseEntryDay[def.phase] ?? state.day) + def.offsetDays;
}

/** The next unfired, currently-relevant people beat — one at a time. */
export function getPeopleUpcomingBeat(state: PeopleBeatsState): UpcomingBeat | null {
  if (state.phase < 3 || state.phase > 6) return null;

  for (const def of BEATS) {
    if (def.phase !== state.phase || fired(state, def.id)) continue;
    const label = def.teaser(state);
    if (!label) continue;
    return {
      id: def.id,
      dueDay: Math.max(beatDueDay(state, def), state.day + 1),
      label,
      source: def.id.includes('ricardo') ? 'decision' : 'buyer',
    };
  }
  return null;
}

/** Resolves at most one due people beat per advance, in authored order. */
export function resolvePeopleBeat(state: PeopleBeatsState, newDay: number): PeopleBeatResult | null {
  if (state.phase < 3 || state.phase > 6) return null;

  for (const def of BEATS) {
    if (def.phase !== state.phase || fired(state, def.id)) continue;
    if (beatDueDay(state, def) > newDay) continue;
    const result = def.build(state, newDay);
    if (result) return result;
  }
  return null;
}

/** Post-hoc offer narration for relationship decisions that shaped a bid. */
export function getPeopleOfferDriver(buyerId: string, storyFlags: Record<string, string>): string | null {
  if (buyerId === 'buyer-03') {
    if (storyFlags[KESTREL_APPROACH_FLAG] === 'direct-partner') {
      return 'The supervised founder sessions you granted Kestrel built conviction behind their number.';
    }
    if (storyFlags[KESTREL_APPROACH_FLAG] === 'process-strict') {
      return 'Kestrel bid through a strict process; disciplined, but with no relationship premium.';
    }
  }
  if (buyerId === 'buyer-04') {
    if (storyFlags[SCHNEIDER_DD_FLAG] === 'deep-session') {
      return "The founder deep-dive you granted converted Schneider's caution into committee confidence.";
    }
    if (storyFlags[SCHNEIDER_GOVERNANCE_FLAG] === 'grant-access') {
      return 'Early board access satisfied Schneider’s approvals machine and kept their bid alive.';
    }
    if (storyFlags[SCHNEIDER_DD_FLAG] === 'written-only') {
      return 'Schneider worked from documents alone; their committee priced in the unanswered questions.';
    }
  }
  return null;
}
