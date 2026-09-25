import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';

/** Wraps a card with subtle pointer-tracking 3D tilt, lift on hover, and a light sheen glow. */
export default function TiltCard({ children, className = '', glow = '#2EA0FD', maxTilt = 6 }) {
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springX = useSpring(mx, { stiffness: 200, damping: 20 });
  const springY = useSpring(my, { stiffness: 200, damping: 20 });
  const rotateX = useTransform(springY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [0, 1], [-maxTilt, maxTilt]);
  const sheenX = useTransform(springX, [0, 1], ['0%', '100%']);
  const sheenY = useTransform(springY, [0, 1], ['0%', '100%']);
  const sheenBg = useMotionTemplate`radial-gradient(circle at ${sheenX} ${sheenY}, ${glow}26, transparent 60%)`;

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const handleLeave = () => { mx.set(0.5); my.set(0.5); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -3 }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={`group relative ${className}`}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
        style={{ background: sheenBg }}
      />
      {children}
    </motion.div>
  );
}