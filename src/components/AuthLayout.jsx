import React from "react";
import { motion } from "framer-motion";
import useKeyboardViewport from "@/hooks/useKeyboardViewport";

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
      style={{ maxWidth: "170px", width: "100%", aspectRatio: "508 / 89" }}
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

export default function AuthLayout({ icon: Icon, title, subtitle, footer, secondaryTone, compact = false, children }) {
  const toneClass = secondaryTone === "green" ? "auth-login-green" : "";
  const { keyboardInset, isKeyboardOpen, handleFocusCapture } = useKeyboardViewport(compact);

  const handleBackgroundPointerDown = (e) => {
    if (!compact) return;
    const tag = e.target.tagName;
    if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "BUTTON" && tag !== "A" && !e.target.closest("button, a, label, [data-slot]")) {
      if (document.activeElement && typeof document.activeElement.blur === "function") {
        document.activeElement.blur();
      }
    }
  };

  return (
    <div
      onFocusCapture={handleFocusCapture}
      onPointerDown={handleBackgroundPointerDown}
      style={keyboardInset > 0 ? { paddingBottom: `${keyboardInset + 24}px` } : undefined}
      className={`auth-brand ${toneClass} relative min-h-[100dvh] flex flex-col items-center ${
        compact ? "px-4 py-3 sm:py-4 lg:py-6" : "justify-center px-4 py-8"
      } bg-background overflow-x-hidden`}
    >
      {/* Aurora borealis background — slow drifting green/blue glows, kept dim so black dominates */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/4 -left-1/4 w-[70%] h-[70%] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(46,253,122,0.16) 0%, rgba(46,253,122,0.05) 45%, transparent 75%)" }}
          animate={{ x: [0, 60, -20, 0], y: [0, 40, -30, 0], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-1/4 w-[60%] h-[60%] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(46,160,253,0.13) 0%, rgba(46,160,253,0.04) 45%, transparent 75%)" }}
          animate={{ x: [0, -50, 30, 0], y: [0, -30, 20, 0], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-[-20%] left-1/4 w-[50%] h-[50%] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--auth-secondary) / 0.13) 0%, hsl(var(--auth-secondary) / 0.04) 45%, transparent 75%)" }}
          animate={{ x: [0, 40, -40, 0], y: [0, -20, 30, 0], opacity: [0.15, 0.28, 0.15] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className={`relative z-10 w-full max-w-md flex flex-col items-center ${compact ? "my-auto" : "justify-center"}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={`flex flex-col items-center text-center shrink-0 ${compact ? "mb-2" : "mb-3"}`}
        >
          {/* Cropped power symbol only — the source image is a square with the icon on top and the "Baseline" wordmark baked into the bottom, so we clip to the top fraction to isolate just the icon */}
          {compact ? (
            <div
              className={`relative mb-1 transition-all duration-200 ${
                isKeyboardOpen ? "w-14 sm:w-20" : "w-20 sm:w-24 lg:w-32"
              }`}
              style={{ aspectRatio: "1 / 0.65" }}
            >
              <motion.div
                className="absolute inset-0 rounded-2xl bg-auth-secondary/25 blur-2xl pointer-events-none"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative w-full h-full overflow-hidden">
                <motion.img
                  src={ORB_SRC}
                  alt=""
                  className="absolute top-0 left-0 w-full select-none mix-blend-screen object-cover"
                  style={{ height: `${(1 / 0.65) * 100}%` }}
                  animate={{ filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          ) : (
            <div className="relative mb-2" style={{ width: 230.4, height: 230.4 * 0.65 }}>
              <motion.div
                className="absolute inset-0 rounded-2xl bg-[#2EFD7A]/25 blur-2xl pointer-events-none"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative w-full h-full overflow-hidden">
                <motion.img
                  src={ORB_SRC}
                  alt=""
                  className="absolute top-0 left-0 select-none mix-blend-screen"
                  style={{ width: 230.4, height: 230.4, objectFit: "cover" }}
                  animate={{ filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          )}

          <Wordmark className={compact ? "mb-1 max-w-[135px] sm:max-w-[155px]" : "mb-2"} />
          <p className={`text-white/40 text-[10px] font-light tracking-[0.3em] uppercase ${compact ? "mb-2" : "mb-4"}`}>
            Mind Over Money
          </p>

          <h1 className={`${compact ? "text-xl sm:text-2xl" : "text-2xl"} font-light tracking-tight text-white`}>
            {title}
          </h1>

          {Icon && (
            <div
              className={`inline-flex items-center justify-center ${
                compact ? "w-8 h-8 sm:w-9 sm:h-9 rounded-xl mt-1.5" : "w-10 h-10 rounded-2xl mt-3 mb-1"
              } bg-auth-secondary/15 border border-auth-secondary/30 shadow-sm`}
            >
              <Icon className={`${compact ? "w-4 h-4" : "w-5 h-5"} text-auth-secondary`} aria-hidden="true" />
            </div>
          )}

          {subtitle && <p className="text-white/50 mt-1 text-xs">{subtitle}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className={`bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-3xl ${
            compact ? "p-4 sm:p-5" : "p-5 overflow-y-auto"
          } w-full`}
        >
          {children}
        </motion.div>

        {footer && (
          <p className={`text-center text-xs text-white/40 ${compact ? "mt-2.5" : "mt-3"} shrink-0`}>{footer}</p>
        )}
      </div>
    </div>
  );
}