import { Hero3D } from "@/components/Hero3D";
import { WalletConnectBar } from "@/components/WalletConnectBar";
import { AIAssistant } from "@/components/AIAssistant";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";
import { Projects3DCarousel } from "@/components/Projects3DCarousel";
import { SkillsHolograph } from "@/components/SkillsHolograph";
import { AwardsBadges } from "@/components/AwardsBadges";
import { ContactWeb3 } from "@/components/ContactWeb3";
import { SkillTowerGame } from "@/components/SkillTowerGame";
import { SkillRunnerGame } from "@/components/SkillRunnerGame";

export default function Home() {
  return (
    <div className="min-h-[200dvh] bg-black">
      <WalletConnectBar />
      <Hero3D />
      <section className="px-4 md:px-8 -mt-24 relative z-10">
        <AIAssistant />
      </section>
      <ExperienceTimeline />
      <Projects3DCarousel />
      <SkillsHolograph />
      <SkillTowerGame />
      <SkillRunnerGame />
      <AwardsBadges />
      <ContactWeb3 />
    </div>
  );
}
