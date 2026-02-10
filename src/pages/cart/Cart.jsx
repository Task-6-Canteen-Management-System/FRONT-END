import React, { useContext, useState } from "react";
import "./cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CartItemRow = ({ item, quantity, notes }) => {
  const { updateCartNotes, removeItemCompletely, addToCart, removeFromCart } =
    useContext(StoreContext);

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotes, setEditNotes] = useState(notes || "");

  const handleSaveNotes = () => {
    updateCartNotes(item._id, editNotes);
    setIsEditingNotes(false);
  };

  const lineTotal = (item.price || 0) * (quantity || 0);

  return (
    <>
      <div className="cart-items-title cart-items-item">
        <img src={item.image} alt={item.name} />
        <p>{item.name}</p>
        <p>₹{item.price}</p>

        <div className="cart-quantity-control">
          <button onClick={() => removeFromCart(item._id)}>-</button>
          <span>{quantity}</span>
          <button onClick={() => addToCart(item._id, notes)}>+</button>
        </div>

        <p>₹{lineTotal}</p>

        <div className="cart-notes-cell">
          {isEditingNotes ? (
            <div className="cart-notes-edit">
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
                className="cart-notes-input"
              />
              <div className="cart-notes-actions">
                <button type="button" className="cart-notes-save" onClick={handleSaveNotes}>
                  Save
                </button>
                <button
                  type="button"
                  className="cart-notes-cancel"
                  onClick={() => {
                    setEditNotes(notes || "");
                    setIsEditingNotes(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="cart-notes-display">
              <span className="cart-notes-text" title={notes || ""}>
                {notes ? (notes.length > 30 ? `${notes.slice(0, 30)}...` : notes) : "No notes"}
              </span>
              <button
                type="button"
                className="cart-notes-edit-btn"
                onClick={() => setIsEditingNotes(true)}
                title="Edit notes"
              >
                ✏
              </button>
            </div>
          )}
        </div>

        <p onClick={() => removeItemCompletely(item._id)} className="cross">
          ×
        </p>
      </div>
      <hr />
    </>
  );
};

const Cart = () => {
  const {
    food_list = [],
    getTotalCartAmount,
    getCartQuantity,
    getCartNotes,
    clearCart,
    token,
  } = useContext(StoreContext);

  const navigate = useNavigate();

  const subtotal = Number(getTotalCartAmount() || 0);
  const platformFee = subtotal > 0 ? 2 : 0;
  const grandTotal = subtotal + platformFee;

  const handleCheckout = () => {
    if (!token) return toast.error("Please login to place an order");
    if (subtotal === 0) return toast.error("Your cart is empty");
    navigate("/order");
  };

  if (subtotal === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty 😕</h2>
        <button onClick={() => navigate("/")}>Browse Menu</button>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Customization</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />

        {food_list.map((item) => {
          const q = getCartQuantity(item._id);
          if (q > 0) {
            return (
              <CartItemRow
                key={item._id}
                item={item}
                quantity={q}
                notes={getCartNotes(item._id)}
              />
            );
          }
          return null;
        })}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{subtotal}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Canteeno Platform Fee</p>
              <p>₹{platformFee}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{grandTotal}</b>
            </div>
          </div>

          <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>

          <button
            className="clear-cart-btn"
            onClick={clearCart}
            style={{ backgroundColor: "#f44336", marginTop: "10px" }}
          >
            CLEAR CART
          </button>
        </div>

        <div className="cart-promocode">
          <div>
            <p>If you have a promocode, enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="promo code" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;