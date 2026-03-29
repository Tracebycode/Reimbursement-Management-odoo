import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // Backend base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;


  // baseURL: "https://reimbursement-management-odoo.onrender.com", // Backend base URL
