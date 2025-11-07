import React, { useContext, useState } from "react";
import "./cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const CartItemRow = ({ item, quantity, notes, updateNotes, removeFromCart }) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotes, setEditNotes] = useState(notes);
  const { url } = useContext(StoreContext);

  const handleSaveNotes = () => {
    updateNotes(editNotes);
    setIsEditingNotes(false);
  };

  return (
    <div>
      <div className="cart-items-title cart-items-item">
        <img src={url+"/images/"+item.image} alt={item.name} />
        <p>{item.name}</p>
        <p>₹{item.price}</p>
        <p>{quantity}</p>
        <p>₹{item.price * quantity}</p>
        <div className="cart-notes-cell">
          {isEditingNotes ? (
            <div className="cart-notes-edit">
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes..."
                rows="2"
                className="cart-notes-input"
                autoFocus
              />
              <div className="cart-notes-actions">
                <button
                  type="button"
                  className="cart-notes-save"
                  onClick={handleSaveNotes}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="cart-notes-cancel"
                  onClick={() => {
                    setEditNotes(notes);
                    setIsEditingNotes(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="cart-notes-display">
              {notes ? (
                <span className="cart-notes-text" title={notes}>
                  {notes.length > 30 ? notes.substring(0, 30) + "..." : notes}
                </span>
              ) : (
                <span className="cart-notes-empty">No notes</span>
              )}
              <button
                type="button"
                className="cart-notes-edit-btn"
                onClick={() => setIsEditingNotes(true)}
                title="Edit customization notes"
              >
                ✏
              </button>
            </div>
          )}
        </div>
        <p onClick={removeFromCart} className="cross">
          x
        </p>
      </div>
      <hr />
    </div>
  );
};

const Cart = () => {
  const {
    food_list,
    cartItems,
    removeFromCart,
    getTotalCartAmount,
    getCartQuantity,
    getCartNotes,
    updateCartNotes,
    url
  } = useContext(StoreContext);

  const navigate=useNavigate();

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
        {food_list.map((item, index) => {
          const quantity = getCartQuantity(item._id);
          if (quantity > 0) {
            return (
              <CartItemRow
                key={item._id || index}
                item={item}
                quantity={quantity}
                notes={getCartNotes(item._id)}
                updateNotes={(notes) => updateCartNotes(item._id, notes)}
                removeFromCart={() => removeFromCart(item._id)}
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
              <p>Subtotals</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Canteeno Platform Fee</p>
              <p>₹{getTotalCartAmount()===0?0:2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{getTotalCartAmount()===0?0:getTotalCartAmount()+2}</b>
            </div>
          </div>
          <button onClick={()=>navigate('/order')}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promocode, Enter it here</p>
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
