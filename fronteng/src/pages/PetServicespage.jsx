// src/pages/PetServices.jsx
import React, { useEffect, useState } from "react";
import api from "../lib/api";
import iconGrooming from "../assets/grooming.png";
import iconPetsHotel from "../assets/petshotel.png";
import iconDayCamp from "../assets/bone.png";
import iconTraining from "../assets/training.png";
import iconVet from "../assets/veterinary_care.png";
import iconAdoption from "../assets/adoption.png";
import PetServiceSection from "../components/PetServiceSection";
import Breadcrumbs from "../components/BreadCrumbs";

/**
 * Helpers to defensively extract media urls and resolve relative paths.
 */
function getApiRoot() {
  try {
    if (api && api.defaults && api.defaults.baseURL) {
      return api.defaults.baseURL.replace(/\/api\/?$/, "").replace(/\/+$/, "");
    }
  } catch (e) {
    // ignore
  }
  return import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "http://127.0.0.1:8000";
}

const API_ROOT = getApiRoot();

function resolveUrl(u) {
  if (!u || typeof u !== "string") return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("//")) return window.location.protocol + u;
  return `${API_ROOT}${u.startsWith("/") ? "" : "/"}${u}`;
}

function extractMediaUrl(field) {
  if (!field) return null;
  if (typeof field === "string") return field;
  if (Array.isArray(field) && field.length) return extractMediaUrl(field[0]);
  const candidates = ["url", "image", "image_url", "file", "src", "path"];
  for (const k of candidates) {
    if (field[k] && typeof field[k] === "string") return field[k];
  }
  // try nested objects
  for (const k of Object.keys(field)) {
    if (field[k] && typeof field[k] === "object") {
      const nested = extractMediaUrl(field[k]);
      if (nested) return nested;
    }
  }
  return null;
}

export default function PetServices() {
  const [landing, setLanding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/petservices/");
        console.log("[PetServices] raw response:", res && res.data);
        if (!mounted) return;

        let data = res?.data;
        if (!data) data = null;
        else if (Array.isArray(data) && data.length) data = data[0];
        else if (data.results && Array.isArray(data.results) && data.results.length) data = data.results[0];

        setLanding(data);
      } catch (err) {
        console.error("Failed to fetch petservices landing:", err);
        setLanding(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const services = [
    { key: "grooming", label: "Grooming", icon: iconGrooming },
    { key: "hotel", label: "Pets Hotel", icon: iconPetsHotel },
    { key: "daycamp", label: "Doggie Day Camp", icon: iconDayCamp },
    { key: "training", label: "Training", icon: iconTraining },
    { key: "vet", label: "Veterinary Care", icon: iconVet },
    { key: "adopt", label: "Adoption", icon: iconAdoption },
  ];

  // defensive extraction + resolution
  const leftRaw = extractMediaUrl(landing?.left_banner || landing?.left_image || landing?.left_image_url);
  const rightRaw = extractMediaUrl(landing?.right_banner || landing?.right_image || landing?.right_image_url);
  const logoRaw = extractMediaUrl(landing?.logo || landing?.site_logo || landing?.logo_url);

  const leftUrl = resolveUrl(leftRaw);
  const rightUrl = resolveUrl(rightRaw);
  const logoUrl = resolveUrl(logoRaw);

  return (
    <div className="w-full">
      <div className="p-4">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Pet Services" },
          ]}
        />
      </div>

      {/* wrapper for banner + overlapping card */}
      <div className="relative">
        {/* Banner area */}
        <div className="relative w-full h-56 md:h-72 overflow-hidden bg-gray-50">
          {/* left half */}
          {leftUrl ? (
            <img
              src={leftUrl}
              alt="left banner"
              className="absolute left-0 top-0 h-full w-1/2 object-cover"
              onError={(e) => {
                console.warn("Left banner failed to load:", e?.currentTarget?.src);
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="absolute left-0 top-0 h-full w-1/2 bg-gray-200" />
          )}

          {/* right half */}
          {rightUrl ? (
            <img
              src={rightUrl}
              alt="right banner"
              className="absolute right-0 top-0 h-full w-1/2 object-cover"
              onError={(e) => {
                console.warn("Right banner failed to load:", e?.currentTarget?.src);
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gray-300" />
          )}

          {/* center gradient overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>

          {/* centered logo (visually centered in banner) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div
              className="w-28 h-28 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: "#1C49C2" }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="logo"
                  className="w-20 h-20 md:w-36 md:h-36 lg:w-48 lg:h-56 object-contain rounded-full bg-transparent"
                  onError={(e) => {
                    console.warn("Logo failed to load:", e?.currentTarget?.src);
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="text-white font-semibold">Logo</div>
              )}
            </div>
          </div>
        </div>

        {/* White card positioned overlapping the bottom of the banner */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-50  w-full max-w-7xl px-4 z-20">
          <div className="bg-white rounded-xl shadow-xl border p-6 md:px-6">
            {loading ? (
              <div className="py-6 text-center text-sm text-gray-500">Loading services…</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {services.map((s) => (
                  <div
                    key={s.key}
                    className="flex flex-col items-center justify-center h-46 bg-[#98fb98] rounded p-3"
                  >
                    <div className="w-12 h-12 flex items-center justify-center mb-2">
                      <img src={s.icon} alt={s.label} className="w-full h-full object-contain" />
                    </div>
                    <div className="text-xs sm:text-sm lg:text-base font-bold text-gray-800 text-center">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* spacer to account for the overlapping card */}
      <div className="h-28 md:h-36" />

      {/* sections */}
      <div className="mt-15 px-4 max-w-7xl mx-auto">
        <PetServiceSection />
      </div>
    </div>
  );
}
