
import React, { useContext, useState } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/frontend_assets/assets";
import { StoreContext } from "../../context/StoreContext";

const FoodItem = ({ id, name, price, description, image, isSpecial = false, discount = 0, originalPrice = null }) => {
  const {cartItems,addToCart,removeFromCart,getCartQuantity,getCartNotes,updateCartNotes,url}=useContext(StoreContext);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState("");
  
  // Calculate display price
  const displayPrice = originalPrice && discount > 0 ? price : price;
  const showOriginalPrice = originalPrice && originalPrice > price;
  
  const quantity = getCartQuantity(id);
  const existingNotes = getCartNotes(id);
  
  const handleAddToCart = () => {
    if (quantity === 0) {
      // First time adding - show notes modal
      setNotes(existingNotes);
      setShowNotesModal(true);
    } else {
      // Already in cart - just add quantity
      addToCart(id, existingNotes);
    }
  };
  
  const handleConfirmAdd = () => {
    addToCart(id, notes);
    setShowNotesModal(false);
    setNotes("");
  }; 

  return (
    <div className={`food-item ${isSpecial ? 'special-dish-item' : ''}`}>
      {isSpecial && (
        <div className="special-badge">
          <span>🔥 Special</span>
        </div>
      )}
      <div className="food-item-img-container">
        <img src={image} alt="" className="food-item-image" />
        {quantity === 0 ? (
          <img
            className="add"
            onClick={handleAddToCart}
            src={assets.add_icon_white}
            alt=""
          />
        ) : (
          <div className="food-item-counter">
            <img onClick={()=>removeFromCart(id)} src={assets.remove_icon_red} alt="" />
            <p>{quantity}</p>
            <img onClick={()=>addToCart(id, existingNotes)} src={assets.add_icon_green} alt="" />
            <img 
              onClick={() => { setNotes(existingNotes); setShowNotesModal(true); }} 
              className="notes-icon" 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23D96F32' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'%3E%3C/path%3E%3Cpath d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'%3E%3C/path%3E%3C/svg%3E" 
              alt="Edit notes" 
              title="Add customization notes"
            />
          </div>
        )}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="" />
        </div>
        <p className="food-item-desc">{description}</p>
        <div className="food-item-price-container">
          {showOriginalPrice && (
            <span className="food-item-original-price">₹{originalPrice}</span>
          )}
          <p className="food-item-price">₹{displayPrice}</p>
          {discount > 0 && (
            <span className="food-item-discount-badge">{discount}% OFF</span>
          )}
        </div>
      </div>
      
      {/* Notes Modal */}
      {showNotesModal && (
        <div className="notes-modal-overlay" onClick={() => setShowNotesModal(false)}>
          <div className="notes-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notes-modal-header">
              <h3>Customize Your Order</h3>
              <span className="notes-modal-close" onClick={() => setShowNotesModal(false)}>×</span>
            </div>
            <div className="notes-modal-body">
              <p className="notes-label">Add special instructions (e.g., No onions, Light spicy, More cheese)</p>
              <textarea
                className="notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter your customization notes here..."
                rows="4"
              />
              <div className="notes-examples">
                <p>Examples:</p>
                <div className="notes-tags">
                  <span onClick={() => setNotes("No onions")}>No onions</span>
                  <span onClick={() => setNotes("Light spicy")}>Light spicy</span>
                  <span onClick={() => setNotes("More cheese")}>More cheese</span>
                  <span onClick={() => setNotes("Extra sauce")}>Extra sauce</span>
                </div>
              </div>
            </div>
            <div className="notes-modal-footer">
              <button type="button" className="notes-cancel" onClick={() => setShowNotesModal(false)}>
                Cancel
              </button>
              <button type="button" className="notes-confirm" onClick={handleConfirmAdd}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodItem;
