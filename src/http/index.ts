import axios from "axios";

const http = axios.create({
  baseURL: "https://back-end-financeiro.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default http;