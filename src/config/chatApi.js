import axios from "axios";

const CHAT_API_BASE_URL = "https://canteen-recommendation-system.onrender.com";

export const sendChatMessage = async ({ new_message, history = [] } = {}) => {
  try {
    if (!new_message || new_message.trim() === "") {
      throw new Error("new_message is required");
    }

    const requestBody = {
      history: history || [],
      new_message: new_message.trim()
    };

    const fullUrl = `${CHAT_API_BASE_URL}/chat/chat`;
    console.log('💬 [Chat API] Making request to:', fullUrl);
    console.log('📤 [Chat API] Request body:', requestBody);

    const response = await axios.post(fullUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      }
    });

    console.log('📥 [Chat API] Response status:', response.status);
    console.log('📥 [Chat API] Response data:', response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("❌ [Chat API] Error sending message:", error);
    console.error("❌ [Chat API] Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url
    });

    let errorMessage = "Failed to send message";

    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;
      console.error(`❌ [Chat API] HTTP Error ${status}:`, responseData);

      switch (status) {
        case 400:
          errorMessage = responseData?.message || "Invalid request. Please check your message.";
          break;
        case 405:
          const allowedMethods = error.response?.headers?.['allow'] || error.response?.headers?.['Allow'];
          if (allowedMethods && !allowedMethods.includes('OPTIONS')) {
            errorMessage = "CORS Error: The server doesn't allow OPTIONS requests. The backend needs to handle CORS preflight requests.";
          } else {
            errorMessage = "Method not allowed. Please check the API endpoint.";
          }
          break;
        case 422:
          const validationErrors = responseData?.detail;
          if (validationErrors && Array.isArray(validationErrors)) {
            const errorDetails = validationErrors.map(err => err.msg).join(', ');
            errorMessage = `Validation error: ${errorDetails}`;
          } else {
            errorMessage = responseData?.message || "Invalid request format. Please check your input.";
          }
          break;
        case 502:
          errorMessage = "Chat service is temporarily unavailable. Please try again later.";
          break;
        case 503:
          errorMessage = "Chat service is currently under maintenance.";
          break;
        case 500:
          errorMessage = "Internal server error. Please try again later.";
          break;
        case 404:
          errorMessage = "Chat endpoint not found.";
          break;
        default:
          errorMessage = responseData?.message || `Server error (${status}). Please try again.`;
      }
    } else if (error.request) {
      console.error("❌ [Chat API] No response received. Network error or CORS issue.");
      console.error("❌ [Chat API] Request details:", {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
      
      if (error.message && (
        error.message.includes('CORS') || 
        error.message.includes('Network Error') ||
        error.message.includes('Failed to fetch')
      )) {
        const errorString = JSON.stringify(error);
        if (errorString.includes('preflight') || errorString.includes('Redirect is not allowed')) {
          errorMessage = "CORS Error: The server is redirecting the preflight request, which is not allowed. The backend must handle OPTIONS requests without redirecting and return proper CORS headers.";
        } else if (errorString.includes('Access-Control-Allow-Origin')) {
          errorMessage = "CORS Error: The chat service is not allowing requests from this origin. The backend needs to include 'http://localhost:5173' in Access-Control-Allow-Origin header.";
        } else {
          errorMessage = "CORS error: The chat service is not allowing requests from this origin. Please check backend CORS configuration.";
        }
      } else {
        errorMessage = "Unable to connect to chat service. This could be a network issue or CORS configuration problem. Please check your internet connection and backend CORS settings.";
      }
    } else {
      console.error("❌ [Chat API] Request setup error:", error.message);
      errorMessage = error.message || "An unexpected error occurred.";
    }

    return {
      success: false,
      error: errorMessage,
      data: null,
    };
  }
};

export const checkChatApiStatus = async () => {
  try {
    const response = await axios.get(`${CHAT_API_BASE_URL}/chat/`, {
      headers: {
        'accept': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data,
      available: true
    };
  } catch (error) {
    console.error("❌ [Chat API] Status check failed:", error);
    return {
      success: false,
      error: error.message || "Unable to check API status",
      available: false
    };
  }
};

export const convertToApiHistory = (messages) => {
  return messages
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
};

export const convertFromApiHistory = (apiHistory) => {
  return apiHistory.map(msg => ({
    role: msg.role === 'model' ? 'assistant' : 'user',
    content: msg.parts?.[0]?.text || '',
    timestamp: new Date()
  }));
};

