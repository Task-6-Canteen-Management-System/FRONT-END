import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "https://ajay-cafe-1.onrender.com";
  const [foodList, setFoodList] = useState([]);
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
  };

  useEffect(() => {
    fetchFoodList();
  }, []);

  // --- Cart Management Functions ---

  const addToCart = (itemId, notes) => {
    setCartItems((prev) => {
      const item = prev[itemId];
      if (!item) {
        return { ...prev, [itemId]: { quantity: 1, notes: notes || "" } };
      } else {
        return {
          ...prev,
          [itemId]: {
            quantity: item.quantity + 1,
            notes: notes !== undefined ? notes : item.notes,
          },
        };
      }
    });
  };

  const removeFromCart = (itemId) => {
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
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
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
    for (const itemId in cartItems) {
      if (cartItems.hasOwnProperty(itemId)) {
        const itemInfo = foodList.find((product) => product._id === itemId);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[itemId].quantity;
        }
      }
    }
    return totalAmount;
  };

  // --- THE NEW FUNCTION ---
  const getTotalCartItems = () => {
    let totalItems = 0;
    // Loop over all items in the cart
    for (const itemId in cartItems) {
      if (cartItems.hasOwnProperty(itemId)) {
        // Add the quantity of each item to the total
        totalItems += cartItems[itemId].quantity;
      }
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
    url,
    food_list: foodList,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getCartQuantity,
    getCartNotes,
    getTotalCartAmount,
    getTotalCartItems, // <-- Now it is being provided
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;