import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { getTotalCartAmount, token, food_list, getCartQuantity } =
    useContext(StoreContext);

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Build formatted items
  const buildOrderItems = () => {
    let orderItems = [];
    food_list.forEach((item) => {
      const qty = getCartQuantity(item._id);
      if (qty > 0) orderItems.push({ foodId: item._id, quantity: qty });
    });
    return orderItems;
  };

  // Create Razorpay order on backend
  const createBackendOrder = async () => {
    const res = await axios.post(
      `${API_BASE_URL}/payment/create`,
      {
        amount: getTotalCartAmount() + 2,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return res.data.data; // { order, payment }
  };

  const handleUPIPayment = async (event) => {
    event.preventDefault();

    if (!tableNumber) return toast.error("Please enter a table number");

    const orderData = await createBackendOrder();
    const razorpayOrder = orderData.order;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: razorpayOrder.amount,
      currency: "INR",
      name: "Ajay Cafe",
      description: "Order Payment",
      order_id: razorpayOrder.id,

      handler: async function (response) {
        toast.success("Payment Success! Confirming order…");

        const verify = await axios.post(
          `${API_BASE_URL}/payment/verify`,
          {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (verify.data.success) {
          placeFinalOrder("upi"); // 🎉 Correct!
        } else {
          toast.error("Payment verification failed");
        }
      },

      theme: { color: "#D96F32" },
    };

    new window.Razorpay(options).open();
  };

  // Create final order in your backend
  const placeFinalOrder = async (method) => {
    const orderItems = buildOrderItems();

    try {
      const res = await axios.post(
        `${API_BASE_URL}/order/createOrder`,
        {
          items: orderItems,
          tableNumber: Number(tableNumber),
          paymentMethod: method,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setOrderId(res.data.data._id);
        setOrderPlaced(true);
      }
    } catch (error) {
      toast.error("Error placing final order");
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (paymentMethod === "upi") return handleUPIPayment(event);

    return placeFinalOrder("cash");
  };

  // SUCCESS SCREEN
  if (orderPlaced) {
    return (
      <div className="place-order">
        <div className="place-order-right">
          <div className="cart-total">
            <h2>Order Confirmed ✅</h2>
            <p>Order ID: {orderId}</p>

            <p className="payment-instruction">
              Please wait while we prepare your food 🍽️
            </p>

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

          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>₹{getTotalCartAmount()}</p>
          </div>

          <div className="cart-total-details">
            <p>Platform Fee</p>
            <p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
          </div>

          <div className="cart-total-details">
            <b>Total</b>
            <b>₹{getTotalCartAmount() + 2}</b>
          </div>

          <label>Table Number</label>
          <input
            type="number"
            placeholder="Enter Table Number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />

          <label>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
          </select>

          {paymentMethod === "upi" && (
            <div className="upi-box">
              <p className="upi-title">📲 Pay with UPI</p>
              <p className="upi-sub">
                A Razorpay UPI QR popup will open for payment.
              </p>
            </div>
          )}

          <button type="submit">PLACE ORDER</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
