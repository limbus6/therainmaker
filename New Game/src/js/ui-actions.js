import { getActionAvailability, getActionById } from "./action-library.js";
import { createInitialState, hydrateState, recomputeDerivedState } from "./game-state.js";
import { deepClone } from "./helpers.js";
import { runWeekResolution } from "./resolution-engine.js";
import { clearGame, loadGame, saveGame } from "./save-system.js";
import { toggleResultsBoard, toggleStrategyGuide } from "./ui-renderers.js";

export function bindUI({ getState, setState }) {
  document.getElementById("newGameBtn").addEventListener("click", () => {
    const newState = createInitialState(Date.now());
    setState(newState);
    saveGame(newState);
  });

  document.getElementById("saveBtn").addEventListener("click", () => {
    saveGame(getState());
  });

  document.getElementById("loadBtn").addEventListener("click", () => {
    const loaded = loadGame();
    if (!loaded) return;
    setState(hydrateState(loaded));
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    clearGame();
    setState(createInitialState(Date.now()));
  });

  document.getElementById("advanceWeekBtn").addEventListener("click", () => {
    const resolved = runWeekResolution(getState());
    setState(resolved);
    saveGame(resolved);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const intent = target.dataset.intent;
    if (!intent) return;

    if (intent === "toggleStrategy") {
      toggleStrategyGuide();
      setState(getState());
      return;
    }

    if (intent === "toggleResultsBoard") {
      toggleResultsBoard();
      setState(getState());
      return;
    }
    const actionId = target.dataset.actionId;
    if (!actionId) return;

    const action = getActionById(actionId);
    if (!action) return;

    const state = deepClone(getState());

    if (intent === "queue") {
      const availability = getActionAvailability(state, action);
      if (!availability.queueable) return;

      if (!state.planning.selectedTaskIds.includes(actionId)) {
        state.planning.selectedTaskIds.push(actionId);
      }
    }

    if (intent === "remove") {
      state.planning.selectedTaskIds = state.planning.selectedTaskIds.filter((id) => id !== actionId);
    }

    setState(recomputeDerivedState(state));
  });
}

