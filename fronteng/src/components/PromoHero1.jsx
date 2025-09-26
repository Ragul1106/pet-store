// src/components/PromoHero.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

import CloudPng from "../assets/cloud.png";
import UmbrellaIconPng from "../assets/umbrella-icon.png";

export default function PromoHero1({ apiEndpoint = "/carousal-banner1/" }) {
  const [banner, setBanner] = useState(null);
  const [drops, setDrops] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function fetchBanner() {
      try {
        const res = await api.get(apiEndpoint);
        const data = Array.isArray(res.data) ? res.data : [];
        if (mounted && data.length > 0) {
          setBanner(data[0]);
        }
      } catch (err) {
        console.error("Failed to load promo banner", err);
      }
    }
    fetchBanner();
    return () => (mounted = false);
  }, [apiEndpoint]);

  useEffect(() => {
    // generate raindrops
    const arr = Array.from({ length: 25 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: `${1.5 + Math.random() * 1.5}s`,
      delay: `${i * 0.2}s`,
    }));
    setDrops(arr);
  }, []);

  if (!banner) return null;

  const {
    title,
    subtitle,
    button_text = "Shop Now",
    link = "#",
    image_url,
    right_image_url,
  } = banner;

  const renderButton = () => {
    if (!link) {
      return (
        <button className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-full shadow">
          {button_text}
        </button>
      );
    }
    if (link.startsWith("http")) {
      return (
        <a
          href={link}
          target="_blank"
          rel="noreferrer noopener"
          className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-full shadow inline-block"
        >
          {button_text}
        </a>
      );
    }
    return (
      <Link
        to={link}
        className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-full shadow inline-block"
      >
        {button_text}
      </Link>
    );
  };

  return (
    <section className="w-full mx-auto my-8 px-4">

      <div className="flex flex-col md:flex-row items-stretch rounded-2xl overflow-hidden relative">
        {/* Left image (60%) */}
        <div className="md:w-3/5 w-full">
          <div className="w-full h-56 md:h-96 bg-gray-100">
            <img
              src={image_url}
              alt={title || "promo"}
              className="w-full h-full object-cover block"
            />
          </div>
        </div>

        {/* Right panel (40%) */}
        <div className="md:w-2/5 w-full bg-[#98FB98] relative p-6 flex flex-col justify-between">
          {/* decorative cloud */}
          <img
            src={CloudPng}
            alt="cloud"
            className="hidden md:block absolute left-16 top-16 w-20 pointer-events-none"
          />

          {/* content */}
          <div className="relative z-10">
            <div className="flex items-start gap-4">
              {/* umbrella icon in rounded white circle */}
              <div className="absolute top-46 left-40 rounded-full bg-white p-3 shadow-md inline-flex items-center justify-center flex-shrink-0">
                <img src={UmbrellaIconPng} alt="umbrella icon" className="w-5 h-5" />
              </div>

              <div className="absolute top-60 left-36 font-bold  text-center">
                <p>100 %</p>
                <p>water proof</p>
              </div>

              <div className="flex-1 absolute top-10 text-center">
                <h3 className="text-xl md:text-2xl font-extrabold text-black leading-tight px-56">
                  {title}
                </h3>
                {subtitle && <p className="mt-2 text-sm text-gray-800">{subtitle}</p>}
              </div>
            </div>
          </div>

          {/* right side umbrella illustration */}
          {right_image_url && (
            <img
              src={right_image_url}
              alt="illustration"
              className="absolute right-6 top-44 w-28 md:w-44 object-contain pointer-events-none"
            />
          )}

          {/* CTA */}
          <div className="mt-6 text-center">{renderButton()}</div>

          {/* Rain animation container */}
          <div
            style={{
              position: "absolute",
              right: "0",
              top: "-15%",
              width: "70%",
              height: "150%",
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {drops.map((d, i) => (
              <span
                key={i}
                className="promo-drop"
                style={{
                  left: d.left,
                  width: `${d.size}px`,
                  height: `${d.size * 8}px`,
                  animation: `slant-fall ${d.duration} linear ${d.delay} infinite`,
                  opacity: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

