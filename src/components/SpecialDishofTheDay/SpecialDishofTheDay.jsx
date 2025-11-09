import React, { useContext, useEffect, useState } from "react";
import "./SpecialDishofTheDay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const SpecialDishofTheDay = () => {
  const { food_list } = useContext(StoreContext);
  const [recommended, setRecommended] = useState([]); 
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch("https://canteen-recommendation-api-latest.onrender.com");
        if (!res.ok) throw new Error("API not responding");
        const data = await res.json();
        console.log("✅ ML API Response:", data);
        setRecommended(data.recommendations || []);
      } catch (err) {
        console.error("❌ ML API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  
  const specialDish = food_list.find(
    (item) => item.isSpecialToday === true || item.isSpecialToday === "true"
  );

  if (!specialDish) return null;

  const discount = specialDish.discount || 0;
  const originalPrice = specialDish.originalPrice || specialDish.price;
  const specialPrice =
    specialDish.specialPrice ||
    (discount > 0
      ? Math.round(originalPrice - (originalPrice * discount) / 100)
      : originalPrice);

  
  const recommendedItems = food_list.filter((item) =>
    recommended.includes(item.name)
  );

  
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
            <span className="save-text">
              Save ₹{originalPrice - specialPrice}
            </span>
          </div>
        )}
      </div>

      {/* ---- 5️⃣ Recommended Dishes Section ---- */}
      <div className="recommendation-section">
        <h3>🍽 Recommended for You</h3>
        {loading ? (
          <p>Loading recommendations...</p>
        ) : recommendedItems.length > 0 ? (
          <div className="recommended-list">
            {recommendedItems.map((item) => (
              <FoodItem
                key={item._id}
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
              />
            ))}
          </div>
        ) : (
          <p>No recommendations available right now.</p>
        )}
      </div>
    </div>
  );
};

export default SpecialDishofTheDay;
