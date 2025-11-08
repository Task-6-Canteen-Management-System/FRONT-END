import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchRecommendations } from "../config/recommendationApi";
import { sendChatMessage, checkChatApiStatus } from "../config/chatApi";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "https://ajay-cafe-1.onrender.com";
  const [foodList, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [userType, setUserType] = useState("user"); // "user" or "admin"

  // --- Fetch all food items ---
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/foods/allFoods`);
      if (response.data.success) {
        setFoodList(response.data.data);
      } else {
        toast.error("Error fetching food list.");
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
      toast.error("Network error while fetching food.");
    }
  };

  // --- Load user's cart ---
  const loadCardData = async (token) => {
    try {
      const response = await axios.post(
        `${url}/api/cart/get`,
        {},
        { headers: { token } }
      );
      setCartItems(response.data.cartData || {});
    } catch (error) {
      console.error("Failed to load cart data", error);
      setCartItems({});
    }
  };

  // --- On mount ---
  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        const savedUserType = localStorage.getItem("userType") || "user";
        setUserType(savedUserType);
        await loadCardData(storedToken);
      }
    }
    loadData();
  }, []);

  // --- Cart Helpers ---
  const getCartQuantity = (itemId) => {
    const item = cartItems[itemId];
    if (!item) return 0;
    if (typeof item === "number") return item;
    return item.quantity || 0;
  };

  const getCartNotes = (itemId) => {
    const item = cartItems[itemId];
    if (!item || typeof item === "number") return "";
    return item.notes || "";
  };

  const updateCartNotes = (itemId, notes) => {
    setCartItems((prev) => {
      const currentItem = prev[itemId];
      if (!currentItem) return prev;
      if (typeof currentItem === "number") {
        return { ...prev, [itemId]: { quantity: currentItem, notes } };
      }
      return { ...prev, [itemId]: { ...currentItem, notes } };
    });
  };

  // --- Add to Cart ---
  const addToCart = async (itemId, notes = "") => {
    setCartItems((prev) => {
      const currentItem = prev[itemId];
      if (!currentItem)
        return { ...prev, [itemId]: { quantity: 1, notes } };
      if (typeof currentItem === "number")
        return { ...prev, [itemId]: { quantity: currentItem + 1, notes } };
      return {
        ...prev,
        [itemId]: {
          quantity: currentItem.quantity + 1,
          notes: notes || currentItem.notes,
        },
      };
    });

    if (token) {
      try {
        const response = await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          { headers: { token } }
        );
        if (response.data.success) toast.success("Item Added to Cart");
        else toast.error(response.data.message || "Error adding to cart");
      } catch (error) {
        toast.error("Failed to update cart");
      }
    }
  };

  // --- Remove from Cart ---
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const currentItem = prev[itemId];
      if (!currentItem) return prev;

      if (typeof currentItem === "number") {
        const newQty = currentItem - 1;
        if (newQty <= 0) {
          const { [itemId]: removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [itemId]: newQty };
      } else {
        const newQty = currentItem.quantity - 1;
        if (newQty <= 0) {
          const { [itemId]: removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [itemId]: { ...currentItem, quantity: newQty } };
      }
    });

    if (token) {
      try {
        const response = await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          { headers: { token } }
        );
        if (response.data.success) toast.success("Item Removed from Cart");
        else toast.error(response.data.message || "Error removing item");
      } catch (error) {
        toast.error("Failed to update cart");
      }
    }
  };

  // --- Remove Item Completely ---
  const removeItemCompletely = async (itemId) => {
    if (!token) {
      toast.error("Please login first");
      return;
    }
    try {
      const response = await axios.delete(`${url}/api/cart/remove/${itemId}`, {
        headers: { token },
      });
      if (response.data.success) {
        setCartItems((prev) => {
          const { [itemId]: removed, ...rest } = prev;
          return rest;
        });
        toast.success("Item removed completely");
      } else {
        toast.error(response.data.message || "Failed to remove item");
      }
    } catch (error) {
      toast.error("Server error while removing item");
    }
  };

  // --- Cart Totals ---
  const getTotalCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const item = foodList.find((f) => f._id === itemId);
      if (item) total += item.price * getCartQuantity(itemId);
    }
    return total;
  };

  const getTotalCartItems = () => {
    let count = 0;
    for (const itemId in cartItems) {
      count += getCartQuantity(itemId);
    }
    return count;
  };

  // --- Logout ---
  const logout = () => {
    setToken("");
    setUserType("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    toast.success("Logged out successfully");
  };

  // --- Context Value ---
  const contextValue = {
    url,
    food_list: foodList,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    getCartQuantity,
    getCartNotes,
    updateCartNotes,
    token,
    setToken,
    userType,
    setUserType,
    logout,
    fetchRecommendations,
    sendChatMessage,
    checkChatApiStatus,
    getTotalCartAmount,
    getTotalCartItems,
    loadCardData,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
