import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Slider({ apiEndpoint = "/home-categories/", visibleCount = 5 }) {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [responsiveCount, setResponsiveCount] = useState(visibleCount);
  const [containerWidth, setContainerWidth] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Responsive visible count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setResponsiveCount(1);
      else if (window.innerWidth < 1024) setResponsiveCount(2);
      else setResponsiveCount(visibleCount);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [visibleCount]);

  // Fetch items
  useEffect(() => {
    let mounted = true;
    async function fetchItems() {
      try {
        const res = await api.get(apiEndpoint);
        if (mounted) {
          setItems(res.data || []);
          // reset index if items change
          setIndex(0);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchItems();
    return () => (mounted = false);
  }, [apiEndpoint]);

  // Measure container width (useLayoutEffect to avoid flicker)
  useLayoutEffect(() => {
    function measure() {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || 0;
        setContainerWidth(w);
      }
    }
    // measure now
    measure();
    // measure after a short debounce on resize
    const t = () => {
      measure();
      // clamp index if needed
      const maxIndex = Math.max(0, items.length - responsiveCount);
      setIndex((i) => Math.min(i, maxIndex));
    };
    window.addEventListener("resize", t);
    return () => window.removeEventListener("resize", t);
  }, [responsiveCount, items.length]);

  // slide width in pixels (floor to avoid fractional px)
  const slideWidthPx = containerWidth && responsiveCount ? Math.floor(containerWidth / responsiveCount) : 0;
  const trackWidthPx = slideWidthPx * items.length;

  // Pixel translateX (round to avoid fractional pixels)
  const translateXpx = -Math.round(index * slideWidthPx);

  // handle next / prev with clamping
  const handleNext = () => {
    const maxIndex = Math.max(0, items.length - responsiveCount);
    setIndex((i) => Math.min(i + 1, maxIndex));
  };

  const handlePrev = () => {
    setIndex((i) => Math.max(i - 1, 0));
  };

  // When an image loads, increment counter (so we can re-measure to avoid layout-shift)
  const onImageLoad = () => {
    setImagesLoaded((n) => n + 1);
    // re-measure after image load to be safe
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth || 0);
    }
  };

  // ensure index is clamped if responsiveCount or items change
  useEffect(() => {
    const maxIndex = Math.max(0, items.length - responsiveCount);
    setIndex((i) => Math.min(i, maxIndex));
  }, [items.length, responsiveCount]);

  // reserved height for slides to avoid vertical jumps (adjust as needed)
  const reservedSlideHeight = 220; // px — change to suit your design (matches image container below)

  return (
    <div className="w-full py-12">
      <h2 className="text-3xl text-center font-semibold mb-8">Shop by Pet</h2>
      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-8">
        {/* Arrows */}
        {index > 0 && (
          <button
            aria-label="Previous"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-[#0045ff] text-white rounded-full shadow-lg p-3 focus:outline-none"
            style={{ transform: "translateY(-50%)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        {index + responsiveCount < items.length && (
          <button
            aria-label="Next"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-[#0045ff] text-white rounded-full shadow-lg p-3 focus:outline-none"
            style={{ transform: "translateY(-50%)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Viewport */}
        <div ref={containerRef} className="overflow-hidden" style={{ minHeight: reservedSlideHeight }}>
          {/* Track */}
          <div
            className="flex"
            style={{
              width: trackWidthPx ? `${trackWidthPx}px` : "100%",
              transform: `translateX(${translateXpx}px)`,
              transition: "transform 500ms ease",
              willChange: "transform",
              backfaceVisibility: "hidden",
            }}
          >
            {items.map((it) => (
              <div
                key={it.id}
                className="flex-shrink-0 flex flex-col items-center justify-start px-2 sm:px-4"
                style={{
                  width: slideWidthPx ? `${slideWidthPx}px` : `${100 / Math.max(1, responsiveCount)}%`,
                }}
              >
                {/* image container reserves size to avoid layout shift */}
                <div
                  className="rounded-[40%] bg-[#98FB98] flex items-center justify-center overflow-hidden"
                  style={{
                    width: Math.min(280, slideWidthPx * 0.9),
                    height: Math.min(280, reservedSlideHeight),
                    minWidth: 120,
                    minHeight: 120,
                    display: "flex",
                  }}
                >
                  {it.image_url ? (
                    <img
                      src={it.image_url}
                      alt={it.title}
                      onLoad={onImageLoad}
                      loading="lazy"
                      width={Math.min(280, Math.round((slideWidthPx || 200) * 0.9))}
                      height={reservedSlideHeight}
                      style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }}
                      className="cursor-pointer"
                      onClick={() => navigate(`/category/${it.slug || it.id}`)}
                    />
                  ) : (
                    <div className="text-sm text-gray-500">No Image</div>
                  )}
                </div>

                <Link
                  to={`/category/${it.slug || it.id}`}
                  className="mt-2 text-base md:text-2xl font-medium text-gray-900 text-center"
                >
                  {it.title}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}





// import React, { useEffect, useRef, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import api from "../lib/api";

// export default function Slider({ apiEndpoint = "/home-categories/", visibleCount = 5 }) {
//   const [items, setItems] = useState([]);
//   const [index, setIndex] = useState(0);
//   const [responsiveCount, setResponsiveCount] = useState(visibleCount);
//   const navigate = useNavigate();

//   // Determine visible cards based on screen size
//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth < 640) setResponsiveCount(1); // mobile
//       else if (window.innerWidth < 1024) setResponsiveCount(2); // tablet
//       else setResponsiveCount(visibleCount); // desktop
//     };

//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [visibleCount]);

//   // Fetch items
//   useEffect(() => {
//     let mounted = true;
//     async function fetchItems() {
//       try {
//         const res = await api.get(apiEndpoint);
//         if (mounted) setItems(res.data || []);
//       } catch (err) {
//         console.error(err);
//       }
//     }
//     fetchItems();
//     return () => (mounted = false);
//   }, [apiEndpoint]);

//   const handleNext = () => {
//     if (index + responsiveCount < items.length) setIndex((i) => i + 1);
//   };

//   const handlePrev = () => {
//     if (index > 0) setIndex((i) => i - 1);
//   };

//   const translateX = -(index * (100 / responsiveCount));

//   return (
//     <div className="w-full py-12">
//       <h2 className="text-3xl text-center font-semibold mb-8">Shop by Pet</h2>
//       <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-8">

//         {/* Arrows */}
//         {index > 0 && (
//           <button
//             aria-label="Previous"
//             onClick={handlePrev}
//             className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-[#0045ff] text-white rounded-full shadow-lg p-3 focus:outline-none"
//           >
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//               <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//             </svg>
//           </button>
//         )}
//         {index + responsiveCount < items.length && (
//           <button
//             aria-label="Next"
//             onClick={handleNext}
//             className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-[#0045ff] text-white rounded-full shadow-lg p-3 focus:outline-none"
//           >
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//               <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//             </svg>
//           </button>
//         )}

//         <div className="overflow-hidden">
//           <div
//             className="flex transition-transform duration-500 ease-in-out"
//             style={{
//               transform: `translateX(${translateX}%)`,
//               width: `${(items.length * 100) / responsiveCount}%`,
//             }}
//           >
//             {items.map((it) => (
//               <div
//                 key={it.id}
//                 className="flex-shrink-0 flex flex-col items-center justify-center px-2 sm:px-4"
//                 style={{ width: `${100 / items.length}%` }}
//               >
//                 <div className={`w-48 h-48 sm:w-56 sm:h-56 md:w-54 md:h-54 rounded-[40%] bg-[#98FB98] flex items-center justify-center overflow-hidden`}>
//                   {it.image_url ? (
//                     <img
//                       src={it.image_url}
//                       alt={it.title}
//                       className="max-w-[90%] max-h-[90%] object-contain cursor-pointer"
//                       onClick={() => navigate(`/category/${it.slug || it.id}`)}
//                     />
//                   ) : (
//                     <div className="text-sm text-gray-500">No Image</div>
//                   )}
//                 </div>

//                 <Link
//                   to={`/category/${it.slug || it.id}`}
//                   className="mt-2 text-base md:text-2xl font-medium text-gray-900 text-center"
//                 >
//                   {it.title}
//                 </Link>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
