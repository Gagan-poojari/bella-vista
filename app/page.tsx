import AmenitiesSection from "./components/amenities/Amenitiessection";
import BeyondEstate from "./components/beyond/BeyondEstate";
import HeroSection from "./components/hero/HeroSection";
import NavBar from "./components/hero/NavBar";
import Footer from "./components/layout/Footer";
import GuestVoices from "./components/reviews/GuestVoices";
import RoomsOverview from "./components/rooms/RoomsOverview";

export default function Home() {
  return (
    <>
      <NavBar />
      <HeroSection />
      <RoomsOverview />
      <AmenitiesSection />
      <GuestVoices />
      <BeyondEstate />
      <Footer />
    </>
  );
}