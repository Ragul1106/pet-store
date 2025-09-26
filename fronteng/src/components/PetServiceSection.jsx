// src/pages/PetServicesPage.jsx
import React, { useEffect, useState } from "react";
import api from "../lib/api";

export default function PetServiceSection() {
  const [page, setPage] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [pageRes, cardsRes] = await Promise.allSettled([
          api.get("/petservicescards/"),
          api.get("/servicecards/"),
        ]);

        console.log("RAW petservices response:", pageRes);
        console.log("RAW servicecards response:", cardsRes);

        if (!mounted) return;

        // pageRes: handle fulfilled/rejected and different shapes
        if (pageRes.status === "fulfilled") {
          const r = pageRes.value;
          // r.data might be an object, an array, or empty
          let data = r.data;
          // if paginated or wrapped in results array, unwrap
          if (!data) data = null;
          else if (Array.isArray(data) && data.length) data = data[0];
          else if (data.results && Array.isArray(data.results) && data.results.length) data = data.results[0];

          setPage(data);
        } else {
          console.error("petservices request failed:", pageRes.reason);
          setError("Failed to load page content. See console for details.");
        }

        // cardsRes: set array defensively
        if (cardsRes.status === "fulfilled") {
          const r2 = cardsRes.value;
          const list = Array.isArray(r2.data) ? r2.data : r2.data?.results || [];
          setCards(list);
        } else {
          console.warn("servicecards fetch failed:", cardsRes.reason);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Unexpected error (see console).");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  // fallback helpers
  const safe = (k, fallback = "") => (page && page[k] ? page[k] : fallback);

  return (
    <div className="mx-auto px-6 lg:px-8 py-8">
      {/* ROW 1 */}
      <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-12 lg:col-span-9">
          <h2 className="text-2xl font-bold mb-3">{safe("title", "Pet Services")}</h2>
          {/* render intro_text; if it contains newlines keep them */}
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{safe("intro_text", "Describe your services here...")}</p>
        </div>

        <div className="col-span-12 lg:col-span-3 text-right">
          <div className="text-sm font-semibold text-[#0045ff] uppercase">{safe("customer_service_title", "customer service")}</div>
          <div className="text-sm text-[#0045ff] font-medium mt-2">{safe("customer_phone", "+91-1234567890")}</div>
        </div>
      </div>

      <div className="h-8" />

      {/* ROW 2 */}
      <div className="grid grid-cols-12 gap-6 items-stretch">
        <div className="col-span-12 lg:col-span-9">
          <div className="grid grid-cols-2 gap-0 h-full">
            <div className="bg-[#0045ff] text-white rounded-l-lg p-6 flex flex-col items-center justify-center text-center min-h-[180px] md:min-h-[220px]">
              <h3 className="text-xl font-semibold mb-4">
                {safe("promo_left_title", "Summer Special")}
              </h3>
              <p className="text-sm leading-relaxed mb-6">
                {safe("promo_left_subtitle", "Upgrade a salon visit or overnight stay...")}
              </p>
              <button className="inline-block bg-white text-[#0045ff] rounded-full px-6 py-2 font-semibold shadow">
                {safe("promo_left_button", "Book Now")}
              </button>
            </div>


            <div className="rounded-r-lg overflow-hidden bg-gray-50 flex items-center justify-center min-h-[180px] md:min-h-[220px]">
              {safe("center_image") ? (
                <img src={safe("center_image")} alt="center" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">No image uploaded</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <div className="h-full bg-[#98fb98] rounded-lg p-6 flex items-center justify-center text-center min-h-[180px] md:min-h-[220px]">
            <div>
              <h3 className="text-lg font-bold mb-2">
                {safe("promo_right_title", "Monthly specials")}
              </h3>
              <p className="text-sm text-gray-800 mb-4">
                {safe("promo_right_text", "Check out deals, offers & events...")}
              </p>
              <button className="inline-block bg-[#0045ff] text-white rounded-full px-6 py-2 font-semibold shadow">
                {safe("promo_right_button", "Get Details")}
              </button>
            </div>
          </div>
        </div>

      </div>

      <div className="h-10" />

      {/* ROW 3 */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
          {(cards.length ? cards.slice(0, 3) : [
            { id: "p1", content: "$5 OFF on salon walk-in services Monday Thru Friday", button_text: "Learn more" },
            { id: "p2", content: "ONLY $129 any 6-wk. Training Class (that's $21.50 a class) valid thru 7/6", button_text: "Enroll Now" },
            { id: "p3", content: "Traveling without your pet this summer? Suite upgrades and add-ons.", button_text: "Book Stay" },
          ]).map((c) => (
            <div
              key={c.id}
              className="border border-gray-300 rounded-lg p-4 flex items-center justify-center text-center w-72 sm:w-80 h-56"
            >
              <div>
                <div className="text-sm text-gray-800 leading-relaxed mb-4">{c.content}</div>
                <button className="bg-[#0045ff] text-white rounded px-5 py-2 font-semibold shadow">
                  {c.button_text}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>



      <div className="h-12" />
    </div>
  );
}
