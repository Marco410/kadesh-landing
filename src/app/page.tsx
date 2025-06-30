import Image from "next/image";
import styles from "./page.module.css";
import Hero from '../components/Hero';
import About from '../components/About';
import ProblemSolution from '../components/ProblemSolution';
import HowItWorks from '../components/HowItWorks';
import Shop from '../components/Shop';
import Testimonials from '../components/Testimonials';
import Join from '../components/Join';
import Donate from '../components/Donate';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Hero />
      {/* Tres columnas con puntos clave */}
      <div style={{
        width: '100%',
        background: '#fff',
        margin: '0 auto',
        padding: '48px 0 32px 0',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex',
          gap: '48px',
          maxWidth: 1100,
          width: '100%',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 220, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🐶</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#f7945e', marginBottom: 4 }}>¿Perdiste a tu mascota?</div>
          </div>
          <div style={{ flex: 1, minWidth: 220, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🐕‍🦺</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#f7945e', marginBottom: 4 }}>¿Quieres adoptar o ayudar?</div>
          </div>
          <div style={{ flex: 1, minWidth: 220, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏥</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#f7945e', marginBottom: 4 }}>¿Tienes una veterinaria o refugio?</div>
          </div>
        </div>
      </div>
      <About />
      <ProblemSolution />
      <HowItWorks />
      <Shop />
      <Testimonials />
      <Join />
      <Donate />
      <Footer />
    </>
  );
}
