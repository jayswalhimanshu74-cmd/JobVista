# 🚀 JobVista – Full Stack Job Portal

JobVista is a full-stack job portal web application that allows users to search and apply for jobs, while companies can post and manage job listings. It includes secure authentication, role-based access, resume uploads, and real-time features.

---

## 🧠 Tech Stack

### Frontend

* React
* Tailwind CSS
* Axios

### Backend

* Spring Boot (Java)
* Spring Security
* JWT Authentication

### Database

* PostgreSQL

### Other Integrations

* Adzuna Job API
* Gmail SMTP (Email Notifications)

---

## ✨ Features

### 👤 User Features

* User registration & login (JWT-based)
* Browse and search jobs
* Apply to jobs
* Upload resume
* Receive email notifications

### 🏢 Admin / Recruiter Features

* Post new jobs
* Manage job listings
* View applications
* Role-based access control

### ⚙️ System Features

* Secure authentication using JWT
* RESTful APIs
* File upload support
* Caching for performance
* Event-driven notifications

---

## 📁 Project Structure

```
JobVista/
├── frontend/   # React + Tailwind UI
├── backend/    # Spring Boot REST API
└── README.md
```

---

## ⚙️ Setup Instructions

### 🔹 1. Clone the Repository

```bash
git clone https://github.com/jayswalhimanshu74-cmd/JobVista.git
cd JobVista
```

---

### 🔹 2. Backend Setup (Spring Boot)

```bash
cd backend
```

#### Configure Environment Variables

Create a `.env` file:

```env
DB_URL=jdbc:postgresql://localhost:5432/jobvista
DB_USERNAME=postgres
DB_PASSWORD=your_password

JWT_SECRET_KEY=your_secret_key

MAIL_USERNAME=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

ADZUNA_APP_ID=your_id
ADZUNA_APP_KEY=your_key
```

#### Run Backend

```bash
./mvnw spring-boot:run
```

Backend will run on:

```
http://localhost:8080
```

---

### 🔹 3. Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

```
http://localhost:5173
```

---

## 🔐 Environment Variables

Make sure NOT to push `.env` to GitHub.

Use `.env.example` like this:

```env
DB_URL=
DB_USERNAME=
DB_PASSWORD=
JWT_SECRET_KEY=
MAIL_USERNAME=
GMAIL_APP_PASSWORD=
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
```

---

## 📸 Screenshots

> Add screenshots here (recommended)

Example:

* Home Page
* Job Listings
* Login Page
* Admin Dashboard

---

## 🚀 Future Improvements

* Live chat between recruiter and applicant
* Resume parsing with AI
* Advanced job recommendations
* Mobile app version

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Author

**Himanshu Jayswal**

* GitHub: https://github.com/jayswalhimanshu74-cmd

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
