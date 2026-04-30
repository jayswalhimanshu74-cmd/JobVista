import axiosInstance from "./axiosConfig";

const getUserProfile = async () => {
  const res = await axiosInstance.get("/users/me");
  return res.data;
};

const getCompanyProfile = async () => {
  const res = await axiosInstance.get("/company/me");
  return res.data;
};

const getSeekerProfile = async () => {
  const res = await axiosInstance.get("/jobSeeker/me");
  return res.data;
};

const updateUserProfile = async (userData) => {
  const res = await axiosInstance.put("/users/me", userData);
  return res.data;
};

const updateCompanyProfile = async (companyData) => {
  const res = await axiosInstance.put("/company/me", companyData);
  return res.data;
};

const updateSeekerProfile = async (seekerData) => {
  const res = await axiosInstance.put("/jobSeeker/me", seekerData);
  return res.data;
};

const deleteAccount = async () => {
  const res = await axiosInstance.delete("/users/me");
  return res.data;
};

export default {
  getUserProfile,
  getCompanyProfile,
  getSeekerProfile,
  updateUserProfile,
  updateCompanyProfile,
  updateSeekerProfile,
  deleteAccount,
};
