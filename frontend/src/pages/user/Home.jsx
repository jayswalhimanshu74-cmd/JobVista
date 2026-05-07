import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, FileText, Rocket, ShieldCheck, Lock, TrendingUp } from "lucide-react";
import "../../styles/home.css";
import axiosInstance from "../../api/axiosConfig";
import webSocketService from "../../api/webSocketService";

const categories = [
  {
    id: 1,
    name: "Software Development",
    image: "https://cdn-icons-png.flaticon.com/512/2721/2721291.png",
    terms: ["software", "developer", "engineer", "fullstack", "backend", "frontend", "web", "coding", "java", "python", "javascript", "react", "node"]
  },
  {
    id: 2,
    name: "Data Science",
    image: "https://cdn-icons-png.flaticon.com/512/2103/2103832.png",
    terms: ["data", "science", "analyst", "machine learning", "ai", "artificial intelligence", "stats", "sql", "pandas", "numpy"]
  },
  {
    id: 3,
    name: "UI / UX Design",
    image: "https://cdn-icons-png.flaticon.com/512/1828/1828919.png",
    terms: ["ui", "ux", "design", "figma", "sketch", "adobe", "creative", "interface", "experience", "product design"]
  },
  {
    id: 4,
    name: "Marketing",
    image: "https://cdn-icons-png.flaticon.com/512/1055/1055687.png",
    terms: ["marketing", "seo", "social media", "content", "branding", "sales", "growth", "digital marketing"]
  },
  {
    id: 5,
    name: "Finance",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135706.png",
    terms: ["finance", "accountant", "audit", "banking", "tax", "investment", "financial", "economics"]
  },
  {
    id: 6,
    name: "Internships",
    image: "https://cdn-icons-png.flaticon.com/512/1995/1995574.png",
    terms: ["intern", "internship", "trainee", "fresher", "apprentice"]
  }
];
function Home() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const companyScrollRef = useRef(null);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [homeStats, setHomeStats] = useState({ jobs: "...", companies: "...", users: "...", rate: "95%" });

  useEffect(() => {
    // Fetch Jobs
    axiosInstance.get("/job/all", { params: { page: 0, size: 6 } })
      .then(res => setJobs(Array.isArray(res.data.content) ? res.data.content : []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));

    // Fetch Companies
    axiosInstance.get("/company/all", { params: { page: 0, size: 6 } })
      .then(res => setCompanies(Array.isArray(res.data.content) ? res.data.content : []))
      .catch(() => setCompanies([]));

    // Fetch Public Stats
    axiosInstance.get("/public/stats")
      .then(res => {
        setHomeStats({
          jobs: `${res.data.totalJobs || 0}+`,
          companies: `${res.data.totalCompanies || 0}+`,
          users: `${res.data.totalUsers || 0}+`,
          rate: "98%"
        });
      })
      .catch(() => {});

    // 🔥 Real-time job updates
    webSocketService.connect(() => {
      webSocketService.subscribe("/topic/jobs", (newJob) => {
        setJobs(prevJobs => {
          // Check if job already exists (to avoid duplicates if re-connecting)
          if (prevJobs.find(j => j.id === newJob.id)) return prevJobs;
          return [newJob, ...prevJobs].slice(0, 6); // Keep only top 6 as per initial fetch
        });
      });
    });

    return () => {
      webSocketService.unsubscribe("/topic/jobs");
    };
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      if (!container) return;
      const atEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;

      if (atEnd) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: 360, behavior: "smooth" });
      }
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => navigate("/login");

  const filteredJobs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const category = categories.find((item) => item.name === activeCategory);

    return jobs.filter((job) => {
      const title = (job.title || "").toLowerCase();
      const company = (job.companyName || job.company || "").toLowerCase();
      const location = (job.location || "").toLowerCase();
      const description = (job.description || "").toLowerCase();
      const content = `${title} ${company} ${location} ${description}`;

      const matchesCategory =
        !category || activeCategory === "All"
          ? true
          : category.terms?.some((t) => content.includes(t.toLowerCase())) || false;

      const matchesSearch =
        !term || content.includes(term) || activeCategory.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [jobs, activeCategory, searchTerm]);

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Career discovery made effortless</span>
          <h1>
            Find your <span>Dream Job</span> faster.
          </h1>
          <p>
            Discover verified jobs, internships, and hiring companies built for
            modern talent. Search by role, location, or company in a polished,
            responsive experience.
          </p>

          <div className="search-bar">
            <div className="search-input-wrapper">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search roles, companies, or locations"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <button type="button" className="home-btn secondary" onClick={() => null}>
              Search
            </button>
          </div>

          <div className="hero-actions">
            <button className="home-btn primary" onClick={handleStart}>
              Get Started
            </button>
            <Link to="/jobs" className="home-btn ghost">
              Browse Jobs
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <strong>{homeStats.jobs}</strong>
              <span>Jobs</span>
            </div>
            <div>
              <strong>{homeStats.companies}</strong>
              <span>Companies</span>
            </div>
            <div>
              <strong>{homeStats.rate}</strong>
              <span>Success Rate</span>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-panel-card">
            <h2>Popular categories</h2>
            <div className="hero-chip-grid">
              <button
                type="button"
                className={`hero-chip ${activeCategory === "All" ? "selected" : ""}`}
                onClick={() => setActiveCategory("All")}
              >
                All
              </button>
              {categories.slice(0, 5).map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`hero-chip ${activeCategory === category.name ? "selected" : ""}`}
                  onClick={() => setActiveCategory(category.name)}
                >
                  {category.image && <img src={category.image} alt="" className="chip-icon" />}
                  {category.name}
                </button>
              ))}
            </div>
            {activeCategory !== "All" && (
              <p className="panel-note">Showing {activeCategory} roles.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Latest Opportunities ── */}
      <section className="jobs-home-section">
        <div className="section-header">
          <h2 className="section-title">Latest Opportunities</h2>
          <Link to="/jobs" className="view-all-link">View all jobs →</Link>
        </div>
        
        <div className="jobs-home-scroll-wrapper">
          <button className="scroll-btn left" onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: "smooth" })}>
            ←
          </button>
          
          <div className="jobs-home-scroll-container" ref={scrollRef}>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div key={job.jobId} className="job-home-card scroll-item">
                  <div className="job-home-header">
                    <div className="job-home-logo-box">
                      {job.companyLogo || job.logoUrl ? (
                        <img src={job.companyLogo || job.logoUrl} alt="" />
                      ) : (
                        <span>{(job.companyName || "J")[0]}</span>
                      )}
                    </div>
                    <span className="job-home-type">{job.employmentType?.replace(/_/g, " ")}</span>
                  </div>

                  <div className="job-home-info">
                    <h3>{job.title}</h3>
                    <p className="job-home-company">{job.companyName}</p>
                  </div>

                  <div className="job-home-meta">
                    <div className="job-home-meta-item">
                      📍 <span>{job.location || "Remote"}</span>
                    </div>
                    <div className="job-home-meta-item">
                      💰 <span>{job.salaryOrStipend || job.salary || "Not Disclosed"}</span>
                    </div>
                  </div>

                  <Link to="/jobs" className="contact-pill" style={{marginTop: 'auto', textAlign: 'center', justifyContent: 'center'}}>
                    View Details
                  </Link>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>
                  {loading 
                    ? "Fetching the latest opportunities..." 
                    : activeCategory !== "All" || searchTerm 
                      ? `No jobs found matching "${searchTerm || activeCategory}"`
                      : "No jobs available at the moment."
                  }
                </p>
              </div>
            )}
          </div>

          <button className="scroll-btn right" onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: "smooth" })}>
            →
          </button>
        </div>
      </section>

      {/* ── Reliability Pillars ── */}
      <section className="reliability-section">
        <div className="section-header center">
          <span className="eyebrow">Trust & Security</span>
          <h2>Why professionals choose JobVista.</h2>
        </div>
        <div className="reliability-grid">
          <div className="rel-card">
            <div className="rel-icon-wrapper"><ShieldCheck size={32} /></div>
            <h3>Verified Employers</h3>
            <p>Every company profile is manually vetted by our team to ensure you only apply to legitimate, high-quality opportunities.</p>
          </div>
          <div className="rel-card">
            <div className="rel-icon-wrapper"><Lock size={32} /></div>
            <h3>Secure Data Vault</h3>
            <p>Your personal details and resumes are encrypted using industry-standard protocols. We never share your data without consent.</p>
          </div>
          <div className="rel-card">
            <div className="rel-icon-wrapper"><TrendingUp size={32} /></div>
            <h3>Career-First Approach</h3>
            <p>Beyond job listings, we provide tools like our Resume Builder to help you present your best self to the world's top employers.</p>
          </div>
        </div>
      </section>

      {/* ── Top Companies Section ── */}
      {/* <section className="top-companies-section">
        <div className="section-header">
          <h2 className="section-title">Top Hiring Companies</h2>
          <Link to="/companies" className="view-all-link">View all companies →</Link>
        </div>

        <div className="jobs-home-scroll-wrapper">
          <button className="scroll-btn left" onClick={() => companyScrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })}>
            ←
          </button>
          
          <div className="jobs-home-scroll-container" ref={companyScrollRef}>
            {companies.map((company) => (
              <Link to="/companies" key={company.id || company.companyId} className="company-home-card scroll-item-mini">
                <div className="company-home-logo-box">
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.companyName} 
                         onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}/>
                  ) : null}
                  <span className="modal-letter-avatar" style={{display: company.logoUrl ? 'none' : 'flex', width: '100%', height: '100%'}}>
                    {(company.companyName || "C")[0]}
                  </span>
                </div>
                <h4>{company.companyName}</h4>
                <p>{company.industry || "Technology"}</p>
              </Link>
            ))}
          </div>

          <button className="scroll-btn right" onClick={() => companyScrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })}>
            →
          </button>
        </div>
      </section> */}

       <section className="categories">
        <h2 className="section-title">Explore Categories</h2>

        <div className="categories-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="category-card">
              <div className="category-icon">
                <img src={cat.image} alt={cat.name} />
              </div>
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title">How JobVista Works</h2>
        <p className="section-sub">
          A simple and fast way to land your dream job without the usual hassle.
        </p>

        <div className="steps">
          <div className="step">
            <div className="step-icon">
              <Search size={40} />
            </div>
            <h3>Discover Opportunities</h3>
            <p>
              Explore thousands of roles tailored to your skills, interests, and
              preferred location.
            </p>
          </div>

          <div className="step">
            <div className="step-icon">
              <FileText size={40} />
            </div>
            <h3>Apply in Seconds</h3>
            <p>
              Submit applications quickly with a smooth, user-friendly process
              and track your progress with ease.
            </p>
          </div>

          <div className="step">
            <div className="step-icon">
              <Rocket size={40} />
            </div>
            <h3>Kickstart Your Career</h3>
            <p>
              Get hired by top companies and begin your professional journey with
              confidence.
            </p>
          </div>
        </div>
      </section>


      <section className="stats">
        <div className="stats-grid">
          <div className="stat">
            <h2>{homeStats.jobs}</h2>
            <p>Jobs Available</p>
          </div>
          <div className="stat">
            <h2>{homeStats.companies}</h2>
            <p>Companies</p>
          </div>
          <div className="stat">
            <h2>{homeStats.users}</h2>
            <p>Active Users</p>
          </div>
          <div className="stat">
            <h2>{homeStats.rate}</h2>
            <p>Success Rate</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Start Your Career Journey Today</h2>
        <p>Create your free account and apply instantly.</p>
        <button className="btn primary" onClick={handleStart}>
          Create Account
        </button>
      </section>

      <footer className="footer">
        <p> 2025 JobVista. All rights reserved.</p>
      </footer>
    </main>
  );
}

export default Home;
