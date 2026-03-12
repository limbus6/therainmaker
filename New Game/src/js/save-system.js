const STORAGE_KEY = "ma_rainmaker_save_v1";

export function saveGame(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadGame() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export function clearGame() {
  localStorage.removeItem(STORAGE_KEY);
}
