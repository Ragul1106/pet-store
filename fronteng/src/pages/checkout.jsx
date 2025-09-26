// src/pages/Checkout.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../lib/api";
import sampleImg from "../assets/productdesimg.png";

import gpay from "../assets/gpay.png";
import phonepe from "../assets/phonepe.png";
import mastercard from "../assets/mastercard.png";
import paypal from "../assets/paypal.png";
import visa from "../assets/visa.png";

export default function Checkout() {
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Check authentication
  const isAuthenticated = Boolean(localStorage.getItem("access"));

  // read buy-now state passed from ProductDetail
  const buyNow = location.state?.buyNow === true;
  const buyNowProductId = location.state?.productId || null;
  const buyNowQty = Number(location.state?.qty || 1);
  const buyNowSnapshot = location.state?.productSnapshot || null;

  const [form, setForm] = useState({
    billing_name: "",
    billing_email: "",
    billing_phone: "",
    billing_address_line1: "",
    billing_address_line2: "",
    billing_city: "",
    billing_state: "",
    billing_pincode: "",
    payment_method: "online",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [buyNowProduct, setBuyNowProduct] = useState(buyNowSnapshot || null);
  const [loadingBuyNowProduct, setLoadingBuyNowProduct] = useState(false);

  const subtotal = Number(
    buyNow
      ? (buyNowProduct ? (buyNowProduct.price_snapshot || 0) * buyNowQty : 0)
      : Number(cart?.subtotal || 0)
  );
  const shipping = 99.0;
  const total = subtotal + shipping;

  useEffect(() => {
    let cancelled = false;
    async function fetchProduct() {
      if (!buyNow || !buyNowProductId || buyNowProduct) return;
      setLoadingBuyNowProduct(true);
      try {
        const res = await api.get(`/pet-product/${buyNowProductId}/`);
        if (cancelled) return;
        const p = res.data;
        setBuyNowProduct({
          id: p.id,
          title: p.title,
          image: p.image || sampleImg,
          price_snapshot: p.price || 0,
          quantity_display: p.quantity_display || "",
        });
      } catch (err) {
        console.error("Failed to fetch buy-now product", err);
      } finally {
        if (!cancelled) setLoadingBuyNowProduct(false);
      }
    }
    fetchProduct();
    return () => (cancelled = true);
  }, [buyNow, buyNowProductId, buyNowProduct]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ If not logged in, redirect to login
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    if (buyNow) {
      if (!buyNowProductId && !buyNowProduct) {
        alert("Buy now product missing.");
        return;
      }
    } else {
      if (!cart?.items?.length && !cart?.token) {
        alert("Your cart is empty.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        billing_name: form.billing_name,
        billing_email: form.billing_email,
        billing_phone: form.billing_phone,
        billing_address_line1: form.billing_address_line1,
        billing_address_line2: form.billing_address_line2,
        billing_city: form.billing_city,
        billing_state: form.billing_state,
        billing_pincode: form.billing_pincode,
        payment_method: form.payment_method,
        notes: form.notes,
        shipping: shipping,
      };

      if (buyNow) {
        payload.cart_token = null;
        payload.buy_now = {
          product_id: buyNowProductId,
          quantity: buyNowQty,
        };
      } else {
        payload.cart_token = cart?.token || null;
        if (!payload.cart_token && Array.isArray(cart?.items) && cart.items.length > 0) {
          const firstItem = cart.items[0];
          if (firstItem && firstItem.product && firstItem.quantity) {
            payload.buy_now = {
              product_id: firstItem.product.id,
              quantity: firstItem.quantity,
            };
          }
        }
      }

      const res = await api.post("/orders/create/", payload);
      const data = res.data;

      const token =
        data?.token ||
        data?.data?.token ||
        data?.order?.token ||
        null;

      const id = data?.id || data?.data?.id || data?.order?.id || null;
      const identifier = token || id;

      if (identifier) {
        navigate(`/order-complete/${encodeURIComponent(identifier)}`);
        return;
      }

      alert("Order placed but no confirmation identifier found.");
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        (err?.response?.data && JSON.stringify(err.response.data)) ||
        err.message ||
        "Checkout failed";
      alert("Checkout failed: " + message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-600">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-1">/</span>
        <span className="hover:underline">Cart</span>
        <span className="mx-1">/</span>
        <span className="font-medium">Checkout</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT FORM */}
        <div className="lg:col-span-2 border rounded p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Contact</h2>
            <input
              type="email"
              name="billing_email"
              placeholder="Email (for order updates)"
              value={form.billing_email}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Delivery</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                name="billing_name"
                placeholder="Full name"
                value={form.billing_name}
                onChange={handleChange}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                name="billing_phone"
                placeholder="Phone"
                value={form.billing_phone}
                onChange={handleChange}
                className="border rounded px-3 py-2"
                required
              />
            </div>

            <input
              type="text"
              name="billing_address_line1"
              placeholder="Address"
              value={form.billing_address_line1}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mb-3"
              required
            />
            <input
              type="text"
              name="billing_address_line2"
              placeholder="Apartment, suite (Optional)"
              value={form.billing_address_line2}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <div className="grid grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                name="billing_city"
                placeholder="City"
                value={form.billing_city}
                onChange={handleChange}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                name="billing_state"
                placeholder="State"
                value={form.billing_state}
                onChange={handleChange}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                name="billing_pincode"
                placeholder="Pincode"
                value={form.billing_pincode}
                onChange={handleChange}
                className="border rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Choose your payment method</h2>
            <div className="space-y-3">
              <label className="flex items-center border rounded px-3 py-3 gap-3">
                <input
                  type="radio"
                  name="payment_method"
                  value="online"
                  checked={form.payment_method === "online"}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <span className="flex-1">Secure transaction (UPI, Cards, Wallets, Net banking)</span>
                <div className="flex gap-2">
                  <img src={gpay} alt="GPay" className="h-6" />
                  <img src={phonepe} alt="PhonePe" className="h-6" />
                  <img src={mastercard} alt="Mastercard" className="h-6" />
                  <img src={paypal} alt="Paypal" className="h-6" />
                  <img src={visa} alt="Visa" className="h-6" />
                </div>
              </label>

              <label className="flex items-center border rounded px-3 py-3 gap-3">
                <input
                  type="radio"
                  name="payment_method"
                  value="cod"
                  checked={form.payment_method === "cod"}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <span>Cash on Delivery</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded font-bold text-lg mt-4"
          >
            {submitting ? "Placing Order..." : "Order Now"}
          </button>
        </div>

        {/* RIGHT ORDER SUMMARY */}
        <aside className="bg-green-100 rounded p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-3">Order summary</h2>

          {/* If buyNow — show only the single item */}
          {buyNow ? (
            loadingBuyNowProduct ? (
              <div>Loading item…</div>
            ) : !buyNowProduct ? (
              <div className="text-sm text-red-600">Could not load product details.</div>
            ) : (
              <div className="flex gap-3">
                <img
                  src={buyNowProduct.image || sampleImg}
                  alt={buyNowProduct.title}
                  className="h-16 w-16 object-contain border rounded"
                />
                <div className="text-sm">
                  <div className="font-semibold">{buyNowProduct.title}</div>
                  <div>MRP: ₹{Number(buyNowProduct.price_snapshot).toLocaleString("en-IN")}</div>
                  <div>Quantity {buyNowQty}</div>
                  <div>Size: {buyNowProduct.quantity_display || ""}</div>
                </div>
              </div>
            )
          ) : (
            // not buyNow — show cart items as before
            <>
              {(cart?.items || []).map((it) => (
                <div key={it.id} className="flex gap-3">
                  <img
                    src={it.product.image || sampleImg}
                    alt={it.product.title}
                    className="h-16 w-16 object-contain border rounded"
                  />
                  <div className="text-sm">
                    <div className="font-semibold">{it.product.title}</div>
                    <div>MRP: ₹{it.price_snapshot}</div>
                    <div>Quantity {it.quantity}</div>
                    <div>Size: {it.product.quantity_display}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Discount code or gift card"
              className="flex-1 border rounded px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => alert("Apply coupon logic here")}
              className="bg-blue-600 text-white px-4 rounded"
            >
              Apply
            </button>
          </div>

          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Sub total</span>
              <span>₹ {subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Flat rate : ₹{shipping}</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>₹ {total.toLocaleString("en-IN")}</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              (includes GST where applicable)
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}






// // src/pages/Checkout.jsx
// import React, { useState, useEffect } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { useCart } from "../context/CartContext";
// import api from "../api";
// import sampleImg from "../assets/productdesimg.png";

// import gpay from "../assets/gpay.png";
// import phonepe from "../assets/phonepe.png";
// import mastercard from "../assets/mastercard.png";
// import paypal from "../assets/paypal.png";
// import visa from "../assets/visa.png";

// export default function Checkout() {
//   const { cart } = useCart();
//   const location = useLocation();
//   const navigate = useNavigate();

//   // read buy-now state passed from ProductDetail
//   const buyNow = location.state?.buyNow === true;
//   const buyNowProductId = location.state?.productId || null;
//   const buyNowQty = Number(location.state?.qty || 1);
//   const buyNowSnapshot = location.state?.productSnapshot || null;

//   const [form, setForm] = useState({
//     billing_name: "",
//     billing_email: "",
//     billing_phone: "",
//     billing_address_line1: "",
//     billing_address_line2: "",
//     billing_city: "",
//     billing_state: "",
//     billing_pincode: "",
//     payment_method: "online",
//     notes: "",
//   });
//   const [submitting, setSubmitting] = useState(false);

//   // local state to hold the single buy-now product details (if buyNow true)
//   const [buyNowProduct, setBuyNowProduct] = useState(buyNowSnapshot || null);
//   const [loadingBuyNowProduct, setLoadingBuyNowProduct] = useState(false);

//   // compute totals: If buyNow true, totals are based on that single item; otherwise use cart
//   const subtotal = Number(
//     buyNow
//       ? (buyNowProduct ? (buyNowProduct.price_snapshot || 0) * buyNowQty : 0)
//       : Number(cart?.subtotal || 0)
//   );
//   const shipping = 99.0;
//   const total = subtotal + shipping;

//   // If buyNow and no snapshot provided, fetch product details
//   useEffect(() => {
//     let cancelled = false;
//     async function fetchProduct() {
//       if (!buyNow || !buyNowProductId || buyNowProduct) return;
//       setLoadingBuyNowProduct(true);
//       try {
//         const res = await api.get(`/pet-product/${buyNowProductId}/`);
//         if (cancelled) return;
//         const p = res.data;
//         // shape the product to match what the checkout summary expects
//         setBuyNowProduct({
//           id: p.id,
//           title: p.title,
//           image: p.image || sampleImg,
//           price_snapshot: p.price || 0,
//           quantity_display: p.quantity_display || "",
//         });
//       } catch (err) {
//         console.error("Failed to fetch buy-now product", err);
//       } finally {
//         if (!cancelled) setLoadingBuyNowProduct(false);
//       }
//     }
//     fetchProduct();
//     return () => (cancelled = true);
//   }, [buyNow, buyNowProductId, buyNowProduct]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // if buyNow: ensure we have buyNowProduct or productId
//     if (buyNow) {
//       if (!buyNowProductId && !buyNowProduct) {
//         alert("Buy now product missing.");
//         return;
//       }
//     } else {
//       // not buyNow: ensure cart has items
//       if (!cart?.items?.length && !cart?.token) {
//         alert("Your cart is empty.");
//         return;
//       }
//     }

//     setSubmitting(true);
//     try {
//       const payload = {
//         billing_name: form.billing_name,
//         billing_email: form.billing_email,
//         billing_phone: form.billing_phone,
//         billing_address_line1: form.billing_address_line1,
//         billing_address_line2: form.billing_address_line2,
//         billing_city: form.billing_city,
//         billing_state: form.billing_state,
//         billing_pincode: form.billing_pincode,
//         payment_method: form.payment_method,
//         notes: form.notes,
//         shipping: shipping,
//       };

//       if (buyNow) {
//         // explicit buy_now payload and do NOT include cart_token so backend treats this as one-item order
//         payload.cart_token = null;
//         payload.buy_now = {
//           product_id: buyNowProductId,
//           quantity: buyNowQty,
//         };
//       } else {
//         // normal cart flow: include cart token if present (so backend uses full cart)
//         payload.cart_token = cart?.token || null;

//         // if no cart_token but cart has items (session cart), backend may accept the cart items in session;
//         // keep the previous fallback: include buy_now for first item only if backend expects it.
//         if (!payload.cart_token && Array.isArray(cart?.items) && cart.items.length > 0) {
//           // Keep existing behaviour: server may accept buy_now fallback. This is unchanged.
//           // But prefer to send the entire cart via cart_token when available.
//           const firstItem = cart.items[0];
//           if (firstItem && firstItem.product && firstItem.quantity) {
//             payload.buy_now = {
//               product_id: firstItem.product.id,
//               quantity: firstItem.quantity,
//             };
//           }
//         }
//       }

//       const res = await api.post("/orders/create/", payload);
//       console.log("Order create response (res):", res);
//       const data = res.data;

//       // detect identifier (token or id)
//       const token =
//         data?.token ||
//         data?.data?.token ||
//         data?.order?.token ||
//         (data?.order && data.order.token) ||
//         null;

//       const id =
//         data?.id ||
//         data?.data?.id ||
//         (data?.order && data.order.id) ||
//         null;

//       const identifier = token || id;

//       if (identifier) {
//         navigate(`/order-complete/${encodeURIComponent(identifier)}`);
//         return;
//       }

//       // fallback deep search for token string
//       function findToken(obj) {
//         if (!obj || typeof obj !== "object") return null;
//         for (const k of Object.keys(obj)) {
//           const v = obj[k];
//           if (typeof v === "string" && /^[0-9a-fA-F-]{8,}$/.test(v)) {
//             return v;
//           }
//           if (typeof v === "object") {
//             const found = findToken(v);
//             if (found) return found;
//           }
//         }
//         return null;
//       }
//       const deepToken = findToken(data);
//       if (deepToken) {
//         navigate(`/order-complete/${encodeURIComponent(deepToken)}`);
//         return;
//       }

//       console.error("Order created but no token/id in response:", data);
//       alert("Order placed but could not find confirmation identifier in response. Check network logs.");
//     } catch (err) {
//       console.error("Checkout failed", err?.response?.status, err?.response?.data || err.message);
//       const message =
//         err?.response?.data?.detail ||
//         (err?.response?.data && JSON.stringify(err.response.data)) ||
//         err.message ||
//         "Checkout failed";
//       alert("Checkout failed: " + message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="mx-auto max-w-7xl px-6 py-8">
//       {/* Breadcrumb */}
//       <div className="mb-6 text-sm text-gray-600">
//         <Link to="/" className="hover:underline">Home</Link>
//         <span className="mx-1">/</span>
//         <span className="hover:underline">Cart</span>
//         <span className="mx-1">/</span>
//         <span className="font-medium">Checkout</span>
//       </div>

//       <h1 className="text-2xl font-bold mb-6">Checkout</h1>

//       <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* LEFT FORM */}
//         <div className="lg:col-span-2 border rounded p-6 space-y-6">
//           <div>
//             <h2 className="text-lg font-semibold mb-3">Contact</h2>
//             <input
//               type="email"
//               name="billing_email"
//               placeholder="Email (for order updates)"
//               value={form.billing_email}
//               onChange={handleChange}
//               required
//               className="w-full border rounded px-3 py-2"
//             />
//           </div>

//           <div>
//             <h2 className="text-lg font-semibold mb-3">Delivery</h2>
//             <div className="grid grid-cols-2 gap-3 mb-3">
//               <input
//                 type="text"
//                 name="billing_name"
//                 placeholder="Full name"
//                 value={form.billing_name}
//                 onChange={handleChange}
//                 className="border rounded px-3 py-2"
//                 required
//               />
//               <input
//                 type="text"
//                 name="billing_phone"
//                 placeholder="Phone"
//                 value={form.billing_phone}
//                 onChange={handleChange}
//                 className="border rounded px-3 py-2"
//                 required
//               />
//             </div>

//             <input
//               type="text"
//               name="billing_address_line1"
//               placeholder="Address"
//               value={form.billing_address_line1}
//               onChange={handleChange}
//               className="w-full border rounded px-3 py-2 mb-3"
//               required
//             />
//             <input
//               type="text"
//               name="billing_address_line2"
//               placeholder="Apartment, suite (Optional)"
//               value={form.billing_address_line2}
//               onChange={handleChange}
//               className="w-full border rounded px-3 py-2 mb-3"
//             />

//             <div className="grid grid-cols-3 gap-3 mb-3">
//               <input
//                 type="text"
//                 name="billing_city"
//                 placeholder="City"
//                 value={form.billing_city}
//                 onChange={handleChange}
//                 className="border rounded px-3 py-2"
//                 required
//               />
//               <input
//                 type="text"
//                 name="billing_state"
//                 placeholder="State"
//                 value={form.billing_state}
//                 onChange={handleChange}
//                 className="border rounded px-3 py-2"
//               />
//               <input
//                 type="text"
//                 name="billing_pincode"
//                 placeholder="Pincode"
//                 value={form.billing_pincode}
//                 onChange={handleChange}
//                 className="border rounded px-3 py-2"
//               />
//             </div>
//           </div>

//           <div>
//             <h2 className="text-lg font-semibold mb-3">Choose your payment method</h2>
//             <div className="space-y-3">
//               <label className="flex items-center border rounded px-3 py-3 gap-3">
//                 <input
//                   type="radio"
//                   name="payment_method"
//                   value="online"
//                   checked={form.payment_method === "online"}
//                   onChange={handleChange}
//                   className="h-4 w-4"
//                 />
//                 <span className="flex-1">Secure transaction (UPI, Cards, Wallets, Net banking)</span>
//                 <div className="flex gap-2">
//                   <img src={gpay} alt="GPay" className="h-6" />
//                   <img src={phonepe} alt="PhonePe" className="h-6" />
//                   <img src={mastercard} alt="Mastercard" className="h-6" />
//                   <img src={paypal} alt="Paypal" className="h-6" />
//                   <img src={visa} alt="Visa" className="h-6" />
//                 </div>
//               </label>

//               <label className="flex items-center border rounded px-3 py-3 gap-3">
//                 <input
//                   type="radio"
//                   name="payment_method"
//                   value="cod"
//                   checked={form.payment_method === "cod"}
//                   onChange={handleChange}
//                   className="h-4 w-4"
//                 />
//                 <span>Cash on Delivery</span>
//               </label>
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={submitting}
//             className="w-full bg-blue-600 text-white py-3 rounded font-bold text-lg mt-4"
//           >
//             {submitting ? "Placing Order..." : "Order Now"}
//           </button>
//         </div>

//         {/* RIGHT ORDER SUMMARY */}
//         <aside className="bg-green-100 rounded p-6 space-y-4">
//           <h2 className="text-lg font-semibold mb-3">Order summary</h2>

//           {/* If buyNow — show only the single item */}
//           {buyNow ? (
//             loadingBuyNowProduct ? (
//               <div>Loading item…</div>
//             ) : !buyNowProduct ? (
//               <div className="text-sm text-red-600">Could not load product details.</div>
//             ) : (
//               <div className="flex gap-3">
//                 <img
//                   src={buyNowProduct.image || sampleImg}
//                   alt={buyNowProduct.title}
//                   className="h-16 w-16 object-contain border rounded"
//                 />
//                 <div className="text-sm">
//                   <div className="font-semibold">{buyNowProduct.title}</div>
//                   <div>MRP: ₹{Number(buyNowProduct.price_snapshot).toLocaleString("en-IN")}</div>
//                   <div>Quantity {buyNowQty}</div>
//                   <div>Size: {buyNowProduct.quantity_display || ""}</div>
//                 </div>
//               </div>
//             )
//           ) : (
//             // not buyNow — show cart items as before
//             <>
//               {(cart?.items || []).map((it) => (
//                 <div key={it.id} className="flex gap-3">
//                   <img
//                     src={it.product.image || sampleImg}
//                     alt={it.product.title}
//                     className="h-16 w-16 object-contain border rounded"
//                   />
//                   <div className="text-sm">
//                     <div className="font-semibold">{it.product.title}</div>
//                     <div>MRP: ₹{it.price_snapshot}</div>
//                     <div>Quantity {it.quantity}</div>
//                     <div>Size: {it.product.quantity_display}</div>
//                   </div>
//                 </div>
//               ))}
//             </>
//           )}

//           <div className="flex gap-2">
//             <input
//               type="text"
//               placeholder="Discount code or gift card"
//               className="flex-1 border rounded px-3 py-2 text-sm"
//             />
//             <button
//               type="button"
//               onClick={() => alert("Apply coupon logic here")}
//               className="bg-blue-600 text-white px-4 rounded"
//             >
//               Apply
//             </button>
//           </div>

//           <div className="text-sm space-y-1">
//             <div className="flex justify-between">
//               <span>Sub total</span>
//               <span>₹ {subtotal.toLocaleString("en-IN")}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Shipping</span>
//               <span>Flat rate : ₹{shipping}</span>
//             </div>
//             <hr />
//             <div className="flex justify-between font-bold">
//               <span>Total</span>
//               <span>₹ {total.toLocaleString("en-IN")}</span>
//             </div>
//             <div className="text-xs text-gray-600 mt-1">
//               (includes GST where applicable)
//             </div>
//           </div>
//         </aside>
//       </form>
//     </div>
//   );
// }
