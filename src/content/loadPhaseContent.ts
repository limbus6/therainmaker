import type { Buyer, Deliverable, Email, GameTask, Headline, PhaseId, Risk } from '../types/game';

export interface PhaseContent {
  tasks: GameTask[];
  emails: Email[];
  deliverables: Deliverable[];
  risks: Risk[];
  headlines: Headline[];
  buyers?: Buyer[];
}

export async function loadPhaseContent(phase: Exclude<PhaseId, 0>): Promise<PhaseContent> {
  switch (phase) {
    case 1: {
      const mod = await import('./phase1');
      return { tasks: mod.phase1Tasks, emails: mod.phase1Emails, deliverables: mod.phase1Deliverables, risks: mod.phase1Risks, headlines: mod.phase1Headlines };
    }
    case 2: {
      const mod = await import('./phase2');
      return { tasks: mod.phase2Tasks, emails: mod.phase2Emails, deliverables: mod.phase2Deliverables, risks: mod.phase2Risks, headlines: mod.phase2Headlines, buyers: mod.phase2Buyers };
    }
    case 3: {
      const mod = await import('./phase3');
      return { tasks: mod.phase3Tasks, emails: mod.phase3Emails, deliverables: mod.phase3Deliverables, risks: mod.phase3Risks, headlines: mod.phase3Headlines };
    }
    case 4: {
      const mod = await import('./phase4');
      return { tasks: mod.phase4Tasks, emails: mod.phase4Emails, deliverables: mod.phase4Deliverables, risks: mod.phase4Risks, headlines: mod.phase4Headlines };
    }
    case 5: {
      const mod = await import('./phase5');
      return { tasks: mod.phase5Tasks, emails: mod.phase5Emails, deliverables: mod.phase5Deliverables, risks: mod.phase5Risks, headlines: mod.phase5Headlines };
    }
    case 6: {
      const mod = await import('./phase6');
      return { tasks: mod.phase6Tasks, emails: mod.phase6Emails, deliverables: mod.phase6Deliverables, risks: mod.phase6Risks, headlines: mod.phase6Headlines };
    }
    case 7: {
      const mod = await import('./phase7');
      return { tasks: mod.phase7Tasks, emails: mod.phase7Emails, deliverables: mod.phase7Deliverables, risks: mod.phase7Risks, headlines: mod.phase7Headlines };
    }
    case 8: {
      const mod = await import('./phase8');
      return { tasks: mod.phase8Tasks, emails: mod.phase8Emails, deliverables: mod.phase8Deliverables, risks: mod.phase8Risks, headlines: mod.phase8Headlines };
    }
    case 9: {
      const mod = await import('./phase9');
      return { tasks: mod.phase9Tasks, emails: mod.phase9Emails, deliverables: mod.phase9Deliverables, risks: mod.phase9Risks, headlines: mod.phase9Headlines };
    }
    case 10: {
      const mod = await import('./phase10');
      return { tasks: mod.phase10Tasks, emails: mod.phase10Emails, deliverables: mod.phase10Deliverables, risks: mod.phase10Risks, headlines: mod.phase10Headlines };
    }
  }
}
