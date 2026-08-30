import HeroSection from "./components/hero/HeroSection";
import NavBar from "./components/hero/NavBar";

export default function Home() {
  return (
    <>
      <NavBar />
      <HeroSection />
      {/* Rest of the page continues below the hero's 400vh scroll track */}
      <section id="stay" className="bg-mist py-24">
        <div className="mx-auto max-w-3xl px-8 text-center">
          <h2 className="font-display text-3xl text-ink">
            Rooms &amp; rates
          </h2>
          <p className="mt-3 font-body text-ink/70">
            1BHK, 2BHK, and dorm beds — the next section of the site picks up
            here.
          </p>
        </div>
      </section>
    </>
  );
}