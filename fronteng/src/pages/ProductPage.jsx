// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import sampleImg from "../assets/productdesimg.png";
import ProductDetailReview from "../components/ProductDetailReview";
import TopRatedSlider from "../components/TopRatedSlider";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // gallery state
  const [mainSrc, setMainSrc] = useState(sampleImg);
  const [thumbs, setThumbs] = useState([]);
  const [activeThumb, setActiveThumb] = useState(0);

  // UI state
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [addedMsg, setAddedMsg] = useState(""); // small success message

  // cart context (expects add(productId, quantity) -> Promise)
  const { add } = useCart();

  const [products, setProducts] = useState([]);

const API_ROOT =
  import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "http://127.0.0.1:8000/api";
const j = (p) => `${API_ROOT}${p.startsWith("/") ? p : `/${p}`}`;

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(j("/pet-products/"), {
          params: { pet_type: "dog" }, 
        });
        const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
        setProducts(data);
      } catch (err) {
        console.error("❌ Failed to fetch products", err);
      }
    }
    load();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .get(`/pet-product/${id}/`)
      .then((res) => {
        if (cancelled) return;
        const p = res.data;
        setProduct(p);

        // build thumbs array: ensure at least 4 thumbnails exist
        const built = [];
        if (p.image) built.push(p.image);
        if (Array.isArray(p.related_products)) {
          p.related_products.slice(0, 4).forEach((r) => r.image && built.push(r.image));
        }
        while (built.length < 4) built.push(p.image || sampleImg);

        setThumbs(built);
        setMainSrc(p.image || sampleImg);
        setActiveThumb(0);

        // preselect size from product quantity if available
        if (p.quantity_value && p.quantity_unit) {
          setSelectedSize(`${p.quantity_value}${p.quantity_unit}`);
        }
      })
      .catch((err) => {
        console.error("Failed loading product", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => (cancelled = true);
  }, [id]);

  const formatPrice = (v) =>
    v == null ? "—" : Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  if (loading) return <div className="p-6">Loading…</div>;
  if (!product) return <div className="p-6 text-red-600">Product not found</div>;

  const showTransient = (msg) => {
    setAddedMsg(msg);
    setTimeout(() => setAddedMsg(""), 1500);
  };

  const handleAddToCart = async () => {
    try {
      await add(product.id, qty);
      showTransient("Added to cart");
    } catch (e) {
      console.error("Add to cart failed", e);
      showTransient("Failed to add");
    }
  };

  const handleBuyNow = async () => {
    try {
      // keep adding to cart if you want global cart to reflect it
      await add(product.id, qty);

      // pass a buyNow flag and a small product snapshot so Checkout can render immediately
      const productSnapshot = {
        id: product.id,
        title: product.title,
        image: product.image || sampleImg,
        price_snapshot: product.price
      };

      navigate("/checkout", {
        state: {
          buyNow: true,
          productId: product.id,
          qty,
          productSnapshot,
        },
      });
    } catch (e) {
      console.error("Buy now failed", e);
      showTransient("Failed to proceed");
    }
  };

  

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-600">
        <Link to="/" className="text-gray-500 hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-500 capitalize">Dog</span>
        <span className="mx-2">/</span>
        <span className="font-medium">{product.title}</span>
      </div>

      {/* Top section: left gallery | right details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT: Main image, dots, thumbnails */}
        <div>
          <div className="flex justify-center">
            <div className="w-[360px] md:w-[420px] bg-white rounded border p-6 flex items-center justify-center">
              <img
                src={mainSrc || sampleImg}
                alt={product.title}
                className="max-h-[360px] object-contain"
              />
            </div>
          </div>

          {/* dots */}
          <div className="mt-3 flex justify-center items-center gap-3">
            {thumbs.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveThumb(i);
                  setMainSrc(thumbs[i]);
                }}
                className={`h-2 w-2 rounded-full ${activeThumb === i ? "bg-blue-600" : "bg-gray-300"}`}
                aria-label={`dot-${i}`}
              />
            ))}
          </div>

          {/* thumbnails */}
          <div className="mt-4 flex items-center justify-start gap-4 overflow-x-auto border-t pt-4">
            {thumbs.map((t, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveThumb(i);
                  setMainSrc(t);
                }}
                className={`h-24 w-24 flex items-center justify-center rounded border p-1 ${activeThumb === i ? "ring-2 ring-blue-500" : ""}`}
              >
                {t ? (
                  <img src={t} alt={`thumb-${i}`} className="h-full w-full object-contain" />
                ) : (
                  <div className="h-full w-full bg-gray-50" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Details */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold leading-tight">
            {product.title}
          </h1>

          <div className="mt-4 text-sm text-gray-700 space-y-2">
            <div><span className="font-semibold text-gray-800">Coupon code:</span> <span className="text-gray-700">92921</span></div>
            {product.brand && (
              <div><span className="font-semibold text-gray-800">Brand:</span> <span className="text-gray-700">{product.brand}</span></div>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-700">
            {product.description ? (
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {product.description.length > 450 ? `${product.description.slice(0, 450)}...` : product.description}
              </p>
            ) : (
              <p className="text-sm text-gray-500">This food feed specifically formulated and marketed for consumption by domesticated companion animals, 
              providing nutritionally balanced diets for their health, growth, and well-being. It can be 
              complete, balanced, digestible, and palatable, and comes in various forms 
              like dry (kibble), wet (canned), semi-moist, treats, and raw/frozen options, 
              with formulations varying for different animal species and life stages.</p>
              
              
            )}

            {/* small bullet meta */}
            <ul className="mt-3 list-disc list-inside text-xs text-gray-600 space-y-1">
              <li>MADE IN CANADA</li>
              <li>HEALTHY GRAINS: Quinoa, oats & barley</li>
              <li>Importer name: Maple pets international pvt ltd</li>
              <li>Per gram price: 0.84₹</li>
              <li>Manufactured by: Omni pet nutrition BC, CANADA</li>
            </ul>
          </div>

          {/* Price / Size / Qty / Buttons */}
          {/* Price / Size / Qty / Buttons */}
          <div className="mt-6 flex flex-col gap-4">
            {/* Price + size */}
            <div className="flex items-start gap-6">
              <div>
                <div className="text-xs text-gray-500">MRP:</div>
                <div className="text-2xl font-bold text-blue-600">₹ {formatPrice(product.price)}</div>
                {product.mrp && <div className="text-sm text-gray-400 line-through">₹ {formatPrice(product.mrp)}</div>}
                <div className="text-xs text-gray-500 mt-1">Inclusive of all taxes</div>
                <div className="ml-auto space-y-2">
                  <div className="text-sm text-gray-600 mb-1">Available Size:</div>
                  <div className="flex items-center gap-2">
                    {["1kg", "2kg"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1 rounded text-sm border ${selectedSize === s ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity row (separate row) */}
            <div className="flex items-center gap-6">

              <div>
                <div className="text-sm text-gray-600">Quantity:</div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 rounded border flex items-center justify-center text-lg"
                    aria-label="decrease"
                  >
                    −
                  </button>
                  <div className="min-w-[44px] text-center">{qty}</div>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="h-8 w-8 rounded border flex items-center justify-center text-lg"
                    aria-label="increase"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Buttons row: large pills, responsive (stack on small screens) */}
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
              <button
                onClick={handleAddToCart}
                className="w-full sm:w-auto flex-1 sm:flex-none px-10 py-3 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 transition"
              >
                Add to cart
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full sm:w-auto flex-1 sm:flex-none px-8 py-3 rounded-full bg-black text-white text-sm font-semibold border-2 border-black/10 hover:opacity-95 transition"
              >
                Buy Now
              </button>

              {/* small status message (keeps inline on wide screens) */}
              {addedMsg && (
                <div className="mt-2 sm:mt-0 sm:ml-4 text-sm text-green-600 font-medium">
                  {addedMsg}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* separator */}
      <div className="mt-8 border-t" />

      {/* Lower big section: left description list + right image */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* left: 2/3 width on large screens */}
        <div className="lg:col-span-2 bg-white rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Product Description</h2>

          {/* Four subtitles with paragraphs */}
          <div className="space-y-5 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold">Fresh Dog Food</h3>
              <p className="mt-1">Small Breed Dog Food, Turkey, Chickpea & Sweet Potato — Quality, Canadian sources of protein, including fresh turkey, turkey meal and eggs, are at the foundation of our recipe.</p>
            </div>

            <div>
              <h3 className="font-semibold">Flaxseed, chia seed, salmon oil for healthy skin & coat</h3>
              <p className="mt-1">This powerful combination of salmon oil, chia & flax ensures a diet rich in omega fatty acids to help your dog maintain a healthy skin & coat.</p>
            </div>

            <div>
              <h3 className="font-semibold">Prebiotics & probiotics for a healthy digestive system</h3>
              <p className="mt-1">Prebiotics & probiotics along with ingredients rich in dietary fiber such as sweet potatoes, black beans, oats and barley, help support a healthy digestive system.</p>
            </div>

            <div>
              <h3 className="font-semibold">Rich in antioxidants to support a healthy immune system</h3>
              <p className="mt-1">Berries and carrots, loaded with antioxidants and phytonutrients, along with vitamins and minerals help support a healthy immune system.</p>
            </div>

            <p className="mt-2 text-sm text-gray-600">
              {product.description || "Zoe Small Breed Dog Food — This dry dog food is made with fresh deboned turkey..."}
            </p>
          </div>
        </div>

        {/* right: image panel */}
        <div className="flex items-start">
          <div className="w-full rounded border overflow-hidden bg-white">
            <img
              src={product.right_image || sampleImg}
              alt="promo"
              className="h-full w-full object-cover max-h-[420px]"
            />
          </div>
        </div>
      </div>

      <div className="mt-12">
        <ProductDetailReview productId={product.id} />
      </div>
      <TopRatedSlider products={products} />

    </div>
  );
}
