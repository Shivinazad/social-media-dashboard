// Get the base URL for the API
const getApiUrl = () => {
  const isProd = window.location.hostname !== "localhost";
  return isProd
    ? window.location.origin
    : "https://social-media-dashboard-eu4r.onrender.com";
};

// Since we're using combined server, auth API is on the same port
const getAuthApiUrl = () => getApiUrl();

// Export the configuration
module.exports = {
  getApiUrl,
  getAuthApiUrl,
};
