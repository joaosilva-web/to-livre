import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";

export default function Home() {
  return (
    <div className="min-h-screen bg-background-muted p-6 text-text">
      <Hero />
      <HowItWorks />
    </div>
  );
}
