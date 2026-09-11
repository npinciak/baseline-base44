import React from "react";

// Shared SVG wordmark images used across the marketing hero, BaseScore quiz, and onboarding
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

const WORDMARK_W = 508;
const WORDMARK_H = 89;

export default function BaselineWordmark({ scale = 0.38 }) {
  const w = WORDMARK_W * scale;
  const h = WORDMARK_H * scale;

  const renderMark = (opacity) => (
    <div className="absolute inset-0" style={{ opacity }}>
      {baselineImages.map((img, i) => (
        <img
          key={i}
          src={img.src}
          className="absolute object-contain"
          style={{
            left: (img.left / WORDMARK_W) * w,
            top: (img.top / WORDMARK_H) * h,
            width: (img.width / WORDMARK_W) * w,
            height: (img.height / WORDMARK_H) * h,
          }}
          alt=""
        />
      ))}
    </div>
  );

  // Crop the source image to its top ~65% (the icon glyph), excluding the "Baseline" text baked into the bottom of the image
  const logoContainerH = h * 4.8;
  const cropFrac = 0.65;
  const logoImgSize = logoContainerH / cropFrac;

  return (
    <div className="relative shrink-0" style={{ width: w, height: h }} aria-label="Baseline">
      {/* Faint logo watermark behind the title, proportional to font size */}
      <div
        className="absolute pointer-events-none overflow-hidden"
        style={{
          width: logoImgSize,
          height: logoContainerH,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -70%)",
          opacity: 0.1375,
        }}
      >
        <img
          src="https://media.base44.com/images/public/6a3542676f9044e70b439a84/156742c3c_2c64e420d_b567a13c189ab17b1195db0aba380e0ba8854e8c.png"
          alt=""
          className="absolute object-contain"
          style={{ width: logoImgSize, height: logoImgSize, top: 0, left: 0 }}
        />
      </div>
      {renderMark(1)}
    </div>
  );
}