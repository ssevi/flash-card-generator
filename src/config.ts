const API_URL = window.location.hostname === "localhost"
  ? process.env.REACT_APP_API_URL
  : process.env.REACT_APP_API_URL_2;

// Remove `/api` when needed
const BASE_URL = (API_URL || "").replace(/\/api$/, "");

export { API_URL, BASE_URL };
