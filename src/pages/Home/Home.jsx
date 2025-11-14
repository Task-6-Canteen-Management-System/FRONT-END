import React, { useState, useContext, useEffect, useCallback } from "react";
import "./Home.css";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import SearchBar from "../../components/SearchBar/SearchBar";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import SpecialDishofTheDay from "../../components/SpecialDishofTheDay/SpecialDishofTheDay";
import AppDownload from "../../components/AppDownload/AppDownload";
import { useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../assets/frontend_assets/assets";
import { fetchPopularItems } from "../../config/recommendationApi"; 
import SimilarItems from "../../components/SimilarItems/SimilarItems"; 

const Home = () => {
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState(null);
  const { getTotalCartItems, food_list, addToCart, token } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      if (location.state?.resetCategory || location.search.includes("reset=")) {
        setCategory("All");
        setSearchQuery("");
      }
    }
  }, [location.pathname, location.state, location.search]);

  useEffect(() => {
    setCategory("All");
    setSearchQuery("");
  }, []);

  const loadRecommendations = useCallback(async () => {
    setLoadingRecommendations(true);
    setRecommendationError(null);

    try {
      const result = await fetchPopularItems({
        top_n: 5,
        window_days: null,
      });

      if (result.success && result.data) {
        setRecommendations(result.data.recommendations || result.data || []);
        setRecommendationError(null);
      } else {
        setRecommendationError(result.error || "Failed to load popular items");
        setRecommendations([]);
      }
    } catch (error) {
      console.error("💥 [Recommendations] Exception:", error);
      setRecommendationError("Unable to connect to recommendation service.");
      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const getFoodItemDetails = (itemName) =>
    food_list.find((item) => item.name.toLowerCase() === itemName.toLowerCase());

  const handleAddToCart = (itemName) => {
    const foodItem = getFoodItemDetails(itemName);
    if (foodItem && foodItem._id) addToCart(foodItem._id);
  };

  return (
    <div>
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} />
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        category={category}
        setCategory={setCategory}
      />
      <SpecialDishofTheDay />

      <div className="popular-items-section">
        <div className="popular-items-header">
          <h2>🔥 Popular Items</h2>
          <p className="popular-items-subtitle">Most ordered items recently</p>
        </div>

        {loadingRecommendations ? (
          <div className="loading">Loading popular items...</div>
        ) : recommendationError ? (
          <div className="recommendation-error">
            <p className="error-message">{recommendationError}</p>
            <button className="retry-btn" onClick={loadRecommendations}>
              Retry
            </button>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="popular-items-list">
            {recommendations.map((item, index) => {
              const foodItem = getFoodItemDetails(item.item_name || item.name);
              const orderCount = item.order_count || item.count || 0;
              return (
                <div key={index} className="popular-item-card">
                  <div className="popular-item-info">
                    <div className="popular-item-rank">#{index + 1}</div>
                    <div className="popular-item-details">
                      <h3 className="popular-item-name">
                        {item.item_name || item.name}
                      </h3>
                      <p className="popular-item-orders">
                        {orderCount} {orderCount === 1 ? "order" : "orders"}
                      </p>
                      {foodItem && (
                        <p className="popular-item-price">₹{foodItem.price}</p>
                      )}
                    </div>
                  </div>
                  {foodItem && foodItem._id && (
                    <button
                      className="popular-item-add-btn"
                      onClick={() =>
                        handleAddToCart(item.item_name || item.name)
                      }
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="recommendation-error">
            <p className="error-message">No popular items available right now</p>
            <button className="retry-btn" onClick={loadRecommendations}>
              Retry
            </button>
          </div>
        )}
      </div>

      <SimilarItems baseItemName="Burger" limit={6} />

      <FoodDisplay category={category} searchQuery={searchQuery} />
      <AppDownload />

      {getTotalCartItems() > 0 && (
        <div className="floating-cart-icon" onClick={() => navigate("/cart")}>
          <img src={assets.basket_icon} alt="Cart" />
          <span className="cart-badge">{getTotalCartItems()}</span>
        </div>
      )}
    </div>
  );
};

export default Home;
