import LandingNav from "../components/landing/LandingNav";
import LandingHero from "../components/landing/LandingHero";
import LandingTrust from "../components/landing/LandingTrust";
import LandingProblemSolution from "../components/landing/LandingProblemSolution";
import LandingFeatures from "../components/landing/LandingFeatures";
import LandingForBusinesses from "../components/landing/LandingForBusinesses";
import LandingForPromoters from "../components/landing/LandingForPromoters";
import LandingHowItWorks from "../components/landing/LandingHowItWorks";
import LandingShowcase from "../components/landing/LandingShowcase";
import LandingCTA from "../components/landing/LandingCTA";
import LandingFooter from "../components/landing/LandingFooter";

import "./Landing.css";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingTrust />
        <LandingProblemSolution />
        <LandingFeatures />
        <LandingForBusinesses />
        <LandingForPromoters />
        <LandingHowItWorks />
        <LandingShowcase />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
