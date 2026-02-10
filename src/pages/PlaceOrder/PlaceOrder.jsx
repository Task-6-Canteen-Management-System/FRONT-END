import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { getTotalCartAmount, token, food_list, cartItems, getCartQuantity, getCartNotes } =
    useContext(StoreContext);

  const [orderCount, setOrderCount] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // ✅ Fetch order history count
  const fetchOrderCount = async () => {
    try {
      const response = await axios.get("/api/order/allOrders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) setOrderCount(response.data.data.length);
    } catch {
      console.log("Could not fetch previous orders");
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (!tableNumber) return toast.error("Please enter a table number");
    if (!token) return toast.error("Please Login first");
    if (getTotalCartAmount() === 0) return toast.error("Your cart is empty");

    // ✅ Convert cart → backend format
    let orderItems = [];
    food_list.forEach((item) => {
      const quantity = getCartQuantity(item._id);
      const notes = getCartNotes(item._id);
      if (quantity > 0) {
        orderItems.push({ foodId: item._id, quantity });
      }
    });

    // ✅ FREE ITEM ON EVERY 6TH ORDER
    const isComplementaryOrder = orderCount % 6 === 5;
    if (isComplementaryOrder && orderItems.length > 0) {
      const cheapest = [...orderItems].sort((a, b) => a.price - b.price)[0];
      toast.success("🎉 Free complementary item added to your order!");
      // Backend will calculate total amount anyway
    }

    try {
      const res = await axios.post(
        "/api/order/createOrder",
        {
          items: orderItems,
          tableNumber: Number(tableNumber),
          paymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setOrderId(res.data.data._id);
        setOrderPlaced(true);
        toast.success("Order placed successfully ✅");
      } else {
        toast.error(res.data.message || "Failed to place order");
      }
    } catch (err) {
      console.log(err);
      toast.error("Server error while placing order");
    }
  };

  useEffect(() => {
    if (token) fetchOrderCount();
  }, [token]);

  // ✅ Payment Screen UI after order placed
  if (orderPlaced) {
    return (
      <div className="place-order">
        <div className="place-order-right">
          <div className="cart-total">
            <h2>Order Confirmed ✅</h2>
            <p>Order ID: {orderId}</p>

            <p className="payment-instruction">
              Please go to the counter or wait for preparation updates.
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

          {orderCount % 6 === 5 && (
            <div className="loyalty-notification">
              <p>🎉 <strong>You're eligible for a free item!</strong></p>
            </div>
          )}

          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>₹{getTotalCartAmount()}</p>
          </div>

          <div className="cart-total-details">
            <p>Canteeno Platform Fee</p>
            <p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
          </div>

          <div className="cart-total-details">
            <b>Total</b>
            <b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
          </div>

          <br />

          <label>Table Number</label>
          <input
            type="number"
            placeholder="Enter Table Number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />

          <label>Payment Method</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
          </select>

          <button type="submit">PLACE ORDER</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
