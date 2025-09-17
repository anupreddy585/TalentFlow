export function saveState<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadState<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

