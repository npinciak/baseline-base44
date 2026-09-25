import { useEffect, useState } from 'react';

/** Animates a number counting up from 0 to `target` over `duration` ms. */
export default function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}