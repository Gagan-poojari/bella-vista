import HeroSection from "./components/hero/HeroSection";
import NavBar from "./components/hero/NavBar";
import Footer from "./components/layout/Footer";
import RoomsOverview from "./components/rooms/RoomsOverview";

export default function Home() {
  return (
    <>
      <NavBar />
      <HeroSection />
      <RoomsOverview />
      <Footer />
    </>
  );
}