export function readJson(storage, key, fallback) {
  try {
    const raw = storage?.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

export function writeJson(storage, key, value) {
  try {
    storage?.setItem(key, JSON.stringify(value));
    return true;
  } catch (_) {
    return false;
  }
}

export function browserStorage() {
  try {
    return globalThis.window?.localStorage || globalThis.localStorage || null;
  } catch (_) {
    return null;
  }
}
