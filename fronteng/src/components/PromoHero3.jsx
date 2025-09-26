// src/components/PromoHero3.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function PromoHero3({ apiEndpoint = "/carousal-banner3/" }) {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchBanner() {
      try {
        const res = await api.get(apiEndpoint);
        const data = Array.isArray(res.data) ? res.data : [];
        if (mounted && data.length > 0) setBanner(data[0]);
      } catch (err) {
        console.error("Failed to load promo banner 3", err);
      }
    }
    fetchBanner();
    return () => (mounted = false);
  }, [apiEndpoint]);

  if (!banner) return null;

  const {
    left_image_1_url = "",
    left_image_2_url = "",
    right_image_url = "",
    diamond_text = "Only@\n₹ 399",
    save_text = "Save 100",
    button_text = "Shop Now",
    button_link = "#",
    bg_color = "#98FB98",
  } = banner;

  const renderButton = () => {
    const btn = (
      <button className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg">
        {button_text}
      </button>
    );
    if (!button_link) return btn;
    if (button_link.startsWith("http")) {
      return (
        <a href={button_link} target="_blank" rel="noreferrer noopener">
          {btn}
        </a>
      );
    }
    return <Link to={button_link}>{btn}</Link>;
  };

  return (
    <section className="w-full mx-auto my-6 px-4">
      {/* small local CSS for diamond/tags */}
      <style>{`
        /* diamond: square rotated 45deg with inner text rotated back */
        .diamond {
          width: 88px;
          height: 88px;
          transform: rotate(45deg);
          display:flex;
          align-items:center;
          justify-content:center;
        }
        .diamond .diamond-inner {
          transform: rotate(-45deg);
          text-align:center;
          font-weight:700;
          line-height:1;
        }
        /* small save pill */
        .save-pill {
          background: #0b5bff;
          color: white;
          padding: .35rem .6rem;
          border-radius: 8px;
          font-weight:700;
          box-shadow: 0 4px 8px rgba(0,0,0,0.12);
        }
          
      `}</style>

      <div className="rounded-2xl overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-stretch">
          {/* LEFT: green panel (absolute items inside) */}
          <div
            className="md:w-1/2 w-full relative flex items-center justify-center"
            style={{ background: bg_color }}
          >
            {/* this wrapper provides the visual area for absolute elements */}
            <div className="w-full h-64 md:h-[360px] relative">
              {/* diamond tag - top-left-ish absolute */}
              <div className="absolute left-52 top-6">
                <div
                  className="diamond bg-red-600 text-white shadow-lg"
                  style={{ display: "inline-flex" }}
                >
                  <div className="diamond-inner text-xs md:text-sm">
                    {diamond_text.split("\n").map((l, i) => (
                      <div key={i}>{l}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* two small product thumbnails stacked below diamond */}
              <div className="absolute left-36 top-36 flex gap-12">
                {left_image_1_url && (
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded flex items-center justify-center shadow">
                    <img
                      src={left_image_1_url}
                      alt="left-thumb-1"
                      className="w-16 h-12 md:w-32 md:h-32 object-contain"
                    />
                  </div>
                )}
                {left_image_2_url && (
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded flex items-center justify-center shadow">
                    <img
                      src={left_image_2_url}
                      alt="left-thumb-2"
                      className="w-12 h-12 md:w-32 md:h-32 object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Save pill near center-left */}
              <div className="absolute right-2 bottom-28 md:bottom-24">
                <div className="save-pill">{save_text}</div>
              </div>

              {/* Shop Now button centered on seam bottom */}
              <div className="absolute left-10 bottom-6 border-2 border-black rounded-3xl">
                {renderButton()}
              </div>
            </div>
          </div>

          {/* RIGHT: big image */}
          <div className="md:w-1/2 w-full flex items-center justify-center bg-white">
            <div className="w-full h-64 md:h-[360px] flex items-center justify-center relative">
              {right_image_url ? (
                <img
                  src={right_image_url}
                  alt="right-product"
                  className="object-cover h-full w-auto md:w-full md:h-full"
                  style={{ maxWidth: "100%", objectPosition: "center" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center"> </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
