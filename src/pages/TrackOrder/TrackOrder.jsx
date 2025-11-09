import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import "./TrackOrder.css";

const TrackOrder = () => {
  const { orderId } = useParams();
  const { url, token } = useContext(StoreContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch order details
  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${url}/api/order/status/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }, // ✅ Correct token format
      });
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        console.error("Order not found:", response.data.message);
      }
    } catch (err) {
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto-refresh every 10 seconds
  useEffect(() => {
    if (token) {
      fetchOrder();
      const interval = setInterval(fetchOrder, 10000);
      return () => clearInterval(interval);
    }
  }, [orderId, token, url]);

  if (loading) return <p className="track-loading">Loading order details...</p>;
  if (!order) return <p className="track-error">Order not found or expired.</p>;

  // ✅ Define progress stages
  const stages = ["Pending", "Preparing", "Out for Delivery", "Delivered"];
  const currentStageIndex = stages.findIndex(
    (s) => s.toLowerCase() === order.status?.toLowerCase()
  );

  return (
    <div className="track-order">
      <h2>Order Tracking</h2>

      <div className="order-info">
        <p>
          <strong>Order ID:</strong> {order._id}
        </p>
        <p>
          <strong>Total Amount:</strong> ₹{order.totalAmount || order.amount}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
      </div>

      {/* ✅ Progress Bar */}
      <div className="order-progress">
        {stages.map((stage, index) => (
          <div
            key={index}
            className={`progress-step ${
              index <= currentStageIndex ? "active" : ""
            }`}
          >
            <div className="step-circle">{index + 1}</div>
            <p>{stage}</p>
          </div>
        ))}
      </div>

      {/* ✅ Items List */}
      {order.items && order.items.length > 0 && (
        <div className="order-items">
          <h3>Ordered Items</h3>
          <ul>
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.foodId?.name || item.name} × {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
