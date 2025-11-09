import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
  const { url, setToken } = useContext(StoreContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // login or signup
  const [role, setRole] = useState("user"); // user or admin

  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    userId: "",
    name: "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let newUrl = url;
    let requestData = {};

    try {
      if (role === "user") {
        if (mode === "signup") {
          if (!data.username || !data.email || !data.password) {
            toast.error("Please fill all required fields");
            return;
          }
          newUrl += "/api/user/register";
          requestData = {
            username: data.username.trim(),
            email: data.email.trim(),
            password: data.password,
            role: "user",
          };
        } else {
          if (!data.email || !data.password) {
            toast.error("Please fill all required fields");
            return;
          }
          newUrl += "/api/user/login";
          requestData = {
            email: data.email.trim(),
            password: data.password,
          };
        }
      } else if (role === "admin") {
        if (mode === "signup") {
          if (!data.name || !data.userId || !data.password) {
            toast.error("Please fill all required fields");
            return;
          }
          newUrl += "/api/admin/register";
          requestData = {
            name: data.name.trim(),
            userId: data.userId.trim(),
            password: data.password,
            role: "admin",
          };
        } else {
          if (!data.userId || !data.password) {
            toast.error("Please fill all required fields");
            return;
          }
          newUrl += "/api/admin/login";
          requestData = {
            userId: data.userId.trim(),
            password: data.password,
          };
        }
      }

      console.log("📤 Sending:", requestData);
      console.log("🌍 URL:", newUrl);

      const response = await axios.post(newUrl, requestData, {
        withCredentials: true,
      });

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", role);
        toast.success(`${role} ${mode} successful`);
        setShowLogin(false);
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (error) {
      console.error(" Auth error:", error);
      toast.error(error.response?.data?.message || "Server error occurred");
    }
  };
  

  const handleGoogleLogin = () => {
    window.open(`${url}/api/user/google`, "_self");
    setShowLogin(false);
  };

  return (
    <div className="login-popup">
      <div className="login-popup-container">
        <button onClick={() => setShowLogin(false)} className="close-btn">
          ×
        </button>

        <h2>{mode === "login" ? "Login" : "Create Account"}</h2>

        <div className="role-select">
          <label>Select Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {role === "user" && mode === "signup" && (
            <input
              type="text"
              name="username"
              value={data.username}
              onChange={handleChange}
              placeholder="Username"
              required
            />
          )}

          {role === "user" && (
            <input
              type="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          )}

          {role === "admin" && mode === "signup" && (
            <>
              <input
                type="text"
                name="name"
                value={data.name}
                onChange={handleChange}
                placeholder="Admin Name"
                required
              />
              <input
                type="text"
                name="userId"
                value={data.userId}
                onChange={handleChange}
                placeholder="Admin ID"
                required
              />
            </>
          )}

          {role === "admin" && mode === "login" && (
            <input
              type="text"
              name="userId"
              value={data.userId}
              onChange={handleChange}
              placeholder="Admin ID"
              required
            />
          )}

          <input
            type="password"
            name="password"
            value={data.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />

          <button type="submit" className="btn-submit">
            {mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="divider">or</div>

        {role === "user" && (
          <button onClick={handleGoogleLogin} className="google-btn">
            <GoogleIcon /> Continue with Google
          </button>
        )}

        <p className="toggle-text">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <span onClick={() => setMode("signup")}>Sign Up</span>
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
