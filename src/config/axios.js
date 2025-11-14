// Single axios config used everywhere
import axios from "axios";

axios.defaults.baseURL = "https://ajay-cafe-1.onrender.com";
axios.defaults.withCredentials = true; // ok even if server ignores cookies

export default axios;
