import React, { useState, useEffect } from "react";
import "../../styles/company-dashboard.css";
import CompanySidebar from "../../components/layouts/CompanySidebar";
import CompanyOverview from "./CompanyOverview";
import CompanyMyJobs from "./CompanyMyJobs";
import CompanyPostJob from "./CompanyPostJob";
import CompanyApplications from "./CompanyApplications";
import CompanyProfileEdit from "./CompanyProfileEdit";
import axiosInstance from "../../api/axiosConfig";

function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [company, setCompany] = useState(null);
  const [editingJob, setEditingJob] = useState(null);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await axiosInstance.get("/company/me");
      setCompany(res.data);
    } catch (err) {
      console.log("No company profile yet");
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setActiveTab("post");
  };

  const handleJobSaved = () => {
    setEditingJob(null);
    setActiveTab("jobs");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <CompanyOverview company={company} />;
      case "jobs":
        return <CompanyMyJobs company={company} onEditJob={handleEditJob} />;
      case "post":
        return <CompanyPostJob company={company} editingJob={editingJob} onSaved={handleJobSaved} />;
      case "applications":
        return <CompanyApplications company={company} />;
      case "profile":
        return <CompanyProfileEdit company={company} onUpdated={fetchCompany} />;
      default:
        return <CompanyOverview company={company} />;
    }
  };

  return (
    <div className="company-dashboard-container">
      <CompanySidebar
        activeTab={activeTab}
        setActiveTab={(tab) => { setActiveTab(tab); if (tab !== "post") setEditingJob(null); }}
        companyName={company?.companyName}
      />
      <div className="company-main">
        {renderContent()}
      </div>
    </div>
  );
}

export default CompanyDashboard;
