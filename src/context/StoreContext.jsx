import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "https://ajay-cafe-1.onrender.com";
  const [foodList, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});

  // --- API Fetching ---

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/foods/allFoods`);
      if (response.data.success) {
        setFoodList(response.data.data);
      } else {
        console.error("Error fetching food list:", response.data.message);
      }
    } catch (error) {
      console.error("An error occurred while fetching the food list:", error);
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
      const item = prev[itemId];
      if (item.quantity > 1) {
        return { ...prev, [itemId]: { ...item, quantity: item.quantity - 1 } };
      } else {
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
      }
    });
  };

  // --- Helper Functions (for components to use) ---

  const getCartQuantity = (itemId) => {
    return cartItems[itemId] ? cartItems[itemId].quantity : 0;
  };

  const getCartNotes = (itemId) => {
    return cartItems[itemId] ? cartItems[itemId].notes : "";
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

  // --- Final Context Value ---

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