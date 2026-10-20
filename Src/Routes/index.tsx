import { createFileRoute } from "@tanstack/react-router";

import { AcademicHub } from "@/Components/Site/AcademicHub";
import { Assignments } from "@/Components/Site/Assignments";
import { Faq } from "@/Components/Site/Faq";
import { FinalCta } from "@/Components/Site/FinalCta";
import { Hero } from "@/Components/Site/Hero";
import { HowItWorks } from "@/Components/Site/HowItWorks";
import { Notifications } from "@/Components/Site/Notifications";
import { Personalization } from "@/Components/Site/Personalization";
import { Planner } from "@/Components/Site/Planner";
import { Practicals } from "@/Components/Site/Practicals";
import { Pricing } from "@/Components/Site/Pricing";
import { SiteFooter } from "@/Components/Site/SiteFooter";
import { SiteNav } from "@/Components/Site/SiteNav";
import { BroadcastBanner } from "@/Components/Ui/BroadcastBanner";

const TITLE = "SaastaScholar — Your Entire University Life. Organized.";
const DESCRIPTION =
  "Notes, assignments, practicals, previous-year papers, notifications and planning — organized around your university, department, semester and section.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <div className="relative z-10">
        <SiteNav />
        <main>
          <Hero />
          <Personalization />
          <AcademicHub />
          <Assignments />
          <Practicals />
          <Notifications />
          <Planner />
          <HowItWorks />
          <Pricing />
          <Faq />
          <FinalCta />
        </main>
        <SiteFooter />
      </div>

      {/* External Floating Modern Announcement Popup Widget */}
      <BroadcastBanner target="WEBSITE" mode="popup" />
    </div>
  );
}
