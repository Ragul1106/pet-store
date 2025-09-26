// src/pages/ConsultNow.jsx
import React, { useEffect, useState } from "react";
import api from "../lib/api";

// STATIC ICONS (place these in src/assets/)
import featureIcon1 from "../assets/verified.png";
import featureIcon2 from "../assets/person.png";
import featureIcon3 from "../assets/person.png";
import bankIcon from "../assets/bank.png";
import truckIcon from "../assets/truck.png";
import codIcon from "../assets/cod.png";
import starIcon from "../assets/star.png";
// fallback hero if backend not available
import fallbackHero from "../assets/star.png";
import CustomerReviews from "../components/CustomerReviews";
import Breadcrumbs from "../components/BreadCrumbs";


export default function ConsultNow() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get("/booking-service/")
      .then((res) => {
        if (!mounted) return;
        setPage(res.data || null);
      })
      .catch((err) => {
        console.warn("Failed to fetch booking-service:", err);
        setPage(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  // fallback values
  const banner = page?.banner || fallbackHero;
  const f1 = page?.feature_1 || "Pay & book the consultant";
  const f2 = page?.feature_2 || "Choose video or Teleconsultation";
  const f3 = page?.feature_3 || "Receive prescription after the call";

  const overlayTitle =
    page?.overlay_title || "Instant and complete vet care";
  const overlayText =
    page?.overlay_text ||
    "Wherever you are. At only 299, get end-to-end support from our vets.";
  const overlayCta = page?.overlay_cta_text || "Consult Now";

  const price = page?.price ?? 299;
  const mrp = page?.mrp ?? 499;
  const discountText = page?.discount_text || "40% OFF";

  const offersText = page?.offers_text || "Bank offers and coupons";
  const offersButton = page?.offers_button_text || "Check offers";

  const codInfo =
    page?.cod_info ||
    "Currently, cash on delivery is not available on this product.";
  const deliveryInfo =
    page?.delivery_info || "Free delivery on orders above ₹599";

  const addToCartText = page?.add_to_cart_text || "Add to cart";
  const rating = page?.rating ?? 5;

  // helper: format price
  const formatPrice = (v) => {
    try {
      const n = Number(v);
      return `₹${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;
    } catch {
      return `₹${v}`;
    }
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-4">
                     <Breadcrumbs
                items={[
                  { label: "Home", to: "/" },
                  { label: "Consult Vet", to: "/consult-vet" }, 
                  { label: "Consult Doctor" }, 
                ]}
              />
                </div>
      <div className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
          {/* LEFT: large image + green feature strip */}
          <div className="lg:col-span-6 p-0 relative">
            {/* Top green features bar - absolute */}
           <div className="absolute left-6 right-6 top-4 z-20">
  <div className="bg-[#98fb98] rounded-md flex flex-col md:flex-row items-center md:justify-between px-4 py-3 gap-3 md:gap-0">
    <div className="flex-1 text-sm flex items-center gap-3 justify-center">
      <img src={featureIcon1} alt="pay" className="w-6 h-6" />
      <div className="text-xs md:text-sm font-medium">{f1}</div>
    </div>
    <div className="flex-1 text-sm flex items-center gap-3 justify-center">
      <img src={featureIcon2} alt="video" className="w-6 h-6" />
      <div className="text-xs md:text-sm font-medium">{f2}</div>
    </div>
    <div className="flex-1 text-sm flex items-center gap-3 justify-center">
      <img src={featureIcon3} alt="prescription" className="w-6 h-6" />
      <div className="text-xs md:text-sm font-medium">{f3}</div>
    </div>
  </div>
</div>


            {/* Image area */}
            <div className="pt-36 md:pt-16 px-6 pb-6">
              <div className="bg-white border rounded-sm overflow-hidden">
                <img
                  src={banner}
                  alt="consult hero"
                  className="w-full h-auto object-cover block"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: service details */}
          <div className="lg:col-span-6 p-6 flex flex-col">
            {/* rating badge top-right */}
            <div className="absolute right-6 top-6">
              <div className="flex items-center gap-1 border rounded-md px-2 py-1 bg-white">
                <img src={starIcon} alt="star" className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {Number(rating).toFixed(1)}
                </span>
              </div>
            </div>

            <div className="mt-2 lg:mt-0 flex-1">
              <h2 className="text-2xl font-semibold mb-1">Services</h2>
              <div className="text-sm text-gray-600 mb-6">
                Instant Consultation (10 AM to 7 PM)
              </div>

              {/* Booking card */}
              <div
                className="w-full rounded-lg border p-0 overflow-hidden mb-4"
                style={{ maxWidth: 220 }}
              >
                <div className="bg-[#0045ff] rounded-t-lg text-white px-3 py-2 text-sm font-semibold">
                  Book consultation
                </div>
                <div className="bg-white px-4 py-3 rounded-b-lg border-t">
                  <div className="text-sm text-gray-600">
                    <span className="text-lg font-semibold">
                      {formatPrice(price)}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      MRP
                    </span>
                    
                    <span className="line-through text-xs text-gray-400 ml-1">
                      {formatPrice(mrp)}
                    </span>
                  </div>
                  <div className="text-xs text-[#0045ff] font-semibold mt-1">
                    {discountText}
                  </div>
                </div>
              </div>

              {/* Offers / bank box */}
              <div
                className="flex items-center justify-between border rounded-lg px-4 py-3 mb-4 w-full"
    
              >
                <div className="flex items-center gap-3">
                  <img src={bankIcon} alt="bank" className="w-6 h-6" />
                  <div className="text-sm">{offersText}</div>
                </div>
                <button className="text-sm text-[#0045ff] font-medium">
                  {offersButton} &gt;
                </button>
              </div>

              {/* Info rows */}
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex items-start gap-3">
                  <img src={codIcon} alt="cod" className="w-5 h-5 mt-1" />
                  <div>{codInfo}</div>
                </div>
                <div className="flex items-start gap-3">
                  <img src={truckIcon} alt="truck" className="w-5 h-5 mt-1" />
                  <div>{deliveryInfo}</div>
                </div>
              </div>

              {/* Add to cart CTA */}
              <div>
                <button className="bg-[#0045ff] text-white px-10 py-3 rounded-full font-semibold shadow-xl">
                  {addToCartText}
                </button>
              </div>
            </div>

            <div className="h-6" />
          </div>
        </div>
      </div>

      <CustomerReviews />
    </div>
  );
}
