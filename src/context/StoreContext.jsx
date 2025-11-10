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

const StoreContextProvider = (props) => {
  const url = "https://ajay-cafe-1.onrender.com"; 

  const [foodList, setFoodList] = useState([]); 
  const [menuList, setMenuList] = useState([]); 
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [userType, setUserType] = useState("user"); 

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

  const fetchFoodList = async () => {
    try {
      const res = await axios.get("/api/foods/allFoods");
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

  // ===== Cart helpers (local) =====
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

  // normalize backend -> local map { [foodId]: {quantity, notes} }
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

  // ===== Cart: load from backend =====
  const loadCardData = async (jwt) => {
    if (!jwt) return;
    try {
      const res = await axios.get("/api/cart/MyCart", {
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

  // ===== Init =====
  useEffect(() => {
    (async () => {
      await fetchFoodList();
      const stored = localStorage.getItem("token");
      if (stored) {
        setToken(stored);
        const savedRole = localStorage.getItem("userType") || "user";
        setUserType(savedRole);
        await loadCardData(stored);
      }
    })();
  }, []);

  // ===== Cart API actions (Bearer) =====
  const addToCart = async (id, notes = "") => {
    const newQty = getCartQuantity(id) + 1;
    const prevNotes = getCartNotes(id);
    setLocalQty(id, newQty, notes || prevNotes); // optimistic

    if (!token) return;
    try {
      // backend expects absolute quantity or increment is okay?
      // To be safe, we call /add with quantity 1 (increment on server),
      // OR you can send newQty if your server overwrites.
      await axios.post(
        "/api/cart/add",
        { foodId: id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      setLocalQty(id, newQty - 1, prevNotes); // rollback
      toast.error("Failed to add to cart");
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
        "/api/cart/updateCart",
        { foodId: id, quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      setLocalQty(id, current, prevNotes); // rollback
      toast.error("Failed to update cart");
    }
  };

  const removeItemCompletely = async (id) => {
    const backup = cartItems[id];
    setLocalQty(id, 0); // optimistic

    if (!token) return toast.error("Please login first");
    try {
      await axios.delete(`/api/cart/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Item removed");
    } catch (e) {
      setLocalQty(id, backup?.quantity || 0, backup?.notes || ""); // rollback
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    const backup = cartItems;
    setCartItems({}); // optimistic

    if (!token) return;
    try {
      await axios.delete("/api/cart/clear", {
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
      const info = food_list.find((f) => f._id === id);
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

    // cart helpers
    getCartQuantity,
    getCartNotes,
    updateCartNotes,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    clearCart,
    getTotalCartAmount,
    getTotalCartItems,

    // auth / role
    token,
    setToken,
    userType,
    setUserType,
    fetchPopularItems,
    fetchSimilarItems,
    sendChatMessage,
    checkChatApiStatus,
    getTotalCartAmount,
    getTotalCartItems,
    loadCardData,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
