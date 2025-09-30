export function setRef<T = any>(
  ref: ((el: T | null) => void) | { current?: T | null } | undefined,
  value: T | null
) {
  if (!ref) return;

  if (typeof ref === "function") {
    ref(value);
  } else {
    (ref as any).current = value;
  }
}
