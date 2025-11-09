import React, { useContext, useEffect, useState } from "react";
import "./cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Cart = () => {
  const { url, token, removeItemCompletely } = useContext(StoreContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch cart from backend
  const fetchCart = async () => {
    if (!token) {
      toast.error("Please login to view your cart");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8080/api/cart/MyCart`, {
        headers: { token },
      });
      if (res.data.success || res.data.statusCode === 200) {
        setCart(res.data.data);
      } else {
        toast.error(res.data.message || "Failed to fetch cart");
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      toast.error("Server error while loading cart");
    } finally {
      setLoading(false);
    }
  };

  // Update quantity in backend
  const handleQuantityChange = async (foodId, newQty) => {
    if (newQty < 0) return;

    try {
      const res = await axios.put(
        `${url}/api/cart/updateCart`,
        { foodId, quantity: newQty },
        { headers: { token } }
      );
      if (res.data.success || res.data.statusCode === 200) {
        setCart(res.data.data);
      } else {
        toast.error(res.data.message || "Failed to update quantity");
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      toast.error("Server error while updating item");
    }
  };

  // Clear the entire cart
  const clearCart = async () => {
    try {
      const res = await axios.delete(`${url}/api/cart/clear`, {
        headers: { token },
      });
      if (res.data.success || res.data.statusCode === 200) {
        setCart(res.data.data);
        toast.success("Cart cleared successfully");
      } else {
        toast.error(res.data.message || "Failed to clear cart");
      }
    } catch (err) {
      console.error("Error clearing cart:", err);
      toast.error("Server error while clearing cart");
    }
  };

  // Calculate total amount locally
  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, [token]);

  if (loading) return <p>Loading your cart...</p>;
  if (!cart || !cart.items?.length)
    return (
      <div className="cart-empty">
        <h2>Your cart is empty 😕</h2>
        <button onClick={() => navigate("/")}>Browse Menu</button>
      </div>
    );

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Item</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />

        {cart.items.map((item) => (
          <div key={item._id} className="cart-items-item">
            <img
              src={`${url}/images/${item.foodId.image}`}
              alt={item.foodId.name}
            />
            <p>{item.foodId.name}</p>
            <p>₹{item.price}</p>

            <div className="cart-quantity-control">
              <button
                onClick={() =>
                  handleQuantityChange(item.foodId._id, item.quantity - 1)
                }
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() =>
                  handleQuantityChange(item.foodId._id, item.quantity + 1)
                }
              >
                +
              </button>
            </div>

            <p>₹{item.price * item.quantity}</p>

            <p
              onClick={() => removeItemCompletely(item.foodId._id)}
              className="cross"
            >
              ×
            </p>
          </div>
        ))}
      </div>

      {/* Cart total section */}
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{calculateTotal()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Canteeno Platform Fee</p>
              <p>₹{calculateTotal() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{calculateTotal() === 0 ? 0 : calculateTotal() + 2}</b>
            </div>
          </div>
          <button onClick={() => navigate("/order")}>
            PROCEED TO CHECKOUT
          </button>
          <button
            className="clear-cart-btn"
            onClick={clearCart}
            style={{ backgroundColor: "#f44336", marginTop: "10px" }}
          >
            CLEAR CART
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
