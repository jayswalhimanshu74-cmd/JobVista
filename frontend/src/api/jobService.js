import axiosInstance from "./axiosConfig";

const getAllJobs = async (params = {}) => {
  const res = await axiosInstance.get("/job/all", { params });
  return res.data;
};

const searchJobs = async (params = {}) => {
  const res = await axiosInstance.get("/job/search", { params });
  return res.data;
};

const applyJob = async (jobId) => {
  // Ensure jobId is a clean string, no extra encoding
  const res = await axiosInstance.post(`/application/apply/${String(jobId).trim()}`);
  return res.data;
};

const toggleSaveJob = async (jobId) => {
  const res = await axiosInstance.post(`/saved-jobs/${String(jobId).trim()}/toggle`);
  return res.data;
};

const getSavedJobs = async (params = {}) => {
  const res = await axiosInstance.get("/saved-jobs", { params });
  return res.data;
};

const getAppliedJobs = async (params = {}) => {
  const res = await axiosInstance.get("/application/me", { params });
  return res.data;
};

const createJob = async (jobData) => {
  const res = await axiosInstance.post("/job", jobData);
  return res.data;
};

const getJobApplicants = async (jobId, params = {}) => {
  const res = await axiosInstance.get(`/application/job/${jobId}`, { params });
  return res.data;
};

const updateApplicationStatus = async (applicationId, status) => {
  const res = await axiosInstance.put(`/application/${applicationId}/status`, null, { params: { status } });
  return res.data;
};

export default { getAllJobs, searchJobs, applyJob, toggleSaveJob, getSavedJobs, getAppliedJobs, createJob, getJobApplicants, updateApplicationStatus };