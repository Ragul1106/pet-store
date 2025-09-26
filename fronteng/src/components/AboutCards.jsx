import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function AboutCards({ apiEndpoint = "/about-cards/" }) {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await api.get(apiEndpoint);
        if (!mounted) return;
        setCards(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load about cards", err);
      }
    }
    load();
    return () => (mounted = false);
  }, [apiEndpoint]);

  if (!cards.length) return null;

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((c) => (
            <div
              key={c.id}
              className="w-full max-w-sm rounded-2xl border border-neutral-300 bg-white shadow-sm p-6 flex flex-col items-center"
            >
              {/* Image */}
              <div className="w-full">
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.title}
                    className="w-full h-72 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-md" />
                )}
              </div>

              {/* Equal-sized reduced-width button */}
              <div className="mt-4">
                {c.link ? (
                  /^https?:\/\//.test(c.link) ? (
                    <a
                      href={c.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-40 mx-auto bg-[#0045ff] text-white font-bold py-3 rounded-md shadow-md text-center"
                    >
                      {c.title}
                    </a>
                  ) : (
                    <Link
                      to={c.link}
                      className="block w-40 mx-auto bg-[#0045ff] text-white font-bold py-3 rounded-md shadow-md text-center"
                    >
                      {c.title}
                    </Link>
                  )
                ) : (
                  <div className="block w-56 mx-auto bg-[#0045ff] text-white font-bold py-2 rounded-md shadow-md text-center text-xl px-2">
                    {c.title}
                  </div>
                )}
              </div>
{/* 
              {c.description && (
                <div className="mt-3 text-center px-2">
                  <p className="text-sm text-gray-700">{c.description}</p>
                </div>
              )} */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
