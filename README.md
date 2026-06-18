# Online Complaint Registration & Management System

## Overview

The Online Complaint Registration & Management System is a full-stack MERN application designed to streamline the process of complaint submission, tracking, assignment, and resolution. The platform provides a centralized system where users can register complaints, monitor their progress in real time, communicate with assigned agents, and provide feedback after resolution.

The system incorporates role-based access control for Users, Agents, and Administrators, ensuring secure and efficient complaint handling while improving transparency and accountability throughout the resolution process.

---

## Live Demo

**Frontend:** https://online-complaint-registration-ten.vercel.app/

**Backend API:** https://online-complaint-registration-pfe0.onrender.com

**GitHub Repository:** https://github.com/sathvik89/Online-complaint-registration

---

## Features

### User Features

* User Registration & Login
* JWT-Based Authentication
* Submit New Complaints
* Track Complaint Status
* View Complaint History
* Real-Time Complaint Updates
* Submit Feedback After Resolution

### Agent Features

* View Assigned Complaints
* Update Complaint Status
* Manage Resolution Workflow
* Monitor Assigned Tasks

### Admin Features

* Manage Users and Agents
* Assign Complaints to Agents
* Monitor Complaint Progress
* View System Statistics
* Analyze Complaint Resolution Performance

---

## Tech Stack

### Frontend

* React.js
* React Router DOM
* Axios
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Authentication & Security

* JWT (JSON Web Tokens)
* bcryptjs
* Helmet
* CORS
* Express Validator

### Database

* MongoDB Atlas

### Deployment

* Frontend: Vercel
* Backend: Render

---

## System Architecture

The application follows a client-server architecture:

Frontend (React.js)
⬇
REST APIs (Express.js)
⬇
MongoDB Database

Authentication is secured using JWT tokens, and user access is controlled through role-based authorization middleware.

---

## Database Collections

### Users

Stores:

* Name
* Email
* Password (Hashed)
* Role (USER / AGENT / ADMIN)

### Complaints

Stores:

* Complaint Details
* Category
* Description
* Status
* Assigned Agent
* Timestamps

### Feedback

Stores:

* Rating
* Comments
* Complaint Reference

---

## Role-Based Access Control

### User

* Register and Login
* Submit Complaints
* Track Complaint Status
* Submit Feedback

### Agent

* View Assigned Complaints
* Update Complaint Progress
* Resolve Complaints

### Admin

* Manage Users
* Assign Agents
* View Analytics
* Monitor System Performance

---

## Security Features

* JWT Authentication
* Password Hashing using bcryptjs
* Role-Based Authorization
* Input Validation using Express Validator
* Secure API Headers using Helmet
* CORS Protection
* Environment Variable Configuration

---

## Project Structure

```bash
Online-complaint-registration/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.jsx
│   │
│   └── package.json
│
└── README.md
```

---

## Installation & Setup

### Clone Repository

```bash
git clone https://github.com/sathvik89/Online-complaint-registration.git
cd Online-complaint-registration
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

Run Backend:

```bash
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## API Modules

### Authentication

* Register User
* Login User

### Complaints

* Create Complaint
* View Complaints
* Update Complaint Status
* Assign Complaints

### Feedback

* Submit Feedback
* View Feedback

### User Management

* Manage Users
* Manage Agents

---

## Future Enhancements

* Real-Time Chat using Socket.IO
* File Attachments for Complaints
* Complaint Categorization using AI
* Email & SMS Notifications
* Advanced Analytics Dashboard
* Complaint Priority Prediction

---

## Learning Outcomes

This project demonstrates:

* Full-Stack MERN Development
* REST API Design
* JWT Authentication & Authorization
* MongoDB Data Modeling
* Role-Based Access Control
* Secure Backend Development
* Frontend-Backend Integration
* Deployment using Vercel and Render

---

## Author

**Sathvik**

B.Tech Artificial Intelligence
Newton School of Technology, Rishihood University

GitHub: https://github.com/sathvik89
