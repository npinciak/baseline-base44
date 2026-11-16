import { useEffect, useState, useCallback } from "react";

function scrollElementIntoVisualViewport(el) {
  if (!el) return;
  const form = el.closest("form");
  const submitBtn = form?.querySelector('button[type="submit"]');
  const vv = window.visualViewport;

  if (!vv) {
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    return;
  }

  const elRect = el.getBoundingClientRect();
  const btnRect = submitBtn?.getBoundingClientRect();
  const margin = 16;
  const visibleBottom = vv.height - margin;

  // Prefer keeping both the focused input and submit button visible when they fit together
  const targetBottom =
    btnRect && btnRect.bottom - elRect.top <= vv.height - margin * 2
      ? btnRect.bottom
      : elRect.bottom + 12;

  if (targetBottom > visibleBottom) {
    window.scrollBy({ top: targetBottom - visibleBottom, behavior: "smooth" });
  } else if (elRect.top < margin) {
    window.scrollBy({ top: elRect.top - margin, behavior: "smooth" });
  }
}

export default function useKeyboardViewport(enabled = false) {
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;

    const update = () => {
      const overlap = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
      setKeyboardInset(overlap > 80 ? overlap : 0);
      const active = document.activeElement;
      if (overlap > 80 && active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) {
        scrollElementIntoVisualViewport(active);
      }
    };

    vv.addEventListener("resize", update);
    return () => vv.removeEventListener("resize", update);
  }, [enabled]);

  const handleFocusCapture = useCallback(
    (e) => {
      if (!enabled) return;
      const target = e.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        setTimeout(() => scrollElementIntoVisualViewport(target), 150);
      }
    },
    [enabled]
  );

  return { keyboardInset, isKeyboardOpen: keyboardInset > 0, handleFocusCapture };
}