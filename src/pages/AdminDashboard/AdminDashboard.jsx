import React, { useContext, useEffect, useState, useCallback } from "react";
import "./AdminDashboard.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { token, userType } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      // ✅ Correct endpoint
      const res = await axios.get("/api/order/allOrders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success && Array.isArray(res.data.data)) {
        const sorted = [...res.data.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sorted);
      } else {
        toast.error(res.data?.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err?.response || err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };
    const candidates = [
      { method: "post", url: `/api/order/status/${orderId}`, body: { status: newStatus } },
      { method: "put",  url: `/api/order/status/${orderId}`, body: { status: newStatus } },
      { method: "patch",url: `/api/order/status/${orderId}`, body: { status: newStatus } },
      { method: "put",  url: `/api/order/update/${orderId}`, body: { status: newStatus } },
      { method: "patch",url: `/api/order/${orderId}/status`, body: { status: newStatus } },
    ];

    let lastError = null;
    for (const c of candidates) {
      try {
        const res = await axios[c.method](c.url, c.body, { headers });
        if (res.data?.success) {
          toast.success(`Order marked as ${newStatus}`);
          setOrders((prev) =>
            prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
          );
          return;
        }
        lastError = res?.data?.message || `Failed with ${c.method.toUpperCase()} ${c.url}`;
      } catch (err) {
        lastError = err?.response?.data?.message || err?.message;
        // try the next shape
        continue;
      }
    }
    console.error("Update status error:", lastError);
    toast.error(lastError || "Failed to update order status");
  };

  const handleStatusChange = (orderId, currentStatus) => {
    const s = (currentStatus || "").toLowerCase();
    const next =
      s === "pending" || s === "order placed"
        ? "accepted"
        : s === "accepted"
        ? "preparing"
        : s === "preparing"
        ? "ready"
        : null;

    if (next) updateOrderStatus(orderId, next);
  };

  useEffect(() => {
    if (!token) return navigate("/");
    if (userType !== "admin") return navigate("/");

    fetchOrders();
    const id = setInterval(fetchOrders, 5000); // auto-refresh
    return () => clearInterval(id);
  }, [token, userType, navigate, fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "all") return true;
    const s = (order.status || "pending").toLowerCase();
    if (filterStatus === "pending") {
      return s === "pending" || s === "order placed";
    }
    return s === filterStatus;
  });

  if (loading) {
    return (
      <div className="admin-dashboard">
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>📊 Order Management Dashboard</h1>

      <div className="admin-filter-tabs">
        {["all", "pending", "accepted", "preparing", "ready"].map((s) => (
          <button
            key={s}
            className={filterStatus === s ? "active" : ""}
            onClick={() => setFilterStatus(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} (
            {
              orders.filter((o) => {
                const st = (o.status || "pending").toLowerCase();
                return (
                  st === s ||
                  (s === "pending" &&
                    (st === "order placed" || st === "pending"))
                );
              }).length
            }
            )
          </button>
        ))}
        <button className="refresh-btn" onClick={fetchOrders} title="Refresh">
          ⟳
        </button>
      </div>

      <div className="orders-grid">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))
        ) : (
          <p>No orders in this category.</p>
        )}
      </div>
    </div>
  );
};

const OrderCard = ({ order, onStatusChange }) => {
  const status = (order.status || "pending").toLowerCase();
  const isPending = status === "pending" || status === "order placed";
  const isAccepted = status === "accepted";
  const isPreparing = status === "preparing";
  const isReady = status === "ready";

  const color = isPending
    ? "#ef4444"
    : isAccepted
    ? "#f59e0b"
    : isPreparing
    ? "#3b82f6"
    : isReady
    ? "#10b981"
    : "#6b7280";

  const nextAction = isPending
    ? "Accept Order"
    : isAccepted
    ? "Mark Preparing"
    : isPreparing
    ? "Mark Ready"
    : null;

  // ✅ Backend returns items[].food object + totalAmount
  const items = Array.isArray(order.items) ? order.items : [];
  const getName = (it) => it?.food?.name || it?.name || "Item";
  const getQty = (it) => Number(it?.quantity || 0);

  return (
    <div className="order-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="order-header">
        <strong>Order #{String(order._id).slice(-6)}</strong>
        <span className="status" style={{ color }}>
          {order.status || "Pending"}
        </span>
      </div>

      <p>
        <strong>Total:</strong> ₹{order.totalAmount ?? 0}
      </p>
      <p>
        <strong>Time:</strong>{" "}
        {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
      </p>

      <div className="order-items">
        <strong>Items:</strong>
        {items.map((it, i) => (
          <div key={i} className="item-row">
            <span>{getName(it)}</span>
            <span>x{getQty(it)}</span>
          </div>
        ))}
      </div>

      {nextAction && (
        <button
          className="status-btn"
          onClick={() => onStatusChange(order._id, status)}
          style={{ background: color }}
        >
          {nextAction}
        </button>
      )}

      {isReady && <p className="ready-msg">✅ Ready for Pickup</p>}
    </div>
  );
};

export default AdminDashboard;
