import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "../../config/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C36.47 2.64 30.74 0 24 0 14.74 0 6.67 5.21 2.69 12.8l7.98 6.19C12.57 13.01 17.85 9.5 24 9.5z" />
    <path fill="#34A853" d="M46.14 24.5c0-1.64-.15-3.21-.42-4.72H24v9.03h12.5c-.54 2.85-2.13 5.26-4.5 6.89l7.07 5.48C43.72 37.04 46.14 31.2 46.14 24.5z" />
    <path fill="#FBBC05" d="M10.67 28.99a14.43 14.43 0 0 1 0-9.98l-7.98-6.19A24 24 0 0 0 0 24c0 3.9.93 7.6 2.69 10.9l7.98-6.19z" />
    <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.07-5.48c-1.96 1.32-4.47 2.11-8.83 2.11-6.15 0-11.43-3.51-13.33-8.6l-7.98 6.19C6.67 42.79 14.74 48 24 48z" />
  </svg>
);

const LoginPopup = ({ setShowLogin }) => {
  const { setToken, setUserType, loadCartData, setUserId } = useContext(StoreContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");         // "login" | "signup"
  const [loginRole, setLoginRole] = useState("user"); // "user" | "admin"
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
    userId: "",
  });

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    let endpoint = "";
    let requestData = {};

    if (loginRole === "admin") {
      if (mode === "login") {
        if (!data.userId || !data.password) return toast.error("Please fill in Admin ID and Password.");
        endpoint = "/api/admin/login";
        requestData = { userId: data.userId.trim(), password: data.password };
      } else {
        if (!data.username || !data.userId || !data.password) return toast.error("Please fill in all required fields.");
        endpoint = "/api/admin/register";
        requestData = { name: data.username.trim(), userId: data.userId.trim(), password: data.password, role: "admin" };
      }
    } else {
      if (mode === "login") {
        if (!data.email || !data.password) return toast.error("Please fill in Email and Password.");
        endpoint = "/api/user/login";
        requestData = { email: data.email.trim(), password: data.password };
      } else {
        if (!data.username || !data.email || !data.password || !data.role) return toast.error("Please fill in all required fields.");
        endpoint = "/api/user/register";
        requestData = { username: data.username.trim(), email: data.email.trim(), password: data.password, role: data.role };
      }
    }

    try {
      const res = await axios.post(endpoint, requestData);
      const ok = res?.data?.success;
      const payload = res?.data?.data || {};

      if (!ok) return toast.error(res?.data?.message || "Request failed.");

      // read correct field
      const accessToken = payload.accessToken || res?.data?.accessToken || payload.token || null;
      console.log("accessToken",accessToken);
      if (!accessToken) {
        toast.error("Login successful, but the access token is missing.");
        return;
      }

      // role detection
      const finalRole = payload.admin ? "admin" : (payload.role || "user");

      // save auth
      setToken(accessToken);
      localStorage.setItem("token", accessToken);
      localStorage.setItem("userType", finalRole);
      setUserType(finalRole);

      // capture userId if returned
      const returnedUserId = payload?.user?._id || payload?.userId || payload?._id || null;
      if (returnedUserId) {
        setUserId(returnedUserId);
        localStorage.setItem("userId", returnedUserId);
      }

      // load cart only for non-admin
      if (finalRole !== "admin") {
        await loadCartData(accessToken);
      }

      toast.success(`Logged in as ${finalRole}`);
      setShowLogin(false);

      // redirect by role
      if (finalRole === "admin") navigate("/admin/dashboard");
      else navigate("/");
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message;
      if (status === 401) return toast.error(msg || "Invalid credentials.");
      if (status) return toast.error(msg || `Error ${status}: Something went wrong.`);
      if (error?.request) return toast.error("Network error. Please try again.");
      toast.error(error?.message || "An unexpected error occurred.");
    }
  };

  const handleGoogleLogin = () => {
    window.open("https://ajay-cafe-1.onrender.com/api/user/google", "_self");
    setShowLogin(false);
  };

  return (
    <div className="login-popup">
      <div className="login-popup-container">
        <button onClick={() => setShowLogin(false)} className="close-btn">×</button>
        <h2>{mode === "login" ? "Login" : "Create Account"} ({loginRole})</h2>

        <form onSubmit={handleSubmit} className="login-form">
          {loginRole === "admin" ? (
            <>
              {mode === "signup" && (
                <input type="text" name="username" value={data.username} onChange={handleChange} placeholder="Admin Name" required />
              )}
              <input type="text" name="userId" value={data.userId} onChange={handleChange} placeholder="Admin User ID" required />
              <input type="password" name="password" value={data.password} onChange={handleChange} placeholder="Password" required />
            </>
          ) : (
            <>
              {mode === "signup" && (
                <input type="text" name="username" value={data.username} onChange={handleChange} placeholder="Username" required />
              )}
              <input type="email" name="email" value={data.email} onChange={handleChange} placeholder="Email" required />
              <input type="password" name="password" value={data.password} onChange={handleChange} placeholder="Password" required />
              {mode === "signup" && (
                <div className="role-select">
                  <label>Select Role:</label>
                  <select name="role" value={data.role} onChange={handleChange} required>
                    <option value="user">USER</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </div>
              )}
            </>
          )}
          <button type="submit" className="btn-submit">{mode === "login" ? "Login" : "Sign Up"}</button>
        </form>

        <div className="divider">or</div>
        <button onClick={handleGoogleLogin} className="google-btn">
          <GoogleIcon /> Continue with Google
        </button>

        <p className="toggle-text">
          {mode === "login" ? <>Don't have an account? <span onClick={() => setMode("signup")}>Sign up</span></> :
            <>Already have an account? <span onClick={() => setMode("login")}>Login</span></>}
        </p>

        <p className="toggle-text">
          {loginRole === "user" ? <>Are you an Admin? <span onClick={() => setLoginRole("admin")}>Login here</span></> :
            <>Are you a User? <span onClick={() => setLoginRole("user")}>Login here</span></>}
        </p>
      </div>
    </div>
  );
};

export default LoginPopup;
