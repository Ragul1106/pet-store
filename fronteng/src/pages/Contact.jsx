// src/pages/Contact.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BsTruck, BsChatText } from "react-icons/bs";
import payment from "../assets/conPay.png";
import contactBox from "../assets/contactbox.png";
import contactreturn from "../assets/contactreturn.png";
// axios import left in case you re-enable the form
import axios from "axios";

export default function Contact() {
  // contact form state is kept commented for now
  // const [form, setForm] = useState({
  //   name: "",
  //   email: "",
  //   phone: "",
  //   subject: "",
  //   message: "",
  // });
  // const [sending, setSending] = useState(false);
  // const [sentOk, setSentOk] = useState(null);
  const API_ROOT = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "";

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setForm((f) => ({ ...f, [name]: value }));
  // };

  // const submit = async (e) => {
  //   e.preventDefault();
  //   setSending(true);
  //   setSentOk(null);
  //   try {
  //     await axios.post(`${API_ROOT}/api/contact/messages/`, form);
  //     setSentOk(true);
  //     setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  //   } catch (err) {
  //     console.error("Contact submit failed", err);
  //     setSentOk(false);
  //   } finally {
  //     setSending(false);
  //     setTimeout(() => setSentOk(null), 4000);
  //   }
  // };

  const QuickCard = ({ title, subtitle, icon, to = "#" }) => (
    <Link to={to} className="group block rounded-xl border p-6 bg-white hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-white text-lg">
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-lg">{title}</div>
          <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
        </div>
        <div className="ml-4 flex items-center">
          <div className="h-8 w-8 rounded-full border flex items-center justify-center text-blue-600 group-hover:bg-blue-50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );

  const TopicCard = ({ children }) => (
    <div className="rounded-xl border p-5 bg-white flex items-center justify-between">
      <div className="text-sm text-gray-700">{children}</div>
      <div className="ml-4 h-8 w-8 rounded-full border flex items-center justify-center text-blue-600">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:underline">Home</Link> / <span className="font-medium">Contact</span>
      </div>

      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

      {/* Hero help box */}
      <div className="rounded-xl border p-6 mb-8 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full border flex items-center justify-center text-2xl">👤</div>
          <div>
            <div className="font-medium">Getting help is easy</div>
            <div className="text-sm text-gray-500">Sign in to get help with recent orders</div>
          </div>
        </div>

        <div>
          <Link to="/signin" className="rounded-md bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700">Sign in</Link>
        </div>
      </div>

      {/* Quick Links */}
      <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
        <QuickCard
          icon={<BsTruck className="w-6 h-6" />}
          title="Track order"
          subtitle="View the status of your order"
          to="/track-order"
        />

        <QuickCard
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 7h6l4 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          title="Return order"
          subtitle="Return and view the items in your order"
          to="/returns"
        />

        <QuickCard
          icon={<BsChatText className="w-6 h-6" />}
          title="Chat with vet"
          subtitle="Talk to a vet for advice"
          to="/chat-vet"
        />
      </div>

      {/* Browse Topics */}
      <h3 className="text-lg font-semibold mb-4">Browse Topics</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <TopicCard>Order related</TopicCard>

        <TopicCard>
          <div className="flex items-center gap-2">
            <img src={contactreturn} alt="returns" className="h-6 w-6 object-contain" />
            <span>Return & cancellations related</span>
          </div>
        </TopicCard>

        <TopicCard>
          <div className="flex items-center gap-2">
            <img src={payment} alt="payments" className="h-6 w-6 object-contain" />
            <span>Payments & refund related</span>
          </div>
        </TopicCard>

        <TopicCard>General enquiry</TopicCard>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold mb-3">Get in touch</h3>
          <p className="mb-6 text-gray-600">If you have any inquiries, feel free to contact us</p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full border flex items-center justify-center">📞</div>
              <div>
                <div className="font-medium">Call to 1234567890</div>
                {/* <div className="text-sm text-gray-500">Available 9am — 6pm</div> */}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full border flex items-center justify-center">✉️</div>
              <div>
                <div className="font-medium">support@petpalooza.com</div>
                {/* <div className="text-sm text-gray-500">We respond within 24 hours</div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




{/* <div>
          <form onSubmit={submit} className="rounded-xl border p-6 bg-white shadow-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input required name="name" value={form.name} onChange={handleChange} placeholder="Full name" className="border rounded px-3 py-2" />
              <input required name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border rounded px-3 py-2" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-3">
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (optional)" className="border rounded px-3 py-2" />
              <input name="subject" value={form.subject} onChange={handleChange} placeholder="Subject" className="border rounded px-3 py-2" />
            </div>

            <textarea name="message" required value={form.message} onChange={handleChange} placeholder="Write your message" rows="5" className="border rounded px-3 py-2 mt-3 w-full" />

            <div className="mt-4 flex items-center gap-3">
              <button disabled={sending} className="rounded bg-blue-600 px-5 py-2 text-white font-semibold hover:bg-blue-700">
                {sending ? "Sending..." : "Send message"}
              </button>
              {sentOk === true && <div className="text-green-600">Message sent ✓</div>}
              {sentOk === false && <div className="text-red-600">Failed to send</div>}
            </div>
          </form>
        </div> */}