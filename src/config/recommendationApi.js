import axios from "axios";

const RECOMMENDATION_API_BASE_URL = "https://api-general-latest.onrender.com";
const BACKEND_URL = "https://ajay-cafe-1.onrender.com"

export const fetchPopularItems = async ({ limit = 5, window_days = null } = {}) => {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());

    if (window_days !== null && window_days !== undefined) {
      if (window_days < 1) throw new Error("window_days must be at least 1");
      params.append("window_days", window_days.toString());
    }

    const fullUrl = `${RECOMMENDATION_API_BASE_URL}/recommend/popular?${params.toString()}`;
    console.log("🌐 [API] Requesting popular items:", fullUrl);

    const response = await axios.get(fullUrl);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("❌ [API] Error fetching popular items:", error);
    let message = "Failed to fetch popular items.";
    if (error.response) {
      message = error.response.data?.message || `Server error (${error.response.status})`;
    } else if (error.request) {
      message = "No response received. Possible CORS or network issue.";
    }
    return { success: false, error: message };
  }
};

export const fetchSimilarItems = async ({ item_name, limit = 6 } = {}) => {
  try {
    if (!item_name) throw new Error("item_name is required");

    const fullUrl = `${RECOMMENDATION_API_BASE_URL}/recommend/similar?item_name=${encodeURIComponent(
      item_name
    )}&limit=${limit}`;

    console.log("🌐 [API] Fetching similar items:", fullUrl);

    const response = await axios.get(fullUrl);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("❌ [API] Error fetching similar items:", error);

    let message = "Failed to fetch similar items.";
    if (error.response) {
      const status = error.response.status;
      message = `Server error (${status})`;
    } else if (error.request) {
      message = "No response received. Network or CORS issue.";
    }
    return { success: false, error: message };
  }
};


export const fetchMenu = async () => {
  try {
    const fullUrl = `${BACKEND_URL}/api/menu/getMenu`;
    console.log("🌐 [API] Fetching full menu:", fullUrl);

    const response = await axios.get(fullUrl);

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("❌ [API] Error fetching menu:", error);

    let message = "Failed to fetch menu.";
    if (error.response) {
      message = error.response.data?.message || `Server error (${error.response.status})`;
    } else if (error.request) {
      message = "No response received. Possible CORS or network issue.";
    }
    return { success: false, error: message };
  }
};