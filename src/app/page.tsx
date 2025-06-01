import FAQ from "./components/Faq";
import ForWhom from "./components/ForWhom";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Pricing from "./components/Pricing";
import Testimonials from "./components/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen bg-background-muted p-6 text-text">
      <Hero />
      <HowItWorks />
      <ForWhom />
      <Testimonials />
      <Pricing />
      <FAQ />
    </div>
  );
}
