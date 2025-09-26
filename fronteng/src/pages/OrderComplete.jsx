import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function OrderComplete() {
  const { identifier } = useParams(); 
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!identifier) {
      setError("No order identifier provided in URL.");
      setLoading(false);
      return;
    }

    const fetchByToken = async (id) => {
      try {
        const res = await api.get(`/orders/by-token/?token=${encodeURIComponent(id)}`);
        return res.data;
      } catch (err) {
        if (err?.response && [400, 404].includes(err.response.status)) return null;
        throw err;
      }
    };

    const fetchById = async (id) => {
      const tryPaths = [
        `/orders/id/${encodeURIComponent(id)}/`,
        `/orders/${encodeURIComponent(id)}/`,
      ];
      for (const path of tryPaths) {
        try {
          const res = await api.get(path);
          return res.data;
        } catch (err) {
          if (err?.response && [400, 404].includes(err.response.status)) continue;
          throw err;
        }
      }
      return null;
    };

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = await fetchByToken(identifier);
        if (!data && /^\d+$/.test(identifier)) {
          data = await fetchById(identifier);
        }
        if (!data) {
          setError("Order not found for the given identifier.");
        } else {
          setOrder(data);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        const msg =
          err?.response?.data?.detail ||
          (err?.response?.data && JSON.stringify(err.response.data)) ||
          err.message ||
          "Failed to load order";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [identifier]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error)
    return (
      <div className="p-6 text-red-600">
        <div className="font-semibold mb-2">Could not load order</div>
        <div className="mb-4">{String(error)}</div>
        <div>
          <Link to="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  if (!order) return <div className="p-6 text-red-600">Order not found</div>;

  // Layout values with safe fallbacks
  const name = order.billing_name || "-";
  const addr1 = order.billing_address_line1 || "-";
  const addr2 = order.billing_address_line2 || "";
  const city = order.billing_city || "";
  const pincode = order.billing_pincode || "";
  const state = order.billing_state || "";
  const phone = order.billing_phone || "-";
  const email = order.billing_email || "-";

  return (
    <div className="min-h-screen bg-white py-12 px-4 flex items-start justify-center">
      <div className="w-full max-w-2xl">
        {/* breadcrumb (optional small text) */}
        <div className="text-xs text-gray-500 mb-6">Home / Cart / Checkout / <span className="text-gray-400">Order Completion</span></div>

        <div className="mx-auto">
          {/* Centered green card */}
          <div className="relative bg-green-200 rounded-2xl shadow-2xl p-10 md:p-12" style={{ borderRadius: "18px" }}>
            {/* big heading */}
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-3">Thank you for your purchase!</h2>

            <p className="text-center text-sm md:text-base text-gray-700 mb-6 max-w-xl mx-auto">
              Your order will be processed within 24 hours during working days. We will notify you by email once your order has been shipped.
            </p>

            {/* dashed divider (centered horizontally) */}
            <div className="w-full flex justify-center mb-6">
              <div className="w-11/12 border-t-2 border-dashed border-red-300" />
            </div>

            {/* Billing address heading */}
            <div className="text-left font-semibold mb-4">Billing address</div>

            {/* two-column billing details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 text-sm">
              <div className="text-sm text-gray-700 md:col-span-1">
                <div className="py-1"><span className="font-medium">Name</span></div>
                <div className="py-1"><span className="font-medium">Address</span></div>
                <div className="py-1"><span className="font-medium">Phone</span></div>
                <div className="py-1"><span className="font-medium">Email</span></div>
              </div>

              <div className="md:col-span-2 text-sm text-gray-800">
                <div className="py-1">{name}</div>
                <div className="py-1">
                  <div>{addr1}</div>
                  {addr2 && <div>{addr2}</div>}
                  <div>{city} {pincode}</div>
                  {state && <div>{state}</div>}
                </div>
                <div className="py-1">{phone}</div>
                <div className="py-1">{email}</div>
              </div>
            </div>

            {/* spacing then Back button centered */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => navigate(-1)}
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:shadow-lg focus:outline-none"
                style={{ minWidth: 120 }}
              >
                Back
              </button>
            </div>

            {/* subtle bottom shadow curve effect - replicate the rounded light shadow */}
            <div className="absolute bottom-[-14px] left-1/2 transform -translate-x-1/2 w-3/4 h-6 rounded-b-2xl bg-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
