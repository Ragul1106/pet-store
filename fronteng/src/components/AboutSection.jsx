import React, { useEffect, useState } from "react";
import api from "../lib/api";
export default function AboutSection({ apiEndpoint = "/about/" }) {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await api.get(apiEndpoint);
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setAbout(data || null);
      } catch (err) {
        console.error("Failed to load about content", err);
      }
    }
    load();
    return () => (mounted = false);
  }, [apiEndpoint]);

  if (!about) return null;

  return (
    <section className="w-full mx-auto px-2 md:px-8 lg:px-20 py-10">
      {/* Row 1: hero image with overlay */}
      <div className="relative w-full">
        <img
          src={about.hero_image_url}
          alt={about.overlay_title || "About hero"}
          className="w-full h-[400px] md:h-[720px] "
        />

        {/* Overlay: centered, dark translucent, rounded */}
        <div className="absolute top-[110px] left-[0px]  md:top-[400px] md:left-[0px]  lg:top-[500px] lg:left-[300px]  flex items-center justify-center pointer-events-none">
          <div
            className="bg-black/60 text-white text-center rounded-xl p-6 md:p-8 max-w-3xl"
            style={{ backdropFilter: "none" }}
          >
            <h2 className="text-xl md:text-3xl font-bold mb-2">
              {about.overlay_title}
            </h2>
            {about.overlay_text && (
              <p className="text-lg md:text-2xl font-bold leading-relaxed">
                {about.overlay_text}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: green block with black text */}
      <div
        className="w-full py-8 md:py-12"
        style={{ background: "#98FB98", color: "#000" }}
      >
        <div className="max-w-6xl mx-auto px-2">
          <div className="text-center">
            {/* If you want a small uppercase heading */}
            <h3 className="text-sm md:text-xl font-bold mb-4">ANYTHING for PETS®</h3>

            <div className="text-sm md:text-lg leading-relaxed whitespace-pre-line px-2">
              {about.body_text}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
