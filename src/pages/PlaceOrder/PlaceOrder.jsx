import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {
  const navigate= useNavigate();

  const { getTotalCartAmount, token, food_list, cartItems, getCartQuantity, getCartNotes, url } =
    useContext(StoreContext);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });
  const [orderCount, setOrderCount] = useState(0);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

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
    food_list.map((item) => {
      const quantity = getCartQuantity ? getCartQuantity(item._id) : (cartItems[item._id] || 0);
      const notes = getCartNotes ? getCartNotes(item._id) : "";
      if (quantity > 0) {
        let itemInfo = { ...item };
        itemInfo["quantity"] = quantity;
        if (notes) {
          itemInfo["notes"] = notes;
        }
        orderItems.push(itemInfo);
      }
    });

    // Check if this is the 6th order (orderCount 5 = 6th order)
    const isComplementaryOrder = orderCount % 6 === 5;
    
    if (isComplementaryOrder && orderItems.length > 0) {
      // Add complementary item (lowest priced item in cart)
      const sortedItems = [...orderItems].sort((a, b) => a.price - b.price);
      const cheapestItem = sortedItems[0];
      
      // Create a free duplicate of the cheapest item
      const complementaryItem = { 
        ...cheapestItem,
        name: cheapestItem.name + " (FREE - Foodie Reward!)",
        quantity: 1,
        price: 0
      };
      orderItems.push(complementaryItem);
      toast.success("🎉 Free complementary item added to your order!");
    }

    // Calculate total amount from items (complementary items have price 0)
    let totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let orderData = {
      address: data,
      items: orderItems,
      amount: totalAmount + 2, // Keep delivery fee
    };
    
    let response= await axios.post(url+"/api/order/place",orderData,{headers:{token}});
    if(response.data.success){
      const {session_url}=response.data;
      window.location.replace(session_url);
    }else{
      toast.error("Errors!")
    }
  };

  useEffect(()=>{
    if(!token){
      toast.error("Please Login first")
      navigate("/cart")
    }
    else if(getTotalCartAmount()===0){
      toast.error("Please Add Items to Cart");
      navigate("/cart")
    } else {
      fetchOrderCount();
    }
  },[token])
  return (
    <form className="place-order" onSubmit={placeOrder}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            required
            name="firstName"
            value={data.firstName}
            onChange={onChangeHandler}
            type="text"
            placeholder="First name"
          />
          <input
            required
            name="lastName"
            value={data.lastName}
            onChange={onChangeHandler}
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          required
          name="email"
          value={data.email}
          onChange={onChangeHandler}
          type="text"
          placeholder="Email Address"
        />
        <input
          required
          name="street"
          value={data.street}
          onChange={onChangeHandler}
          type="text"
          placeholder="Street"
        />
        <div className="multi-fields">
          <input
            required
            name="city"
            value={data.city}
            onChange={onChangeHandler}
            type="text"
            placeholder="City"
          />
          <input
            required
            name="state"
            value={data.state}
            onChange={onChangeHandler}
            type="text"
            placeholder="State"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="zipcode"
            value={data.zipcode}
            onChange={onChangeHandler}
            type="text"
            placeholder="Zip Code"
          />
          <input
            required
            name="country"
            value={data.country}
            onChange={onChangeHandler}
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          name="phone"
          value={data.phone}
          onChange={onChangeHandler}
          type="text"
          placeholder="Phone"
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          {orderCount % 6 === 5 && (
            <div className="loyalty-notification">
              <p>🎉 <strong>Congratulations!</strong> This is your 6th order!</p>
              <p>You'll receive a FREE complementary item!</p>
            </div>
          )}
          <div>
            <div className="cart-total-details">
              <p>Subtotals</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>
                ₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}
              </b>
            </div>
          </div>
          <button type="submit">PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;