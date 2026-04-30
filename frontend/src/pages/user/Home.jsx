import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, FileText, Rocket } from "lucide-react";
import "../../styles/home.css";
import axiosInstance from "../../api/axiosConfig";
import webSocketService from "../../api/webSocketService";

const categories = [
  {
    id: 1,
    name: "Software Development",
    image: "https://cdn-icons-png.flaticon.com/512/2721/2721291.png"
  },
  {
    id: 2,
    name: "Data Science",
    image: "https://cdn-icons-png.flaticon.com/512/2103/2103832.png"
  },
  {
    id: 3,
    name: "UI / UX Design",
    image: "https://cdn-icons-png.flaticon.com/512/1828/1828919.png"
  },
  {
    id: 4,
    name: "Marketing",
    image: "https://cdn-icons-png.flaticon.com/512/1055/1055687.png"
  },
  {
    id: 5,
    name: "Finance",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135706.png"
  },
  {
    id: 6,
    name: "Internships",
    image: "https://cdn-icons-png.flaticon.com/512/1995/1995574.png"
  }
];
function Home() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axiosInstance.get("/job/all", { params: { page: 0, size: 6 } })
      .then(res => setJobs(Array.isArray(res.data.content) ? res.data.content : []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));

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
          : category.terms.some((term) => content.includes(term));

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
              <strong>10K+</strong>
              <span>Jobs</span>
            </div>
            <div>
              <strong>5K+</strong>
              <span>Companies</span>
            </div>
            <div>
              <strong>95%</strong>
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
                  {category.icon}
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

      <section className="explore-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Explore Opportunities</h2>
            <p className="section-sub">
              Browse the latest roles from top companies. Use search and category
              filters to refine the preview.
            </p>
          </div>
        </div>

        <div className="scroll-wrapper">
          <button
            className="scroll-btn left"
            onClick={() => scrollRef.current?.scrollBy({ left: -380, behavior: "smooth" })}
            aria-label="Scroll left"
          >
            ◀
          </button>

          <div className="scroll-container" ref={scrollRef}>
            {loading ? (
              <div className="card-placeholder">Loading jobs...</div>
            ) : filteredJobs.length ? (
              filteredJobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-card-meta">
                    <span>{job.location || "Remote"}</span>
                    <strong>{job.companyName || job.company || "JobVista"}</strong>
                  </div>
                  <h3>{job.title || "Open Role"}</h3>
                  <p>
                    {job.description
                      ? `${job.description.slice(0, 100)}...`
                      : "Explore this job listing from top employers."}
                  </p>
                  <Link to="/jobs" className="job-action">
                    View Opportunities
                  </Link>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No matching jobs were found.</p>
                <Link type="button" className="home-btn ghost" to ="/jobs"
                 onClick={() => setActiveCategory("All")}>View all</Link>
              </div>
            )}
          </div>

          <button
            className="scroll-btn right"
            onClick={() => scrollRef.current?.scrollBy({ left: 380, behavior: "smooth" })}
            aria-label="Scroll right"
          >
            ▶
          </button>
        </div>
      </section>

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
            <h2>10K+</h2>
            <p>Jobs Available</p>
          </div>
          <div className="stat">
            <h2>5K+</h2>
            <p>Companies</p>
          </div>
          <div className="stat">
            <h2>25K+</h2>
            <p>Active Users</p>
          </div>
          <div className="stat">
            <h2>95%</h2>
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
