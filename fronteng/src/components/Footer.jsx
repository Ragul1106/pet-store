import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import FacebookIcon from "../assets/fb.png";
import InstagramIcon from "../assets/insta.png";
import YoutubeIcon from "../assets/yt.png";
import WhatsappIcon from "../assets/wp.png";
import logo from "../assets/logo.png";

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api
      .get("/site-settings/")
      .then((res) => setSettings(res.data || {}))
      .catch((err) => console.error("Failed to load site settings", err));
  }, []);

  const phone = settings?.phone || "+91-1234567890";
  const email = settings?.email || "support@petpalooza.com";


  return (
    <footer className="bg-[#1C49C2] text-white py-10 px-6 md:px-12 lg:px-20">
      
      {/* Logo Row */}
      <div className="mb-8">
        <img src={logo} alt="logo" className="h-12" />
      </div>

      {/* Columns below logo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
        
        {/* PetPalooza Links */}
        <div>
          <h3 className="font-bold mb-3">PetPalooza</h3>
          <ul className="space-y-1 text-sm">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-bold mb-3">Categories</h3>
          <ul className="space-y-1 text-sm">
            <li><Link to="/categories/dog">Dog</Link></li>
            <li><Link to="/categories/cat">Cat</Link></li>
            <li><Link to="/categories/fish">Fish</Link></li>
            <li><Link to="/categories/rats">Rats</Link></li>
            <li><Link to="/categories/rabbits">Rabbits</Link></li>
            <li><Link to="/categories/hamsters">Hamsters</Link></li>
            <li><Link to="/categories/guinea-pigs">Guinea pigs</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-bold mb-3">Support</h3>
          <ul className="space-y-1 text-sm">
            <li><Link to="/privacy-policy">Privacy policy</Link></li>
            <li><Link to="/refund-policy">Refund & returns policy</Link></li>
            <li><Link to="/shipping-policy">Shipping policy</Link></li>
            <li><Link to="/terms">Terms & conditions</Link></li>
          </ul>
        </div>

        {/* Follow + Get in Touch */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h3 className="font-bold">Follow:</h3>
            <div className="flex gap-3">
              <Link to="#"><img src={FacebookIcon} alt="Facebook" className="w-6 h-6" /></Link>
              <Link to="#"><img src={InstagramIcon} alt="Instagram" className="w-6 h-6" /></Link>
              <Link to="#"><img src={YoutubeIcon} alt="YouTube" className="w-6 h-6" /></Link>
              <Link to="#"><img src={WhatsappIcon} alt="WhatsApp" className="w-6 h-6" /></Link>
            </div>
          </div>
          <h3 className="font-bold mb-2">Get in Touch</h3>
          <p className="text-sm">Call: {phone}</p>
          <p className="text-sm">Email: {email}</p>
        </div>

        {/* Subscribe */}
        <div>
          <h3 className="font-bold mb-3">Subscribe</h3>
          <div className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              className="px-3 py-2 bg-white text-black placeholder:text-black font-bold rounded"
            />
            <button className="bg-white text-black font-semibold py-2 rounded hover:bg-gray-100">
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
