import api from "./api";

export async function createOrder(payload) {
  const res = await api.post("/orders/create", payload, {
    headers: {
      "X-Cart-Token": localStorage.getItem("cart_token") || "",
    },
  });
  return res.data;
}
