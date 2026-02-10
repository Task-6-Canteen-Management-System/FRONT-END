import React, { useContext, useMemo } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category, searchQuery = "" }) => {
  const { food_list } = useContext(StoreContext);
  
  const filteredItems = useMemo(() => {
    return food_list.filter((item) => {
      const matchesCategory = category === "All" || category === item.category;
      
      const matchesSearch = searchQuery === "" || 
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [food_list, category, searchQuery]);
  
  const getHeading = () => {
    if (searchQuery) {
      return `Search Results${category !== "All" ? ` in ${category}` : ""}`;
    }
    if (category === "All") {
      return "Hot Picks";
    }
    return category;
  };
  
  return (
    <div className="food-display" id="food-display">
      <h2>{getHeading()}</h2>
      {filteredItems.length === 0 ? (
        <div className="no-results">
          <p className="no-results-text">
            {searchQuery
              ? `No items found matching "${searchQuery}"${category !== "All" ? ` in ${category}` : ""}`
              : `No items found in ${category}`}
          </p>
          <p className="no-results-suggestion">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="food-display-list">
          {filteredItems.map((item, index) => (
            <FoodItem
              key={item._id || index}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
              isSpecial={item.isSpecialToday === true || item.isSpecialToday === "true"}
              discount={item.discount || 0}
              originalPrice={item.originalPrice || null}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodDisplay;