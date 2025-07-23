import Axios from "axios";

// Local
// const apiUrl = `http://192.168.0.151:8080`;

// Staging
//const apiUrl = `https://www.stageapi-acharyainstitutes.in/Acharya_University`;
const apiUrl = "https://api.preprodx.in";

// Kubernetes
// const apiUrl = `https://api-dev-acharyainstitutes.com`;

// Production
//  const apiUrl = `https://acerp.acharyaerptech.in`;

const token = JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.token;

const axios = Axios.create({
  baseURL: apiUrl,
});

axios.interceptors.request.use((config) => {
  config.headers.authorization = `Bearer ${token}`;
  config.headers["ngrok-skip-browser-warning"] = true;
  return config;
});

export default axios;
