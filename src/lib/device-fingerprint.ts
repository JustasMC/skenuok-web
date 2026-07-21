/** Client-side device fingerprint for guest credit / rate-limit binding (not a secret). */
const KEY = "sk_device_fp";

export function getDeviceFingerprint(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `fp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(KEY, id);
    return id;
  } catch {
    return "";
  }
}

export function fingerprintHeaders(): HeadersInit {
  const fp = getDeviceFingerprint();
  return fp ? { "x-device-fingerprint": fp } : {};
}
