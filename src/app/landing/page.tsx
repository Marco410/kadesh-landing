import {
  Hero,
  KeyPoints,
  About,
  ProblemSolution,
  HowItWorks,
  WorkingOn,
  Testimonials,
  Join,
  Donate,
  CommunityMembers,
  Footer,
} from 'kadesh/components/landing';

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
      <CommunityMembers />
      <Footer />
    </>
  );
}
