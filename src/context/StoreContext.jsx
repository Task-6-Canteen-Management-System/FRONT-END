import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "https://ajay-cafe-1.onrender.com"; 

  const [foodList, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [cartNotes, setCartNotes] = useState({});
  const [token, setToken] = useState("");
  const [userType, setUserType] = useState("user");

  
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/foods/allFoods`);
      if (response.data.success) {
        setFoodList(response.data.data);
      } else {
        toast.error("Failed to load food list");
      }
    } catch (error) {
      console.error("Error fetching foods:", error);
      toast.error("Server error fetching foods");
    }
  };

 
  const loadCartData = async (token) => {
    try {
      const response = await axios.get(`${url}/api/cart/MyCart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.data.items) {
        const formatted = {};
        response.data.data.items.forEach((item) => {
          formatted[item.foodId._id] = {
            quantity: item.quantity,
            price: item.price,
            name: item.foodId.name,
            image: item.foodId.image,
          };
        });
        setCartItems(formatted);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  const addToCart = async (foodId) => {
  try {
    if (!token) {
      toast.error("Please login to add items to cart");
      return;
    }

    const response = await axios.post(
      `${url}/api/cart/add`,
      {
        foodId: foodId,
        quantity: 1
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log("✅ Cart Add Response:", response.data);

    if (response.data.success) {
      setCartItems((prev) => ({
        ...prev,
        [foodId]: (prev[foodId] || 0) + 1
      }));
      toast.success("Item added to cart");
    } else {
      toast.error(response.data.message || "Failed to add item");
    }
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    toast.error("Server error while adding item");
  }
};


  const removeItemCompletely = async (foodId) => {
    if (!token) return toast.error("Please login first");

    try {
      const response = await axios.delete(`${url}/api/cart/remove/${foodId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success("Item removed");
        await loadCartData(token);
        setCartNotes((prev) => {
          const newNotes = { ...prev };
          delete newNotes[foodId];
          return newNotes;
        });
      } else {
        toast.error(response.data.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Remove item error:", error);
      toast.error("Server error while removing item");
    }
  };

  const updateCartQuantity = async (foodId, quantity) => {
    if (!token) return toast.error("Please login first");

    try {
      const response = await axios.put(
        `${url}/api/cart/updateCart`,
        { foodId, quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Cart updated");
        await loadCartData(token);
      } else {
        toast.error(response.data.message || "Failed to update cart");
      }
    } catch (error) {
      console.error("Update cart error:", error);
      toast.error("Server error while updating cart");
    }
  };

  
  const getTotalCartAmount = () =>
    Object.values(cartItems).reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

  
  const getTotalCartItems = () =>
    Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);

  
  const getCartQuantity = (foodId) =>
    cartItems[foodId]?.quantity || 0;

  
  const updateCartNotes = (foodId, note) => {
    setCartNotes((prev) => ({ ...prev, [foodId]: note }));
  };

  const getCartNotes = (foodId) => cartNotes[foodId] || "";

  
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      loadCartData(storedToken);
    }
    fetchFoodList();
  }, []);
  
  
  const contextValue = {
    url,
    food_list: foodList,
    cartItems,
    addToCart,
    removeItemCompletely,
    updateCartQuantity,
    getTotalCartAmount,
    getTotalCartItems,
    getCartQuantity,
    updateCartNotes,
    getCartNotes,
    token,
    setToken,
    loadCartData,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
