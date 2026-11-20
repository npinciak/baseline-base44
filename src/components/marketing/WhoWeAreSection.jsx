import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const PORTRAIT_STUDENT_URL =
  "https://media.base44.com/images/public/6a3542676f9044e70b439a84/ffee70006_generated_image.png";
const PORTRAIT_EDUCATOR_URL =
  "https://media.base44.com/images/public/6a3542676f9044e70b439a84/631a410d6_generated_image.png";
const PRODUCT_SHOWCASE_URL =
  "https://media.base44.com/images/public/6a3542676f9044e70b439a84/4733b035c_generated_image.png";

const AB7_STYLES = `
  .ab7-section {
    --ab7-bg: #000000;
    --ab7-text: #ffffff;
    --ab7-accent: #2EFD7A;
    --ab7-radius: 30px;
    --ab7-btn-radius: 68px;
    background: var(--ab7-bg);
    color: var(--ab7-text);
    font-family: var(--font-body, 'Poppins', sans-serif);
    width: 100%;
    box-sizing: border-box;
    container: ab7-root / inline-size;
  }
  .ab7-section *, .ab7-section *::before, .ab7-section *::after {
    box-sizing: border-box;
  }
  .ab7-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-areas:
      "headline"
      "bodytext"
      "portrait2"
      "portrait1"
      "phone"
      "button";
    gap: clamp(16px, 3cqi, 24px);
  }
  .ab7-headline { grid-area: headline; }
  .ab7-headline h2 {
    font-family: var(--font-heading, 'Poppins', sans-serif);
    font-size: clamp(32px, 6.2cqi, 56px);
    font-weight: 800;
    line-height: 1.02;
    text-transform: uppercase;
    color: var(--ab7-text);
    margin: 0;
    letter-spacing: -0.02em;
  }
  @container ab7-root (width < 700px) {
    .ab7-headline h2 { font-size: clamp(44px, 13cqi, 72px); }
  }
  .ab7-portrait-1 { grid-area: portrait1; }
  .ab7-portrait-2 { grid-area: portrait2; }
  .ab7-portrait-1, .ab7-portrait-2 {
    clip-path: inset(0 round var(--ab7-radius));
    background: #0a0e1a;
    position: relative;
    will-change: transform;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
  }
  .ab7-portrait-1 img, .ab7-portrait-2 img {
    width: 100%;
    aspect-ratio: 306 / 443;
    object-fit: cover;
    object-position: top center;
    display: block;
  }
  .ab7-phone { grid-area: phone; }
  .ab7-phone-card {
    clip-path: inset(0 round var(--ab7-radius));
    background: #0a0e1a;
    will-change: transform;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    aspect-ratio: 570 / 442;
    overflow: hidden;
  }
  .ab7-phone-card img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transform: scale(1.04);
  }
  .ab7-bodytext {
    grid-area: bodytext;
    font-size: 15px;
    font-weight: 300;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.76);
    margin: 0;
  }
  .ab7-button-wrap {
    grid-area: button;
    display: flex;
    justify-content: center;
  }
  .ab7-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid var(--ab7-accent);
    border-radius: var(--ab7-btn-radius);
    padding: 16px 40px;
    font-family: var(--font-heading, 'Poppins', sans-serif);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ab7-accent);
    background: transparent;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
    min-height: 48px;
    white-space: nowrap;
  }
  .ab7-btn:hover {
    background: var(--ab7-accent);
    color: #000000;
    box-shadow: 0 0 24px rgba(46, 253, 122, 0.35);
  }
  @keyframes ab7-rise {
    from { opacity: 0; transform: translate3d(0, 52px, 0); }
    to   { opacity: 1; transform: translateZ(0); }
  }
  @keyframes ab7-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .ab7-section.ab7-anim:not(.ab7-inview) .ab7-headline,
  .ab7-section.ab7-anim:not(.ab7-inview) .ab7-bodytext,
  .ab7-section.ab7-anim:not(.ab7-inview) .ab7-portrait-1,
  .ab7-section.ab7-anim:not(.ab7-inview) .ab7-portrait-2,
  .ab7-section.ab7-anim:not(.ab7-inview) .ab7-phone,
  .ab7-section.ab7-anim:not(.ab7-inview) .ab7-button-wrap {
    opacity: 0;
  }
  .ab7-section.ab7-inview .ab7-headline    { animation: ab7-fade 1.2s ease 0.08s both; }
  .ab7-section.ab7-inview .ab7-bodytext    { animation: ab7-fade 1.2s ease 0.24s both; }
  .ab7-section.ab7-inview .ab7-portrait-1  { animation: ab7-rise 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both; }
  .ab7-section.ab7-inview .ab7-portrait-2  { animation: ab7-rise 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both; }
  .ab7-section.ab7-inview .ab7-phone       { animation: ab7-rise 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.7s both; }
  .ab7-section.ab7-inview .ab7-button-wrap { animation: ab7-rise 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.95s both; }
  @media (prefers-reduced-motion: reduce) {
    .ab7-section.ab7-anim:not(.ab7-inview) .ab7-headline,
    .ab7-section.ab7-anim:not(.ab7-inview) .ab7-bodytext,
    .ab7-section.ab7-anim:not(.ab7-inview) .ab7-portrait-1,
    .ab7-section.ab7-anim:not(.ab7-inview) .ab7-portrait-2,
    .ab7-section.ab7-anim:not(.ab7-inview) .ab7-phone,
    .ab7-section.ab7-anim:not(.ab7-inview) .ab7-button-wrap {
      opacity: 1;
    }
    .ab7-section.ab7-inview .ab7-headline, .ab7-section.ab7-inview .ab7-bodytext,
    .ab7-section.ab7-inview .ab7-portrait-1, .ab7-section.ab7-inview .ab7-portrait-2,
    .ab7-section.ab7-inview .ab7-phone, .ab7-section.ab7-inview .ab7-button-wrap {
      animation: none;
    }
  }
  @container ab7-root (width >= 700px) {
    .ab7-grid {
      grid-template-columns: 1fr 1fr 1.87fr;
      grid-template-areas:
        "headline  portrait2  bodytext"
        "portrait1 portrait2  phone"
        "portrait1 button     phone";
      grid-template-rows: auto 1fr auto;
      column-gap: clamp(16px, 2cqi, 24px);
      row-gap: clamp(12px, 1.5cqi, 20px);
      align-items: stretch;
    }
    .ab7-headline { align-self: start; }
    .ab7-portrait-2 { grid-area: portrait2; grid-row: 1 / 3; margin-top: 0; }
    .ab7-portrait-2 img, .ab7-portrait-1 img {
      width: 100%;
      height: 100%;
      aspect-ratio: unset;
      object-fit: cover;
      object-position: top center;
    }
    .ab7-portrait-1 { grid-area: portrait1; grid-row: 2 / 4; margin-top: 30px; }
    .ab7-bodytext { align-self: end; max-width: 412px; margin-left: auto; }
    .ab7-phone { grid-area: phone; grid-row: 2 / 4; margin-top: 30px; }
    .ab7-phone-card { width: 100%; height: 100%; aspect-ratio: unset; }
    .ab7-button-wrap { align-self: center; justify-content: center; }
  }
  @container ab7-root (700px <= width < 900px) {
    .ab7-headline h2 { font-size: clamp(24px, 4.5cqi, 36px); }
    .ab7-btn { font-size: 13px; padding: 12px 28px; }
  }
  @container ab7-root (width >= 1000px) {
    .ab7-grid { column-gap: clamp(20px, 2cqi, 28px); }
  }
`;

