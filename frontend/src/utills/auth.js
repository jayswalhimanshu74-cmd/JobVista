import { getAccessToken } from "./tokenStore";

export const isAuthenticated = () => {
  return !!getAccessToken();
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};