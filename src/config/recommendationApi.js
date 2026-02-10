import axios from "axios";

// Use proxy in development to avoid CORS issues
const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
const RECOMMENDATION_API_BASE_URL = isDev
  ? "/api/recommend"  // Use Vite proxy in development
  : "https://api-general-latest.onrender.com";  // Direct URL in production

const BACKEND_URL = "https://ajay-cafe-1.onrender.com"

// ---------- Internal helpers (fallbacks) ----------
const fetchMenuDirect = async () => {
  const url = `${BACKEND_URL}/api/menu/getMenu`;
  const res = await axios.get(url, { withCredentials: false });
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
};

const buildPopularFromMenu = (menuList = [], limit = 5) => {
  const items = (menuList || []).slice(0, Math.max(0, limit));
  return items.map((it, idx) => ({
    item_name: it?.name || it?.item_name || `Item ${idx + 1}`,
    order_count: it?.order_count || it?.count || 0,
  }));
};

const buildSimilarFromMenu = (menuList = [], baseName = "", limit = 6) => {
  const normalized = (baseName || "").toLowerCase();
  const scored = (menuList || []).map((it) => {
    const name = (it?.name || it?.item_name || "").toLowerCase();
    let score = 0;
    if (name.includes(normalized)) score += 2;
    if (normalized && name[0] === normalized[0]) score += 1;
    return { it, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored
    .filter((s) => s.score > 0)
    .slice(0, Math.max(0, limit))
    .map((s) => ({ item_name: s.it?.name || s.it?.item_name }));
};

export const fetchPopularItems = async ({ limit = 5, window_days = null } = {}) => {
  try {
    // In development, avoid noisy failing network calls; synthesize from menu.
    if (isDev) {
      const menu = await fetchMenuDirect();
      const data = buildPopularFromMenu(menu, limit);
      return { success: true, data };
    }

    const params = new URLSearchParams();
    params.append("limit", limit.toString());

    if (window_days !== null && window_days !== undefined) {
      if (window_days < 1) throw new Error("window_days must be at least 1");
      params.append("window_days", window_days.toString());
    }

    // Try the endpoint - API might expect /recommend/popular or just /popular
    const fullUrl = isDev
      ? `${RECOMMENDATION_API_BASE_URL}/popular?${params.toString()}`
      : `${RECOMMENDATION_API_BASE_URL}/recommend/popular?${params.toString()}`;
    console.log("🌐 [API] Requesting popular items:", fullUrl);
    console.log("🌐 [API] Base URL:", RECOMMENDATION_API_BASE_URL);
    console.log("🌐 [API] Is Dev:", isDev);

    const response = await axios.get(fullUrl, {
      withCredentials: false,  // Don't send credentials to avoid CORS issues
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("❌ [API] Error fetching popular items:", error);
    // Fallback to menu-derived popular items for 4xx/5xx
    try {
      const status = error?.response?.status;
      if (status && [400, 401, 403, 404, 500, 502, 503].includes(status)) {
        const menu = await fetchMenuDirect();
        const fallback = buildPopularFromMenu(menu, limit);
        if (fallback.length > 0) {
          console.warn("⚠️ [API] Using fallback popular items from menu");
          return { success: true, data: fallback };
        }
      }
    } catch (fallbackErr) {
      console.error("❌ [API] Popular fallback failed:", fallbackErr);
    }
    let message = "Failed to fetch popular items.";
    if (error?.response) {
      message = error.response.data?.message || `Server error (${error.response.status})`;
    } else if (error?.request) {
      message = "No response received. Possible CORS or network issue.";
    }
    return { success: false, error: message };
  }
};

export const fetchSimilarItems = async ({ item_name, limit = 6 } = {}) => {
  try {
    if (!item_name) throw new Error("item_name is required");

    // In development, avoid failing calls; synthesize from menu.
    if (isDev) {
      const menu = await fetchMenuDirect();
      const data = buildSimilarFromMenu(menu, item_name, limit);
      return { success: true, data };
    }

    const fullUrl = isDev
      ? `${RECOMMENDATION_API_BASE_URL}/similar?item_name=${encodeURIComponent(item_name)}&limit=${limit}`
      : `${RECOMMENDATION_API_BASE_URL}/recommend/similar?item_name=${encodeURIComponent(item_name)}&limit=${limit}`;

    console.log("🌐 [API] Fetching similar items:", fullUrl);
    console.log("🌐 [API] Base URL:", RECOMMENDATION_API_BASE_URL);
    console.log("🌐 [API] Is Dev:", isDev);

    const response = await axios.get(fullUrl, {
      withCredentials: false,  // Don't send credentials to avoid CORS issues
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("❌ [API] Error fetching similar items:", error);
    // Fallback to simple name-based similarity from menu
    try {
      const status = error?.response?.status;
      if (status && [400, 401, 403, 404, 500, 502, 503].includes(status)) {
        const menu = await fetchMenuDirect();
        const fallback = buildSimilarFromMenu(menu, item_name, limit);
        if (fallback.length > 0) {
          console.warn("⚠️ [API] Using fallback similar items from menu");
          return { success: true, data: fallback };
        }
      }
    } catch (fallbackErr) {
      console.error("❌ [API] Similar fallback failed:", fallbackErr);
    }
    let message = "Failed to fetch similar items.";
    if (error?.response) {
      const status = error.response.status;
      message = `Server error (${status})`;
    } else if (error?.request) {
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