export default function WhoWeAreSection({
  ctaLabel = "Read More",
  ctaTo = "/about",
}) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let io;
    const rafId = requestAnimationFrame(() => {
      section.classList.add("ab7-anim");
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              section.classList.add("ab7-inview");
              io.disconnect();
            }
          });
        },
        { threshold: 0.15 }
      );
      io.observe(section);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (io) io.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="ab7-section py-14 md:py-[86px]"
      aria-labelledby="who-we-are-heading"
    >
      <style>{AB7_STYLES}</style>
      <div className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 md:px-[clamp(32px,6vw,140px)]">
        <div className="ab7-grid">
          <div className="ab7-headline">
            <h2 id="who-we-are-heading">
              Who We
              <br />
              <span className="text-[#2EFD7A]">Are</span>
            </h2>
          </div>

          <div className="ab7-portrait-2">
            <img
              src={PORTRAIT_EDUCATOR_URL}
              alt="Baseline financial educator and product builder"
              loading="lazy"
            />
          </div>

          <p className="ab7-bodytext">
            Baseline was built by educators, designers, and engineers who believe
            learning how money works should feel empowering rather than overwhelming.
            Through BaseScore™, guided Money Moves, and visual cash-flow forecasting,
            we give students, young adults, and families practical clarity for every
            financial milestone ahead.
          </p>

          <div className="ab7-portrait-1">
            <img
              src={PORTRAIT_STUDENT_URL}
              alt="Student building money habits with Baseline"
              loading="lazy"
            />
          </div>

          <div className="ab7-phone">
            <div className="ab7-phone-card">
              <img
                src={PRODUCT_SHOWCASE_URL}
                alt="Baseline BaseScore and interactive learning path preview"
                loading="lazy"
              />
            </div>
          </div>

          <div className="ab7-button-wrap">
            <Link to={ctaTo} className="ab7-btn">
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}