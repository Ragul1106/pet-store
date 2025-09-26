import React from "react";
import AboutSection from "../components/AboutSection";
import AboutCards from "../components/AboutCards";
import AboutHighlight from "../components/AboutHighlight";

export default function AboutPage() {
  return (
    <div className="w-full">
        <AboutSection />
        <AboutCards />
        <AboutHighlight />
    </div>
  );
}
