import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../gameStore';
describe('Game Store', () => {
    beforeEach(() => {
        // Reset store state before each test if necessary
        // But since Zustand doesn't auto-reset between tests, we do it manually or override state
        useGameStore.setState({
            preferredBidderId: null,
            preferredBidderConfirmed: false,
            buyers: [
                { id: 'buyer-01', name: 'Buyer 1', type: 'pe', executionCredibility: 100, ddFriction: 'low', valuationPosture: 'fair', status: 'bidding', bindingOfferSubmitted: true },
                { id: 'buyer-02', name: 'Buyer 2', type: 'pe', executionCredibility: 100, ddFriction: 'high', valuationPosture: 'fair', status: 'bidding', bindingOfferSubmitted: true }
            ],
            leads: [
                {
                    id: 'lead-1',
                    companyName: 'Company 1',
                    investigation: { sector: 'none', company: 'none', shareholder: 'none', market: 'none' },
                    meetingScheduled: false,
                    meetingDone: false,
                }
            ],
            tasks: [],
            phaseEntryDay: {},
            day: 1
        });
    });
    it('selectPreferredBidder with confirmed=true locks the selection', () => {
        useGameStore.getState().selectPreferredBidder('buyer-01', true);
        let state = useGameStore.getState();
        expect(state.preferredBidderId).toBe('buyer-01');
        expect(state.preferredBidderConfirmed).toBe(true);
        // Subsequent calls should be no-ops
        useGameStore.getState().selectPreferredBidder('buyer-02', false);
        state = useGameStore.getState();
        expect(state.preferredBidderId).toBe('buyer-01');
        expect(state.preferredBidderConfirmed).toBe(true);
        useGameStore.getState().selectPreferredBidder('buyer-02', true);
        state = useGameStore.getState();
        expect(state.preferredBidderId).toBe('buyer-01');
    });
    it('selectPreferredBidder without confirmed is rejected when already set', () => {
        useGameStore.getState().selectPreferredBidder('buyer-01', false);
        let state = useGameStore.getState();
        expect(state.preferredBidderId).toBe('buyer-01');
        expect(state.preferredBidderConfirmed).toBe(false);
        // Try to change it without confirmed=true
        useGameStore.getState().selectPreferredBidder('buyer-02', false);
        state = useGameStore.getState();
        // It should remain buyer-01 because the second call didn't have confirmed=true while preferredBidderId is already set
        expect(state.preferredBidderId).toBe('buyer-01');
    });
    it('syncLeadsFromTasks does not overwrite completed investigations', () => {
        useGameStore.setState({
            leads: [
                {
                    id: 'lead-1',
                    companyName: 'Company 1',
                    investigation: { sector: 'completed', company: 'none', shareholder: 'none', market: 'none' },
                    meetingScheduled: false,
                    meetingDone: false,
                }
            ],
            tasks: [
                {
                    id: 'task-investigate-lead-1-sector',
                    status: 'in_progress',
                }
            ]
        });
        // Advance week triggers syncLeadsFromTasks
        useGameStore.getState().advanceWeek();
        const state = useGameStore.getState();
        // sector should remain 'completed', not overridden by 'in_progress' from the task
        expect(state.leads[0].investigation.sector).toBe('completed');
    });
    it('scheduleMeeting sets meetingScheduled but not meetingDone', () => {
        useGameStore.getState().scheduleMeeting('lead-1');
        const state = useGameStore.getState();
        expect(state.leads[0].meetingScheduled).toBe(true);
        expect(state.leads[0].meetingDone).toBe(false);
    });
    it('phaseEntryDay is populated on phase advance', async () => {
        useGameStore.setState({ phase: 0, day: 10, phaseEntryDay: { 0: 1 } });
        await useGameStore.getState().advancePhase();
        const state = useGameStore.getState();
        expect(state.phase).toBe(1);
        expect(state.phaseEntryDay[1]).toBe(10);
    });
});
//# sourceMappingURL=gameStore.test.js.map