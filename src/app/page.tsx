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
import KeyPoints from '../components/KeyPoints';

export default function Home() {
  return (
    <>
      <Hero />
      <KeyPoints />
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
