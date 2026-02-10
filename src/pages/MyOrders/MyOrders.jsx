import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/frontend_assets/assets";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        `${url}/api/order/userorders`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setData(response.data.data);
        setOrderCount(response.data.data.length);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const progressInCycle = orderCount % 6;
  const ordersUntilFree = progressInCycle === 0 ? 6 : 6 - progressInCycle;

  return (
    <div className="my-orders">
      <h2>Orders</h2>
      

      {/* 🎉 Loyalty Section */}
      <div className="loyalty-program">
        <h3>🎉 Foodie Rewards</h3>
        <p style={{ color: "#475569", marginBottom: "15px" }}>
          Complete 6 orders to earn a FREE complementary item!
        </p>
        {progressInCycle === 0 && orderCount > 0 ? (
          <div className="reward-message">
            <p>
              🎁 <strong>Congratulations!</strong> You've earned a complementary
              food item!
            </p>
            <p>Your next order will include a free item.</p>
          </div>
        ) : (
          <div className="reward-progress">
            <p>
              Progress: {progressInCycle}/6 orders -{" "}
              <strong>{ordersUntilFree} more order(s) until free item!</strong>
            </p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(progressInCycle / 6) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 🧾 Orders List */}
      <div className="container">
        {data.map((order, index) => (
          <div key={index} className="my-orders-order">
            <img src={assets.parcel_icon} alt="parcel" />
            <p>
              {order.items.map((item, i) =>
                i === order.items.length - 1
                  ? `${item.name} × ${item.quantity}`
                  : `${item.name} × ${item.quantity}, `
              )}
            </p>
            <p>₹{order.amount}.00</p>
            <p>Items: {order.items.length}</p>
            <p>
              <span>&#x25cf;</span>
              <b> {order.status}</b>
            </p>
            <button onClick={() => navigate(`/track/${order._id}`)}>
              Track Order
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
