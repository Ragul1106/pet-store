import React, { useEffect, useState } from "react";
import api from "../lib/api";

export default function AboutHighlight({ apiEndpoint = "/about-highlights/" }) {
  const [highlight, setHighlight] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await api.get(apiEndpoint);
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setHighlight(data || null);
      } catch (err) {
        console.error("Failed to load about highlight", err);
      }
    }
    load();
    return () => (mounted = false);
  }, [apiEndpoint]);

  if (!highlight) return null;

  return (
    <section className="w-full px-2 md:px-8 lg:px-20 py-10">
      <div className="mx-auto grid grid-cols-1 md:grid-cols-2">
        {/* Left text section */}
        <div
          className="flex items-center justify-center px-6 py-10"
          style={{ background: "#98FB98", color: "#000" }}
        >
          <div className="max-w-md">
            {highlight.title && (
              <h2 className="text-lg md:text-xl">{highlight.title}</h2>
            )}
            <p className="text-sm md:text-xl leading-relaxed whitespace-pre-line">
              {highlight.body_text}
            </p>
          </div>
        </div>

        {/* Right image section */}
        <div className="h-72 md:h-auto">
          {highlight.image_url ? (
            <img
              src={highlight.image_url}
              alt={highlight.title || "About highlight"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
      </div>
    </section>
  );
}
