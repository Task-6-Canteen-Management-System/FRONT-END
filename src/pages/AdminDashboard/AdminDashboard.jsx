import React, { useContext, useEffect, useState } from "react";
import "./AdminDashboard.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { url, token, userType } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const response = await axios.get(url + "/api/order/all", { headers: { token } });
      if (response.data.success) {
        const sortedOrders = response.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      } else {
        toast.error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.post(
        url + "/api/order/update-status",
        { orderId, status: newStatus },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(`Order marked as ${newStatus}`);
        setOrders(prev =>
          prev.map(order =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        toast.error(response.data.message || "Failed to update order status");
      }
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleStatusChange = (orderId, currentStatus) => {
    const next =
      currentStatus === "pending" || currentStatus === "order placed"
        ? "accepted"
        : currentStatus === "accepted"
        ? "preparing"
        : currentStatus === "preparing"
        ? "ready"
        : null;

    if (next) updateOrderStatus(orderId, next);
  };

  useEffect(() => {
    if (!token || userType !== "admin") {
      navigate("/");
      return;
    }
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [token, userType, navigate]);

  const filteredOrders = orders.filter(order => {
    if (filterStatus === "all") return true;
    const status = order.status?.toLowerCase() || "pending";
    if (filterStatus === "pending") {
      return status === "pending" || status === "order placed";
    }
    return status === filterStatus;
  });

  if (loading) return <div className="admin-dashboard"><p>Loading orders...</p></div>;

  return (
    <div className="admin-dashboard">
      <h1>📊 Order Management Dashboard</h1>

      <div className="admin-filter-tabs">
        {["all", "pending", "accepted", "preparing", "ready"].map(s => (
          <button key={s} className={filterStatus === s ? "active" : ""} onClick={() => setFilterStatus(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)} ({orders.filter(o => 
              (o.status?.toLowerCase() || "pending") === s || 
              (s === "pending" && (o.status?.toLowerCase() === "order placed"))
            ).length})
          </button>
        ))}
      </div>

      <div className="orders-grid">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
          ))
        ) : (
          <p>No orders here.</p>
        )}
      </div>
    </div>
  );
};

// ✅ Simplified OrderCard (NO Delivery Info)
const OrderCard = ({ order, onStatusChange }) => {
  const status = order.status?.toLowerCase() || "pending";
  const isPending = status === "pending" || status === "order placed";
  const isAccepted = status === "accepted";
  const isPreparing = status === "preparing";
  const isReady = status === "ready";

  const getStatusColor = () =>
    isPending ? "#ef4444" :
    isAccepted ? "#f59e0b" :
    isPreparing ? "#3b82f6" :
    isReady ? "#10b981" : "#6b7280";

  const nextAction =
    isPending ? "Accept Order" :
    isAccepted ? "Mark Preparing" :
    isPreparing ? "Mark Ready" :
    null;

  return (
    <div className="order-card" style={{ borderLeft: `4px solid ${getStatusColor()}` }}>
      <div className="order-header">
        <strong>Order #{order._id.slice(-6)}</strong>
        <span className="status" style={{ color: getStatusColor() }}>{order.status || "Pending"}</span>
      </div>

      <p><strong>Total:</strong> ₹{order.amount}</p>
      <p><strong>Time:</strong> {new Date(order.createdAt).toLocaleString()}</p>

      <div className="order-items">
        <strong>Items:</strong>
        {order.items?.map((item, index) => (
          <div key={index} className="item-row">
            <span>{item.name}</span>
            <span>x{item.quantity}</span>
          </div>
        ))}
      </div>

      {nextAction && (
        <button className="status-btn" onClick={() => onStatusChange(order._id, status)} style={{ background: getStatusColor() }}>
          {nextAction}
        </button>
      )}

      {isReady && <p className="ready-msg">✅ Ready for Pickup</p>}
    </div>
  );
};

export default AdminDashboard;
