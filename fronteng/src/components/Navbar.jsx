// src/components/Navbar.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../lib/api";

import { FiSearch } from "react-icons/fi";
import { useCart } from "../context/CartContext";

import PhoneIcon from "../assets/phone.png";
import MailIcon from "../assets/mail.png";
import UserIcon from "../assets/user.png";
import CartIcon from "../assets/cart.png";
import SecondaryNav from "./secondaryNav";

export default function Navbar() {
  const [settings, setSettings] = useState(null);
  const [open, setOpen] = useState(false); // mobile main menu
  const [user, setUser] = useState(null);
  const [userMenu, setUserMenu] = useState(false);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("access"));

  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // Search state
  const [query, setQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchInputRef = useRef(null);

  // cart from context
  const { cart } = useCart();
  const cartCount = (cart && typeof cart.item_count === "number") ? cart.item_count : 0;

  // Restore axios auth header if token exists
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  // Load site settings
  useEffect(() => {
    let mounted = true;
    api
      .get("/site-settings/")
      .then((res) => {
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setSettings(data || {});
      })
      .catch((err) => {
        console.error("Failed to load site settings", err);
      });
    return () => (mounted = false);
  }, []);

  const phone = settings?.phone || "+91-1234567890";
  const email = settings?.email || "Support@petpalooza.com";
  const logo = settings?.logo_url || null;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  // Listen for login/logout events
  useEffect(() => {
    function onStorage(e) {
      if (e.key === "access") {
        setAccessToken(localStorage.getItem("access"));
      }
    }
    function onAuthChange() {
      setAccessToken(localStorage.getItem("access"));
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("authChanged", onAuthChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("authChanged", onAuthChange);
    };
  }, []);

  // Fetch current user when token changes
  useEffect(() => {
    if (!accessToken) {
      setUser(null);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/account/me/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (mounted) setUser(res.data || null);
      } catch (err) {
        console.warn("Invalid token, clearing.", err);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
        setAccessToken(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenu(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleLogout = () => {
    // Remove tokens + cached user
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    // Clear axios header
    delete api.defaults.headers.common["Authorization"];

    // Reset state
    setUser(null);
    setAccessToken(null);
    setUserMenu(false);

    // Notify other tabs/components
    window.dispatchEvent(new Event("authChanged"));

    // Redirect to login
    navigate("/login");
  };

  // Search submit handler — navigates to /search?query=...
  const handleSearchSubmit = (e) => {
    e && e.preventDefault();
    const q = (query || "").trim();
    if (!q) return;
    navigate(`/search?query=${encodeURIComponent(q)}`);
    setQuery("");
    setShowMobileSearch(false);
  };

  // On mobile when showing search, focus input
  useEffect(() => {
    if (showMobileSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showMobileSearch]);

  return (
    <header className="w-full">
      {/* Top strip */}
      <div className="bg-gray-100 text-gray-800">
        <div className="px-4 h-10 flex items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <img src={PhoneIcon} alt="phone" className="w-4 h-4" />
              <span className="text-[10px] md:text-sm">{phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <img src={MailIcon} alt="mail" className="w-4 h-4" />
              <span className="text-[10px] md:text-sm">{email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="bg-[#1C49C2] text-white">
        <div className="px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: logo + search */}
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex items-center">
                {logo ? (
                  <Link to="/">
                    <img src={logo} alt="logo" className="h-12 w-auto" />
                  </Link>
                ) : (
                  <Link to="/" className="text-white text-xl font-bold">
                    PetPalooza
                  </Link>
                )}
              </div>

              {/* Desktop / tablet search bar (visible from sm and up) */}
              <form
                onSubmit={handleSearchSubmit}
                className="hidden sm:flex items-center bg-white rounded-full px-3 py-2 w-[420px] md:w-[560px] focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-white/30"
                role="search"
                aria-label="Search for products"
              >
                <FiSearch className="w-5 h-5 text-gray-500 mr-2" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products"
                  className="flex-1 bg-transparent outline-none text-black placeholder:text-gray-400"
                  aria-label="Search"
                />
                <button type="submit" className="sr-only">Search</button>
              </form>

              {/* Mobile: compact search icon (visible on xs) */}
              <div className="sm:hidden">
                {showMobileSearch ? (
                  <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-full px-2 py-1 w-[70vw]">
                    <FiSearch className="w-5 h-5 text-gray-500 mr-2" />
                    <input
                      ref={searchInputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search for products"
                      className="flex-1 bg-transparent outline-none text-black placeholder:text-gray-400"
                      aria-label="Mobile search"
                    />
                    <button type="button" onClick={() => setShowMobileSearch(false)} className="ml-2 text-sm text-[#0045ff]">Close</button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowMobileSearch(true)}
                    className="p-2 rounded-md hover:bg-blue-600"
                    aria-label="Open search"
                  >
                    <FiSearch className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: links + user + cart */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`font-bold hover:text-[#ffff02] ${
                      location.pathname === link.path ? "text-[#ffff02]" : ""
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* User login / dropdown */}
                {!user ? (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 font-bold hover:text-[#ffff02]"
                  >
                    <img src={UserIcon} alt="user" className="w-5 h-5" />
                    <span>Log In</span>
                  </Link>
                ) : (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenu((s) => !s)}
                      className="flex items-center gap-2 font-bold hover:text-[#ffff02]"
                    >
                      <img src={UserIcon} alt="user" className="w-6 h-6" />
                      <span>{user.first_name || user.username || user.email}</span>
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {userMenu && (
                      <div className="absolute right-0 mt-2 w-36 bg-white text-black rounded shadow-lg z-40">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative flex items-center gap-2 font-bold hover:text-[#ffff02]"
                >
                  <img src={CartIcon} alt="cart" className="w-6 h-6" />
                  <span>Cart</span>

                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Hamburger for mobile */}
              <div className="lg:hidden flex items-center gap-2">
                {/* show cart icon on mobile with badge */}
                <Link to="/cart" className="p-2 relative">
                  <img src={CartIcon} alt="cart" className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-0 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => setOpen(!open)}
                  aria-label="Toggle menu"
                  className="p-2"
                >
                  {open ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {open && (
            <div className="lg:hidden px-3 pb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block py-2 font-bold text-white hover:text-[#ffff02] ${
                    location.pathname === link.path ? "text-[#ffff02]" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {!user ? (
                <Link
                  to="/login"
                  className="flex items-center gap-2 py-2 font-bold text-white hover:text-[#ffff02]"
                  onClick={() => setOpen(false)}
                >
                  <img src={UserIcon} alt="user" className="w-5 h-5" />
                  <span>Log In</span>
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-2 font-bold text-white hover:text-[#ffff02]"
                >
                  <img src={UserIcon} alt="user" className="w-5 h-5" />
                  <span>Logout ({user.first_name || user.username})</span>
                </button>
              )}

              <Link
                to="/cart"
                className="relative flex items-center gap-2 py-2 font-bold text-white hover:text-[#ffff02]"
                onClick={() => setOpen(false)}
              >
                <img src={CartIcon} alt="cart" className="w-6 h-6" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Secondary nav (mega menu) */}
      <SecondaryNav />
    </header>
  );
}
