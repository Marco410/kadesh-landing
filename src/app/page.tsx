import Hero from '../components/Hero';
import About from '../components/About';
import ProblemSolution from '../components/ProblemSolution';
import HowItWorks from '../components/HowItWorks';
import WorkingOn from '../components/WorkingOn';
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
      <WorkingOn />
      <Testimonials />
      <Join />
      <Donate />
      <Footer />
    </>
  );
}
