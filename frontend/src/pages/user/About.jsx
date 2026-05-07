import React, { useEffect, useState } from "react";
import "../../styles/about.css";
import axiosInstance from "../../api/axiosConfig";
import { Target, Shield, Zap, Mail, Award, Users } from "lucide-react";

function About() {
  const [stats, setStats] = useState({ jobs: "...", companies: "...", satisfaction: "98%" });

  useEffect(() => {
    axiosInstance.get("/public/stats")
      .then(res => {
        setStats({
          jobs: `${res.data.totalJobs}+`,
          companies: `${res.data.totalCompanies}+`,
          satisfaction: "99%"
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="about-page">
      {/* ── Immersive Hero ── */}
      <section className="about-hero-v2 ">
        <div className="hero-overlay" style={{background:"rgba(38, 88, 169, 1)"}}></div>
        <div className="hero-content">
          <span className="about-badge" style={{backgroundColor:"rgba(0, 0, 0, 0.393)", color:"#2658A9"}}>Established 2024</span>
          <h1 className="classy-title">Simplifying the search for excellence.</h1>
          <p className="classy-lead">
            JobVista is a curated marketplace designed to bring clarity to the world of hiring. 
            We believe the right match shouldn't be hard to find.
          </p>
        </div>
      </section>

      <section className="about-content">
        {/* ── Core Values ── */}
        <div className="classy-grid">
          <div className="classy-item-v2">
            <div className="icon-box"><Target size={28} /></div>
            <h3>The Vision</h3>
            <p>To create a space where professional integrity meets opportunity. No noise, just progress.</p>
          </div>
          <div className="classy-item-v2">
            <div className="icon-box"><Zap size={28} /></div>
            <h3>The Process</h3>
            <p>We manually vet every company and every listing to ensure your time is spent on real possibilities.</p>
          </div>
          <div className="classy-item-v2">
            <div className="icon-box"><Shield size={28} /></div>
            <h3>The Promise</h3>
            <p>Your data remains yours. Secure, encrypted, and only shared when you choose to apply.</p>
          </div>
        </div>

        {/* ── How it Works ── */}
        <div className="how-it-works-section">
          <h2 className="section-title-alt">Your journey with JobVista.</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">01</div>
              <h4>Create your Profile</h4>
              <p>Build a professional identity with our interactive resume builder and showcase your unique skills.</p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <h4>Apply with Clarity</h4>
              <p>Find vetted opportunities that match your expertise and apply with a single, secure click.</p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <h4>Get the Job</h4>
              <p>Connect directly with decision-makers at top companies and land your dream role.</p>
            </div>
          </div>
        </div>

        {/* ── Trust & Security ── */}
        <div className="trust-security-row">
          <div className="trust-content">
            <h2 className="section-title-alt">Reliability is our priority.</h2>
            <div className="trust-features">
              <div className="trust-feature">
                <Shield className="trust-icon" />
                <div>
                  <h4>Advanced Encryption</h4>
                  <p>All your personal data and resume details are protected with bank-grade encryption.</p>
                </div>
              </div>
              <div className="trust-feature">
                <Award className="trust-icon" />
                <div>
                  <h4>Verified Companies</h4>
                  <p>We manually verify every company profile to prevent spam and ensure real opportunities.</p>
                </div>
              </div>
              <div className="trust-feature">
                <Zap className="trust-icon" />
                <div>
                  <h4>Real-time Updates</h4>
                  <p>Get instant notifications on your application status via our integrated WebSocket system.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="trust-badge-container">
            <div className="security-badge">
              <Shield size={48} />
              <span>Certified Secure</span>
            </div>
          </div>
        </div>

        {/* ── Dynamic Stats ──
        <div className="about-stats-container">
          <div className="classy-stats-v2">
            <div className="stat-card">
              <strong>{stats.jobs}</strong>
              <span>Active Positions</span>
            </div>
            <div className="stat-card">
              <strong>{stats.companies}</strong>
              <span>Trusted Partners</span>
            </div>
            <div className="stat-card">
              <strong>{stats.satisfaction}</strong>
              <span>Community Satisfaction</span>
            </div>
          </div>
        </div> */}

        {/* ── Contact Footer ── */}
        <div className="classy-footer-v2">
          <div className="footer-circle"></div>
          <h3>Let's build the future of work together.</h3>
          <p>Interested in joining us or listing a position?</p>
          <a href="mailto:jobvista51@gmail.com" className="contact-pill">
            <Mail size={18} /> jobvista51@gmail.com
          </a>
        </div>
      </section>
    </div>
  );
}

export default About;
