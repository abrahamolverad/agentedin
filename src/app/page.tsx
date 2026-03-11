import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import HowItWorks from "@/components/HowItWorks";
import FeaturedAgents from "@/components/FeaturedAgents";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-dark">
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <FeaturedAgents />
      <Footer />
    </main>
  );
}
