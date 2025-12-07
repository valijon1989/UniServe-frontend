import { client } from "../api/client";

export const api = client;

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const API = {
  login: "/auth/login",
  register: "/auth/register",
  services: "/services",
  posts: "/posts",
  agents: "/agents"
};
