export const DELIVERABLE_LIBRARY = [
  {
    id: "teaser",
    name: "Teaser",
    unlockPhaseId: 1,
    thresholds: { completeProgress: 60, solidQuality: 55, exceptionalQuality: 75 }
  },
  {
    id: "im",
    name: "Information Memorandum",
    unlockPhaseId: 1,
    thresholds: { completeProgress: 60, solidQuality: 60, exceptionalQuality: 80 }
  },
  {
    id: "model",
    name: "Financial Model",
    unlockPhaseId: 1,
    thresholds: { completeProgress: 55, solidQuality: 60, exceptionalQuality: 80 }
  },
  {
    id: "buyerList",
    name: "Buyer List",
    unlockPhaseId: 1,
    thresholds: { completeProgress: 50, solidQuality: 55, exceptionalQuality: 75 }
  },
  {
    id: "vdr",
    name: "Virtual Data Room",
    unlockPhaseId: 1,
    thresholds: { completeProgress: 60, solidQuality: 60, exceptionalQuality: 80 }
  }
];

export function getDeliverableById(deliverableId) {
  return DELIVERABLE_LIBRARY.find((item) => item.id === deliverableId) ?? null;
}
