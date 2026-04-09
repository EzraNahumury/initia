export interface XPState {
  totalXP: number;
  level: number;
  actions: Record<string, number>;
}

const XP_PER_ACTION: Record<string, number> = {
  swap: 10,
  bridge: 15,
  send: 5,
  batch: 20,
  limit: 12,
};

function calcLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 10));
}

export function xpForLevel(level: number): number {
  return level * level * 10;
}

function storageKey(address: string) {
  return `rr_xp_${address.toLowerCase()}`;
}

export function getXP(address: string): XPState {
  if (typeof window === "undefined") return { totalXP: 0, level: 0, actions: {} };
  try {
    const raw = localStorage.getItem(storageKey(address));
    if (raw) return JSON.parse(raw);
  } catch {}
  return { totalXP: 0, level: 0, actions: {} };
}

export function awardXP(address: string, actionType: string): XPState {
  const state = getXP(address);
  const points = XP_PER_ACTION[actionType] ?? 5;
  state.totalXP += points;
  state.level = calcLevel(state.totalXP);
  state.actions[actionType] = (state.actions[actionType] ?? 0) + 1;
  localStorage.setItem(storageKey(address), JSON.stringify(state));
  return state;
}
