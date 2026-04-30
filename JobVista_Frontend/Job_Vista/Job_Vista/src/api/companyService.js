
import axios from "axios";
import axiosInstance from "./axiosConfig";

const getAllCompanies = async (page, size) => {
  const response = await axiosInstance.get("/company/all", {
    params: { page, size },
  });
  return response.data;
}

const getCompanyJobs = async( companyId , page = 0 , size = 10 ) =>{
   const response = await axiosInstance.get(`/job/company/${companyId}`, {
    params: { page, size },
  });
  return response.data;
}
const createCompany = async (companyData) => {
  const response = await axiosInstance.post("/company", companyData);
  return response.data;
};

export default {
  getAllCompanies,
  createCompany,
  getCompanyJobs
};
