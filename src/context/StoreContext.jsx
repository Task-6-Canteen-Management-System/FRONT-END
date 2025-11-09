import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { food_list as localFoodList } from "../assets/frontend_assets/assets";
import { fetchRecommendations } from "../config/recommendationApi";
import { sendChatMessage, checkChatApiStatus } from "../config/chatApi";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "https://ajay-cafe-1.onrender.com";

  // --- State variables (define once only)
  const [foodList, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [userType, setUserType] = useState("user"); // "user" or "admin"

  // --- Fetch food list ---
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

  // --- Load cart data ---
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

  // --- Load data on mount ---
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

  // --- Cart helper functions ---
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

  // --- Add to cart ---
  const addToCart = async (itemId, notes = "") => {
    setCartItems((prev) => {
      const currentItem = prev[itemId];
      if (!currentItem)
        return { ...prev, [itemId]: { quantity: 1, notes: notes || "" } };

      if (typeof currentItem === "number")
        return {
          ...prev,
          [itemId]: { quantity: currentItem + 1, notes: notes || "" },
        };

      return {
        ...prev,
        [itemId]: {
          quantity: currentItem.quantity + 1,
          notes: notes || currentItem.notes || "",
        },
      };
    });

    if (token) {
      try {
        const response = await axios.post(
          ` http://localhost:8080/api/cart/add`,
          { itemId },
          { headers: { token } }
        );
        if (response.data.success) toast.success("Item added to cart");
        else toast.error(response.data.message || "Something went wrong");
      } catch {
        toast.error("Failed to update cart");
      }
    }
  };

  // --- Remove from cart ---
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const currentItem = prev[itemId];
      if (!currentItem) return prev;

      if (typeof currentItem === "number") {
        const newQty = currentItem - 1;
        if (newQty <= 0) {
          const { [itemId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [itemId]: newQty };
      }

      const newQty = currentItem.quantity - 1;
      if (newQty <= 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [itemId]: { ...currentItem, quantity: newQty } };
    });

    if (token) {
      try {
        const response = await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          { headers: { token } }
        );
        if (response.data.success) toast.success("Item removed from cart");
        else toast.error(response.data.message || "Something went wrong");
      } catch {
        toast.error("Failed to update cart");
      }
    }
  };

  // --- Remove item completely ---
  const removeItemCompletely = async (itemId) => {
    if (!token) return toast.error("Please login first");
    try {
      const response = await axios.delete(`${url}/api/cart/remove/${itemId}`, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success("Item removed completely");
        setCartItems((prev) => {
          const { [itemId]: _, ...rest } = prev;
          return rest;
        });
      } else {
        toast.error(response.data.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Server error while removing item");
    }
  };

  // --- Total calculation ---
  const getTotalCartAmount = () => {
    return Object.keys(cartItems).reduce((total, itemId) => {
      const itemInfo = foodList.find((f) => f._id === itemId);
      if (itemInfo) total += itemInfo.price * getCartQuantity(itemId);
      return total;
    }, 0);
  };

  const getTotalCartItems = () => {
    return Object.keys(cartItems).reduce(
      (sum, itemId) => sum + getCartQuantity(itemId),
      0
    );
  };

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
