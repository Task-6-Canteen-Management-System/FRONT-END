import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { getTotalCartAmount, token, food_list, cartItems, getCartQuantity, getCartNotes, url } =
    useContext(StoreContext);
  const [orderCount, setOrderCount] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Fetch number of past orders for loyalty tracking
  const fetchOrderCount = async () => {
    try {
      const response = await axios.post(
        `${url}/api/order/userorders`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrderCount(response.data.data.length);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    let orderItems = [];
    food_list.forEach((item) => {
      const quantity = getCartQuantity ? getCartQuantity(item._id) : (cartItems[item._id] || 0);
      const notes = getCartNotes ? getCartNotes(item._id) : "";

      if (quantity > 0) {
        let itemInfo = { foodId: item._id, name: item.name, price: item.price, quantity };
        if (notes) {
          itemInfo.notes = notes;
        }
        orderItems.push(itemInfo);
      }
    });

    // 🎁 Loyalty Reward Logic
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
      address: "No address (Canteen Pickup)",
    const orderData = {
      items: orderItems,
      amount: totalAmount + 2, // ₹2 platform fee
      address: "Canteen Pickup", // simple static address
    };

    let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
    if (response.data.success) {
      if (response.data.orderId) {
        setOrderId(response.data.orderId);
      }
      setOrderPlaced(true);
      toast.success("Order placed! Please scan the QR code to complete payment.");
    } else {
      toast.error("Something went wrong!");
    try {
      const response = await axios.post(
        `${url}/api/order/createOrder`, // ✅ correct endpoint
        orderData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Order placed successfully!");
        navigate("/myorders");
      } else {
        toast.error(response.data.message || "Something went wrong while placing order.");
      }
    } catch (err) {
      console.error("Order placement failed:", err);
      toast.error("Failed to place order. Please try again.");
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please Login first");
      navigate("/cart");
    } else if (getTotalCartAmount() === 0) {
      toast.error("Please Add Items to Cart");
      navigate("/cart");
    } else {
      fetchOrderCount();
    }
  }, [token]);

  if (orderPlaced) {
    return (
      <div className="place-order">
        <div className="place-order-right">
          <div className="cart-total">
            <h2>Complete Your Payment</h2>
            <p className="payment-instruction">
              Please scan the QR code below to complete your payment.
            </p>
            
            <div className="qr-code-container">
              <div className="qr-code-placeholder">
                <p className="qr-placeholder-text">QR Code will be displayed here</p>
              </div>
            </div>

            <div className="order-summary">
              <h3>Order Summary</h3>
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
            </div>

            <button 
              type="button" 
              className="back-to-orders-btn"
              onClick={() => navigate("/myorders")}
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="place-order" onSubmit={placeOrder}>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Your Cart Total</h2>

          {orderCount % 6 === 5 && (
            <div className="loyalty-notification">
              <p>🎉 <strong>It's your 6th order!</strong></p>
              <p>You'll receive a FREE complementary item!</p>
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

          <button type="submit">PLACE ORDER</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
