import type { Client, Lead } from '../types/game';

export type TargetNarrativeId = 'solara' | 'vektor-health' | 'nexa';

type FounderMood = 'confident' | 'steady' | 'restless' | 'anxious';

export interface TargetNarrativeProfile {
  id: TargetNarrativeId;
  leadId: string;
  shortCompanyName: string;
  client: Client;
  lead: Omit<Lead, 'investigation' | 'meetingDone' | 'researchNotes'>;
  founderRole: string;
  cfoName: string;
  keyExecutiveName: string;
  baseEV: number;
  earningsBase: number;
  valuationMetric: 'EBITDA' | 'ARR' | 'revenue';
  buyerNames: Record<string, string>;
  campaignPromise: string;
  centralTension: string;
  founderMoodNotes: Record<FounderMood, string>;
  offerReactionLines: Record<FounderMood, Record<'strong' | 'solid' | 'soft', string>>;
  replacements: ReadonlyArray<readonly [string, string]>;
}

const solaraClient: Client = {
  name: 'Ricardo Mendes',
  companyName: 'Solara Systems',
  sector: 'Industrial SaaS / Energy Tech',
  description: 'Founder-led industrial IoT platform specialising in predictive maintenance for energy infrastructure. €28M ARR, growing 35% YoY. The founder is considering a full exit after 12 years.',
  objectives: ['Maximise valuation', 'Ensure cultural continuity', 'Clean exit within 6 months'],
  valuationExpectation: '10-12x EBITDA',
  valuationExpectationEV: 120,
  timeSensitivity: 'medium',
  riskTolerance: 'moderate',
  trust: 40,
  confidence: 35,
};

const commonLeadState = {
  meetingScheduled: false,
} as const;

