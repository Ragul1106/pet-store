// src/components/PromoHero2.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function PromoHero2({ apiEndpoint = "/carousal-banner2/" }) {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(apiEndpoint);
        const data = Array.isArray(res.data) ? res.data : [];
        if (mounted && data.length > 0) setBanner(data[0]);
      } catch (err) {
        console.error("Failed to fetch banner", err);
      }
    })();
    return () => (mounted = false);
  }, [apiEndpoint]);

  if (!banner) return null;

  const {
    left_image_url,
    right_image_url,
    ribbon_text = "Get upto 40% Discount on all products",
    overlay_title = "",
    overlay_body = "",
    button_text = "Shop Now",
    button_link = "#",
  } = banner;

  const renderCTA = () => {
    if (!button_link) {
      return (
        <button className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg">
          {button_text}
        </button>
      );
    }
    if (button_link.startsWith("http")) {
      return (
        <a
          href={button_link}
          target="_blank"
          rel="noreferrer noopener"
          className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg inline-block"
        >
          {button_text}
        </a>
      );
    }
    return (
      <Link to={button_link} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg inline-block">
        {button_text}
      </Link>
    );
  };

  return (
    <section className="w-full h-full max-w-full mx-auto px-4 py-6">
      {/* local CSS for slanted right panel and exact visuals */}
      <style>{`
        /* Right panel has a slanted left edge */
        .promo2-right {
          clip-path: polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%);
        }
        /* Slight negative margin so seam crosses full width like design */
        .promo2-container {
          margin-left: -6px;
          margin-right: -6px;
        }
        /* black overlay box look */
        .promo2-overlay {
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(0.5px);
        }
        /* blue ribbon */
        .promo2-ribbon {
          background: #0b5bff;
        }

        @media (min-width: 768px) {
          /* make sure overlay width and placement look like the mock on larger screens */
          .promo2-overlay { width: 56%; right: 6%; }
        }
      `}</style>

      <div className="promo2-container rounded-none overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-stretch">
          {/* LEFT: image column */}
          <div className="md:w-1/2 w-full flex items-center justify-center bg-white">
            <div className="w-full h-56 md:h-[360px] flex items-center justify-center">
              <img
                src={left_image_url}
                alt="left"
                className="object-contain h-full md:h-[360px] w-auto"
                style={{ maxWidth: "95%" }}
              />
            </div>
          </div>

          {/* RIGHT: slanted colored panel */}
          <div className="md:w-1/2 w-full relative promo2-right bg-[#98FB98]">
            {/* background right image (under the green overlay) if admin provided */}
            {right_image_url && (
              <img
                src={right_image_url}
                alt="right-bg"
                className="absolute inset-0 w-full h-full object-contain opacity-40 pointer-events-none"
                style={{ zIndex: 0 }}
              />
            )}

            {/* blue ribbon (top centered horizontally in right panel) */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
              <div className="promo2-ribbon text-white font-semibold px-2 py-2 rounded-sm shadow-md text-center text-lg md:text-xl">
                {ribbon_text}
              </div>
            </div>

            {/* big dark rounded overlay with white text */}
            <div
              className="promo2-overlay text-white rounded-full px-20 space-y-2 py-1 absolute z-20"
              style={{
                // position roughly centered vertically and shifted right
                top: "36%",
                right: "6%",
                width: "62%",
                maxWidth: "520px",
                transform: "translateY(-10%)",
                borderRadius: "46px",
              }}
            >
              <div className="text-lg md:text-2xl font-extrabold leading-tight">
                {overlay_title.split("\n").map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>

              {overlay_body && (
                <div className="mt-4 text-sm md:text-base font-semibold leading-relaxed">
                  {overlay_body.split("\n").map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Shop Now button centered on slanted seam near bottom */}
            <div
              className="absolute z-50 left-10 border-2 border-black rounded-full"
              style={{
                bottom: "2%",
              }}
            >
              {renderCTA()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
