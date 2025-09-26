import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import MegaMenu from "./MegaMenu";

export default function SecondaryNav({ items }) {
   const defaultItems = [
    { key: "dog", label: "Dog", path: "/pets/dog" },
    { key: "cat", label: "Cat", path: "/pets/cat" },
    { key: "small-pets", label: "Small pets", path: "/pets/small-pets" },
    { key: "pet-service", label: "Pet Service", path: "/petservices" },
    { key: "shop-by-brand", label: "Shop by Brand" },
    { key: "shop-by-breed", label: "Shop by Breed" },
    { key: "consult-vet", label: "Consult a Vet", path: "/consult-vet" },
  ];
  const navItems = Array.isArray(items) && items.length ? items : defaultItems;

  const [activeKey, setActiveKey] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const narrowKeys = ["small-pets", "pet-service"];

  // wrapper ref (we measure positions relative to this container)
  const wrapperRef = useRef(null);
  // store refs to each nav button (we store caret button here)
  const itemRefs = useRef({});
  // store measured centerX (px) relative to wrapper left
  const [centerX, setCenterX] = useState(null);

  const fetchMenu = async (key) => {
    setLoading(true);
    try {
      const res = await api.get(`/mega-menus/${key}/`);
      setMenuData(res.data || null);
    } catch (err) {
      console.error("MegaMenu fetch error:", err);
      setMenuData(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleKey = (it) => {
    // for consult-vet we don't show mega menu
    if (it.key === "consult-vet") {
      setActiveKey(null);
      setMenuData(null);
      setCenterX(null);
      return;
    }

    if (activeKey === it.key) {
      setActiveKey(null);
      setMenuData(null);
      setCenterX(null);
    } else {
      setActiveKey(it.key);
      fetchMenu(it.key);

      // measure center position relative to wrapper for narrow boxes
      requestAnimationFrame(() => {
        const btn = itemRefs.current[it.key];
        const wrapper = wrapperRef.current;
        if (btn && wrapper && btn.getBoundingClientRect && wrapper.getBoundingClientRect) {
          const btnRect = btn.getBoundingClientRect();
          const wrapRect = wrapper.getBoundingClientRect();
          const center = btnRect.left - wrapRect.left + btnRect.width / 2;
          setCenterX(Math.round(center)); // integer px
        } else {
          setCenterX(null);
        }
      });
    }
  };

  // close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setActiveKey(null);
        setMobileOpen(false);
        setCenterX(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setActiveKey(null);
        setMobileOpen(false);
        setCenterX(null);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // recalc center on resize if active
  useEffect(() => {
    function handleResize() {
      if (activeKey && itemRefs.current[activeKey] && wrapperRef.current) {
        const btnRect = itemRefs.current[activeKey].getBoundingClientRect();
        const wrapRect = wrapperRef.current.getBoundingClientRect();
        const center = btnRect.left - wrapRect.left + btnRect.width / 2;
        setCenterX(Math.round(center));
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeKey]);

  return (
    <div ref={wrapperRef}>
      <div className="bg-[#1C49C2] text-white">
        <div className="px-2">
          {/* Desktop nav */}
          <nav className="hidden md:block">
            <ul className="flex justify-center gap-6 md:gap-4 lg:gap-10 items-center text-sm py-2">
              {navItems.map((it) => (
                <li key={it.key} className="flex items-center">
                  {/* If item has a path but is not consult-vet, render a Link for navigation
                      and a small caret button for dropdown (so both navigation and dropdown exist). */}
                  {it.path && it.key !== "consult-vet" ? (
                    <div className="flex items-center gap-2">
                      {/* clickable label / navigation */}
                      <Link
                        to={it.path}
                        className="inline-flex items-center gap-2 font-bold px-1 py-1 whitespace-nowrap hover:text-[#ffff02]"
                        onClick={() => {
                          // if a dropdown is open for a different key, keep it closed when navigating
                          // this preserves dropdown behavior and doesn't automatically open it
                          setActiveKey(null);
                          setMenuData(null);
                          setCenterX(null);
                        }}
                      >
                        {it.label}
                      </Link>

                      {/* caret button to open mega menu (store ref here) */}
                      <button
                        ref={(el) => (itemRefs.current[it.key] = el)}
                        type="button"
                        onClick={() => toggleKey(it)}
                        className={`inline-flex items-center gap-2 font-bold px-1 py-1 whitespace-nowrap ${
                          activeKey === it.key ? "text-[#ffff02]" : "hover:text-[#ffff02]"
                        }`}
                        aria-expanded={activeKey === it.key}
                        aria-controls={activeKey === it.key ? `${it.key}-mega` : undefined}
                        aria-label={`${it.label} menu`}
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </div>
                  ) : it.key === "consult-vet" ? (
                    // consult-vet remains a direct link (no dropdown)
                    <Link
                      to={it.path || "#"}
                      className="inline-flex items-center gap-2 font-bold px-1 py-1 whitespace-nowrap hover:text-[#ffff02]"
                    >
                      {it.label}
                    </Link>
                  ) : (
                    // normal items (no path) behave like before (open dropdown on click)
                    <button
                      ref={(el) => (itemRefs.current[it.key] = el)}
                      type="button"
                      onClick={() => toggleKey(it)}
                      className={`inline-flex items-center gap-2 font-bold px-1 py-1 whitespace-nowrap ${
                        activeKey === it.key ? "text-[#ffff02]" : "hover:text-[#ffff02]"
                      }`}
                      aria-expanded={activeKey === it.key}
                      aria-controls={activeKey === it.key ? `${it.key}-mega` : undefined}
                    >
                      <span>{it.label}</span>
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile nav */}
          <div className="md:hidden flex items-center justify-between py-2">
            <span className="font-bold">Menu</span>
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="p-2 rounded-md hover:bg-blue-500 focus:outline-none"
              aria-expanded={mobileOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu items */}
          {mobileOpen && (
            <ul className="flex flex-col gap-2 text-sm pb-3">
              {navItems.map((it) => (
                <li key={it.key}>
                  {it.path && it.key !== "consult-vet" ? (
                    <>
                      {/* label link navigates */}
                      <Link
                        to={it.path}
                        className="block font-bold px-2 py-1 hover:text-[#ffff02]"
                        onClick={() => setMobileOpen(false)}
                      >
                        {it.label}
                      </Link>

                      {/* still provide a toggle to open inline menu */}
                      <button
                        type="button"
                        onClick={() => toggleKey(it)}
                        className={`w-full flex justify-between items-center font-bold px-2 py-1 ${
                          activeKey === it.key ? "text-[#ffff02]" : "hover:text-[#ffff02]"
                        }`}
                      >
                        <span className="sr-only">Toggle {it.label} menu</span>
                        <span>{activeKey === it.key ? "−" : "+"}</span>
                      </button>

                      {activeKey === it.key && (
                        <div className="pl-4">
                          {loading ? (
                            <div className="text-xs text-gray-400 py-2">Loading...</div>
                          ) : menuData ? (
                            // mobile: pass full menu for MegaMenu so it can render brands/images
                            <MegaMenu menu={menuData} activeKey={activeKey} centerX={centerX} narrowKeys={narrowKeys} />
                          ) : (
                            <div className="text-xs text-gray-400 py-2">No items</div>
                          )}
                        </div>
                      )}
                    </>
                  ) : it.key === "consult-vet" ? (
                    <Link
                      to={it.path || "#"}
                      className="block font-bold px-2 py-1 hover:text-[#ffff02]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {it.label}
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleKey(it)}
                        className={`w-full flex justify-between items-center font-bold px-2 py-1 ${
                          activeKey === it.key ? "text-[#ffff02]" : "hover:text-[#ffff02]"
                        }`}
                      >
                        {it.label}
                        <span className="ml-2">{activeKey === it.key ? "−" : "+"}</span>
                      </button>

                      {activeKey === it.key && (
                        <div className="pl-4">
                          {loading ? (
                            <div className="text-xs text-gray-400 py-2">Loading...</div>
                          ) : menuData ? (
                            <MegaMenu menu={menuData} activeKey={activeKey} centerX={centerX} narrowKeys={narrowKeys} />
                          ) : (
                            <div className="text-xs text-gray-400 py-2">No items</div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Mega menu (desktop only). It renders directly below nav as a new row. */}
      {activeKey && (
        <>
          {loading ? (
            <div className="hidden md:block w-full bg-white py-6 text-center text-sm text-gray-500">Loading...</div>
          ) : menuData ? (
            <div id={`${activeKey}-mega`} aria-live="polite" className="hidden md:block">
              <MegaMenu menu={menuData} activeKey={activeKey} centerX={centerX} narrowKeys={narrowKeys} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
