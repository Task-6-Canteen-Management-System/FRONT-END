import React, { useState, useEffect, useContext } from "react";
import "./PopularItems.css";
import { StoreContext } from "../../context/StoreContext";
import { fetchPopularItems } from "../../config/recommendationApi";

const PopularItems = ({ limit = 5, window_days = null }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { food_list, addToCart } = useContext(StoreContext);

  const normalizeName = (name) =>
    name?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";

  const getFoodItemDetails = (itemName) =>
  food_list.find(
    (item) =>
      normalizeName(item.item_name || item.name) === normalizeName(itemName)
  );

  useEffect(() => {
    const loadPopularItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchPopularItems({ limit, window_days });
        if (result.success && result.data) {
          const items = result.data.recommendations || result.data || [];
          setRecommendations(items);
        } else {
          setError(result.error || "Failed to load popular items");
        }
      } catch (err) {
        console.error(err);
        setError("Unexpected error while fetching popular items");
      } finally {
        setLoading(false);
      }
    };

    loadPopularItems();
  }, [limit, window_days]);

  const handleAddToCart = (itemName) => {
    const foodItem = getFoodItemDetails(itemName);
    if (foodItem && foodItem._id) {
      addToCart(foodItem._id);
    } else {
      alert(`${itemName} is not available in the menu right now.`);
    }
  };

  if (loading) {
    return (
      <div className="popular-items-section">
        <h2>Popular Items</h2>
        <div className="loading">Loading popular items...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popular-items-section">
        <h2>Popular Items</h2>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="popular-items-section">
      <div className="popular-items-header">
        <h2>🔥 Popular Items</h2>
        <p className="popular-items-subtitle">
          Most ordered items{" "}
          {window_days ? `in the last ${window_days} days` : "recently"}
        </p>
      </div>

      <div className="popular-items-list">
        {recommendations.map((item, index) => {
          const itemName = item.item_name || item.name || "";
          const foodItem = getFoodItemDetails(itemName);
          const orderCount = item.order_count || item.count || 0;
          const price = foodItem?.price || "—";
          const available = !!foodItem?._id;

          return (
            <div key={index} className="popular-item-card">
              <div className="popular-item-info">
                <div className="popular-item-rank">#{index + 1}</div>
                <div className="popular-item-details">
                  <h3 className="popular-item-name">{itemName}</h3>
                  <p className="popular-item-orders">
                    {orderCount} {orderCount === 1 ? "order" : "orders"}
                  </p>
                  <p className="popular-item-price">₹{price}</p>
                </div>
              </div>

              <button
                className={`popular-item-add-btn ${
                  !available ? "disabled" : ""
                }`}
                onClick={() => available && handleAddToCart(itemName)}
                disabled={!available}
              >
                {available ? "Add to Cart" : "Unavailable"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularItems;
