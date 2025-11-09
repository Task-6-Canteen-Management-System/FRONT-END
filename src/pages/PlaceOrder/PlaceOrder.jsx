import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { getTotalCartAmount, token, food_list, cartItems, getCartQuantity, url } =
    useContext(StoreContext);

  const [orderCount, setOrderCount] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: "",
    phone: "",
    hostel: "",
    roomNo: "",
  });

  // ✅ Fetch all orders (for loyalty)
  const fetchOrderCount = async () => {
    try {
      const response = await axios.get(`${url}/api/order/allOrders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        setOrderCount(response.data.data.length);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // ✅ Place order (Ajay Café backend)
  const placeOrder = async (event) => {
    event.preventDefault();

    if (!deliveryDetails.name || !deliveryDetails.phone || !deliveryDetails.hostel || !deliveryDetails.roomNo) {
      toast.error("Please fill all delivery details");
      return;
    }

    let orderItems = [];
    food_list.forEach((item) => {
      const quantity = getCartQuantity ? getCartQuantity(item._id) : (cartItems[item._id] || 0);
      if (quantity > 0) {
        orderItems.push({ foodId: item._id, quantity });
      }
    });

    if (orderItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    const orderData = {
      deliveryDetails,
      paymentMethod: "COD", // or "ONLINE"
    };

    try {
      const response = await axios.post(`${url}/api/order/createOrder`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrderPlaced(true);
        toast.success("✅ Order placed successfully!");
      } else {
        toast.error(response.data.message || "Something went wrong!");
      }
    } catch (err) {
      console.error("Order placement failed:", err);
      toast.error("Server error while placing order.");
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please login first");
      navigate("/cart");
    } else if (getTotalCartAmount() === 0) {
      toast.error("Please add items to your cart");
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
            <h2>✅ Order Placed!</h2>
            <p>Your order has been successfully placed.</p>
            <p>Go to "My Orders" to track your order status.</p>

            <div className="cart-total-details">
              <p>Subtotals</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <p>Platform Fee</p>
              <p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{getTotalCartAmount() + 2}</b>
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
          <h2>Delivery Details</h2>

          <input
            type="text"
            placeholder="Full Name"
            value={deliveryDetails.name}
            onChange={(e) =>
              setDeliveryDetails({ ...deliveryDetails, name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={deliveryDetails.phone}
            onChange={(e) =>
              setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Hostel"
            value={deliveryDetails.hostel}
            onChange={(e) =>
              setDeliveryDetails({ ...deliveryDetails, hostel: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Room No."
            value={deliveryDetails.roomNo}
            onChange={(e) =>
              setDeliveryDetails({ ...deliveryDetails, roomNo: e.target.value })
            }
          />

          {orderCount % 6 === 5 && (
            <div className="loyalty-notification">
              <p>🎉 <strong>It’s your 6th order!</strong></p>
              <p>You’ll receive a complimentary item soon!</p>
            </div>
          )}

          <h2>Your Cart Total</h2>

          <div className="cart-total-details">
            <p>Subtotals</p>
            <p>₹{getTotalCartAmount()}</p>
          </div>

          <hr />

          <div className="cart-total-details">
            <p>Platform Fee</p>
            <p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
          </div>

          <hr />

          <div className="cart-total-details">
            <b>Total</b>
            <b>₹{getTotalCartAmount() + 2}</b>
          </div>

          <button type="submit">PLACE ORDER</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
