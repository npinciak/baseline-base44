import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Helper component to reconstruct text from individual letter images fluidly
const ImageWord = ({ images, width, height, ariaLabel, className="" }) => {
  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{
        maxWidth: `${width}px`,
        width: "100%",
        aspectRatio: `${width} / ${height}`,
      }}
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
};

export default function Baseline30() {
  // Reconstructed data arrays for the image-based text
  const logInImages = [
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/4b538695f_cb7722815_93_463.svg", width: 14, left: 0 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/56382b27d_ea6081d5a_93_467.svg", width: 20, left: 19 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/f3eb6cd0e_001119171_93_471.svg", width: 18, left: 45 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/77e220a4e_35273e809_93_475.svg", width: 2, left: 82 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/3d0b6ab00_4f22fb268_93_479.svg", width: 17, left: 93 },
  ];

  const signUpImages = [
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/1f5f36d78_3f8ce4a94_93_439.svg", width: 16, left: 0 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/1bfb3298d_2ddf7fb30_93_443.svg", width: 2, left: 23 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/776d9d7d1_9f410a7a9_93_447.svg", width: 18, left: 33 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/a3f7af035_05417aa50_93_451.svg", width: 17, left: 59 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/1d24b7275_12b44f957_93_455.svg", width: 18, left: 96 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/a35eb2378_44344110e_93_459.svg", width: 15, left: 122 },
  ];

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

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1920px] mx-auto w-full min-h-screen flex flex-col">
        {/* Header Navigation */}
        <header className="absolute top-[80px] left-0 w-full px-8 lg:px-[clamp(16px,5.7vw,109px)] flex justify-end pointer-events-none">
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

        {/* Hero Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1240fr_680fr] w-full h-full">
          {/* Left spacer to push content to the right on desktop */}
          <div className="hidden lg:block" />

          {/* Right Content Column */}
          <div className="flex flex-col justify-center items-center lg:items-start px-8 lg:px-0 pt-32 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 1.2,
                delay: 0.4,
                type: "spring",
                stiffness: 40,
              }}
              className="flex flex-col gap-[clamp(16px,2.4vw,47px)] w-full max-w-[508px]"
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
                className="lg:ml-[7px] max-w-[80%] lg:max-w-full mx-auto lg:mx-0"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}