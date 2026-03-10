const fs = require('fs');
const path = require('path');

const phaseExpansions = {
    0: "The Deal Origination phase is where M&A begins. It's an unstructured, highly relationship-driven environment where advisors hunt for mandates before competitors even realize a business is preparing to sell. The psychological goal here is establishing unshakeable trust with the founder. \n\nFounders often begin deeply attached to their creation—valuing it far higher than market reality. The advisor's job is to gently reality-check their expectations while simultaneously convincing them that no one else can achieve that valuation. Success in this phase dictates the entire trajectory of the deal. If you overpromise on price here to win the mandate, you are building immense 'Risk Debt' that will obliterate the deal in Phase 7.",
    1: "The Pitch and Mandate phase is the formal audition. It requires synthesizing initial financial data into a compelling, highly polished narrative in days. The advisor must present themselves as absolute authorities on the buyer landscape, the sector trends, and the valuation methodology. \n\nA successful pitch blends analytical rigor with psychological reassurance. The risk here involves competitive dynamics against rival banks, who might undercut your fee structure or promise higher valuations. The contract signed here locks in the economic lifeblood of the advisory firm.",
    2: "The Preparation Phase is perhaps the most operationally intense internal phase. The advisory team essentially builds a fortified fortress around the company's data. Everything must be audited, sanitized, and structured into the Information Memorandum (IM) and the underlying financial model. \n\nThe central tension is accuracy vs speed. The market might be hot, tempting you to rush, but any financial error left fundamentally exposed here will become a fatal flaw during Due Diligence later. Preparing the founder for the emotional grueling of the roadshow is also a critical psychological task here.",
    3: "Market Outreach is where the deal goes live. Teasers are distributed to a carefully curated list of potential buyers. The goal is creating a buzz and psychological momentum without revealing the target's identity until NDAs are signed. \n\nStrategically, this involves balancing Tier-1 buyers (highly strategic, high likelihood to pay a premium) against Tier-2 buyers (who maintain competitive tension). If the initial market reception is weak, the advisor must immediately pivot the narrative to avoid the process being labeled 'busted'.",
    4: "IM Distribution marks the transition into the technical phase. Selected buyers receive the full Information Memorandum and the Data Pack. Asymmetric information control is paramount—you give buyers enough to excite them, but hold back enough to protect leverage. \n\nTrust maintenance is the primary objective here. If buyers feel the IM was misleading or aggressively spun, their confidence plummets. This is the calm before the storm of offers, and the advisor must actively manage buyer engagement daily to ensure they are committing resources to evaluate the deal.",
    5: "NBO Analysis is the first moment of truth. Indicative offers arrive, and they must be ruthlessly torn apart. A high headline price often conceals aggressive structured earn-outs or complex contingencies. \n\nThe advisor constructs a side-by-side comparison matrix, normalizing the offers to determine the true 'Apples to Apples' Enterprise Value. Selecting the shortlist for Due Diligence requires immense political skill, deciding whether to keep a lower-priced but highly certain strategic buyer, or a high-priced but notoriously difficult private equity firm.",
    6: "Due Diligence is the crucible. The shortlisted buyers deploy armies of lawyers, accountants, and commercial experts to validate every single claim made in Phase 2. The Data Room becomes a battlefield of Q&A. \n\nThe advisor acts as a shock absorber. When (not if) accounting discrepancies or customer concentration risks are discovered, the advisor must instantly frame the narrative to prevent the buyer's investment committee from panicking. This phase destroys poorly prepared deals.",
    7: "The Binding Offer (BO/BAFO) phase is the absolute peak of leverage and stress. Buyers submit their final, legally binding commitments. The advisor plays the remaining parties against each other, orchestrating a high-stakes auction. \n\nThe goal is not just the highest price, but the cleanest terms. A buyer offering a slightly lower price but zero financing contingencies and a massive escrow reduction may actually be the superior choice for the founder. The advisor's reputation is forged or broken in these hours.",
    8: "SPA Negotiation transitions the battlefield to the lawyers. The Sale and Purchase Agreement defines the exact legal constraints of the transaction. The commercial team must remain deeply involved to prevent legal counselors from accidentally trading away millions of dollars in net cash via working capital pegs. \n\nThe emotional toll on the founder here is extreme, as they face the reality of selling their life's work while being subjected to aggressive indemnity demands. The advisor must shield them.",
    9: "Signing is an administrative nightmare intertwined with profound relief. The deals are finalized, but this phase isn't just a rubber stamp. Regulatory bodies (like anti-trust regulators) might intervene, or a key lender might suddenly get cold feet. \n\nThe advisor organizes the logistics, tracking hundreds of Condition Precedent (CP) documents. The tension remains exceptionally high because a signed deal only means legal commitment, not cash in the bank.",
    10: "Closing is the transfer of power. Bank wires are initiated, and escrow accounts are funded. The tension finally breaks when the clearing house confirms the capital transfer. \n\nThe advisor's role concludes with administrative wrap-up and ensuring the success fee invoice is paid out of the closing funds. It ends with a tombstone announcement and a celebratory dinner, instantly followed by the firm hunting for the next Origination."
};

Object.keys(phaseExpansions).forEach(k => {
    const file = path.join('By Phase', `MA_Game_PHASE_${k}.md`);
    if (fs.existsSync(file)) {
        let text = fs.readFileSync(file, 'utf16le');
        if (!text.includes('#')) text = fs.readFileSync(file, 'utf8');

        // Check if expansion already added.
        if (text.includes("The psychological goal here is establishing unshakeable trust") ||
            text.includes("The Deal Origination phase is where M&A begins")) {
            console.log(`Phase ${k} already expanded.`);
            return;
        }

        const newOverview = `\n\n### Narrative & Strategic Context\n\n${phaseExpansions[k]}\n\n`;

        // Inject right before "---" that separates overview from mechanics.
        let lines = text.split('\n');
        let injected = false;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('---') && i > 5) {
                lines.splice(i, 0, newOverview);
                injected = true;
                break;
            }
        }

        if (!injected) {
            lines.push(newOverview);
        }

        fs.writeFileSync(file, lines.join('\n'), 'utf8');
    }
});
