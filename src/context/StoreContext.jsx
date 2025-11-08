import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { food_list as localFoodList } from '../assets/frontend_assets/assets';
import { fetchRecommendations } from '../config/recommendationApi';
import { sendChatMessage, checkChatApiStatus } from '../config/chatApi';
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "https://ajay-cafe-1.onrender.com";
  const [foodList, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [userType, setUserType] = useState("user"); // "user" or "admin"

  // --- API Fetching ---

  // This is your correct function from the VAIBHAVSHUKLA branch
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/foods/allFoods`);
      if (response.data.success) {
        setFoodList(response.data.data);
      } else {
        console.error("Error fetching food list:", response.data.message);
        toast.error("Error fetching food list.");
      }
    } catch (error) {
      console.error("An error occurred while fetching the food list:", error);
      toast.error("Network error while fetching food.");
    }
  };

  // This is the cart loading function from the main branch
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
      setCartItems({}); // Default to empty cart on error
    }
  };

  // --- Main data loading on component mount (Combined) ---

  useEffect(() => {
    async function loadData() {
      // We need to fetch the food list regardless of login
      await fetchFoodList(); // <-- This is now correctly called

      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        const savedUserType = localStorage.getItem("userType") || "user";
        setUserType(savedUserType);
        // Load user's cart only if they are logged in
        await loadCardData(storedToken);
      }
    }
    loadData();
  }, []);

  // --- Cart Helper Functions (from 'main', they are more robust) ---

  const [userType, setUserType] = useState("user");
  const [food_list, setFoodList] = useState(localFoodList); 

  // Helper function to get quantity from cart item
  const getCartQuantity = (itemId) => {
    if (!cartItems[itemId]) return 0;
    // Supports both old format (number) and new format ({quantity: ...})
    if (typeof cartItems[itemId] === "number") {
      return cartItems[itemId];
    }
    return cartItems[itemId].quantity || 0;
  };

  const getCartNotes = (itemId) => {
    if (!cartItems[itemId]) return "";
    // Supports both old format (number) and new format ({quantity: ...})
    if (typeof cartItems[itemId] === "number") {
      return ""; // Old format had no notes
    }
    return cartItems[itemId].notes || "";
  };

  const updateCartNotes = (itemId, notes) => {
    setCartItems((prev) => {
      const currentItem = prev[itemId];
      if (typeof currentItem === "number") {
        // Convert old format to new format
      if (typeof currentItem === 'number') {
        return { ...prev, [itemId]: { quantity: currentItem, notes: notes } };
      }
      // Update notes for new format
      return { ...prev, [itemId]: { ...currentItem, notes: notes } };
    });
    // Note: You may want to add a backend API call here to sync notes
  };

  // --- Cart Management Functions (from 'main', with API sync) ---

  // This is the correct 'async' version from 'main'
  const addToCart = async (itemId, notes) => {
    // Robust local state update from 'main'
  // Add to cart - uses updateCart API with new quantity
  const addToCart = async (itemId, notes = "") => {
    // Update local state optimistically
    let newQuantity;
    setCartItems((prev) => {
      const currentItem = prev[itemId];

      if (!currentItem) {
        // Not in cart, add new
        return { ...prev, [itemId]: { quantity: 1, notes: notes || "" } };
      } else if (typeof currentItem === "number") {
        // Convert old format
        return {
          ...prev,
          [itemId]: { quantity: currentItem + 1, notes: notes || "" },
        };
      } else {
        // Already in new format, increment quantity
        const existingNotes = currentItem.notes || "";
        return {
          ...prev,
          [itemId]: {
            quantity: currentItem.quantity + 1,
            notes: notes !== undefined ? notes : existingNotes,
          },
        };
      }
    });

    // API sync from 'main'
    if (token) {
      try {
        const response = await axios.post(
          url + "/api/cart/add",
          { itemId },
          { headers: { token } }
        );
        if (response.data.success) {
          toast.success("Item Added to Cart");
        } else {
          toast.error(response.data.message || "Something went wrong");
        }
      } catch (error) {
        toast.error("Failed to update cart");
      }
    }
  };

  // This is the correct 'async' version from 'main'
  const removeFromCart = async (itemId) => { // <-- Added 'async'
    // Robust local state update from 'main'
        newQuantity = 1;
        return { ...prev, [itemId]: { quantity: 1, notes: notes } };
      } else if (typeof currentItem === 'number') {
        newQuantity = currentItem + 1;
        return { ...prev, [itemId]: { quantity: newQuantity, notes: notes || "" } };
      } else {
        newQuantity = currentItem.quantity + 1;
        const existingNotes = currentItem.notes || "";
        return { 
          ...prev, 
          [itemId]: { 
            quantity: newQuantity, 
            notes: notes || existingNotes 
          } 
        };
      }
    });

    // Sync with backend if logged in
    if (token) {
      try {
        const response = await axios.put(
          url + "/api/cart/updateCart",
          { 
            foodId: itemId,
            quantity: newQuantity
          },
          { headers: { token } }
        );
        
        if (response.data.success) {
          toast.success("Item added to cart");
        } else {
          toast.error("Something went wrong");
          // Revert on error
          setCartItems((prev) => {
            const item = prev[itemId];
            if (item.quantity === 1) {
              const { [itemId]: removed, ...rest } = prev;
              return rest;
            }
            return { 
              ...prev, 
              [itemId]: { ...item, quantity: item.quantity - 1 } 
            };
          });
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast.error("Failed to add item to cart");
        // Revert on error
        setCartItems((prev) => {
          const item = prev[itemId];
          if (item.quantity === 1) {
            const { [itemId]: removed, ...rest } = prev;
            return rest;
          }
          return { 
            ...prev, 
            [itemId]: { ...item, quantity: item.quantity - 1 } 
          };
        });
      }
    }
  };

  // Remove from cart - uses updateCart API with reduced quantity
  const removeFromCart = async (itemId) => {
    let newQuantity;
    
   
    setCartItems((prev) => {
      const currentItem = prev[itemId];
      if (!currentItem) return prev;
      
      if (typeof currentItem === 'number') {
        const newQuantity = currentItem - 1;
        newQuantity = currentItem - 1;
        if (newQuantity <= 0) {
          const { [itemId]: removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [itemId]: newQuantity };
      } else {
        const newQuantity = currentItem.quantity - 1;
        newQuantity = currentItem.quantity - 1;
        if (newQuantity <= 0) {
          const { [itemId]: removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [itemId]: { ...currentItem, quantity: newQuantity } };
      }
    });

    // API sync from 'main'
    if (token) {
      try {
        const response = await axios.post(
          url + "/api/cart/remove",
          { itemId },
          { headers: { token } }
        );
        if (response.data.success) {
          toast.success("Item Removed from Cart");
        } else {
          toast.error(response.data.message || "Something went wrong");
        }
      } catch (error) {
        toast.error("Failed to update cart");
        const response = await axios.put(
          url + "/api/cart/updateCart",
          { 
            foodId: itemId,
            quantity: newQuantity
          },
          { headers: { token } }
        );
        
        if (response.data.success) {
          toast.success("Item removed from cart");
        } else {
          toast.error("Something went wrong");
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
        toast.error("Failed to remove item from cart");
      }
    }
  };
    // Remove item completely from cart (delete API)
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
        toast.success("Item removed completely");
        // Update local cart state to remove the item
        setCartItems((prev) => {
          const { [itemId]: removed, ...rest } = prev;
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

  // --- Cart Total Functions (From 'VAIBHAVSHUKLA', but fixed) ---

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      if (cartItems.hasOwnProperty(itemId)) {
        const itemInfo = foodList.find((product) => product._id === itemId);
        if (itemInfo) {
          // FIXED: Use the helper function to get quantity
          totalAmount += itemInfo.price * getCartQuantity(itemId);
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItems = 0;
    for (const itemId in cartItems) {
      if (cartItems.hasOwnProperty(itemId)) {
        // FIXED: Use the helper function to get quantity
        totalItems += getCartQuantity(itemId);
      }
    }
    return totalItems;
  };

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      if (response.data.success) {
        setFoodList(response.data.data);
      } else {
        alert("Error! Products are not fetching..");
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
    }
  };

  const loadCardData = async (token) => {
    try {
      const response = await axios.get(
        url + "/api/cart/get",
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

    removeItemCompletely,
  };
  
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
export default StoreContextProvider;
