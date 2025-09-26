// src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as cartApi from "../lib/cartApi";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0, item_count: 0, token: null });
  const [loading, setLoading] = useState(true);

  // load cart once on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await cartApi.fetchCart();
        if (!mounted) return;
        setCart({
          items: data.items || [],
          subtotal: data.subtotal || 0,
          item_count: data.item_count || 0,
          token: data.token || localStorage.getItem("cart_token"),
        });
      } catch (e) {
        // ignore, keep empty cart
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // helper to set cart state from server payload
  const setCartFromPayload = useCallback((payload) => {
    setCart({
      items: payload.items || [],
      subtotal: payload.subtotal || 0,
      item_count: payload.item_count || 0,
      token: payload.token || localStorage.getItem("cart_token"),
    });
  }, []);

  // actions
  const add = useCallback(async (productId, quantity = 1) => {
    const payload = await cartApi.addToCart(productId, quantity);
    setCartFromPayload(payload);
    return payload;
  }, [setCartFromPayload]);

  const update = useCallback(async (itemId, quantity) => {
    const payload = await cartApi.updateItem(itemId, quantity);
    setCartFromPayload(payload);
    return payload;
  }, [setCartFromPayload]);

  const remove = useCallback(async (itemId) => {
    const payload = await cartApi.deleteItem(itemId);
    setCartFromPayload(payload);
    return payload;
  }, [setCartFromPayload]);

  const clear = useCallback(async () => {
    const payload = await cartApi.clearCart();
    setCartFromPayload(payload);
    return payload;
  }, [setCartFromPayload]);

  const refresh = useCallback(async () => {
    const payload = await cartApi.fetchCart();
    setCartFromPayload(payload);
    return payload;
  }, [setCartFromPayload]);

  const value = {
    cart,
    loading,
    add,
    update,
    remove,
    clear,
    refresh,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// convenience hook
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
