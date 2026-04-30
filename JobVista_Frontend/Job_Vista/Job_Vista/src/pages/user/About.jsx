import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/about.css";

function About() {
  const industries =  [
    {
      name: "Information Technology",
      icon: "💻",
      description: "Connecting developers, engineers, and tech talent with high-growth software teams."
    },
    {
      name: "Healthcare",
      icon: "🩺",
      description: "Supporting hospitals, clinics, and care providers with skilled professionals."
    },
    {
      name: "Finance",
      icon: "💹",
      description: "Helping financial services hire analysts, advisors, and operations specialists."
    },
    {
      name: "Education",
      icon: "🎓",
      description: "Powering academic institutions and edtech companies with mission-driven talent."
    },
    {
      name: "Manufacturing",
      icon: "🏭",
      description: "Matching operational experts, engineers, and supply chain talent with modern manufacturers."
    },
    {
      name: "Retail",
      icon: "🛍️",
      description: "Helping retail brands scale teams across stores, e-commerce, and customer success."
    },
    {
      name: "Marketing",
      icon: "📣",
      description: "Connecting creative marketers, content strategists, and growth teams with top employers."
    },
    {
      name: "Engineering",
      icon: "🛠️",
      description: "Supporting infrastructure, product, and systems engineering hires for modern organizations."
    }
  ];

  const [activeIndustry, setActiveIndustry] = useState(industries[0]);

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-eyebrow">Built for modern talent and hiring teams</span>
          <h1 className="about-title">About JobVista</h1>
          <p className="about-sub text">
            JobVista connects job seekers with great companies across industries. We focus on meaningful matches using curated job listings, company profiles and a delightful experience.
          </p>

          <div className="about-actions">
            <Link to="/jobs" className="about-btn primary">
              Browse jobs
            </Link>
            <Link to="/login" className="about-btn ghost">
              Join JobVista
            </Link>
          </div>
        </div>
      </section>

      <section className="about-content">
        <div className="about-intro">
          <h2>Our Mission</h2>
          <p>
            Provide an easy-to-use hiring marketplace that helps candidates discover opportunities and employers find the right talent.
          </p>
        </div>

        <div className="industry-section">
          <h3 className="section-title">Industries We Serve</h3>
          <div className="industry-grid">
            {industries.map((industry) => (
              <button
                key={industry.name}
                type="button"
                className={`industry-card ${activeIndustry.name === industry.name ? "active" : ""}`}
                onClick={() => setActiveIndustry(industry)}
              >
                <div className="industry-icon">{industry.icon}</div>
                <div>
                  <div className="industry-name">{industry.name}</div>
                  <p className="industry-tag">Tap to explore</p>
                </div>
              </button>
            ))}
          </div>

          <div className="active-industry-panel">
            <h4>{activeIndustry.name}</h4>
            <p>{activeIndustry.description}</p>
          </div>
        </div>

        <div className="about-footer-cta">
          <p>
            Want to list a job or learn more about hiring on JobVista? Reach out to our team and we’ll help you get started.
          </p>
        </div>
      </section>
    </div>
  );
}

export default About;
