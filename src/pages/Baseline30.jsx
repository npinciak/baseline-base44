import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ImageWord = ({ images, width, height, ariaLabel, className = "" }) => (
  <div
    className={`relative shrink-0 ${className}`}
    style={{ maxWidth: `${width}px`, width: "100%", aspectRatio: `${width} / ${height}` }}
    aria-label={ariaLabel}
    role="img"
  >
    {images.map((img, i) => (
      <img
        key={i}
        src={img.src}
        className="absolute object-contain"
        style={{
          left: `${(img.left / width) * 100}%`,
          top: img.top !== undefined ? `${(img.top / height) * 100}%` : "0%",
          width: `${(img.width / width) * 100}%`,
          height: img.height !== undefined ? `${(img.height / height) * 100}%` : "100%",
        }}
        alt=""
      />
    ))}
  </div>
);

export default function Baseline30() {
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

  const mindOverMoneyImages = [
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/973274d82_44e662a51_93_387.svg", width: 21, left: 0 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/b77acf1a6_48483fefe_93_391.svg", width: 2, left: 29 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/cb653cc88_65f2ea1f0_93_395.svg", width: 17, left: 40 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/37a09e0ec_5a2f677ab_93_399.svg", width: 17, left: 67 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/8968055fe_89a0b436c_93_403.svg", width: 20, left: 101 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/98fed13aa_c147abb07_93_407.svg", width: 19, left: 126 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/871b299e9_269c42072_93_411.svg", width: 14, left: 152 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/3cd017e54_654bb2d15_93_415.svg", width: 15, left: 174 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/67c99f412_9f5974ac1_93_419.svg", width: 21, left: 208 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/b55b26c7d_3f85f6d06_93_423.svg", width: 20, left: 236 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/b215d855b_e53caf776_93_427.svg", width: 17, left: 263 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/28d3c2ad9_61de8f716_93_431.svg", width: 14, left: 290 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/6ad01a08e_dc6f731f2_93_435.svg", width: 18, left: 309 },
  ];

  return (
    <main className="relative w-full min-h-screen bg-black overflow-clip font-sans">
      {/* Background Layers */}
      <img
        src="https://media.base44.com/images/public/6a3542676f9044e70b439a84/5cb8a5204_323ee374e_93_338.svg"
        className="absolute inset-0 w-full h-full object-cover z-0"
        alt=""
      />
      <img
        src="https://media.base44.com/images/public/6a3542676f9044e70b439a84/8e606f141_46cfdf17b_93_339.svg"
        className="absolute inset-0 w-full h-full object-cover z-0"
        alt=""
      />

      {/* Header Navigation */}
      <header className="absolute top-[80px] left-0 w-full px-8 lg:px-[clamp(16px,5.7vw,109px)] flex justify-end z-20 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex items-center gap-[clamp(16px,2.8vw,54px)] pointer-events-auto"
        >
          <Link to="/login" className="text-white font-semibold text-sm hover:opacity-70 transition-opacity">
            Log In
          </Link>
          <Link to="/register" className="px-4 py-2 bg-white text-black font-semibold text-sm rounded-full hover:bg-white/90 transition-all">
            Sign Up
          </Link>
        </motion.div>
      </header>

      {/* Hero: two-column on large, overlapping stack on small */}
      <div className="relative z-10 w-full min-h-screen flex flex-col lg:flex-row items-center">

        {/* Orb — full width on mobile, half on desktop */}
        <div className="w-full lg:w-1/2 flex items-center justify-center min-h-screen lg:min-h-screen overflow-hidden">
          <motion.div
            className="relative w-full max-w-[660px] aspect-square overflow-hidden"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.img
              src="https://media.base44.com/images/public/6a3542676f9044e70b439a84/156742c3c_2c64e420d_b567a13c189ab17b1195db0aba380e0ba8854e8c.png"
              alt="Power Core"
              className="absolute max-w-none"
              style={{
                width: "237.034%",
                height: "238.171%",
                left: "-72.624%",
                top: "-50.189%",
                objectFit: "cover",
                objectPosition: "center",
              }}
              animate={{
                filter: ["brightness(1)", "brightness(1.25)", "brightness(1)"],
                scale: [1, 1.015, 1],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        {/* Brand text — overlays orb on mobile (absolute centered), normal flow on desktop */}
        <div className="absolute inset-0 flex items-center justify-center px-8 lg:static lg:w-1/2 lg:flex lg:items-center lg:justify-start lg:px-[clamp(32px,5vw,80px)]">
          <motion.div
            initial={{ opacity: 0, x: 0, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, type: "spring", stiffness: 40 }}
            className="flex flex-col gap-[clamp(10px,2.4vw,47px)] w-full max-w-[min(508px,85vw)]"
          >
            <ImageWord
              images={baselineImages}
              width={508}
              height={89}
              ariaLabel="Baseline"
            />
            <ImageWord
              images={mindOverMoneyImages}
              width={327}
              height={21}
              ariaLabel="Mind Over Money"
            />
          </motion.div>
        </div>
      </div>
    </main>
  );
}