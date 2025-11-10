import React, { useState, useEffect, useContext } from "react";
import "./SimilarItems.css";
import { StoreContext } from "../../context/StoreContext";
import { fetchSimilarItems } from "../../config/recommendationApi";

const SimilarItems = ({ baseItemName = "burger", limit = 6 }) => {
  const [similarItems, setSimilarItems] = useState([]);
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
    const loadSimilarItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchSimilarItems({
          item_name: baseItemName,
          limit,
        });

        if (result.success && result.data) {
          const items = result.data.recommendations || result.data || [];
          setSimilarItems(items);
        } else {
          setError(result.error || "Failed to load similar items");
        }
      } catch (err) {
        console.error("💥 [SimilarItems] Error:", err);
        setError("Unexpected error while fetching similar items");
      } finally {
        setLoading(false);
      }
    };

    loadSimilarItems();
  }, [baseItemName, limit]);

  const handleAddToCart = (itemName) => {
    const foodItem = getFoodItemDetails(itemName);
    if (foodItem && foodItem._id) {
      addToCart(foodItem._id);
    } else {
      alert(`${itemName} is not available in the menu right now.`);
    }
  };

  if (loading)
    return (
      <div className="similar-items-section">
        <h2>✨ Recommended for You</h2>
        <p>Loading similar items...</p>
      </div>
    );

  if (error)
    return (
      <div className="similar-items-section">
        <h2>✨ Recommended for You</h2>
        <p className="error">{error}</p>
      </div>
    );

  if (similarItems.length === 0) return null;

  return (
    <div className="similar-items-section">
      <h2>✨ Recommended for You</h2>
      <div className="similar-items-grid">
        {similarItems.map((item, index) => {
          const itemName = item.item_name || item.name || "";
          const foodItem = getFoodItemDetails(itemName);
          const available = !!foodItem?._id;
          const price = foodItem?.price || "—";

          return (
            <div key={index} className="similar-item-card">
              <h3 className="similar-item-name">{itemName}</h3>
              <p className="similar-item-price">
                ₹{price === "—" ? "—" : price}
              </p>

              <button
                className={`similar-item-add-btn ${
                  available ? "" : "disabled"
                }`}
                onClick={() => available && handleAddToCart(itemName)}
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

export default SimilarItems;
