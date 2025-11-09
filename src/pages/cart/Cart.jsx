import React, { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const {
    food_list,
    cartItems,
    addToCart,
    removeFromCart,
    getCartQuantity,
    getTotalCartAmount,
    updateCartNotes,
    getCartNotes,
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const totalAmount = getTotalCartAmount();

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>

      {Object.keys(cartItems).length === 0 ? (
        <p>Your cart is empty 🛒</p>
      ) : (
        <div className="cart-list">
          {Object.keys(cartItems).map((foodId) => {
            const item = food_list.find((f) => f._id === foodId);
            if (!item) return null;
            const quantity = getCartQuantity(foodId);
            const notes = getCartNotes(foodId);

            return (
              <div className="cart-item" key={foodId}>
                <img src={item.image} alt={item.name} />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>₹{item.price}</p>

                  <div className="quantity-controls">
                    <button onClick={() => removeFromCart(foodId)}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => addToCart(foodId)}>+</button>
                  </div>

                  <textarea
                    placeholder="Add special notes..."
                    value={notes}
                    onChange={(e) => updateCartNotes(foodId, e.target.value)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="cart-summary">
        <h3>Total: ₹{totalAmount}</h3>
        <button
          className="checkout-btn"
          onClick={() => navigate("/placeorder")}
          disabled={Object.keys(cartItems).length === 0}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
