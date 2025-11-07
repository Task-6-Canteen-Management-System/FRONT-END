import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { food_list as localFoodList } from "../assets/frontend_assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "https://ajay-cafe-1.onrender.com";
  const [token, setToken] = useState("");
  const [userType, setUserType] = useState("user"); // "user" or "admin"
  const [food_list, setFoodList] = useState(localFoodList);

  // Helper function to get quantity from cart item (supports both old and new format)
  const getCartQuantity = (itemId) => {
    if (!cartItems[itemId]) return 0;
    if (typeof cartItems[itemId] === "number") {
      return cartItems[itemId];
    }
    return cartItems[itemId].quantity || 0;
  };

  // Helper function to get notes from cart item
  const getCartNotes = (itemId) => {
    if (!cartItems[itemId]) return "";
    if (typeof cartItems[itemId] === "number") {
      return "";
    }
    return cartItems[itemId].notes || "";
  };

  // Helper function to update cart notes
  const updateCartNotes = (itemId, notes) => {
    setCartItems((prev) => {
      const currentItem = prev[itemId];
      if (typeof currentItem === "number") {
        // Convert old format to new format
        return { ...prev, [itemId]: { quantity: currentItem, notes: notes } };
      }
      return { ...prev, [itemId]: { ...currentItem, notes: notes } };
    });
  };

  const addToCart = async (itemId, notes = "") => {
    setCartItems((prev) => {
      const currentItem = prev[itemId];
      if (!currentItem) {
        return { ...prev, [itemId]: { quantity: 1, notes: notes } };
      } else if (typeof currentItem === "number") {
        // Convert old format to new format
        return {
          ...prev,
          [itemId]: { quantity: currentItem + 1, notes: notes || "" },
        };
      } else {
        // If adding more, keep existing notes unless new notes provided
        const existingNotes = currentItem.notes || "";
        return {
          ...prev,
          [itemId]: {
            quantity: currentItem.quantity + 1,
            notes: notes || existingNotes,
          },
        };
      }
    });
    if (token) {
      const response = await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("item Added to Cart");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const currentItem = prev[itemId];
      if (!currentItem) return prev;

      if (typeof currentItem === "number") {
        // Old format
        const newQuantity = currentItem - 1;
        if (newQuantity <= 0) {
          const { [itemId]: removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [itemId]: newQuantity };
      } else {
        // New format
        const newQuantity = currentItem.quantity - 1;
        if (newQuantity <= 0) {
          const { [itemId]: removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [itemId]: { ...currentItem, quantity: newQuantity } };
      }
    });
    if (token) {
      const response = await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("item Removed from Cart");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      const quantity = getCartQuantity(item);
      if (quantity > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * quantity;
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItems = 0;
    for (const item in cartItems) {
      totalItems += getCartQuantity(item);
    }
    return totalItems;
  };

  const fetchFoodList = async () => {
    const response = await axios.get(url + "/api/food/list");
    if (response.data.success) {
      setFoodList(response.data.data);
    } else {
      alert("Error! Products are not fetching..");
    }
  };

  const loadCardData = async (token) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        {},
        { headers: { token } }
      );
      setCartItems(response.data.cartData || {});
    } catch (error) {
      console.error("Failed to load cart data", error);
      setCartItems({});
    }
  };

  useEffect(() => {
    async function loadData() {
      // await fetchFoodList();
      if (localStorage.getItem("token")) {
        setToken(localStorage.getItem("token"));
        // Load user type from localStorage
        const savedUserType = localStorage.getItem("userType") || "user";
        setUserType(savedUserType);
        await loadCardData(localStorage.getItem("token"));
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
    getCartQuantity,
    getCartNotes,
    updateCartNotes,
    url,
    token,
    setToken,
    userType,
    setUserType,
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;
