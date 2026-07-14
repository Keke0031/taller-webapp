const SESSION_KEY = "talleron_usuario";
const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 8;

function getStorage(storage) {
  if (storage) return storage;
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function saveSession(usuario, storage, expiresAt = Date.now() + DEFAULT_SESSION_TTL_MS) {
  const target = getStorage(storage);
  if (!target) return null;

  const payload = { usuario, expiresAt };
  target.setItem(SESSION_KEY, JSON.stringify(payload));
  return payload;
}

export function getStoredSession(storage) {
  const target = getStorage(storage);
  if (!target) return null;

  const raw = target.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.usuario) throw new Error("Sesión inválida");

    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      clearSession(target);
      return null;
    }

    return parsed.usuario;
  } catch {
    clearSession(target);
    return null;
  }
}

export function clearSession(storage) {
  const target = getStorage(storage);
  if (!target) return;
  target.removeItem(SESSION_KEY);
}

export function hasActiveSession(storage) {
  return Boolean(getStoredSession(storage));
}
