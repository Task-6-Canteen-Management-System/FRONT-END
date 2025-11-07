import React from "react";
import "./SearchBar.css";
import { menu_list } from "../../assets/frontend_assets/assets";

const SearchBar = ({ searchQuery, setSearchQuery, category, setCategory }) => {
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar-wrapper">
        <div className="search-input-container">
          <svg
            className="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name (e.g., Burger, Pizza, Coffee)..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={clearSearch}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <div className="category-filter-container">
          <svg
            className="filter-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <select
            className="category-filter"
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="All">All Categories</option>
            {menu_list.map((item, index) => (
              <option key={index} value={item.menu_name}>
                {item.menu_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {searchQuery && (
        <div className="search-results-info">
          <p>Searching for: <strong>"{searchQuery}"</strong></p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

