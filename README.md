# 🚀 JobVista - Backend

JobVista is a scalable job portal backend built using Spring Boot. It provides secure APIs for job seekers, companies, and admins.

---

## 🔹 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access (USER, COMPANY, ADMIN)
- Ownership validation for secure operations

### 💼 Job Management
- Create, update, delete jobs
- Job search with filters and pagination

### 📄 Job Applications
- Apply to jobs
- Status tracking (APPLIED → SHORTLISTED → HIRED/REJECTED)
- Duplicate application prevention

### 📂 Resume Management
- Upload resume
- Replace old resume
- Download resume

### ⚡ Performance
- Caching for optimized job search

### 🧠 Smart Features
- Job recommendations (based on skills, location, experience)
- Saved jobs
- Recently viewed jobs tracking

### 📩 Event-Driven Architecture
- Email notifications using event listeners
- Loose coupling for scalability

### 📊 Admin Analytics
- Total users, jobs, applications
- Job popularity
- Top companies
- Recent activity tracking

---

## 🔹 Tech Stack

- Java
- Spring Boot
- Spring Security (JWT)
- Spring Data JPA
- PostgreSQL
- Spring Cache

---

## 🔹 API Testing

All APIs are tested using Postman.

---

## 🔹 Future Improvements

- React frontend integration
- Redis caching
- AI-based job recommendations
- Deployment (Docker + Cloud)