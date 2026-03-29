import axios from "axios";

const api = axios.create({
  baseURL: "https://reimbursement-management-odoo.onrender.com", // Backend base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
