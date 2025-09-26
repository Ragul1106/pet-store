// src/components/PromoCarousel.jsx
import React, { useEffect, useRef, useState } from "react";
import PromoHero1 from "./PromoHero1";
import PromoHero2 from "./PromoHero2";
import PromoHero3 from "./PromoHero3";

export default function PromoCarousel({ interval = 2000 }) {
  const slides = [<PromoHero1 key="p1" />, <PromoHero2 key="p2" />, <PromoHero3 key="p3" />];
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % slides.length);
      }, interval);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPaused, interval, slides.length]);

  const goTo = (i) => {
    setIndex(i % slides.length);
  };

  return (
    <div
      className="relative w-full mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div className="relative overflow-hidden">
        {slides.map((Slide, i) => {
          const isActive = i === index;
          return (
            <div
              key={i}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                isActive ? "opacity-100 translate-x-0 z-20" : "opacity-0 translate-x-6 z-10 pointer-events-none"
              }`}
            >
              <div className="relative">{Slide}</div>
            </div>
          );
        })}
        {/* Keeps container height stable */}
        <div className="invisible">{slides[index]}</div>
      </div>

      {/* Horizontal indicators at bottom center */}
      <div
        className="absolute bottom-[4px] left-1/2 transform -translate-x-1/2 flex gap-3 z-50 border-4 border-black rounded-3xl p-2"
        role="tablist"
        aria-label="Promo selectors"
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-8 h-8 rounded-full border-4 border-black flex items-center justify-center focus:outline-none`}
            aria-pressed={i === index}
            aria-label={`Show promo ${i + 1}`}
            title={`Promo ${i + 1}`}
          >
            <span
              className={`block w-7 h-6 rounded-full ${
                i === index ? "bg-blue-600" : "bg-white"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
