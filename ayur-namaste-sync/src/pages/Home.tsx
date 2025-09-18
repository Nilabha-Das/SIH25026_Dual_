import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { About } from "@/components/About";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-background to-background/80">
      <Navigation />
      <Hero />
      <Services />
      <About />
      <Footer />
    </div>
  );
}