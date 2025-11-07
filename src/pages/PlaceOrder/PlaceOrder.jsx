import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {
  const navigate = useNavigate();

  const { getTotalCartAmount, token, food_list, cartItems, getCartQuantity, getCartNotes, url } =
    useContext(StoreContext);

  const [orderCount, setOrderCount] = useState(0);

  const fetchOrderCount = async () => {
    const response = await axios.post(
      url + "/api/order/userorders",
      {},
      { headers: { token } }
    );
    if (response.data.success) {
      setOrderCount(response.data.data.length);
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    let orderItems = [];
    food_list.forEach((item) => {
      const quantity = getCartQuantity ? getCartQuantity(item._id) : (cartItems[item._id] || 0);
      const notes = getCartNotes ? getCartNotes(item._id) : "";

      if (quantity > 0) {
        let itemInfo = { ...item, quantity };
        if (notes) {
          itemInfo.notes = notes;
        }
        orderItems.push(itemInfo);
      }
    });

    // Free item logic
    const isComplementaryOrder = orderCount % 6 === 5;
    if (isComplementaryOrder && orderItems.length > 0) {
      const sortedItems = [...orderItems].sort((a, b) => a.price - b.price);
      const cheapestItem = sortedItems[0];
      const complementaryItem = { 
        ...cheapestItem,
        name: cheapestItem.name + " (FREE - Foodie Reward!)",
        quantity: 1,
        price: 0
      };
      orderItems.push(complementaryItem);
      toast.success("🎉 Free complementary item added to your order!");
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let orderData = {
      address: "No address (Canteen Pickup)", // ✅ Static placeholder — backend won't break
      items: orderItems,
      amount: totalAmount + 2,
    };

    let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
    if (response.data.success) {
      window.location.replace(response.data.session_url);
    } else {
      toast.error("Something went wrong!");
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please Login first")
      navigate("/cart")
    } else if (getTotalCartAmount() === 0) {
      toast.error("Please Add Items to Cart");
      navigate("/cart")
    } else {
      fetchOrderCount();
    }
  }, [token]);

  return (
    <form className="place-order" onSubmit={placeOrder}>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Your Cart Total</h2>

          {orderCount % 6 === 5 && (
            <div className="loyalty-notification">
              <p>🎉 <strong>It’s your 6th order!</strong></p>
              <p>You’ll receive a FREE complementary item!</p>
            </div>
          )}

          <div className="cart-total-details">
            <p>Subtotals</p>
            <p>₹{getTotalCartAmount()}</p>
          </div>

          <hr />

          <div className="cart-total-details">
            <p>Canteeno Platform Fee</p>
            <p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
          </div>

          <hr />

          <div className="cart-total-details">
            <b>Total</b>
            <b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
          </div>

          <button type="submit">PROCEED TO PAY</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