export const TARGET_NARRATIVES: Record<TargetNarrativeId, TargetNarrativeProfile> = {
  solara: {
    id: 'solara',
    leadId: 'lead-1',
    shortCompanyName: 'Solara',
    client: solaraClient,
    lead: {
      ...commonLeadState,
      id: 'lead-1',
      companyName: 'Solara Systems',
      sector: 'Industrial SaaS / Energy Tech',
      founderName: 'Ricardo Mendes',
      origin: 'Inbound network referral',
      description: solaraClient.description,
      investmentCaseSummary: 'Strong SaaS metrics and clear strategic value to industrial buyers. High likelihood of aggressive bidding if properly positioned.',
      hiddenMotivations: 'After twelve years of building, Ricardo is exhausted and his family wants certainty. He still needs to believe the next owner will protect the product and team.',
      hiddenGrowth: 'high',
      hiddenRisk: 'low',
    },
    founderRole: 'Founder & CEO',
    cfoName: 'Helena Costa',
    keyExecutiveName: 'Tomás Rocha',
    baseEV: 120,
    earningsBase: 12,
    valuationMetric: 'EBITDA',
    buyerNames: {
      'buyer-01': 'Vektor Industries',
      'buyer-02': 'Nexus Data Group',
      'buyer-03': 'Kestrel Capital',
      'buyer-04': 'Schneider Digital',
      'buyer-05': 'Frontier Equity',
    },
    campaignPromise: 'A premium industrial-software auction where founder trust and competitive tension drive the price.',
    centralTension: 'Ricardo wants a clean exit without handing his culture to the highest bidder blindly.',
    founderMoodNotes: {
      confident: 'Ricardo has been forwarding buyer emails with one-word comments: “Good.”',
      steady: 'Ricardo is checking in on schedule and letting the team work.',
      restless: 'Ricardo has started asking why things take as long as they take.',
      anxious: 'Ricardo is calling after hours and rereading every buyer signal twice.',
    },
    offerReactionLines: {
      confident: { strong: 'That is what running a real process looks like. Now show me it closes.', solid: 'Fair number. I expected it — which tells you how far we have come.', soft: 'They can do better than that, and they know it. Let the process answer them.' },
      steady: { strong: 'That is a serious number. Show me how real it is.', solid: 'Workable. The question is what sits behind it.', soft: 'Lower than I hoped. Tell me what this does to the field.' },
      restless: { strong: 'Finally. Can we move before they rethink it?', solid: 'Is this what all the patience was for? Convince me it grows from here.', soft: 'Weeks of process for this? I need to see the next envelope beat it.' },
      anxious: { strong: 'Do not celebrate yet. Strong numbers have fallen apart before.', solid: 'I can live with that number — if nothing behind it bites us.', soft: 'This is what I was afraid of. Tell me honestly: is the process failing?' },
    },
    replacements: [],
  },
  'vektor-health': {
    id: 'vektor-health',
    leadId: 'lead-2',
    shortCompanyName: 'Vektor Health',
    client: {
      name: 'Dra. Clara Vance',
      companyName: 'Vektor Health Tech',
      sector: 'MedTech / Diagnostic Software',
      description: 'AI-assisted diagnostic software for hospital radiology networks. €14M ARR, growing 48% YoY. Clara wants a strategic partner for US expansion while German regulatory scrutiny is intensifying.',
      objectives: ['Secure a credible US expansion partner', 'Protect clinical independence', 'De-risk German regulatory clearance'],
      valuationExpectation: '6-8x ARR',
      valuationExpectationEV: 95,
      timeSensitivity: 'high',
      riskTolerance: 'conservative',
      trust: 40,
      confidence: 34,
    },
    lead: {
      ...commonLeadState,
      id: 'lead-2',
      companyName: 'Vektor Health Tech',
      sector: 'MedTech / Diagnostic Software',
      founderName: 'Dra. Clara Vance',
      origin: 'Partner network intro',
      description: 'AI-assisted diagnostic software for hospital radiology networks. €14M ARR, 48% YoY growth. High-margin software, but German regulators are reviewing its newest clinical decision-support module.',
      investmentCaseSummary: 'Category-leading growth and scarce clinical data create strategic value. Regulatory clearance and hospital renewal timing make execution certainty as important as headline price.',
      hiddenMotivations: 'Clara wants a strategic buyer that can finance US clinical trials without reducing doctors to product marketing. A pending regulator meeting gives her a narrow window.',
      hiddenGrowth: 'high',
      hiddenRisk: 'moderate',
    },
    founderRole: 'Founder & Chief Medical Officer',
    cfoName: 'Miriam Vogel',
    keyExecutiveName: 'Dr. Elias Weber',
    baseEV: 95,
    earningsBase: 14,
    valuationMetric: 'ARR',
    buyerNames: {
      'buyer-01': 'Helix Diagnostics Group',
      'buyer-02': 'MedAxis Data',
      'buyer-03': 'Meridian Health Partners',
      'buyer-04': 'Nordlicht Medical Systems',
      'buyer-05': 'Cedar Health Capital',
    },
    campaignPromise: 'A high-growth clinical-software sale where regulatory credibility can outweigh the richest headline bid.',
    centralTension: 'Clara needs US scale, but refuses to let an acquirer weaken clinical governance or patient safety.',
    founderMoodNotes: {
      confident: 'Clara is annotating buyer questions like a clinical paper and marking the strong ones “credible.”',
      steady: 'Clara joins the scheduled calls, answers precisely, and returns to the regulatory file.',
      restless: 'Clara has begun asking whether the process understands the regulator’s timetable.',
      anxious: 'Clara is calling after hospital rounds and checking every buyer claim against the clinical evidence.',
    },
    offerReactionLines: {
      confident: { strong: 'That values the evidence and gives us room to scale. Now test their clinical commitments.', solid: 'The number is credible. I want to know who protects medical governance.', soft: 'They are discounting regulatory work we have already done. Make them defend it.' },
      steady: { strong: 'Serious value. Show me the approval path behind it.', solid: 'Clinically workable; strategically, I still need proof.', soft: 'Below the evidence base. What assumption did their committee reject?' },
      restless: { strong: 'Good. Can they commit before the regulator meeting?', solid: 'The window is narrowing. Tell me this can still improve.', soft: 'We cannot lose six weeks just to be misunderstood at the end.' },
      anxious: { strong: 'A strong number does not cure weak clinical governance. Read the conditions.', solid: 'I can accept the value if the US plan is real.', soft: 'Are they pricing the regulator — or telling us they do not believe the product?' },
    },
    replacements: [
      ['Founder & CEO, Solara Systems', 'Founder & Chief Medical Officer, Vektor Health Tech'],
      ['Founder & CEO', 'Founder & Chief Medical Officer'],
      ['Solara leadership team', 'Vektor Health clinical leadership team'],
      ['Vektor Industries', 'Helix Diagnostics Group'],
      ['Nexus Data Group', 'MedAxis Data'],
      ['Kestrel Capital', 'Meridian Health Partners'],
      ['Kestrel Capital Partners', 'Meridian Health Partners'],
      ['Schneider Digital', 'Nordlicht Medical Systems'],
      ['Frontier Equity', 'Cedar Health Capital'],
      ['Ricardo Mendes', 'Dra. Clara Vance'],
      ['Solara Systems', 'Vektor Health Tech'],
      ['Helena Costa', 'Miriam Vogel'],
      ['Pedro Alves', 'Dr. Elias Weber'],
      ['Tomás Rocha', 'Dr. Elias Weber'],
      ['Inês Carvalho', 'Miriam Vogel'],
      ['Key Employee Threatens to Resign', 'Chief Clinical Officer May Leave'],
      ['Top Customer Shows Churn Signal', 'Flagship Hospital Delays Renewal'],
      ['Cyber Security Gap Found in Pre-Process Audit', 'Clinical Model Validation Gap Found'],
      ['IP Ownership Gap Discovered', 'Training Data Consent Gap Discovered'],
      ['Tax Authority Issues Inquiry', 'Regulator Opens Clinical Evidence Review'],
      ['Financial Data Inconsistency', 'Clinical Revenue Recognition Review'],
      ['Sector Valuation Reset', 'Digital Health Valuation Reset'],
      ['Normalised EBITDA: €8.2M', 'Normalised EBITDA: €3.8M'],
      ['Revenue CAGR 32%', 'ARR CAGR 46%'],
      ['Gross margins 74%', 'Gross margins 82%'],
      ['closer to 68%', 'closer to 76%'],
      ['12-15x EBITDA', '6-8x ARR'],
      ['€28M ARR', '€14M ARR'],
      ['€35M in Year 2', '€24M ARR in Year 2'],
      ['€210M cash at closing (66% of headline)', '€83M cash at closing (66% of headline)'],
      ['Cash at close: €210M', 'Cash at close: €83M'],
      ['€210M in cash', '€83M in cash'],
      ['€320M', '€126M'],
      ['€285M', '€112M'],
      ['€270M', '€106M'],
      ['€240-255M', '€95-101M'],
      ['€235M', '€118M'],
      ['€210M', '€106M'],
      ['€200M', '€100M'],
      ['€195M', '€98M'],
      ['€192-198M', '€96-99M'],
      ['€185M', '€93M'],
      ['€180M', '€90M'],
      ['€175-185M', '€88-93M'],
      ['€170M', '€86M'],
      ['€120M', '€95M'],
      ['€60M', '€24M'],
      ['€50M', '€19M'],
      ['€47M', '€37M'],
      ['€40M', '€20M'],
      ['€30M', '€15M'],
      ['€20M', '€10M'],
      ['€13.5M', '€5.3M'],
      ['€500M acquisition facility', '€300M acquisition facility'],
      ['14-16x EBITDA', '6-8x ARR'],
      ['14.2x EV/EBITDA', '7.1x EV/ARR'],
      ['14x EBITDA', '7x ARR'],
      ['15x revenue', '7.5x ARR'],
      ['10-12x expectation', '6-8x expectation'],
      ['EV/Revenue and EV/EBITDA', 'EV/ARR and revenue growth'],
      ['industrial IoT platform', 'AI diagnostic-imaging platform'],
      ['Industrial IoT platform', 'AI diagnostic-imaging platform'],
      ['industrial IoT', 'clinical imaging software'],
      ['Industrial IoT', 'Clinical imaging software'],
      ['predictive maintenance', 'diagnostic workflow automation'],
      ['energy infrastructure', 'hospital radiology networks'],
      ['energy, automation, infrastructure tech', 'diagnostics, hospital IT, clinical workflow'],
      ['strategic industrials', 'strategic healthcare groups'],
      ['infrastructure tech buyers', 'hospital-technology buyers'],
      ['energy tech', 'digital health'],
      ['Strategic Industrials', 'Strategic Healthcare Groups'],
      ['Infrastructure Funds', 'Healthcare Growth Funds'],
      ['customer contracts', 'hospital licences'],
      ['Customer Contracts', 'Hospital Licences'],
      ['customers', 'hospital networks'],
      ['customer', 'hospital'],
      ['CTO retention', 'clinical leadership retention'],
      ['the CTO', 'the Chief Clinical Officer'],
      ['CTO', 'Chief Clinical Officer'],
      ['NordicGrid AS', 'Charité Imaging Network'],
      ['Meridian Power', 'RheinScan Clinics'],
      ['Meridian Energy', 'RheinScan Clinics'],
      ['Iberian Utilities', 'Atlantic Radiology Alliance'],
      ['Zentara Group', 'MediCore AG'],
      ['BrightStar Industrial', 'Aurelia Diagnostics'],
      ['VaultSense Technologies', 'ScanLogic Health'],
      ['Axiom Technologies', 'Vertex Clinical Systems'],
      ['outdated authentication protocols', 'insufficient external validation across two clinical cohorts'],
      ['customer portal', 'diagnostic model'],
      ['IP assignment agreement', 'patient-data consent schedule'],
      ['IP assignment', 'training-data consent'],
      ['had a long conversation with his wife', 'left a difficult meeting with her clinical co-founder'],
      ['personal reasons', 'a fixed regulatory timetable'],
      ['government project', 'regional hospital tender'],
      ['technology platform', 'regulated clinical platform'],
      ['SaaS metrics', 'clinical software metrics'],
      ['Solara board', 'Vektor Health clinical board'],
      ['Solara', 'Vektor Health'],
      ['Ricardo', 'Clara'],
      ['Helena', 'Miriam'],
      ['Tomás', 'Elias'],
      ['He ', 'She '],
      ['His ', 'Her '],
      ["He's ", "She's "],
      ["he's ", "she's "],
      ["he'll ", "she'll "],
      ["he'd ", "she'd "],
      ['himself', 'herself'],
      [' He ', ' She '],
      [' he ', ' she '],
      [' his ', ' her '],
      [' him ', ' her '],
      ['Vektor', 'Helix'],
      ['Nexus', 'MedAxis'],
      ['Kestrel', 'Meridian Health'],
      ['Schneider', 'Nordlicht'],
      ['Frontier', 'Cedar Health'],
    ],
  },
  nexa: {
    id: 'nexa',
    leadId: 'lead-3',
    shortCompanyName: 'Nexa',
    client: {
      name: 'Tomás Silva',
      companyName: 'Nexa Automation',
      sector: 'Supply Chain Tech / Robotics',
      description: 'Warehouse dispatch and fleet-optimisation platform with a large installed hardware base. €19M revenue, growing 20% YoY. Solid cash flow is offset by component dependency and a co-founder valuation split.',
      objectives: ['Resolve co-founder alignment', 'Reward the operations team', 'Choose a buyer that can fund the next hardware cycle'],
      valuationExpectation: '4-5x revenue',
      valuationExpectationEV: 82,
      timeSensitivity: 'high',
      riskTolerance: 'aggressive',
      trust: 39,
      confidence: 31,
    },
    lead: {
      ...commonLeadState,
      id: 'lead-3',
      companyName: 'Nexa Automation',
      sector: 'Supply Chain Tech / Robotics',
      founderName: 'Tomás Silva',
      origin: 'Outreach campaign target',
      description: 'Automated warehouse dispatch and fleet-optimisation platform. €19M revenue, 20% YoY growth. Recurring software is profitable, but the installed base depends on scarce robotics controllers.',
      investmentCaseSummary: 'Sticky enterprise contracts and proven cash generation attract industrial strategics and operational PE. Hardware concentration and shareholder disagreement can break timetable discipline.',
      hiddenMotivations: 'Tomás wants liquidity before a major hardware refresh. His co-founder, Beatriz, wants a higher price and a continuing role, so every concession risks reopening the shareholder split.',
      hiddenGrowth: 'moderate',
      hiddenRisk: 'high',
    },
    founderRole: 'Co-founder & CEO',
    cfoName: 'Luís Matos',
    keyExecutiveName: 'Marta Correia',
    baseEV: 82,
    earningsBase: 19,
    valuationMetric: 'revenue',
    buyerNames: {
      'buyer-01': 'Atlas Logistics Systems',
      'buyer-02': 'Gridline Data Group',
      'buyer-03': 'Forgepoint Capital',
      'buyer-04': 'Orbis Automation',
      'buyer-05': 'Harbor Industrial Partners',
    },
    campaignPromise: 'A cash-generative robotics process where shareholder alignment and hardware diligence can fracture the auction.',
    centralTension: 'Tomás wants speed before the next product cycle; Beatriz will not accept a deal that sidelines the engineering team.',
    founderMoodNotes: {
      confident: 'Tomás is sending warehouse photos after buyer calls with the caption “They finally understand it.”',
      steady: 'Tomás keeps the operating review on schedule and leaves the process cadence to the team.',
      restless: 'Tomás is asking whether every extra week gives Beatriz another reason to reopen valuation.',
      anxious: 'Tomás is calling from the factory floor and treating each hardware question as a threat to the timetable.',
    },
    offerReactionLines: {
      confident: { strong: 'That pays for what is installed and what comes next. Now prove they can operate it.', solid: 'Workable value. I want Beatriz aligned before we call it progress.', soft: 'They are pricing us like hardware stock. Make them value the control layer.' },
      steady: { strong: 'A serious number. What does it mean for the team and the next product cycle?', solid: 'It can work if the cash is real and governance is clean.', soft: 'Below our installed-base value. Show me where their model broke.' },
      restless: { strong: 'Good. Can we lock it before components become the story again?', solid: 'Every extra week reopens the shareholder debate. Can this move?', soft: 'We did not run an auction to accept a distributor multiple.' },
      anxious: { strong: 'Read every condition. A big headline can still leave us funding the hardware risk.', solid: 'I can take that to Beatriz if the structure is clean.', soft: 'This gives the co-founders every reason to split again. What is the recovery plan?' },
    },
    replacements: [
      ['Founder & CEO, Solara Systems', 'Co-founder & CEO, Nexa Automation'],
      ['Founder & CEO', 'Co-founder & CEO'],
      ['Solara leadership team', 'Nexa operating leadership team'],
      ['Vektor Industries', 'Atlas Logistics Systems'],
      ['Nexus Data Group', 'Gridline Data Group'],
      ['Kestrel Capital', 'Forgepoint Capital'],
      ['Kestrel Capital Partners', 'Forgepoint Capital'],
      ['Schneider Digital', 'Orbis Automation'],
      ['Frontier Equity', 'Harbor Industrial Partners'],
      ['Ricardo Mendes', 'Tomás Silva'],
      ['Solara Systems', 'Nexa Automation'],
      ['Helena Costa', 'Luís Matos'],
      ['Pedro Alves', 'Marta Correia'],
      ['Tomás Rocha', 'Marta Correia'],
      ['Inês Carvalho', 'Luís Matos'],
      ['Key Employee Threatens to Resign', 'VP Robotics Threatens to Leave'],
      ['Top Customer Shows Churn Signal', 'Anchor Warehouse Pauses Renewal'],
      ['Cyber Security Gap Found in Pre-Process Audit', 'Controller Supply Chain Vulnerability Found'],
      ['IP Ownership Gap Discovered', 'Firmware Ownership Gap Discovered'],
      ['Tax Authority Issues Inquiry', 'Component Import Classification Inquiry'],
      ['Financial Data Inconsistency', 'Hardware Margin Reconciliation'],
      ['Sector Valuation Reset', 'Automation Multiples Reset'],
      ['Normalised EBITDA: €8.2M', 'Normalised EBITDA: €5.4M'],
      ['Revenue CAGR 32%', 'Revenue CAGR 20%'],
      ['Gross margins 74%', 'Blended gross margins 58%'],
      ['closer to 68%', 'closer to 51%'],
      ['12-15x EBITDA', '4-5x revenue'],
      ['€28M ARR', '€19M revenue'],
      ['€35M in Year 2', '€27M revenue in Year 2'],
      ['€210M cash at closing (66% of headline)', '€71M cash at closing (66% of headline)'],
      ['Cash at close: €210M', 'Cash at close: €71M'],
      ['€210M in cash', '€71M in cash'],
      ['€320M', '€108M'],
      ['€285M', '€96M'],
      ['€270M', '€92M'],
      ['€240-255M', '€82-86M'],
      ['€235M', '€101M'],
      ['€210M', '€91M'],
      ['€200M', '€86M'],
      ['€195M', '€84M'],
      ['€192-198M', '€83-86M'],
      ['€185M', '€80M'],
      ['€180M', '€78M'],
      ['€175-185M', '€76-80M'],
      ['€170M', '€74M'],
      ['€120M', '€82M'],
      ['€60M', '€20M'],
      ['€50M', '€17M'],
      ['€47M', '€32M'],
      ['€40M', '€17M'],
      ['€30M', '€13M'],
      ['€20M', '€8M'],
      ['€13.5M', '€4.6M'],
      ['€500M acquisition facility', '€260M acquisition facility'],
      ['14-16x EBITDA', '4-5x revenue'],
      ['14.2x EV/EBITDA', '5.7x EV/Revenue'],
      ['14x EBITDA', '5.5x revenue'],
      ['15x revenue', '5.8x revenue'],
      ['10-12x expectation', '4-5x expectation'],
      ['EV/Revenue and EV/EBITDA', 'EV/Revenue and EBITDA conversion'],
      ['industrial IoT platform', 'warehouse robotics platform'],
      ['Industrial IoT platform', 'Warehouse robotics platform'],
      ['industrial IoT', 'warehouse automation'],
      ['Industrial IoT', 'Warehouse automation'],
      ['predictive maintenance', 'fleet and dispatch optimisation'],
      ['energy infrastructure', 'distribution centres'],
      ['energy, automation, infrastructure tech', 'logistics, robotics, industrial software'],
      ['strategic industrials', 'strategic logistics groups'],
      ['infrastructure tech buyers', 'warehouse-technology buyers'],
      ['energy tech', 'robotics technology'],
      ['Strategic Industrials', 'Strategic Logistics Groups'],
      ['Infrastructure Funds', 'Industrial Growth Funds'],
      ['customer contracts', 'enterprise deployment contracts'],
      ['Customer Contracts', 'Enterprise Deployment Contracts'],
      ['customers', 'warehouse operators'],
      ['customer', 'warehouse operator'],
      ['CTO retention', 'robotics leadership retention'],
      ['the CTO', 'the VP Robotics'],
      ['CTO', 'VP Robotics'],
      ['NordicGrid AS', 'NorthDock Logistics'],
      ['Meridian Power', 'TransIberia Fulfilment'],
      ['Meridian Energy', 'TransIberia Fulfilment'],
      ['Iberian Utilities', 'Baltic Warehouse Group'],
      ['Zentara Group', 'RoboMotion plc'],
      ['BrightStar Industrial', 'CargoMind Systems'],
      ['VaultSense Technologies', 'StackPilot Robotics'],
      ['Axiom Technologies', 'VectorDock Automation'],
      ['outdated authentication protocols', 'single-source controller firmware with no qualified substitute'],
      ['customer portal', 'fleet-control gateway'],
      ['IP assignment agreement', 'firmware assignment agreement'],
      ['IP assignment', 'firmware ownership'],
      ['had a long conversation with his wife', 'had a difficult valuation call with Beatriz'],
      ['personal reasons', 'the component procurement cycle'],
      ['government project', 'automotive distribution rollout'],
      ['technology platform', 'robotics control stack'],
      ['SaaS metrics', 'software-plus-hardware economics'],
      ['Solara board', 'Nexa shareholder board'],
      ['Solara', 'Nexa'],
      ['Ricardo', 'Tomás'],
      ['Helena', 'Luís'],
      ['Tomás', 'Marta'],
      ['Vektor', 'Atlas'],
      ['Nexus', 'Gridline'],
      ['Kestrel', 'Forgepoint'],
      ['Schneider', 'Orbis'],
      ['Frontier', 'Harbor'],
    ],
  },
};

