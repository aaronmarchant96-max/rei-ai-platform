const STORAGE_PREFIX = "prompthound.flag.";

const DEFAULT_FLAGS = {
  "navigation-rail": false,
};

export function getFlag(name) {
  if (typeof window === "undefined") return DEFAULT_FLAGS[name] ?? false;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + name);
    if (raw === null) return DEFAULT_FLAGS[name] ?? false;
    return raw === "true";
  } catch {
    return DEFAULT_FLAGS[name] ?? false;
  }
}

export function setFlag(name, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + name, String(value));
  } catch {
    // silently ignore storage failures
  }
}

export function toggleFlag(name) {
  const next = !getFlag(name);
  setFlag(name, next);
  return next;
}
