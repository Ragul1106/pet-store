// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Pets from "./pages/Pets";
import Login from "./pages/Login";
import Home from "./pages/HomePage";
import Contact from "./pages/Contact";
import About from "./pages/AboutPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/Cart";
import Checkout from "./pages/checkout";
import ConsultNow from "./pages/ConsultNow";
import ConsultVet from "./pages/ConsultVet";
import PetServices from "./pages/PetServicespage";
import OrderComplete from "./pages/OrderComplete";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
         
         

          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Pets page: only allowed pet types are handled inside the Pets component */}
          <Route path="/pets/:petType" element={<Pets />} />

          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/petservices" element={<PetServices />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-complete/:identifier" element={<OrderComplete />} />

        
          
          <Route path="/consult-vet" element={<ConsultVet />} />
          <Route path="/consult-now" element={<ConsultNow />} />


          {/* Fallback route: optional 404 UI */}
          <Route
            path="*"
            element={
              <div className="p-8 text-center">
                <h2 className="text-xl font-semibold">Page not found</h2>
                <p className="text-gray-500">We couldn't find that page.</p>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
