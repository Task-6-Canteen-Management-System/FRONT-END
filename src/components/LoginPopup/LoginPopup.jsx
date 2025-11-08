import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

// ✅ Google icon
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" width="24px" height="24px">
    <path
      fill="#4285F4"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C36.47 2.64 30.74 0 24 0 14.74 0 6.67 5.21 2.69 12.8l7.98 6.19C12.57 13.01 17.85 9.5 24 9.5z"
    />
    <path
      fill="#34A853"
      d="M46.14 24.5c0-1.64-.15-3.21-.42-4.72H24v9.03h12.5c-.54 2.85-2.13 5.26-4.5 6.89l7.07 5.48C43.72 37.04 46.14 31.2 46.14 24.5z"
    />
    <path
      fill="#FBBC05"
      d="M10.67 28.99a14.43 14.43 0 0 1 0-9.98l-7.98-6.19A24 24 0 0 0 0 24c0 3.9.93 7.6 2.69 10.9l7.98-6.19z"
    />
    <path
      fill="#EA4335"
      d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.07-5.48c-1.96 1.32-4.47 2.11-8.83 2.11-6.15 0-11.43-3.51-13.33-8.6l-7.98 6.19C6.67 42.79 14.74 48 24 48z"
    />
  </svg>
);

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken, userType, setUserType } = useContext(StoreContext);

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    role: "customer",
    userId: "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let newUrl = url;
    let requestData = { ...data };
    
    if (userType === "admin") {
      if (mode === "login") {
        if (!data.userId || !data.password) {
          toast.error("Please fill in all required fields.");
          return;
        }
        newUrl += "/api/admin/login";
        requestData = {
          userId: data.userId.trim(),
          password: data.password
        };
      } else {
        if (!data.username || !data.userId || !data.password) {
          toast.error("Please fill in all required fields.");
          return;
        }
        newUrl += "/api/admin/register";
        requestData = {
          name: data.username.trim(),
          userId: data.userId.trim(),
          password: data.password,
          role:"customer"
        };
      }
    } else {
      if (mode === "login") {
        if (!data.email || !data.password) {
          toast.error("Please fill in all required fields.");
          return;
        }
        newUrl += "/api/user/login";
        requestData = {
          email: data.email.trim(),
          password: data.password
        };
      } else {
        if (!data.username || !data.email || !data.password || !data.role) {
          toast.error("Please fill in all required fields.");
          return;
        }
        newUrl += "/api/user/register";
        requestData = {
          username: data.username.trim(),
          email: data.email.trim(),
          password: data.password,
          role:data.role
        };
      }
    }
    
    try {
            console.log("Here is the body I am sending",requestData)

      const response = await axios.post(newUrl, requestData, {
        withCredentials:true
      });
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userType", userType);
        setUserType(userType);
        toast.success(`${userType === "admin" ? "Admin" : "User"} ${mode === "login" ? "Login" : "Registration"} Successfully`);
        setShowLogin(false);
      } else {
        toast.error(response.data.message || `${mode === "login" ? "Login" : "Registration"} failed. Please try again.`);
      }
    } catch (error) {
      console.error("Login/Register error:", error);
      console.error("Request URL:", newUrl);
      console.error("Request Data:", requestData);
      console.error("Response:", error.response?.data);
      
      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;
        
        switch (status) {
          case 400:
            toast.error(responseData?.message || "Invalid request. Please check your input.");
            break;
          case 401:
            toast.error(responseData?.message || "Invalid email or password.");
            break;
          case 404:
            toast.error(responseData?.message || "Endpoint not found. Please contact support.");
            break;
          case 500:
            toast.error(responseData?.message || "Server error. The backend service may be experiencing issues. Please try again later.");
            console.error("Server error details:", responseData);
            break;
          case 502:
          case 503:
            toast.error("Service temporarily unavailable. Please try again later.");
            break;
          default:
            toast.error(responseData?.message || `Error ${status}: Something went wrong. Please try again.`);
        }
      } else if (error.request) {
        toast.error("Network error. Unable to reach the server. Please check your connection.");
      } else {
        toast.error(error.message || "An unexpected error occurred. Please try again.");
      }
    }
  };

  // ✅ Google login
  const handleGoogleLogin = () => {
    window.open(`${url}/api/user/auth/google`, "_self");
    // ✅ Optional: Close popup immediately
    setShowLogin(false);
  };

  return (
    <div className="login-popup">
      <div className="login-popup-container">
        <button onClick={() => setShowLogin(false)} className="close-btn">
          ×
        </button>

        <h2>{mode === "login" ? "Login" : "Create Account"}</h2>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === "signup" && (
            <input
              type="text"
              name="username"
              value={data.username}
              onChange={handleChange}
              placeholder="Username"
              required
            />
          )}

          <input
            type="email"
            name="email"
            value={data.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />

          <input
            type="password"
            name="password"
            value={data.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />

          {mode === "signup" && (
            <div className="role-select">
              <label>Select Role:</label>
              <select
                name="role"
                value={data.role}
                onChange={handleChange}
                required
              >
                <option value="customer">Customer</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-submit">
            {mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="divider">or</div>

        <button onClick={handleGoogleLogin} className="google-btn">
          <GoogleIcon /> Continue with Google
        </button>

        <p className="toggle-text">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <span onClick={() => setMode("signup")}>Sign up</span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span onClick={() => setMode("login")}>Login</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginPopup;
