// src/components/PromoCarousel.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * PromoCarousel - resilient against slides that return `null` while they fetch data.
 *
 * Props:
 * - interval (ms) default 2000
 * - slides: array of React nodes (optional)
 * - minHeight (px) default 320
 * - maxHeight (px) default 520
 */
export default function PromoCarousel({
  interval = 2000,
  slides: externalSlides = null,
  minHeight = 320,
  maxHeight = 520,
}) {
  const defaultSlides = [
    <div key="p1" className="w-full h-full"><div style={{ minHeight: 1 }} /></div>,
  ];
  const slides = externalSlides && externalSlides.length ? externalSlides : defaultSlides;

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // start with maxHeight to avoid initial collapse; will be clamped after measure
  const [viewportHeight, setViewportHeight] = useState(maxHeight);
  const timerRef = useRef(null);
  const slideRefs = useRef([]);
  const resizeTimeout = useRef(null);

  const setSlideRef = (el, i) => {
    slideRefs.current[i] = el;
  };

  // clamp helper
  const clampHeight = (h) => {
    if (!isFinite(h) || h <= 0) return Math.max(minHeight, 0);
    return Math.max(minHeight, Math.min(maxHeight, Math.round(h)));
  };

  // measure slides; if active is zero, pick the tallest measured slide; then clamp
  const measureActiveHeight = useCallback(() => {
    const heights = slideRefs.current.map((el) => {
      if (!el) return 0;
      return el.offsetHeight || el.getBoundingClientRect().height || 0;
    });

    const activeH = heights[index] || 0;
    let chosen = activeH > 0 ? activeH : Math.max(...heights, minHeight || 0, maxHeight || 0);
    chosen = clampHeight(chosen);

    if (chosen !== viewportHeight) setViewportHeight(chosen);
  }, [index, minHeight, maxHeight, viewportHeight]);

  // auto-advance timer
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!isPaused && slides.length > 1) {
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

  // measure after paint + short delay to catch images
  useEffect(() => {
    const r = requestAnimationFrame(() => {
      measureActiveHeight();
      setTimeout(measureActiveHeight, 140);
    });
    return () => cancelAnimationFrame(r);
  }, [index, measureActiveHeight, slides.length]);

  // debounced resize
  useEffect(() => {
    function onResize() {
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(() => {
        measureActiveHeight();
      }, 120);
    }
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
    };
  }, [measureActiveHeight]);

  const goTo = (i) => {
    setIndex(i % slides.length);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), Math.max(700, interval));
  };

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div
      className="relative w-full mx-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* viewport pinned to measured & clamped height */}
      <div
        className="relative overflow-hidden"
        style={{
          height: viewportHeight ? `${viewportHeight}px` : undefined,
          transition: "height 240ms ease",
        }}
        aria-live="polite"
      >
        {slides.map((SlideNode, i) => {
          const content = SlideNode == null ? <div className="w-full h-full" /> : SlideNode;
          const isActive = i === index;
          return (
            <div
              key={i}
              ref={(el) => setSlideRef(el, i)}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out transform ${isActive ? "opacity-100 z-20" : "opacity-0 z-10 pointer-events-none"}`}
              style={{
                transform: isActive ? "translateX(0)" : "translateX(6%)",
                willChange: "opacity, transform",
              }}
            >
              <div className="w-full h-full">{content}</div>
            </div>
          );
        })}
      </div>

      {/* indicators */}
      <div
        className="absolute bottom-[75px] left-1/2 transform -translate-x-1/2 flex gap-3 z-50 border-4 border-black rounded-3xl p-2"
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
              className={`block w-7 h-6 rounded-full ${i === index ? "bg-blue-600" : "bg-white"}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}




// // src/components/PromoCarousel.jsx
// import React, { useEffect, useRef, useState } from "react";
// import PromoHero1 from "./PromoHero1";
// import PromoHero2 from "./PromoHero2";
// import PromoHero3 from "./PromoHero3";

// export default function PromoCarousel({ interval = 2000 }) {
//   const slides = [<PromoHero1 key="p1" />, <PromoHero2 key="p2" />, <PromoHero3 key="p3" />];
//   const [index, setIndex] = useState(0);
//   const [isPaused, setIsPaused] = useState(false);
//   const timerRef = useRef(null);

//   useEffect(() => {
//     if (!isPaused) {
//       timerRef.current = setInterval(() => {
//         setIndex((i) => (i + 1) % slides.length);
//       }, interval);
//     }
//     return () => {
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//         timerRef.current = null;
//       }
//     };
//   }, [isPaused, interval, slides.length]);

//   const goTo = (i) => {
//     setIndex(i % slides.length);
//   };

//   return (
//     <div
//       className="relative w-full mx-auto"
//       onMouseEnter={() => setIsPaused(true)}
//       onMouseLeave={() => setIsPaused(false)}
//     >
//       {/* Slides */}
//       <div className="relative overflow-hidden">
//         {slides.map((Slide, i) => {
//           const isActive = i === index;
//           return (
//             <div
//               key={i}
//               aria-hidden={!isActive}
//               className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
//                 isActive ? "opacity-100 translate-x-0 z-20" : "opacity-0 translate-x-6 z-10 pointer-events-none"
//               }`}
//             >
//               <div className="relative">{Slide}</div>
//             </div>
//           );
//         })}
//         {/* Keeps container height stable */}
//         <div className="invisible">{slides[index]}</div>
//       </div>

//       {/* Horizontal indicators at bottom center */}
//       <div
//         className="absolute bottom-[4px] left-1/2 transform -translate-x-1/2 flex gap-3 z-50 border-4 border-black rounded-3xl p-2"
//         role="tablist"
//         aria-label="Promo selectors"
//       >
//         {slides.map((_, i) => (
//           <button
//             key={i}
//             onClick={() => goTo(i)}
//             className={`w-8 h-8 rounded-full border-4 border-black flex items-center justify-center focus:outline-none`}
//             aria-pressed={i === index}
//             aria-label={`Show promo ${i + 1}`}
//             title={`Promo ${i + 1}`}
//           >
//             <span
//               className={`block w-7 h-6 rounded-full ${
//                 i === index ? "bg-blue-600" : "bg-white"
//               }`}
//             />
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }
