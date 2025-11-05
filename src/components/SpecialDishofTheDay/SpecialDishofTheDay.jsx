import React, { useContext } from "react";
import "./SpecialDisofTheDay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const SpecialDishofTheDay = () => {
  const { food_list } = useContext(StoreContext);
  const specialDish = food_list.find(
    (item) => item.isSpecialToday === true || item.isSpecialToday === "true"
  );

  if (!specialDish) {
    return null; 
  }

  const discount = specialDish.discount || 0;
  const originalPrice = specialDish.originalPrice || specialDish.price;
  const specialPrice =
    specialDish.specialPrice ||
    (discount > 0 ? Math.round(originalPrice - (originalPrice * discount) / 100) : originalPrice);

  return (
    <div className="special-dish-section">
      <div className="special-dish-header">
        <div className="special-dish-badge">
          <span className="special-icon">🔥</span>
          <h2>Special Dish of the Day</h2>
        </div>
        <p className="special-dish-subtitle">
          Today's exclusive offer with special discount!
        </p>
      </div>
      <div className="special-dish-content">
        <FoodItem
          id={specialDish._id}
          name={specialDish.name}
          description={specialDish.description}
          price={specialPrice}
          originalPrice={originalPrice}
          image={specialDish.image}
          isSpecial={true}
          discount={discount}
        />
        {discount > 0 && (
          <div className="special-offer-badge">
            <span className="discount-percentage">{discount}% OFF</span>
            <span className="save-text">Save ₹{originalPrice - specialPrice}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialDishofTheDay;
