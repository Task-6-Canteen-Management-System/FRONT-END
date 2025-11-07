import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/frontend_assets/assets";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [orderCount, setOrderCount] = useState(0);

  const fetchOrders = async () => {
    const response = await axios.post(
      url + "/api/order/userorders",
      {},
      { headers: { token } }
    );
    if (response.data.success) {
      setData(response.data.data);
      setOrderCount(response.data.data.length);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const progressInCycle = orderCount % 6; // 0-5
  const ordersUntilFree = progressInCycle === 0 ? 6 : 6 - progressInCycle;
  
  return (
    <div className="my-orders">
      <h2>Orders</h2>
      
      {/* Loyalty Program Display */}
      <div className="loyalty-program">
        <h3>🎉 Foodie Rewards</h3>
        <p style={{color: '#475569', marginBottom: '15px'}}>Complete 6 orders to earn a FREE complementary item!</p>
        {progressInCycle === 0 && orderCount > 0 ? (
          <div className="reward-message">
            <p>🎁 <strong>Congratulations!</strong> You've earned a complementary food item!</p>
            <p>Your next order will include a free item.</p>
          </div>
        ) : (
          <div className="reward-progress">
            <p>Progress: {progressInCycle}/6 orders - <strong>{ordersUntilFree} more order(s) until free item!</strong></p>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${(progressInCycle / 6) * 100}%`}}></div>
            </div>
          </div>
        )}
      </div>

      <div className="container">
        {data.map((order, index) => {
          return (
            <div key={index} className="my-orders-order">
              <img src={assets.parcel_icon} alt="" />
              <p>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " X " + item.quantity;
                  } else {
                    return item.name + " X " + item.quantity + ",";
                  }
                })}
              </p>
              <p>₹{order.amount}.00</p>
              <p>items: {order.items.length}</p>
              <p>
                <span>&#x25cf;</span>
                <b> {order.status}</b>
              </p>
              <button onClick={fetchOrders}>Track Order</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;