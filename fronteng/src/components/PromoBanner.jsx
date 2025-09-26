import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function PromoBanner({ apiEndpoint = "/promo-banners/" }) {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await api.get(apiEndpoint);
        if (res.data.length > 0) {
          setBanner(res.data[0]); // show first banner only
        }
      } catch (err) {
        console.error("Error loading promo banner", err);
      }
    }
    fetchBanner();
  }, [apiEndpoint]);

  if (!banner) return null;

  const renderButton = () => {
    if (!banner.link) {
      return (
        <button
          disabled
          className="bg-gray-300 text-gray-600 font-semibold px-6 py-3 rounded-xl w-fit cursor-not-allowed"
        >
          {banner.button_text}
        </button>
      );
    }

    if (banner.link.startsWith("http")) {
      // External link
      return (
        <a
          href={banner.link}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-black font-semibold px-6 py-3 rounded-xl inline-block w-fit"
        >
          {banner.button_text}
        </a>
      );
    } else {
      // Internal React Router link
      return (
        <Link
          to={banner.link}
          className="bg-white text-black font-semibold px-6 py-3 rounded-xl inline-block w-fit"
        >
          {banner.button_text}
        </Link>
      );
    }
  };

  return (
    <div className="w-full mx-auto px-10 py-8">
      <div className="flex flex-col md:flex-row rounded-2xl overflow-hidden bg-transparent">
        {/* Left Blue Section - 60% on md+ */}
        <div className="bg-[#0045ff] text-white p-8 md:w-3/5 flex flex-col justify-center relative">
          <div className=" mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">{banner.title}</h2>
          <p className="mb-6 text-sm md:text-xl leading-relaxed mr-56">{banner.subtitle}</p>
          </div>
          <div className="pl-10 text-sm md:text-2xl ">
            {renderButton()}
          </div>
        </div>

        {/* Right Image Section - 40% on md+ */}
        <div className="relative md:w-2/5 h-64 md:h-auto">
          <img
            src={banner.image_url}
            alt={banner.title}
            className="w-full h-full object-cover"
            style={{ display: "block" }}
          />

          {/* Discount Circle placed on the seam (overlapping left section) */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 bg-white text-black rounded-full w-28 h-28 flex items-center justify-center shadow-lg">
            <span className="text-center font-semibold text-sm md:text-2xl px-4">
              {banner.discount_text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
