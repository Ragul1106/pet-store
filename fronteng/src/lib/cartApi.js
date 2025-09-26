// src/lib/cartApi.js
import axios from "axios";

const API_ROOT = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/+$/, "");
const CART_API_ROOT = API_ROOT.endsWith("/api") ? API_ROOT : `${API_ROOT}/api`;

function getToken() {
  return localStorage.getItem("cart_token");
}
function setToken(t) {
  if (!t) return;
  localStorage.setItem("cart_token", t);
}
function getHeaders() {
  const headers = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) headers["X-Cart-Token"] = t;
  return headers;
}
function saveTokenFromResponse(resp) {
  const token = resp?.headers?.["x-cart-token"] || resp?.data?.token;
  if (token) setToken(token);
}

// Fetch entire cart
export async function fetchCart() {
  const res = await axios.get(`${CART_API_ROOT}/cart/`, { headers: getHeaders() });
  saveTokenFromResponse(res);
  return res.data;
}

// Add product to cart and return cart payload
export async function addToCart(product_id, quantity = 1) {
  const res = await axios.post(
    `${CART_API_ROOT}/cart/add/`,
    { product_id, quantity },
    { headers: getHeaders() }
  );
  saveTokenFromResponse(res);
  return res.data;
}

// Update item quantity -> returns cart payload
export async function updateItem(itemId, quantity) {
  const res = await axios.patch(`${CART_API_ROOT}/cart/${itemId}/`, { quantity }, { headers: getHeaders() });
  saveTokenFromResponse(res);
  return res.data;
}

// Delete item -> returns cart payload
export async function deleteItem(itemId) {
  const res = await axios.delete(`${CART_API_ROOT}/cart/${itemId}/`, { headers: getHeaders() });
  saveTokenFromResponse(res);
  return res.data;
}

// Clear cart -> returns cart payload
export async function clearCart() {
  const res = await axios.post(`${CART_API_ROOT}/cart/clear/`, {}, { headers: getHeaders() });
  saveTokenFromResponse(res);
  return res.data;
}
