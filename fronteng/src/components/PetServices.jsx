import React, { useEffect, useState } from "react";
import api from "../lib/api";

export default function PetServices({ apiEndpoint = "/pet-services/" }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await api.get(apiEndpoint);
        if (!mounted) return;
        setServices(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed loading services:", err);
      }
    }
    load();
    return () => (mounted = false);
  }, [apiEndpoint]);

  if (!services.length) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold">Pet Services</h2>
          <p className="mt-2 text-gray-600 text-lg">
            Treats Rewards members earn points on every service
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((s) => (
            <div key={s.id} className="flex flex-col items-center">
              <div className="w-full max-w-xs rounded-2xl overflow-hidden shadow-md bg-white">
                {/* Image at the top */}
                <img
                  src={s.image_url}
                  alt={s.title}
                  className="w-full h-64 object-cover"
                />

                {/* Title bar at the bottom */}
                <div className="bg-[#0045ff] text-white text-center py-3 font-bold text-lg lg:text-2xl">
                  {s.title}
                </div>
              </div>

              {/* Description under the card */}
              <div className="mt-3 text-center px-10">
                <p className="text-sm md:text-md text-gray-700 ">
                  {s.promo_text || s.short_description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
