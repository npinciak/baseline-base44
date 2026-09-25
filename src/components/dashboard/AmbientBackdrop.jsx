import { motion } from 'framer-motion';

/** Slow-drifting turquoise/teal aurora + floating orbs — gives the black dashboard canvas depth. */
export default function AmbientBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(46,160,253,0.16) 0%, rgba(46,160,253,0.05) 45%, transparent 75%)' }}
        animate={{ x: [0, 60, -20, 0], y: [0, 40, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-1/4 w-[55%] h-[55%] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(46,253,122,0.12) 0%, rgba(46,253,122,0.04) 45%, transparent 75%)' }}
        animate={{ x: [0, -50, 30, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-1/3 w-[45%] h-[45%] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(46,160,253,0.1) 0%, rgba(46,160,253,0.03) 45%, transparent 75%)' }}
        animate={{ x: [0, 40, -40, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 6 + i * 3,
            height: 6 + i * 3,
            left: `${15 + i * 22}%`,
            top: `${18 + i * 16}%`,
            background: i % 2 === 0 ? 'rgba(46,160,253,0.55)' : 'rgba(46,253,122,0.45)',
            boxShadow: i % 2 === 0 ? '0 0 12px rgba(46,160,253,0.6)' : '0 0 12px rgba(46,253,122,0.5)',
          }}
          animate={{ y: [0, -18, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
        />
      ))}
    </div>
  );
}