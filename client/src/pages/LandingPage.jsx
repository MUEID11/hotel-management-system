import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Hero from '../components/landing/Hero.jsx';
import Amenities from '../components/landing/Amenities.jsx';
import RoomShowcase from '../components/landing/RoomShowcase.jsx';
import Testimonials from '../components/landing/Testimonials.jsx';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar onNavigate={onNavigate} />
      <main>
        <Hero />
        <Amenities />
        <RoomShowcase />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}