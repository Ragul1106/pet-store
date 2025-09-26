import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import doctorIcon from "../assets/verified1.png";
import followupIcon from "../assets/followup.png";
import deliveryIcon from "../assets/medicine-delivery.png";
import icon1 from "../assets/image 1.png";
import icon2 from "../assets/image 2.png";
import icon3 from "../assets/image 3.png";
import icon4 from "../assets/image 4.png";
import icon5 from "../assets/image 5.png";
import icon6 from "../assets/image 6.png";
import icon7 from "../assets/image 7.png";
import icon8 from "../assets/image 8.png";
import Breadcrumbs from "../components/BreadCrumbs";

const FALLBACK_ICONS = [icon1, icon2, icon3, icon4, icon5, icon6, icon7, icon8];

export default function ConsultVet() {
  const [page, setPage] = useState(null); 
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.allSettled([api.get("/consult-page/"), api.get("/vet-doctors/")])
      .then((res) => {
        if (!mounted) return;
        const pageRes = res[0];
        const docsRes = res[1];

        if (pageRes.status === "fulfilled") {
          setPage(pageRes.value.data); // can be null
        } else {
          console.error("Failed to fetch consult-page", pageRes.reason);
          setError("Failed to load page content");
        }

        if (docsRes.status === "fulfilled") {
          setDoctors(Array.isArray(docsRes.value.data) ? docsRes.value.data : []);
        } else {
          console.error("Failed to fetch vet-doctors", docsRes.reason);
        }
      })
      .catch((err) => {
        console.error("Unexpected error fetching consult data", err);
        if (mounted) setError("Unexpected error fetching content");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => (mounted = false);
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // Use page fields or fallbacks
  const banner = page?.banner || null;
  const overlayTitle = page?.overlay_title || "Instant and complete vet care";
  const overlayText = page?.overlay_text || "Wherever you are. At only 299, get end-to-end support from our vets.";
  const overlayCta = page?.overlay_cta_text || "Consult Now";

  const ctaTopImage = page?.cta_top_image || null;
  const ctaText = page?.cta_text || "Get Stress-Free Pet Care from the comfort of your home";
  const ctaButton = page?.cta_button_text || "Consult Now";

  return (
    <div className="w-full ">
        <div className="p-4">
             <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Consult Vet" }, // last item, not clickable
        ]}
      />
        </div>
      {/* SECTION 1: HERO banner with single banner image (full width), overlay & CTA */}
      <section className="relative">
        <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[420px] relative overflow-hidden">
          {banner ? (
            <img src={banner} alt="banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}

          {/* overlay box on left */}
          <div className="absolute right-4 md:right-12 top-6 md:top-10 max-w-xs lg:px-6 text-center bg-black/80 text-white p-4 rounded-md shadow-lg">
            <h2 className="font-semibold text-lg md:text-xl leading-tight">{overlayTitle}</h2>
            <p className="text-sm md:text-xl mt-2 leading-snug">{overlayText}</p>
          </div>

          {/* CTA button placed below overlay (inside banner) */}
          <div className="absolute right-4 md:right-32 top-36 md:top-64">
            <Link to="/consult-now">
            <button className="bg-[#0045ff] text-white px-4 sm:px-6 py-2 rounded-md font-semibold shadow">{overlayCta}</button>
          </Link>
          </div>
          
        </div>

        {/* stat row beneath banner */}
      <div className="w-full bg-[#0045ff] text-white">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center py-3 text-sm gap-3">
    <div className="flex items-center space-x-3">
      <img src={doctorIcon} alt="Verified Doctors" className="w-5 h-5" />
      <span>Verified Doctors</span>
    </div>
    <div className="flex items-center space-x-3">
      <img src={followupIcon} alt="Free follow-up" className="w-5 h-5" />
      <span>Free follow-up</span>
    </div>
    <div className="flex items-center space-x-3">
      <img src={deliveryIcon} alt="Medicine delivery" className="w-5 h-5" />
      <span>Medicine delivery</span>
    </div>
  </div>
</div>
      </section>

      {/* SECTION 2: service icons (8) - fallback to local assets */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-2">
          <div className="flex flex-wrap justify-center gap-12">
            {FALLBACK_ICONS.slice(0, 8).map((src, idx) => (
              <div key={idx} className="flex flex-col items-center w-20 sm:w-24 text-center">
                  <img src={src} alt={`icon-${idx}`} className="w-10 h-10 md:w-32 md:h-32 object-contain" />
                <div className="mt-2 text-xs sm:text-sm text-gray-700">
                  {["General Checkup","Skin issues","Digestive issues","Paws & Limbs","Dental issues","Ear issues","Eye issues","Nutrition"][idx]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Green CTA with overlapping top image (from page.cta_top_image) */}
      <section className="relative py-12 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-48 w-80 sm:w-[520px]">
              <div className="bg-white rounded-xl p-3 shadow-md border">
                {ctaTopImage ? (
                  <img src={ctaTopImage} alt="cta top" className="w-full h-40 sm:h-48 object-cover rounded-lg" />
                ) : (
                  <div className="w-full h-40 sm:h-48 bg-gray-200 rounded-lg" />
                )}
              </div>
            </div>

            <div className="mt-28 bg-[#98fb98] rounded-xl py-12 px-6 text-center">
              <h3 className="font-semibold text-lg md:text-xl mb-4">{ctaText}</h3>
             <Link to="/consult-now">
  <button className="bg-[#0045ff] text-white px-6 py-2 rounded-md font-semibold shadow-md">
    {ctaButton}
  </button>
</Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Doctors cards from admin */}
      <section className="py-12">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <h3 className="text-center font-semibold mb-8">
      Access our expert vets from anywhere
    </h3>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
      {doctors.length ? (
        doctors.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-xl p-6 shadow-sm border flex flex-col items-center text-center"
          >
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md mt-2 bg-white flex items-center justify-center">
              {d.photo ? (
                <img
                  src={d.photo}
                  alt={d.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-400">No image</div>
              )}
            </div>

            <div className="mt-4 text-sm">{d.name}</div>
            <div className="text-sm mt-2 text-gray-600 whitespace-pre-line">
              {d.short_title}
              {d.description ? `\n${d.description}` : ""}
            </div>
          </div>
        ))
      ) : (
        // placeholder 3 cards
        [1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-6 shadow-sm border flex flex-col items-center text-center"
          >
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md -mt-12 bg-gray-100 flex items-center justify-center">
              <div className="text-gray-400">No image</div>
            </div>
            <div className="mt-4 text-sm font-semibold">Doctor Name</div>
            <div className="mt-2 text-xs text-gray-600">
              Specialization | Years
            </div>
          </div>
        ))
      )}
    </div>
  </div>
</section>

    </div>
  );
}
