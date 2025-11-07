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
  const { url, setToken, setUser } = useContext(StoreContext);

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    role: "customer",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "signup") {
        const res = await axios.post(`${url}/api/user/register`, data);
        if (res.data.success) {
          toast.success("Registration successful! Please login now.");
          setMode("login");
        }
      } else {
        const res = await axios.post(`${url}/api/user/login`, {
          email: data.email,
          password: data.password,
        });
        if (res.data.success) {
          toast.success("Login successful!");
          localStorage.setItem("token", res.data.token);
          setToken(res.data.token);
          setUser(res.data.user);
          // ✅ Close popup after login
          setShowLogin(false);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
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
              Don’t have an account?{" "}
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
