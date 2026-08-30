let consumers = 0;
let suppressNextFocusSound = false;

function suppressFocusSound() {
  suppressNextFocusSound = true;
}

function handleVisibilityChange() {
  if (document.visibilityState === "hidden") {
    suppressFocusSound();
  }
}

export function allowFocusSound() {
  if (typeof document === "undefined" || document.visibilityState === "visible") {
    suppressNextFocusSound = false;
  }
}

export function consumeFocusSoundSuppression() {
  const suppressed =
    suppressNextFocusSound ||
    (typeof document !== "undefined" && document.visibilityState !== "visible");
  suppressNextFocusSound = false;
  return suppressed;
}

export function retainFocusSoundGuard() {
  if (typeof window === "undefined") return () => undefined;

  consumers += 1;
  if (consumers === 1) {
    window.addEventListener("blur", suppressFocusSound);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", allowFocusSound, true);
  }

  let retained = true;
  return () => {
    if (!retained) return;
    retained = false;
    consumers -= 1;
    if (consumers === 0) {
      window.removeEventListener("blur", suppressFocusSound);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", allowFocusSound, true);
    }
  };
}
