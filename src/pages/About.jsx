import React from "react";
import PublicNav from "@/components/marketing/PublicNav";
import PublicFooter from "@/components/marketing/PublicFooter";
import WhoWeAreSection from "@/components/marketing/WhoWeAreSection";
import AboutHero from "@/components/about/AboutHero";
import StoryChapter from "@/components/about/StoryChapter";
import AboutPillars from "@/components/about/AboutPillars";
import AboutCta from "@/components/about/AboutCta";

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white font-body flex flex-col">
      <PublicNav />

      <main className="flex-1 pt-[72px]">
        <AboutHero />

        <StoryChapter
          number="01"
          kicker="The problem"
          title="Most of us learn money the hard way."
          body="Too many students graduate without learning how taxes, compound growth or credit really work. The lessons come later, as costly mistakes."
        />

        <StoryChapter
          number="02"
          kicker="Our answer"
          title="Learn it. Try it. See where it takes you."
          body="No spreadsheets. No textbooks. Just short lessons, quick wins and a clear view of your future."
        >
          <AboutPillars />
        </StoryChapter>

        <StoryChapter
          number="03"
          kicker="Who it's for"
          title="First paychecks. First rent. First goals."
          body="Built for teens, college students and young adults finding their footing. And for the families cheering them on, with guardrails instead of lectures."
        />

        <WhoWeAreSection ctaLabel="Take the BaseScore™ Quiz" ctaTo="/basescore-quiz" />

        <AboutCta />
      </main>

      <PublicFooter />
    </div>
  );
}