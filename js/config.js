// Get the base URL for the API
const getApiUrl = () => {
  const isProd = window.location.hostname !== "localhost";
  return isProd ? window.location.origin : "http://localhost:3000";
};

const getAuthApiUrl = () => {
  const isProd = window.location.hostname !== "localhost";
  return isProd ? window.location.origin : "http://localhost:3001";
};
