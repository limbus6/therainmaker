import { createInitialState, hydrateState } from "./game-state.js";
import { renderApp } from "./ui-renderers.js";
import { bindUI } from "./ui-actions.js";
import { loadGame, saveGame } from "./save-system.js";

let state = hydrateState(loadGame() ?? createInitialState(Date.now()));

function getState() {
  return state;
}

function setState(nextState) {
  state = nextState;
  renderApp(state);
}

bindUI({ getState, setState });
renderApp(state);
saveGame(state);
