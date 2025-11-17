import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero
        onRentClick={() => navigate("/rent/start")}
        onReturnClick={() => navigate("/rent/end")}
      />
      <About />
      <Services />
      <Footer />
    </div>
  );
}