export const DEFAULT_TARGET_NARRATIVE_ID: TargetNarrativeId = 'solara';

export function getTargetNarrative(id?: string | null): TargetNarrativeProfile {
  return TARGET_NARRATIVES[(id as TargetNarrativeId) ?? DEFAULT_TARGET_NARRATIVE_ID]
    ?? TARGET_NARRATIVES[DEFAULT_TARGET_NARRATIVE_ID];
}

export function getTargetNarrativeForLead(leadId?: string | null): TargetNarrativeProfile {
  return Object.values(TARGET_NARRATIVES).find((profile) => profile.leadId === leadId)
    ?? TARGET_NARRATIVES[DEFAULT_TARGET_NARRATIVE_ID];
}

export function deriveTargetNarrativeId(client?: Pick<Client, 'companyName'> | null, leadId?: string | null): TargetNarrativeId {
  const byLead = Object.values(TARGET_NARRATIVES).find((profile) => profile.leadId === leadId);
  if (byLead) return byLead.id;
  const byClient = Object.values(TARGET_NARRATIVES).find((profile) => profile.client.companyName === client?.companyName);
  return byClient?.id ?? DEFAULT_TARGET_NARRATIVE_ID;
}

export function createTargetLeads(): Lead[] {
  return Object.values(TARGET_NARRATIVES).map((profile) => ({
    ...profile.lead,
    investigation: { sector: 'none', company: 'none', shareholder: 'none', market: 'none' },
    meetingDone: false,
    researchNotes: [],
  }));
}

