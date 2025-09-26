import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function OfferStrip({ apiEndpoint = "/offer-strips/" }) {
  const [offer, setOffer] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await api.get(apiEndpoint);
        if (!mounted) return;
        if (Array.isArray(res.data) && res.data.length > 0) {
          setOffer(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch offer strip", err);
      }
    }
    load();
    return () => (mounted = false);
  }, [apiEndpoint]);

  if (!offer) return null;

  const bg = offer.background_color || "#bfffb3";
  const textColor = offer.text_color || "#000000";

  const CTA = () => {
    const baseClasses =
      "px-8 py-3 rounded-full text-2xl font-semibold inline-block shadow-md transform transition-transform active:translate-y-0.5";
    const style = {
      background: "#0f52ff",
      color: "#fff",
      boxShadow: "0 6px 0 rgba(0,0,0,0.15), inset 0 -2px 0 rgba(0,0,0,0.08)",
    };

    if (!offer.link) {
      return (
        <button
          disabled
          className={`${baseClasses} opacity-70 cursor-not-allowed `}
          style={style}
        >
          {offer.button_text}
        </button>
      );
    }

    if (/^https?:\/\//.test(offer.link)) {
      return (
        <a href={offer.link} target="_blank" rel="noopener noreferrer" className={baseClasses} style={style}>
          {offer.button_text}
        </a>
      );
    }

    return (
      <Link to={offer.link} className={baseClasses} style={style}>
        {offer.button_text}
      </Link>
    );
  };

  return (
    <div className="w-full px-6 py-6">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: bg, color: textColor }}
      >
        <div className="mx-auto px-10 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left: text block with fixed width (40%) */}
            <div className="w-full md:w-2/5 flex flex-col justify-center text-center md:text-left">
              <h3
                className="text-2xl md:text-2xl font-extrabold leading-tight pr-10"
                style={{ color: textColor }}
              >
                {offer.title}
              </h3>
              {/* {offer.subtitle && (
                <p
                  className="mt-2 text-sm md:text-base"
                  style={{ color: textColor }}
                >
                  {offer.subtitle}
                </p>
              )} */}
            </div>

            {/* Center: product image with fixed size */}
            <div className="flex-shrink-0 flex items-center justify-center w-28 h-28">
              {offer.product_image_url ? (
                <img
                  src={offer.product_image_url}
                  alt={offer.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-white/30 rounded-md" />
              )}
            </div>

            {/* Right: CTA button */}
            <div className="flex-shrink-0 border-2 border-black rounded-full">
              <CTA />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
