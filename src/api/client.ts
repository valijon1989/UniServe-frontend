import axios from "axios";

export const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// Old name compatibility
export const api = client;
