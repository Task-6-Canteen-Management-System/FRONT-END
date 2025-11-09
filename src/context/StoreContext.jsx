import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "../config/axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [foodList, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [userType, setUserType] = useState("user"); // "admin" | "customer" | "owner" | "user"

  const fetchFoodList = async () => {
    try {
      const response = await axios.get("/api/foods/allFoods");
      if (response.data.success) {
        setFoodList(response.data.data);
      } else {
        toast.error(response.data.message || "Error fetching food list.");
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
      toast.error("Network error while fetching food.");
    }
  };

  // NOTE: function name kept as you wrote it earlier ("loadCardData")
  const loadCardData = async (accessToken) => {
    if (!accessToken) return;
    try {
      const response = await axios.get("/api/cart/MyCart", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.data.success) {
        const newCart = {};
        for (const item of response.data.data.items) {
          newCart[item.foodId._id] = {
            quantity: item.quantity,
            notes: item.notes || "",
          };
        }
        setCartItems(newCart);
      }
    } catch (error) {
      console.error("Failed to load cart data", error);
    }
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        const savedUserType = localStorage.getItem("userType") || "user";
        setUserType(savedUserType);
        if (savedUserType !== "admin") {
          await loadCardData(storedToken);
        }
      }
    }
    loadData();
  }, []);

  const getCartQuantity = (itemId) => cartItems[itemId]?.quantity || 0;
  const getCartNotes = (itemId) => cartItems[itemId]?.notes || "";

  const updateCartNotes = (itemId, notes) => {
    setCartItems((prev) => {
      const currentItem = prev[itemId];
      if (!currentItem) return prev;
      return { ...prev, [itemId]: { quantity: currentItem.quantity || 0, notes } };
    });
    toast.success("Notes updated");
  };

  const addToCart = async (itemId, notes = "") => {
    const currentQuantity = getCartQuantity(itemId);
    const newQuantity = currentQuantity + 1;
    const currentNotes = getCartNotes(itemId);

    setCartItems((prev) => ({
      ...prev,
      [itemId]: { quantity: newQuantity, notes: notes || currentNotes || "" },
    }));

    if (token) {
      try {
        const response = await axios.put(
          "/api/cart/updateCart",
          { foodId: itemId, quantity: newQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.data.success) {
          toast.error(response.data.message || "Something went wrong");
          setCartItems((prev) => ({
            ...prev,
            [itemId]: { quantity: currentQuantity, notes: currentNotes },
          }));
        }
      } catch {
        toast.error("Failed to update cart");
        setCartItems((prev) => ({
          ...prev,
          [itemId]: { quantity: currentQuantity, notes: currentNotes },
        }));
      }
    }
  };

  const removeFromCart = async (itemId) => {
    const currentQuantity = getCartQuantity(itemId);
    const newQuantity = currentQuantity - 1;
    const currentNotes = getCartNotes(itemId);

    if (newQuantity > 0) {
      setCartItems((prev) => ({ ...prev, [itemId]: { ...prev[itemId], quantity: newQuantity } }));
      if (token) {
        try {
          await axios.put(
            "/api/cart/updateCart",
            { foodId: itemId, quantity: newQuantity },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch {
          toast.error("Failed to update cart");
          setCartItems((prev) => ({
            ...prev,
            [itemId]: { quantity: currentQuantity, notes: currentNotes },
          }));
        }
      }
    } else {
      removeItemCompletely(itemId);
    }
  };

  const removeItemCompletely = async (itemId) => {
    if (!token) return toast.error("Please login first");
    const itemBackup = cartItems[itemId];
    setCartItems((prev) => {
      const { [itemId]: _, ...rest } = prev;
      return rest;
    });
    try {
      const response = await axios.delete(`/api/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.data.success) {
        toast.error(response.data.message || "Failed to remove item");
        setCartItems((prev) => ({ ...prev, [itemId]: itemBackup }));
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Server error while removing item");
      setCartItems((prev) => ({ ...prev, [itemId]: itemBackup }));
    }
  };

  const clearCart = async () => {
    setCartItems({});
    if (token) {
      try {
        await axios.delete("/api/cart/clear", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Failed to clear cart on backend", error);
      }
    }
  };

  const getTotalCartAmount = () =>
    Object.keys(cartItems).reduce((total, itemId) => {
      const itemInfo = foodList.find((f) => f._id === itemId);
      if (itemInfo) total += itemInfo.price * getCartQuantity(itemId);
      return total;
    }, 0);

  const getTotalCartItems = () =>
    Object.keys(cartItems).reduce((sum, itemId) => sum + getCartQuantity(itemId), 0);

  const contextValue = {
    food_list: foodList,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    clearCart,
    getCartQuantity,
    getCartNotes,
    updateCartNotes,
    token,
    setToken,
    userType,
    setUserType,
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
