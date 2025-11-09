import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { ServiceCards } from "@/components/ServiceCards";
import { RentPanel } from "@/components/RentPanel";
import { ReturnPanel } from "@/components/ReturnPanel";
import { DetectPanel } from "@/components/DetectPanel";
import { Footer } from "@/components/Footer";

type ActivePanel = "rent" | "return" | "detect" | null;

const Index = () => {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const handlePanelClick = (panel: ActivePanel) => {
    setActivePanel(activePanel === panel ? null : panel);
    
    // Scroll to services section
    setTimeout(() => {
      document.getElementById("service-panel")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <NavBar />
      
      <Hero
        onRentClick={() => handlePanelClick("rent")}
        onReturnClick={() => handlePanelClick("return")}
        onDetectClick={() => handlePanelClick("detect")}
      />
      
      <About />
      
      <ServiceCards
        onRentClick={() => handlePanelClick("rent")}
        onReturnClick={() => handlePanelClick("return")}
        onDetectClick={() => handlePanelClick("detect")}
      />

      {/* Active service panel */}
      {activePanel && (
        <section id="service-panel" className="py-12 px-4">
          <div className="container mx-auto max-w-3xl">
            {activePanel === "rent" && <RentPanel />}
            {activePanel === "return" && <ReturnPanel />}
            {activePanel === "detect" && <DetectPanel />}
          </div>
        </section>
      )}
      
      <Footer />
    </div>
  );
};

export default Index;
