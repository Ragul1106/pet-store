// src/pages/Pets.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { addToCart } from "../lib/cartApi";
// Base without trailing slash to avoid // in paths
const API_ROOT =
  import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "http://127.0.0.1:8000";
const j = (p) => `${API_ROOT}${p.startsWith("/") ? p : `/${p}`}`; // safe join

const SORT_OPTIONS = [
  { key: "best", label: "Best sellers" },
  { key: "relevance", label: "Relevance" },
  { key: "price_asc", label: "Price: Low - High" },
  { key: "price_desc", label: "Price: High - Low" },
  { key: "new", label: "New Arrivals" },
  { key: "top", label: "Top Rated" },
];

const FILTER_SECTIONS = [
  { key: "brand", title: "Brand", items: ["Aeolus", "All For Paws", "Arden Grange", "Bayer", "Beaphar"] },
  { key: "size", title: "Size", items: ["X", "Small", "S", "M", "Medium"] },
  { key: "breed", title: "Breed", items: ["Beagle", "Golden retriever", "German shephard", "Labrador", "Pug"] },
  { key: "life_stage", title: "Life Stage", items: ["Puppy", "Adult Dog", "Senior Dog", "Adult Cat", "Senior Cat"] },
  { key: "flavor", title: "Flavor", items: ["Chicken", "Egg", "Fish", "Fruits", "Vegetables"] },
];

// local storage key for cart token
const CART_TOKEN_KEY = "cart_token";
function getCartToken() {
  return localStorage.getItem(CART_TOKEN_KEY);
}
function setCartToken(token) {
  if (!token) return;
  localStorage.setItem(CART_TOKEN_KEY, token);
}

async function addToCartApi(productId, quantity = 1) {
  // returns { data, token } or throws
  const url = j("/api/cart/add/");
  const headers = {};
  const token = getCartToken();
  if (token) headers["X-Cart-Token"] = token;

  const res = await axios.post(url, { product_id: productId, quantity }, { headers });
  // server sets X-Cart-Token header on first create; fallback to res.data.token
  const newToken = res.headers["x-cart-token"] || res.data?.token;
  if (newToken) setCartToken(newToken);
  return res.data;
}

