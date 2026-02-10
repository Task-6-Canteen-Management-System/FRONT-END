import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import {
  fetchPopularItems,
  fetchSimilarItems,
  fetchMenu,
} from "../config/recommendationApi";
import { sendChatMessage, checkChatApiStatus } from "../config/chatApi";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const url = "https://ajay-cafe-1.onrender.com";

  const [foodList, setFoodList] = useState([]);
  const [menuList, setMenuList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [userType, setUserType] = useState("user");
  const [userId, setUserId] = useState("");

  const extractUserIdFromToken = (jwt) => {
    try {
      const parts = jwt.split(".");
      if (parts.length !== 3) return "";
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      return payload?.id || payload?._id || payload?.userId || "";
    } catch (_e) {
      return "";
    }
  };

  // ===== Load menu from ML API =====
  useEffect(() => {
    const loadMenu = async () => {
      const result = await fetchMenu();
      if (result.success && result.data) {
        setMenuList(result.data);
        console.log("✅ Menu loaded from ML API:", result.data);
      } else {
        console.error("❌ Failed to load menu:", result.error);
      }
    };
    loadMenu();
  }, []);

  // ===== Fetch food list from backend =====
  const fetchFoodList = async () => {
    try {
      const res = await axios.get(`${url}/api/foods/allFoods`);
      if (res.data?.success) {
        setFoodList(res.data.data || []);
      } else {
        toast.error(res.data?.message || "Error fetching food list");
      }
    } catch (e) {
      console.error("Food fetch error:", e);
      toast.error("Network error while fetching food.");
    }
  };

  // ===== Cart helpers =====
  const getCartQuantity = (id) => cartItems[id]?.quantity || 0;
  const getCartNotes = (id) => cartItems[id]?.notes || "";

  const setLocalQty = (id, qty, notes) => {
    setCartItems((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = { quantity: qty, notes: notes ?? prev[id]?.notes ?? "" };
      return next;
    });
  };

  const normalizeCart = (data) => {
    const map = {};
    const items = data?.items || [];
    for (const it of items) {
      const id = it?.foodId?._id || it?.foodId || it?._id;
      if (!id) continue;
      map[id] = { quantity: Number(it.quantity || 0), notes: "" };
    }
    return map;
  };

  // ===== Load cart from backend =====
  const loadCartData = async (jwt) => {
    if (!jwt) return;
    try {
      const res = await axios.get(`${url}/api/cart/MyCart`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.data?.success) {
        setCartItems(normalizeCart(res.data.data));
      } else {
        setCartItems({});
      }
    } catch (e) {
      console.error("Load cart error:", e?.response || e);
      setCartItems({});
    }
  };

  // ===== Initialize =====
  useEffect(() => {
    (async () => {
      await fetchFoodList();
      const stored = localStorage.getItem("token");
      if (stored) {
        setToken(stored);
        const savedRole = localStorage.getItem("userType") || "user";
        setUserType(savedRole);
        // try to restore userId from storage or from token payload
        const savedUserId = localStorage.getItem("userId") || extractUserIdFromToken(stored);
        if (savedUserId) {
          setUserId(savedUserId);
          localStorage.setItem("userId", savedUserId);
        }
        await loadCartData(stored);
      }
    })();
  }, []);

  // ===== Cart API actions =====
  const addToCart = async (id, notes = "") => {
    const newQty = getCartQuantity(id) + 1;
    const prevNotes = getCartNotes(id);
    setLocalQty(id, newQty, notes || prevNotes); // optimistic

    if (!token) {
      // rollback optimistic change if user is not logged in
      setLocalQty(id, newQty - 1, prevNotes);
      toast.error("Please login to add items to cart");
      return;
    }
    try {
      await axios.post(
        `${url}/api/cart/add`,
        { foodId: id, quantity: 1, userId: userId || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      setLocalQty(id, newQty - 1, prevNotes);
      const message =
        e?.response?.data?.message ||
        (e?.response?.status === 401 ? "Session expired. Please login again." : null) ||
        "Failed to add to cart";
      toast.error(message);
    }
  };

  const removeFromCart = async (id) => {
    const current = getCartQuantity(id);
    if (current <= 0) return;

    const newQty = current - 1;
    const prevNotes = getCartNotes(id);
    setLocalQty(id, newQty, prevNotes); // optimistic

    if (!token) return;
    try {
      await axios.put(
        `${url}/api/cart/updateCart`,
        { foodId: id, quantity: newQty, userId: userId || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      setLocalQty(id, current, prevNotes);
      toast.error("Failed to update cart");
    }
  };

  const removeItemCompletely = async (id) => {
    const backup = cartItems[id];
    setLocalQty(id, 0); // optimistic

    if (!token) return toast.error("Please login first");
    try {
      await axios.delete(`${url}/api/cart/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Item removed");
    } catch (e) {
      setLocalQty(id, backup?.quantity || 0, backup?.notes || "");
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    const backup = cartItems;
    setCartItems({}); // optimistic

    if (!token) return;
    try {
      await axios.delete(`${url}/api/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      setCartItems(backup); // rollback
      toast.error("Failed to clear cart");
    }
  };

  const updateCartNotes = (id, notes) => {
    setCartItems((prev) => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], notes } };
    });
    toast.success("Notes updated");
  };

  // ===== Totals =====
  const getTotalCartAmount = () =>
    Object.keys(cartItems).reduce((sum, id) => {
      const info = foodList.find((f) => f._id === id);
      return info ? sum + (info.price || 0) * (cartItems[id].quantity || 0) : sum;
    }, 0);

  const getTotalCartItems = () =>
    Object.keys(cartItems).reduce((n, id) => n + (cartItems[id].quantity || 0), 0);

  // ===== Context value =====
  const contextValue = {
    url,
    food_list: menuList.length > 0 ? menuList : foodList,
    cartItems,
    setCartItems,
    userId,
    setUserId,
    getCartQuantity,
    getCartNotes,
    updateCartNotes,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    clearCart,
    getTotalCartAmount,
    getTotalCartItems,
    token,
    setToken,
    userType,
    setUserType,
    fetchPopularItems,
    fetchSimilarItems,
    sendChatMessage,
    checkChatApiStatus,
    loadCartData,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
