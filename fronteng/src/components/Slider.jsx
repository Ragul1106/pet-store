import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Slider({ apiEndpoint = "/home-categories/", visibleCount = 5 }) {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [responsiveCount, setResponsiveCount] = useState(visibleCount);
  const navigate = useNavigate();

  // Determine visible cards based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setResponsiveCount(1); // mobile
      else if (window.innerWidth < 1024) setResponsiveCount(2); // tablet
      else setResponsiveCount(visibleCount); // desktop
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
        if (mounted) setItems(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchItems();
    return () => (mounted = false);
  }, [apiEndpoint]);

  const handleNext = () => {
    if (index + responsiveCount < items.length) setIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const translateX = -(index * (100 / responsiveCount));

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
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(${translateX}%)`,
              width: `${(items.length * 100) / responsiveCount}%`,
            }}
          >
            {items.map((it) => (
              <div
                key={it.id}
                className="flex-shrink-0 flex flex-col items-center justify-center px-2 sm:px-4"
                style={{ width: `${100 / items.length}%` }}
              >
                <div className={`w-48 h-48 sm:w-56 sm:h-56 md:w-54 md:h-54 rounded-[40%] bg-[#98FB98] flex items-center justify-center overflow-hidden`}>
                  {it.image_url ? (
                    <img
                      src={it.image_url}
                      alt={it.title}
                      className="max-w-[90%] max-h-[90%] object-contain cursor-pointer"
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
