import axiosInstance from "./axiosConfig";

const register = async (userData) => {
  const response = await axiosInstance.post("/auth/register", userData);
  return response.data;
};

const login = async (credentials) => {
  const response = await axiosInstance.post("/auth/login", credentials);

  if (response.data.accessToken) {
    localStorage.setItem("accessToken", response.data.accessToken);
  }

  // some backends include the user object along with the token
  if (response.data.user) {
     localStorage.setItem("role", response.data.role);
  }

  return response.data;
};

const logout = async () => {
  try{
  await axiosInstance.post("/auth/logout");
  }catch(error){}
  
  localStorage.clear();
  window.location.href = "/login";
};

const getCurrentUser = async () => {
  const response = await axiosInstance.get("users/me");
  return response.data;
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
};
