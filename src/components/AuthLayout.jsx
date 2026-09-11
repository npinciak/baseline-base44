import React from "react";
import { motion } from "framer-motion";

const ORB_SRC = "https://media.base44.com/images/public/6a3542676f9044e70b439a84/156742c3c_2c64e420d_b567a13c189ab17b1195db0aba380e0ba8854e8c.png";

const baselineImages = [
  { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/f5993dcb0_5579a0908_93_355.svg", width: 72, height: 85, left: 0, top: 2 },
  { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/068919593_cf4dcbdb5_93_359.svg", width: 68, height: 66, left: 78, top: 23 },
  { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/e00160cd9_d36d4f5e0_93_363.svg", width: 60, height: 66, left: 149, top: 23 },
  { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/000a4f3b9_0e64c97bf_93_367.svg", width: 69, height: 66, left: 214, top: 23 },
  { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/261042c37_165540f3c_93_371.svg", width: 38, height: 89, left: 290, top: 0 },
  { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/3aa2025ae_7733732c3_93_375.svg", width: 23, height: 88, left: 334, top: 0 },
  { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/0b22860f7_28b850e24_93_379.svg", width: 64, height: 64, left: 368, top: 23 },
  { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/a315ba224_12790a648_93_383.svg", width: 69, height: 66, left: 439, top: 23 },
];

function Wordmark({ className = "" }) {
  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ maxWidth: "220px", width: "100%", aspectRatio: "508 / 89" }}
      role="img"
      aria-label="Baseline"
    >
      {baselineImages.map((img, i) => (
        <img
          key={i}
          src={img.src}
          className="absolute object-contain"
          style={{
            left: `${(img.left / 508) * 100}%`,
            top: img.top !== undefined ? `${(img.top / 89) * 100}%` : "0%",
            width: `${(img.width / 508) * 100}%`,
            height: img.height !== undefined ? `${(img.height / 89) * 100}%` : "100%",
          }}
          alt=""
        />
      ))}
    </div>
  );
}

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black px-4 py-12 overflow-hidden">
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-center text-center mb-8"
        >
          {/* Cropped power symbol only — the source image is a square with the icon on top and the "Baseline" wordmark baked into the bottom, so we clip to the top fraction to isolate just the icon */}
          <div className="relative mb-4" style={{ width: 108, height: 108 * 0.65 }}>
            <motion.div
              className="absolute inset-0 rounded-2xl bg-[#2EFD7A]/25 blur-2xl pointer-events-none"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative w-full h-full overflow-hidden">
              <motion.img
                src={ORB_SRC}
                alt=""
                className="absolute top-0 left-0 select-none"
                style={{ width: 108, height: 108, objectFit: "cover" }}
                animate={{ filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>

          <Wordmark className="mb-3" />
          <p className="text-white/40 text-[11px] font-light tracking-[0.35em] uppercase mb-8">Mind Over Money</p>

          <h1 className="text-3xl font-light tracking-tight text-white">{title}</h1>
          {subtitle && <p className="text-white/50 mt-2 text-sm">{subtitle}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-3xl p-8"
        >
          {children}
        </motion.div>

        {footer && (
          <p className="text-center text-sm text-white/40 mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}