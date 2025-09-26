// src/pages/Cart.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchCart, updateItem, deleteItem } from "../lib/cartApi";
import sampleImg from "../assets/productdesimg.png";

import GPayImg from "../assets/gpay.png";
import PhonePeImg from "../assets/phonepe.png";
import MastercardImg from "../assets/mastercard.png";
import PayPalImg from "../assets/paypal.png";
import VisaImg from "../assets/visa.png";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  async function loadCart() {
    setLoading(true);
    try {
      const data = await fetchCart();
      setCart(data);
    } catch (e) {
      console.error("Failed to load cart", e);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  const onQtyChange = async (item, delta) => {
    const newQty = Math.max(1, item.quantity + delta);
    try {
      const data = await updateItem(item.id, newQty);
      setCart(data);
    } catch (e) {
      console.error(e);
    }
  };

  const onRemove = async (item) => {
    try {
      const data = await deleteItem(item.id);
      setCart(data);
    } catch (e) {
      console.error(e);
    }
  };

  const onApplyCoupon = async () => {
    setApplying(true);
    // Stub for now — implement backend later
    setTimeout(() => {
      setApplying(false);
      alert("Coupon applied (stub) — implement backend to validate");
    }, 700);
  };

  const onProceed = () => {
  // navigate to checkout and let Checkout fetch cart
  navigate("/checkout", { state: { buyNow: false } });
};

  if (loading) return <div className="p-6">Loading…</div>;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const shipping = 99.0; // static shipping example
  const total = Number(subtotal) + shipping;

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      {/* breadcrumb */}
      <div className="mb-4 text-sm text-gray-600">
        <Link to="/" className="hover:underline">
          Home
        </Link>{" "}
        / <span>Dog</span> / <span className="font-medium">Cart</span>
      </div>

      {/* main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* left: cart list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded border bg-white p-4">
            {/* free shipping bar */}
            <div className="mb-4">
              <div className="text-xs text-green-700 mb-2">
                Your order qualifies for free shipping!
              </div>
              <div className="h-2 bg-blue-300 rounded" style={{ width: "60%" }} />
            </div>

            {/* table header */}
            <div className="hidden md:grid grid-cols-6 gap-4 text-xs text-gray-500 font-medium border-b pb-2">
              <div>Remove</div>
              <div className="col-span-2">Product</div>
              <div>Price</div>
              <div>Quantity</div>
              <div>Sub Total</div>
            </div>

            {/* items */}
            <div className="space-y-4 mt-4">
              {items.length === 0 ? (
                <div className="text-center text-gray-600 p-6">
                  Your cart is empty.
                </div>
              ) : (
                items.map((it) => (
                  <div
                    key={it.id}
                    className="flex flex-col md:flex-row items-center gap-4 border-b pb-4"
                  >
                    {/* remove */}
                    <div className="w-10 text-center">
                      <button
                        onClick={() => onRemove(it)}
                        className="text-red-500"
                      >
                        X
                      </button>
                    </div>

                    {/* product image + title */}
                    <div className="flex items-center gap-4 md:col-span-2 flex-1">
                      <img
                        src={it.product.image || sampleImg}
                        alt={it.product.title}
                        className="h-16 w-16 object-contain border rounded"
                      />
                      <div>
                        <div className="font-medium">{it.product.title}</div>
                        <div className="text-xs text-gray-500">
                          {it.product.quantity_display}
                        </div>
                      </div>
                    </div>

                    {/* price */}
                    <div className="w-28 text-sm">
                      ₹ {Number(it.price_snapshot).toLocaleString("en-IN")}
                    </div>

                    {/* qty */}
                    <div className="w-36 flex items-center gap-2">
                      <button
                        onClick={() => onQtyChange(it, -1)}
                        className="h-8 w-8 rounded border"
                      >
                        −
                      </button>
                      <div className="text-center w-10">{it.quantity}</div>
                      <button
                        onClick={() => onQtyChange(it, +1)}
                        className="h-8 w-8 rounded border"
                      >
                        +
                      </button>
                    </div>

                    {/* subtotal */}
                    <div className="w-36 text-sm text-right">
                      ₹{" "}
                      {(
                        it.quantity * Number(it.price_snapshot)
                      ).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* coupon + apply */}
            <div className="mt-6 flex gap-3 items-center">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon code"
                className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none"
              />
              <button
                onClick={onApplyCoupon}
                disabled={applying}
                className="rounded-full bg-blue-600 px-5 py-2 text-white"
              >
                {applying ? "Applying..." : "Apply coupon"}
              </button>
            </div>
          </div>

          {/* green offers row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-100 p-6 text-center rounded">
              Free products dog food combo 5 kg, turkey
            </div>
            <div className="bg-green-100 p-6 text-center rounded">
              Free products dog food 2 kg turkey
            </div>
            <div className="bg-green-100 p-6 text-center rounded">
              Free products dog food 2 kg chicken
            </div>
          </div>

          {/* help cards row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="p-4">
              <div className="font-semibold">Have a question?</div>
              <div className="text-xs">
                Our experts are here to call:{" "}
                <a className="text-blue-600">call us</a>
              </div>
            </div>
            <div className="p-4">
              <div className="font-semibold">Secure shopping</div>
              <div className="text-xs">
                All transactions are protected by SSL
              </div>
            </div>
            <div className="p-4">
              <div className="font-semibold">Privacy protection</div>
              <div className="text-xs">
                Your privacy is always our top priority.
              </div>
            </div>
          </div>
        </div>

        {/* right: totals */}
        <aside className="space-y-4">
          <div className="rounded border bg-white p-6">
            <h3 className="text-xl font-semibold">Cart Totals</h3>

            <div className="mt-4 text-sm space-y-2">
              <div className="flex justify-between">
                <div>Sub total</div>
                <div>₹ {Number(subtotal).toLocaleString("en-IN")}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>Flat rate : ₹{shipping.toFixed(2)}</div>
              </div>

              <div className="border-t pt-3 mt-3 flex justify-between font-bold">
                <div>Total</div>
                <div>₹ {Number(total).toLocaleString("en-IN")}</div>
              </div>

              {/* ✅ Proceed to checkout */}
              <button
                onClick={onProceed}
                className="mt-4 w-full rounded-full bg-blue-600 px-5 py-3 text-white"
              >
                Proceed to Checkout
              </button>

              <div className="mt-4">
                <div className="text-sm font-medium">Payment methods</div>

                {/* icon row */}
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={GPayImg}
                    alt="G Pay"
                    className="h-8 object-contain"
                    style={{ width: 80 }}
                  />
                  <img
                    src={PhonePeImg}
                    alt="PhonePe"
                    className="h-8 object-contain"
                    style={{ width: 48 }}
                  />
                  <img
                    src={MastercardImg}
                    alt="Mastercard"
                    className="h-8 object-contain"
                    style={{ width: 48 }}
                  />
                  <img
                    src={PayPalImg}
                    alt="PayPal"
                    className="h-8 object-contain"
                    style={{ width: 48 }}
                  />
                  <img
                    src={VisaImg}
                    alt="Visa"
                    className="h-8 object-contain"
                    style={{ width: 64 }}
                  />
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <div className="font-semibold">Delivery information:</div>
                <div>
                  Although we don’t think you'll ever want one, we’ll gladly
                  provide a refund if it’s requested within 14 days of purchase.
                </div>
              </div>
            </div>
          </div>

          {/* small note card */}
          <div className="rounded border bg-white p-4 text-sm">
            <div className="font-semibold">Have a coupon?</div>
            <div className="text-xs text-gray-500">
              Add coupon on the left to see discount.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