const IMMUTABLE_VALUE_KEYS = new Set([
  'id', 'buyerId', 'leadId', 'targetId', 'linkedEntityId', 'missionId', 'chainId',
  'sourceId', 'dedupeKey', 'dependencies', 'key', 'action', 'checkpointId',
]);

function replaceNarrativeText(text: string, profile: TargetNarrativeProfile, protectExistingIdentity = false): string {
  if (profile.replacements.length === 0) return text;
  const protectedValues = protectExistingIdentity
    ? [
        profile.client.companyName,
        profile.shortCompanyName,
        profile.client.name,
        profile.client.name.split(' ')[0] === 'Dra.' ? profile.client.name.split(' ')[1] : profile.client.name.split(' ')[0],
        ...Object.values(profile.buyerNames),
      ].sort((a, b) => b.length - a.length)
    : [];
  const protectedMap = new Map<string, string>();
  let protectedText = text;
  protectedValues.forEach((identity, index) => {
    if (!identity || !protectedText.includes(identity)) return;
    const placeholder = `__TARGET_IDENTITY_${index}__`;
    protectedMap.set(placeholder, identity);
    protectedText = protectedText.replaceAll(identity, placeholder);
  });
  const replacementMap = new Map(profile.replacements);
  const pattern = [...replacementMap.keys()]
    .sort((a, b) => b.length - a.length)
    .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  let result = protectedText.replace(new RegExp(pattern, 'g'), (match) => replacementMap.get(match) ?? match);
  protectedMap.forEach((identity, placeholder) => {
    result = result.replaceAll(placeholder, identity);
  });
  return result;
}

/**
 * Re-skins authored Solara copy while preserving every mechanical identifier.
 * A single-pass replacement prevents target names (notably Vektor/Tomás) from
 * being transformed twice when they are also canonical story tokens.
 */
export function personalizeTargetNarrativeValue<T>(
  value: T,
  target: TargetNarrativeId | TargetNarrativeProfile,
  options: { protectExistingIdentity?: boolean } = {},
): T {
  const profile = typeof target === 'string' ? getTargetNarrative(target) : target;
  if (profile.id === DEFAULT_TARGET_NARRATIVE_ID) return value;
  if (typeof value === 'string') return replaceNarrativeText(value, profile, options.protectExistingIdentity) as T;
  if (Array.isArray(value)) {
    return value.map((item) => personalizeTargetNarrativeValue(item, profile, options)) as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      IMMUTABLE_VALUE_KEYS.has(key) ? item : personalizeTargetNarrativeValue(item, profile, options),
    ])) as T;
  }
  return value;
}
