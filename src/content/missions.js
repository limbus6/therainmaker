// ============================================
// Phase Missions & Deal Beat Definitions
// ============================================
// Defines 2-4 strategic missions per phase that group routine tasks into meaningful choices.
export const PHASE_MISSIONS = {
    0: [
        {
            id: 'p0-m1',
            phase: 0,
            title: 'Target Screening & Founder Discovery',
            strategicChoice: 'Thorough Research vs Speed to Mandate',
            description: 'Investigate Solara Systems fundamentals, sector dynamics, and founder motivations before making a formal IC recommendation.',
            primaryActionIds: ['task-investigate-solara-sector', 'task-investigate-solara-company', 'task-investigate-solara-shareholder'],
            supportingTaskIds: ['task-investigate-solara-market', 'task-gen-02'],
            completionCriteria: {
                requiredActionIds: ['task-investigate-solara-company'],
            },
        },
        {
            id: 'p0-m2',
            phase: 0,
            title: 'IC Board Recommendation',
            strategicChoice: 'Proceed with Mandate vs Decline Opportunity',
            description: 'Present qualification notes to Marcus and the Investment Committee to secure formal mandate approval.',
            primaryActionIds: ['task-gen-01', 'task-gen-03'],
            supportingTaskIds: [],
            completionCriteria: {
                requiredActionIds: ['task-gen-01'],
            },
        },
    ],
    1: [
        {
            id: 'p1-m1',
            phase: 1,
            title: 'Advisor Positioning & Pitch Deck',
            strategicChoice: 'High Valuation Promise vs Realistic Execution Plan',
            description: 'Craft a compelling pitch deck showcasing industry credentials and deal strategy to win the Solara mandate.',
            primaryActionIds: ['task-15', 'task-16'],
            supportingTaskIds: ['task-17'],
            completionCriteria: {
                requiredActionIds: ['task-15'],
            },
        },
        {
            id: 'p1-m2',
            phase: 1,
            title: 'Mandate Fee Structure Negotiation',
            strategicChoice: 'Retainer Certainty vs Ratchet Upside',
            description: 'Negotiate engagement terms with Ricardo to balance monthly retainer cashflow and success fee upside.',
            primaryActionIds: ['task-18', 'task-19'],
            supportingTaskIds: [],
            completionCriteria: {
                requiredActionIds: ['task-18'],
            },
        },
    ],
    2: [
        {
            id: 'p2-m1',
            phase: 2,
            title: 'Financial Modeling & Marketing Collateral',
            strategicChoice: 'Granular Model Depth vs Rapid Market Entry',
            description: 'Build the 3-statement financial model, Information Memorandum (CIM), and Teaser for buyer distribution.',
            primaryActionIds: ['task-20', 'task-21', 'task-22'],
            supportingTaskIds: ['task-23', 'task-24'],
            completionCriteria: {
                requiredActionIds: ['task-20', 'task-21', 'task-22'],
            },
        },
        {
            id: 'p2-m2',
            phase: 2,
            title: 'Buyer Universe & VDR Setup',
            strategicChoice: 'Broad Strategic Scope vs Focused PE Shortlist',
            description: 'Build the buyer target list and populate the Virtual Data Room structure.',
            primaryActionIds: ['task-25', 'task-26'],
            supportingTaskIds: ['task-27', 'task-28'],
            completionCriteria: {
                requiredActionIds: ['task-25'],
            },
        },
    ],
    3: [
        {
            id: 'p3-m1',
            phase: 3,
            title: 'Market Outreach & Confidentiality',
            strategicChoice: 'Strict NDA Gate vs Broad Teaser Push',
            description: 'Contact targeted strategic and financial buyers, issue blind teasers, and negotiate NDAs.',
            primaryActionIds: ['task-40', 'task-41', 'task-42'],
            supportingTaskIds: ['task-43', 'task-44', 'task-45'],
            completionCriteria: {
                requiredActionIds: ['task-40', 'task-42'],
            },
        },
        {
            id: 'p3-m2',
            phase: 3,
            title: 'CIM Distribution & Initial Q&A',
            strategicChoice: 'Early Access for Top Bidders vs Equal Timing',
            description: 'Distribute detailed CIMs to NDA signers and address initial buyer queries.',
            primaryActionIds: ['task-46', 'task-47', 'task-48'],
            supportingTaskIds: [],
            completionCriteria: {
                requiredActionIds: ['task-46', 'task-48'],
            },
        },
    ],
    4: [
        {
            id: 'p4-m1',
            phase: 4,
            title: 'Non-Binding Offer Evaluation',
            strategicChoice: 'Max Headline Valuation vs High Cash Certainty',
            description: 'Analyze received NBOs, evaluate price structures, and manage seller expectations.',
            primaryActionIds: ['task-60', 'task-61', 'task-62'],
            supportingTaskIds: [],
            completionCriteria: {
                requiredActionIds: ['task-61'],
            },
        },
        {
            id: 'p4-m2',
            phase: 4,
            title: 'Shortlist Selection & Phase 5 Access',
            strategicChoice: 'Tight Shortlist (2-3) vs Broad Competitive Field (5+)',
            description: 'Confirm the shortlist with Ricardo and issue DD process letters to selected bidders.',
            primaryActionIds: ['task-63', 'task-64'],
            supportingTaskIds: [],
            completionCriteria: {
                requiredActionIds: ['task-63', 'task-64'],
            },
        },
    ],
    5: [
        {
            id: 'p5-m1',
            phase: 5,
            title: 'Virtual Data Room & Due Diligence Access',
            strategicChoice: 'Phased Information Release vs Full Transparency',
            description: 'Grant VDR access to shortlisted buyers and manage sensitive document disclosures.',
            primaryActionIds: ['task-70', 'task-71', 'task-72'],
            supportingTaskIds: ['task-73'],
            completionCriteria: {
                requiredActionIds: ['task-70'],
            },
        },
        {
            id: 'p5-m2',
            phase: 5,
            title: 'Management Presentations & Process Letter',
            strategicChoice: 'High-Pressure Deadline vs Flexible Buyer Timeline',
            description: 'Host management Q&A sessions and issue the binding offer process letter.',
            primaryActionIds: ['task-74', 'task-75', 'task-76'],
            supportingTaskIds: [],
            completionCriteria: {
                requiredActionIds: ['task-75', 'task-76'],
            },
        },
    ],
    6: [
        {
            id: 'p6-m1',
            phase: 6,
            title: 'Diligence Stream Management & Q&A Queue',
            strategicChoice: 'Rapid Q&A Turnaround vs Thorough Legal Review',
            description: 'Manage buyer financial, legal, and tax diligence streams while clearing the Q&A queue.',
            primaryActionIds: ['task-90', 'task-91'],
            supportingTaskIds: ['task-93', 'task-94'],
            completionCriteria: {
                requiredActionIds: ['task-90'],
            },
        },
        {
            id: 'p6-m2',
            phase: 6,
            title: 'Vendor DD & Process Gate Review',
            strategicChoice: 'Aggressive Binding Deadline vs Extension for Dragging Bidders',
            description: 'Complete the final DD readiness review and verify incoming binding offers.',
            primaryActionIds: ['task-92', 'task-95'],
            supportingTaskIds: [],
            completionCriteria: {
                requiredActionIds: ['task-92'],
            },
        },
    ],
    7: [
        {
            id: 'p7-m1',
            phase: 7,
            title: 'Binding Offer Comparison & Trade-Offs',
            strategicChoice: 'Pure Cash at Closing vs Total EV with Earnout',
            description: 'Compare binding offers on EV, cash certainty, conditionality, and buyer credibility.',
            primaryActionIds: ['task-100', 'task-101'],
            supportingTaskIds: ['task-102'],
            completionCriteria: {
                requiredActionIds: ['task-100'],
            },
        },
        {
            id: 'p7-m2',
            phase: 7,
            title: 'Preferred Bidder Selection & Exclusivity',
            strategicChoice: 'Bilateral Exclusivity vs Open Dual-Track Competition',
            description: 'Recommend the winning bidder to Ricardo and lock preferred bidder status.',
            primaryActionIds: ['task-103', 'task-104'],
            supportingTaskIds: [],
            completionCriteria: {
                requiredActionIds: ['task-103'],
            },
        },
    ],
    8: [
        {
            id: 'p8-m1',
            phase: 8,
            title: 'SPA Legal Terms & Warranty Scope',
            strategicChoice: 'Seller-Friendly Cap vs Buyer-Friendly Indemnities',
            description: 'Negotiate the Sale & Purchase Agreement terms, warranty caps, and escrow percentages.',
            primaryActionIds: ['task-110', 'task-111'],
            supportingTaskIds: ['task-112'],
            completionCriteria: {
                requiredActionIds: ['task-110'],
            },
        },
        {
            id: 'p8-m2',
            phase: 8,
            title: 'Disclosure Letter & Signing Checklist',
            strategicChoice: 'Full Qualification Disclosure vs Minimal Risk Exposure',
            description: 'Finalize the disclosure letter and complete the pre-signature legal checklist.',
            primaryActionIds: ['task-113', 'task-114'],
            supportingTaskIds: [],
            completionCriteria: {
                requiredActionIds: ['task-113', 'task-114'],
            },
        },
    ],
    9: [
        {
            id: 'p9-m1',
            phase: 9,
            title: 'Signature Version Lock & Conditions Precedent',
            strategicChoice: 'Immediate Signature vs Delayed Closing Pre-Conditions',
            description: 'Freeze document drafts, lock signature versions, and prepare closing conditions.',
            primaryActionIds: ['task-120', 'task-121'],
            supportingTaskIds: ['task-122'],
            completionCriteria: {
                requiredActionIds: ['task-120'],
            },
        },
        {
            id: 'p9-m2',
            phase: 9,
            title: 'SPA Execution & Board Sign-Off',
            strategicChoice: 'Formal Signing Ceremony vs Virtual Execution',
            description: 'Obtain formal board resolutions and execute the definitive transaction documents.',
            primaryActionIds: ['task-123', 'task-124'],
            supportingTaskIds: [],
            completionCriteria: {
                requiredActionIds: ['task-123', 'task-124'],
            },
        },
    ],
    10: [
        {
            id: 'p10-m1',
            phase: 10,
            title: 'Funds Flow & Price Settlement',
            strategicChoice: 'Immediate Escrow Release vs Staggered Completion Verification',
            description: 'Verify wire transfers, execute funds flow, and settle net purchase price.',
            primaryActionIds: ['task-125', 'task-126'],
            supportingTaskIds: ['task-127'],
            completionCriteria: {
                requiredActionIds: ['task-126'],
            },
        },
        {
            id: 'p10-m2',
            phase: 10,
            title: 'Ownership Transfer & Deal Closing',
            strategicChoice: 'Public Announcement vs Quiet Completion Memo',
            description: 'Transfer shares, complete registry filings, and issue the final transaction closing memo.',
            primaryActionIds: ['task-128', 'task-129'],
            supportingTaskIds: [],
            completionCriteria: {
                requiredActionIds: ['task-128', 'task-129'],
            },
        },
    ],
};
export function getMissionsForPhase(phase) {
    return PHASE_MISSIONS[phase] || [];
}
//# sourceMappingURL=missions.js.map