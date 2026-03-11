import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import WhyAgentedIn from "@/components/WhyAgentedIn";
import Stats from "@/components/Stats";
import EarlyAccess from "@/components/EarlyAccess";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-dark">
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhyAgentedIn />
      <Stats />
      <EarlyAccess />
      <Footer />
    </main>
  );
}
