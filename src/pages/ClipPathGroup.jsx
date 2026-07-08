import React from 'react';
import { motion } from 'framer-motion';

export default function PowerCore() {
  return (
    <section className="relative w-full bg-black flex items-center justify-center overflow-clip min-h-screen">
      {/*
        The container maintains the exact aspect ratio of the original design (1315x1323).
        It scales fluidly down on smaller screens and caps at the design width on larger ones.
      */}
      <div className="relative w-full max-w-[1315px] aspect-[1315/1323] overflow-clip">

        {/* Entrance animation wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          {/*
            The image is sized and positioned using percentages calculated directly from the
            original absolute pixel values relative to the 1315x1323 design viewport.
            This guarantees the exact same crop and framing is maintained at all screen sizes.

            Math:
            Width: (3117 / 1315) * 100 = 237.034%
            Height: (3151 / 1323) * 100 = 238.171%
            Left: (-955 / 1315) * 100 = -72.624%
            Top: (-664 / 1323) * 100 = -50.189%
          */}
          <motion.img
            src="https://media.base44.com/images/public/6a3542676f9044e70b439a84/156742c3c_2c64e420d_b567a13c189ab17b1195db0aba380e0ba8854e8c.png"
            alt="Power Core Indicator"
            className="absolute max-w-none"
            style={{
              width: "237.034%",
              height: "238.171%",
              left: "-72.624%",
              top: "-50.189%",
              objectFit: "cover",
              objectPosition: "center"
            }}
            // Continuous ambient pulse fitting the "power" theme
            animate={{
              filter: ['brightness(1)', 'brightness(1.25)', 'brightness(1)'],
              scale: [1, 1.015, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
