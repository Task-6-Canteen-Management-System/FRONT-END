import React, { useState, useContext, useEffect } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import SearchBar from '../../components/SearchBar/SearchBar'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import SpecialDishofTheDay from '../../components/SpecialDishofTheDay/SpecialDishofTheDay'
import AppDownload from '../../components/AppDownload/AppDownload'
import { useNavigate, useLocation } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
import { assets } from '../../assets/frontend_assets/assets'

const Home = () => {
  const [category,setCategory]=useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { getTotalCartItems } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Reset category and search to "All" when navigating to home page
    // Check if we're on home page and reset category
    if (location.pathname === '/') {
      // Reset category when location state indicates reset (from logo/Home click)
      // or when search params include reset (for forced reset)
      if (location.state?.resetCategory || location.search.includes('reset=')) {
        setCategory("All");
        setSearchQuery("");
      }
    }
  }, [location.pathname, location.state, location.search]);
  
  // Also reset on initial mount
  useEffect(() => {
    setCategory("All");
    setSearchQuery("");
  }, []);
  
  return (
    <div>
      <Header/>
      <ExploreMenu category={category} setCategory={setCategory} />
      <SearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        category={category}
        setCategory={setCategory}
      />
      <SpecialDishofTheDay />
      <FoodDisplay category={category} searchQuery={searchQuery}/>
      <AppDownload/>
      
      {/* Floating Cart Icon */}
      {getTotalCartItems() > 0 && (
        <div className="floating-cart-icon" onClick={() => navigate('/cart')}>
          <img src={assets.basket_icon} alt="Cart" />
          <span className="cart-badge">{getTotalCartItems()}</span>
        </div>
      )}
    </div>
  )
}

export default Home
