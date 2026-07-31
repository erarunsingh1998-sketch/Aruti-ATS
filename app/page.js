  "use client";

import About from "@/components/HomePage/About";
import Features from "@/components/HomePage/Features";
import Footer from "@/components/HomePage/Footer";
import HomeHeader from "@/components/HomePage/Header";
import Hero from "@/components/HomePage/Hero";
import Pricing from "@/components/HomePage/Pricing";
import ResumeCTA from "@/components/HomePage/ResumeCTA";
import TemplatesGallery from "@/components/HomePage/TemplatesGallery";

  export default function Home() {
    return (<div className="w-full min-h-screen relative overflow-hidden">
      <HomeHeader />
      <Hero />
      <About />
      <Features />
      <ResumeCTA />
      <Pricing />
      <TemplatesGallery />
      <Footer />
    </div>);
  }