export default function Pets({ petType: propPetType = "dog" }) {
  // read param from route: /pets/:petType
  const params = useParams();
  // prefer URL param, otherwise prop, otherwise default "dog"
  const resolvedPetType = params.petType || propPetType || "dog";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // UI state
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState("best"); // default sort
  const [filters, setFilters] = useState({
    brand: new Set(),
    size: new Set(),
    breed: new Set(),
    life_stage: new Set(),
    flavor: new Set(),
  });

  // cart UI state mapping productId -> { loading, success, error }
  const [cartState, setCartState] = useState({});

  const title = useMemo(() => {
    // convert e.g. "small-pets" -> "Small Pets"
    return resolvedPetType
      .replace(/-/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [resolvedPetType]);

  const filterRef = useRef();

  // Build a params object for axios calls
  // Important: convert Sets to arrays for axios params
  const productRequestParams = useMemo(() => {
    const params = {
      pet_type: resolvedPetType,
      sort,
    };
    for (const [k, set] of Object.entries(filters)) {
      if (set && set.size > 0) {
        params[k] = Array.from(set);
      }
    }
    return params;
  }, [resolvedPetType, sort, filters]);

  // Centralized fetch that uses productRequestParams
  const fetchAll = async () => {
    setLoading(true);
    setErr(null);
    try {
      const [cRes, pRes, bRes] = await Promise.all([
        axios.get(j("/api/pet-categories/"), { params: { pet_type: resolvedPetType } }),
        axios.get(j("/api/pet-products/"), { params: productRequestParams }),
        axios.get(j("/api/pet-banners/"), { params: { pet_type: resolvedPetType } }),
      ]);

      setCategories(Array.isArray(cRes.data) ? cRes.data : (cRes.data?.results ?? []));
      setProducts(Array.isArray(pRes.data) ? pRes.data : (pRes.data?.results ?? []));
      setBanners(Array.isArray(bRes.data) ? bRes.data : (bRes.data?.results ?? []));
    } catch (e) {
      console.error("Pets page load error", e);
      const message = e?.response?.data?.detail || e?.message || "Failed to load";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  // Load whenever productRequestParams changes (petType / sort / filters)
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productRequestParams]);

  // toggle a single filter value (updates filters state)
  const toggleFilter = (section, value) => {
    setFilters((prev) => {
      const next = {
        brand: new Set(prev.brand),
        size: new Set(prev.size),
        breed: new Set(prev.breed),
        life_stage: new Set(prev.life_stage),
        flavor: new Set(prev.flavor),
      };
      const set = next[section];
      if (!set) return prev;
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return next;
    });
  };

  const clearAllFilters = () => {
    setFilters({
      brand: new Set(),
      size: new Set(),
      breed: new Set(),
      life_stage: new Set(),
      flavor: new Set(),
    });
  };

  // Close filter panel when clicking outside (simple handler)
  useEffect(() => {
    const onDoc = (e) => {
      if (filterOpen && filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [filterOpen]);

  // Add to cart click handler (keeps your existing addToCart)
  async function handleAddToCart(prod) {
    try {
      await addToCart(prod.id, 1);
      // show success state briefly
      setCartState((s) => ({ ...s, [prod.id]: { success: true, error: null } }));
      setTimeout(() => setCartState((s) => ({ ...s, [prod.id]: {} })), 1200);
    } catch (err) {
      console.error("Add to cart failed", err);
      setCartState((s) => ({ ...s, [prod.id]: { success: false, error: "Failed" } }));
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Failed to load data: {err}</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <div className="mb-3 text-sm text-gray-500">Home / {title}</div>

      {/* Toolbar: Filters | Title | Sort by */}
      <div className="mb-6 grid grid-cols-1 items-center gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <div className="relative inline-block" ref={filterRef}>
            <button
              type="button"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-gray-800 shadow-sm hover:bg-gray-50"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded border">≡</span>
              Filters
            </button>
            {filterOpen && (
              <div className="absolute z-50 mt-2 w-[280px] rounded-md border bg-white p-3 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium">Filters</div>
                  <button
                    className="text-xs text-blue-600 hover:underline"
                    onClick={clearAllFilters}
                  >
                    Clear all
                  </button>
                </div>
                <div className="max-h-[60vh] space-y-4 overflow-auto pr-1">
                  {FILTER_SECTIONS.map((sec) => (
                    <div key={sec.key}>
                      <div className="mb-1 text-sm font-semibold">
                        {sec.title} <span className="text-gray-400">›</span>
                      </div>
                      <div className="rounded border bg-gray-50 p-2">
                        {sec.items.map((label) => {
                          const active = filters[sec.key].has(label);
                          return (
                            <label
                              key={label}
                              className="mb-1 flex cursor-pointer items-center gap-2 text-sm last:mb-0"
                            >
                              <input
                                type="checkbox"
                                checked={active}
                                onChange={() => toggleFilter(sec.key, label)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span>{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
                    onClick={() => {
                      setFilterOpen(false);
                    }}
                  >
                    Cancel
                  </button>
                  {/* Apply no longer calls fetchAll directly; updating `filters` triggers the useEffect */}
                  <button
                    className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                    onClick={() => {
                      setFilterOpen(false);
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Title with short underline */}
        <div className="sm:col-span-1 flex justify-center">
          <div className="relative">
            <h2 className="text-xl font-semibold">{title}</h2>
            <span className="absolute -bottom-1 left-1/2 h-0.5 w-25 -translate-x-1/2 rounded bg-black" />
          </div>
        </div>

        {/* Right: Sort by dropdown */}
        <div className="sm:col-span-1 flex justify-end">
          <div className="relative inline-block">
            <button
              type="button"
              aria-expanded={sortOpen}
              onClick={() => setSortOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-gray-800 shadow-sm hover:bg-gray-50"
            >
              Sort by <span className="text-xs">▾</span>
            </button>
            {sortOpen && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border bg-white p-2 shadow-lg">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      // setSort only — fetch will happen via useEffect/productRequestParams
                      setSort(opt.key);
                      setSortOpen(false);
                    }}
                    className={`mb-1 w-full rounded px-2 py-1 text-left text-sm last:mb-0 hover:bg-gray-50 ${sort === opt.key ? "bg-blue-50 text-blue-700" : ""}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-6">
        {/* Left promo column remains visible on md+; filters live in dropdown */}
        <aside className="hidden w-1/4 space-y-6 md:block">
          {categories.map((cat) => (
            <div key={cat.id} className="overflow-hidden rounded-md bg-white">
              {cat.image && (
                <img src={cat.image} alt={cat.title || "category"} className="h-35 w-full object-cover" />
              )}
              <div className="p-3">
                <h3 className="font-semibold">{cat.title}</h3>
                {cat.subtitle && <p className="text-sm text-gray-600">{cat.subtitle}</p>}
              </div>
            </div>
          ))}
        </aside>

        {/* Products grid - items-stretch so each card is equal height */}
        <section className="flex-1">
          {products.length === 0 ? (
            <div className="rounded-md bg-white p-6 text-center text-gray-600">
              No products found. Try clearing filters or choosing a different sort.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
              {products.map((prod) => {
                const state = cartState[prod.id] || {};
                return (
                  <div key={prod.id} className="h-full flex flex-col rounded-lg border p-3 shadow-sm">
                    <Link to={`/product/${prod.id}`}>
                      <img
                        src={prod.image || "/placeholder.png"}
                        alt={prod.title || "product"}
                        className="mb-3 h-40 w-full object-contain"
                      />
                    </Link>

                    {/* Main content grows to push button to bottom */}
                    <div className="flex-1 flex flex-col">
                      <div>
                        <Link to={`/product/${prod.id}`} className="block">
                          <h3 className="text-sm font-semibold">{prod.title}</h3>
                        </Link>

                        {/* Rating */}
                        <div className="mt-1 flex items-center text-yellow-400">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const r = Math.round(Number(prod.rating) || 0);
                            return (
                              <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill={i < r ? "currentColor" : "lightgray"}
                                className="h-4 w-4"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            );
                          })}
                          <span className="ml-2 text-xs text-gray-500">({prod.rating_count ?? 0})</span>
                        </div>

                        {/* Price */}
                        <div className="mt-2 text-lg font-bold">₹ {prod.price ?? "—"}</div>

                        {/* Quantity chip */}
                        {prod.quantity_display && (
                          <div className="mt-1 w-fit rounded bg-black px-2 py-0.5 text-xs text-white">
                            {prod.quantity_display}
                          </div>
                        )}
                      </div>

                      {/* spacer to separate meta from action */}
                      <div className="mt-4" />

                      {/* small status */}
                      <div className="text-xs h-4">
                        {state.success && <span className="text-green-600">Added ✓</span>}
                        {state.error && <span className="text-red-600">{state.error}</span>}
                      </div>
                    </div>

                    {/* action row at bottom */}
                    <div className="mt-3">
                      <button
                        className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
                        onClick={(e) => { e.preventDefault(); handleAddToCart(prod); }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Bottom banners */}
      {banners.map((ban, i) => (
        <div
          key={i}
          className="mt-8 flex items-center justify-between rounded-lg bg-[#98FB98] p-6"
        >
          {ban.left_image && (
            <img
              src={ban.left_image}
              alt={ban.left_image_alt || "Left Banner"}
              className="mr-5 h-40 object-contain md:h-48"
            />
          )}

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-lg font-medium text-black">{ban.title}</p>
            {ban.subtitle && <p className="text-sm text-green-800">{ban.subtitle}</p>}
          </div>

          {ban.right_image && (
            <img
              src={ban.right_image}
              alt={ban.right_image_alt || "Right Banner"}
              className="ml-5 h-40 object-contain md:h-48"
            />
          )}
        </div>
      ))}
    </div>
  );
}



// // src/pages/Pets.jsx
// import React, { useEffect, useMemo, useState, useRef } from "react";
// import { Link, useParams } from "react-router-dom";
// import axios from "axios";
// import { addToCart } from "../lib/cartApi";
// // Base without trailing slash to avoid // in paths
// const API_ROOT =
//   import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "http://127.0.0.1:8000";
// const j = (p) => `${API_ROOT}${p.startsWith("/") ? p : `/${p}`}`; // safe join

// const SORT_OPTIONS = [
//   { key: "best", label: "Best sellers" },
//   { key: "relevance", label: "Relevance" },
//   { key: "price_asc", label: "Price: Low - High" },
//   { key: "price_desc", label: "Price: High - Low" },
//   { key: "new", label: "New Arrivals" },
//   { key: "top", label: "Top Rated" },
// ];

// const FILTER_SECTIONS = [
//   { key: "brand", title: "Brand", items: ["Aeolus", "All For Paws", "Arden Grange", "Bayer", "Beaphar"] },
//   { key: "size", title: "Size", items: ["X", "Small", "S", "M", "Medium"] },
//   { key: "breed", title: "Breed", items: ["Beagle", "Golden retriever", "German shephard", "Labrador", "Pug"] },
//   { key: "life_stage", title: "Life Stage", items: ["Puppy", "Adult Dog", "Senior Dog", "Adult Cat", "Senior Cat"] },
//   { key: "flavor", title: "Flavor", items: ["Chicken", "Egg", "Fish", "Fruits", "Vegetables"] },
// ];

// // local storage key for cart token
// const CART_TOKEN_KEY = "cart_token";
// function getCartToken() {
//   return localStorage.getItem(CART_TOKEN_KEY);
// }
// function setCartToken(token) {
//   if (!token) return;
//   localStorage.setItem(CART_TOKEN_KEY, token);
// }

// async function addToCartApi(productId, quantity = 1) {
//   // returns { data, token } or throws
//   const url = j("/api/cart/add/");
//   const headers = {};
//   const token = getCartToken();
//   if (token) headers["X-Cart-Token"] = token;

//   const res = await axios.post(url, { product_id: productId, quantity }, { headers });
//   // server sets X-Cart-Token header on first create; fallback to res.data.token
//   const newToken = res.headers["x-cart-token"] || res.data?.token;
//   if (newToken) setCartToken(newToken);
//   return res.data;
// }

// export default function Pets({ petType: propPetType = "dog" }) {
//   // read param from route: /pets/:petType
//   const params = useParams();
//   // prefer URL param, otherwise prop, otherwise default "dog"
//   const resolvedPetType = params.petType || propPetType || "dog";

//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [banners, setBanners] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState(null);

//   // UI state
//   const [sortOpen, setSortOpen] = useState(false);
//   const [filterOpen, setFilterOpen] = useState(false);
//   const [sort, setSort] = useState("best"); // default sort
//   const [filters, setFilters] = useState({
//     brand: new Set(),
//     size: new Set(),
//     breed: new Set(),
//     life_stage: new Set(),
//     flavor: new Set(),
//   });

//   // cart UI state mapping productId -> { loading, success, error }
//   const [cartState, setCartState] = useState({});

//   const title = useMemo(() => {
//     // convert e.g. "small-pets" -> "Small Pets"
//     return resolvedPetType
//       .replace(/-/g, " ")
//       .split(" ")
//       .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//       .join(" ");
//   }, [resolvedPetType]);

//   const filterRef = useRef();

//   // Build a params object for axios calls
//   const productRequestParams = useMemo(() => {
//     const params = {
//       pet_type: resolvedPetType,
//       sort,
//     };
//     // append all sets as repeated params: e.g. brand=val1&brand=val2
//     for (const [k, set] of Object.entries(filters)) {
//       if (set && set.size > 0) {
//         params[k] = Array.from(set);
//       }
//     }
//     return params;
//   }, [resolvedPetType, sort, filters]);

//   const fetchAll = async () => {
//     setLoading(true);
//     setErr(null);
//     try {
//       // Use axios params for products (safer than manual querystring)
//       const [cRes, pRes, bRes] = await Promise.all([
//         axios.get(j("/api/pet-categories/"), { params: { pet_type: resolvedPetType } }),
//         axios.get(j("/api/pet-products/"), { params: productRequestParams }),
//         axios.get(j("/api/pet-banners/"), { params: { pet_type: resolvedPetType } }),
//       ]);

//       setCategories(Array.isArray(cRes.data) ? cRes.data : (cRes.data?.results ?? []));
//       setProducts(Array.isArray(pRes.data) ? pRes.data : (pRes.data?.results ?? []));
//       setBanners(Array.isArray(bRes.data) ? bRes.data : (bRes.data?.results ?? []));
//     } catch (e) {
//       console.error("Pets page load error", e);
//       const message = e?.response?.data?.detail || e?.message || "Failed to load";
//       setErr(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAll();
//     // depend on productRequestParams so filters/sort/petType trigger fetch
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [productRequestParams]);

//   // toggle a single filter value
//   const toggleFilter = (section, value) => {
//     setFilters((prev) => {
//       // create a shallow copy of prev and new Set copies to maintain immutability
//       const next = {
//         brand: new Set(prev.brand),
//         size: new Set(prev.size),
//         breed: new Set(prev.breed),
//         life_stage: new Set(prev.life_stage),
//         flavor: new Set(prev.flavor),
//       };
//       const set = next[section];
//       if (!set) return prev;
//       if (set.has(value)) set.delete(value);
//       else set.add(value);
//       return next;
//     });
//   };

//   const clearAllFilters = () => {
//     setFilters({
//       brand: new Set(),
//       size: new Set(),
//       breed: new Set(),
//       life_stage: new Set(),
//       flavor: new Set(),
//     });
//   };

//   // Close filter panel when clicking outside (simple handler)
//   useEffect(() => {
//     const onDoc = (e) => {
//       if (filterOpen && filterRef.current && !filterRef.current.contains(e.target)) {
//         setFilterOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", onDoc);
//     return () => document.removeEventListener("mousedown", onDoc);
//   }, [filterOpen]);

//   // Add to cart click handler (keeps your existing addToCart)
//   async function handleAddToCart(prod) {
//     try {
//       await addToCart(prod.id, 1);
//       // show success state briefly
//       setCartState((s) => ({ ...s, [prod.id]: { success: true, error: null } }));
//       setTimeout(() => setCartState((s) => ({ ...s, [prod.id]: {} })), 1200);
//     } catch (err) {
//       console.error("Add to cart failed", err);
//       setCartState((s) => ({ ...s, [prod.id]: { success: false, error: "Failed" } }));
//     }
//   }

//   if (loading) return <div className="p-6">Loading…</div>;
//   if (err) return <div className="p-6 text-red-600">Failed to load data: {err}</div>;

//   return (
//     <div className="mx-auto max-w-7xl px-4 py-6">
//       {/* Breadcrumb */}
//       <div className="mb-3 text-sm text-gray-500">Home / {title}</div>

//       {/* Toolbar: Filters | Title | Sort by */}
//       <div className="mb-6 grid grid-cols-1 items-center gap-3 sm:grid-cols-3">
//         <div className="sm:col-span-1">
//           <div className="relative inline-block" ref={filterRef}>
//             <button
//               type="button"
//               aria-expanded={filterOpen}
//               onClick={() => setFilterOpen((v) => !v)}
//               className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-gray-800 shadow-sm hover:bg-gray-50"
//             >
//               <span className="inline-flex h-5 w-5 items-center justify-center rounded border">≡</span>
//               Filters
//             </button>
//             {filterOpen && (
//               <div className="absolute z-50 mt-2 w-[280px] rounded-md border bg-white p-3 shadow-lg">
//                 <div className="mb-2 flex items-center justify-between">
//                   <div className="text-sm font-medium">Filters</div>
//                   <button
//                     className="text-xs text-blue-600 hover:underline"
//                     onClick={clearAllFilters}
//                   >
//                     Clear all
//                   </button>
//                 </div>
//                 <div className="max-h-[60vh] space-y-4 overflow-auto pr-1">
//                   {FILTER_SECTIONS.map((sec) => (
//                     <div key={sec.key}>
//                       <div className="mb-1 text-sm font-semibold">
//                         {sec.title} <span className="text-gray-400">›</span>
//                       </div>
//                       <div className="rounded border bg-gray-50 p-2">
//                         {sec.items.map((label) => {
//                           const active = filters[sec.key].has(label);
//                           return (
//                             <label
//                               key={label}
//                               className="mb-1 flex cursor-pointer items-center gap-2 text-sm last:mb-0"
//                             >
//                               <input
//                                 type="checkbox"
//                                 checked={active}
//                                 onChange={() => toggleFilter(sec.key, label)}
//                                 className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                               />
//                               <span>{label}</span>
//                             </label>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="mt-3 flex justify-end gap-2">
//                   <button
//                     className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
//                     onClick={() => {
//                       setFilterOpen(false);
//                     }}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
//                     onClick={() => {
//                       setFilterOpen(false);
//                       fetchAll();
//                     }}
//                   >
//                     Apply
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Center: Title with short underline */}
//         <div className="sm:col-span-1 flex justify-center">
//           <div className="relative">
//             <h2 className="text-xl font-semibold">{title}</h2>
//             <span className="absolute -bottom-1 left-1/2 h-0.5 w-25 -translate-x-1/2 rounded bg-black" />
//           </div>
//         </div>

//         {/* Right: Sort by dropdown */}
//         <div className="sm:col-span-1 flex justify-end">
//           <div className="relative inline-block">
//             <button
//               type="button"
//               aria-expanded={sortOpen}
//               onClick={() => setSortOpen((v) => !v)}
//               className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-gray-800 shadow-sm hover:bg-gray-50"
//             >
//               Sort by <span className="text-xs">▾</span>
//             </button>
//             {sortOpen && (
//               <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border bg-white p-2 shadow-lg">
//                 {SORT_OPTIONS.map((opt) => (
//                   <button
//                     key={opt.key}
//                     onClick={() => {
//                       setSort(opt.key);
//                       setSortOpen(false);
//                       fetchAll();
//                     }}
//                     className={`mb-1 w-full rounded px-2 py-1 text-left text-sm last:mb-0 hover:bg-gray-50 ${sort === opt.key ? "bg-blue-50 text-blue-700" : ""}`}
//                   >
//                     {opt.label}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Main layout */}
//       <div className="flex gap-6">
//         {/* Left promo column remains visible on md+; filters live in dropdown */}
//         <aside className="hidden w-1/4 space-y-6 md:block">
//           {categories.map((cat) => (
//             <div key={cat.id} className="overflow-hidden rounded-md bg-white">
//               {cat.image && (
//                 <img src={cat.image} alt={cat.title || "category"} className="h-35 w-full object-cover" />
//               )}
//               <div className="p-3">
//                 <h3 className="font-semibold">{cat.title}</h3>
//                 {cat.subtitle && <p className="text-sm text-gray-600">{cat.subtitle}</p>}
//               </div>
//             </div>
//           ))}
//         </aside>

//         {/* Products grid - items-stretch so each card is equal height */}
//         <section className="flex-1">
//           {products.length === 0 ? (
//             <div className="rounded-md bg-white p-6 text-center text-gray-600">
//               No products found. Try clearing filters or choosing a different sort.
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
//               {products.map((prod) => {
//                 const state = cartState[prod.id] || {};
//                 return (
//                   <div key={prod.id} className="h-full flex flex-col rounded-lg border p-3 shadow-sm">
//                     <Link to={`/product/${prod.id}`}>
//                       <img
//                         src={prod.image || "/placeholder.png"}
//                         alt={prod.title || "product"}
//                         className="mb-3 h-40 w-full object-contain"
//                       />
//                     </Link>

//                     {/* Main content grows to push button to bottom */}
//                     <div className="flex-1 flex flex-col">
//                       <div>
//                         <Link to={`/product/${prod.id}`} className="block">
//                           <h3 className="text-sm font-semibold">{prod.title}</h3>
//                         </Link>

//                         {/* Rating */}
//                         <div className="mt-1 flex items-center text-yellow-400">
//                           {Array.from({ length: 5 }).map((_, i) => {
//                             const r = Math.round(Number(prod.rating) || 0);
//                             return (
//                               <svg
//                                 key={i}
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 viewBox="0 0 20 20"
//                                 fill={i < r ? "currentColor" : "lightgray"}
//                                 className="h-4 w-4"
//                               >
//                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                               </svg>
//                             );
//                           })}
//                           <span className="ml-2 text-xs text-gray-500">({prod.rating_count ?? 0})</span>
//                         </div>

//                         {/* Price */}
//                         <div className="mt-2 text-lg font-bold">₹ {prod.price ?? "—"}</div>

//                         {/* Quantity chip */}
//                         {prod.quantity_display && (
//                           <div className="mt-1 w-fit rounded bg-black px-2 py-0.5 text-xs text-white">
//                             {prod.quantity_display}
//                           </div>
//                         )}
//                       </div>

//                       {/* spacer to separate meta from action */}
//                       <div className="mt-4" />

//                       {/* small status */}
//                       <div className="text-xs h-4">
//                         {state.success && <span className="text-green-600">Added ✓</span>}
//                         {state.error && <span className="text-red-600">{state.error}</span>}
//                       </div>
//                     </div>

//                     {/* action row at bottom */}
//                     <div className="mt-3">
//                       <button
//                         className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
//                         onClick={(e) => { e.preventDefault(); handleAddToCart(prod); }}
//                       >
//                         Add to Cart
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </section>
//       </div>

//       {/* Bottom banners */}
//       {banners.map((ban, i) => (
//         <div
//           key={i}
//           className="mt-8 flex items-center justify-between rounded-lg bg-[#98FB98] p-6"
//         >
//           {ban.left_image && (
//             <img
//               src={ban.left_image}
//               alt={ban.left_image_alt || "Left Banner"}
//               className="mr-5 h-40 object-contain md:h-48"
//             />
//           )}

//           <div className="flex flex-1 flex-col items-center justify-center text-center">
//             <p className="text-lg font-medium text-black">{ban.title}</p>
//             {ban.subtitle && <p className="text-sm text-green-800">{ban.subtitle}</p>}
//           </div>

//           {ban.right_image && (
//             <img
//               src={ban.right_image}
//               alt={ban.right_image_alt || "Right Banner"}
//               className="ml-5 h-40 object-contain md:h-48"
//             />
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }