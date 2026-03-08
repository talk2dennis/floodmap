# AFMS Backend

Backend API for the Advanced Flood Management System (AFMS), supporting flood report submission, alert broadcasting, user authentication, and an AI-powered flood safety assistant.

This backend is part of an academic research project for **MSc Information Technology at the National Open University, Nigeria**.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Service](#running-the-service)
- [Authentication and Authorization](#authentication-and-authorization)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

## Overview

AFMS Backend exposes a REST API for:

- User and admin authentication
- Flood report creation and moderation
- Flood alert management and targeted broadcast
- Password recovery via email
- Context-aware chatbot support for flood safety questions

The service is built with Express and MongoDB, and uses JWT-based authentication.

## Tech Stack

- Runtime: Node.js
- Framework: Express 5
- Database: MongoDB with Mongoose
- Auth: JSON Web Tokens (`jsonwebtoken`)
- Security: `helmet`, `cors`
- File uploads: `multer`
- Media storage: Cloudinary
- Email: Mailjet (`node-mailjet`)
- AI Assistant: Google GenAI (`@google/genai`)

## Project Structure

```text
afms-backend/
	src/
		app.js
		server.js
		config/
			db.js
			cloudinary.js
		middleware/
			auth.middleware.js
			role.middleware.js
			error.middleware.js
			upload.middleware.js
		modules/
			auths/
			reports/
			alerts/
			chatbots/
			users/
		routes/
			index.js
		utils/
			jwt.js
			sendEmail.js
			uploadToCloudinary.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or cloud)
- Cloudinary account (for report image uploads)
- Mailjet credentials (for email notifications and password reset)
- Gemini API key (for chatbot)

### Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in `afms-backend/`:

```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db>

# JWT
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES=7d

# Frontend URL (used for password reset links)
FRONTEND_URL=http://localhost:3000

# Mailjet (email)
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_API_SECRET=your_mailjet_api_secret
MAILJET_FROM_EMAIL=no-reply@example.com
MAILJET_FROM_NAME=AFMS

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
AFMS_LOGO_URL=https://your-logo-url

# Gemini / Google GenAI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com
```

### Variable Notes

- `MONGO_URI` is required. The server exits if missing.
- `JWT_SECRET` and `JWT_EXPIRES` are required for token generation.
- Cloudinary keys are required for any report upload operations.
- Mailjet values are required for password reset and alert email delivery.
- `GEMINI_API_KEY` and `GEMINI_API_BASE_URL` are required for chatbot responses.

## Running the Service

### Development

```bash
npm start
```

This runs `nodemon src/server.js`.

### Build Script

```bash
npm run build
```

Current project uses CommonJS-compatible runtime behavior with ESM syntax and has no transpilation build step.

### Health Checks

- `GET /` -> Welcome message
- `GET /api/ping` -> `pong`

## Authentication and Authorization

- Auth is handled with `Authorization: Bearer <token>`.
- Protected routes use `protect` middleware.
- Admin routes also require `protectAdmin` middleware.
- User roles:
  - `USER`
  - `ADMIN`

## API Endpoints

Base path examples below include `/api/...` as configured in `src/routes/index.js`.

### Auth

| Method | Endpoint                          | Access        | Description                 |
| ------ | --------------------------------- | ------------- | --------------------------- |
| POST   | `/api/auth/register`              | Public        | Register new user           |
| POST   | `/api/auth/login`                 | Public        | User login                  |
| POST   | `/api/auth/admin/login`           | Public        | Admin login                 |
| GET    | `/api/auth/me`                    | Authenticated | Get current user profile    |
| PUT    | `/api/auth/me`                    | Authenticated | Update current user details |
| POST   | `/api/auth/forgot-password`       | Public        | Request password reset link |
| POST   | `/api/auth/reset-password/:token` | Public        | Reset password with token   |
| GET    | `/api/auth/admin/users`           | Admin         | List all users              |
| PUT    | `/api/auth/admin/users/:id/role`  | Admin         | Update user role            |
| DELETE | `/api/auth/admin/users/:id`       | Admin         | Delete user                 |
| GET    | `/api/auth/admin/statistics`      | Admin         | Aggregate platform stats    |

### Reports

| Method | Endpoint                  | Access        | Description                                    |
| ------ | ------------------------- | ------------- | ---------------------------------------------- |
| POST   | `/api/reports`            | Authenticated | Create report (multipart, up to 3 images)      |
| GET    | `/api/reports`            | Authenticated | Get all reports                                |
| GET    | `/api/reports/my-reports` | Authenticated | Get current user's reports                     |
| GET    | `/api/reports/:id`        | Authenticated | Get report by ID                               |
| PUT    | `/api/reports/:id`        | Owner/Admin   | Update report                                  |
| DELETE | `/api/reports/:id`        | Owner/Admin   | Delete report and associated Cloudinary images |
| PUT    | `/api/reports/:id/verify` | Admin         | Mark report as `VERIFIED`                      |
| PUT    | `/api/reports/:id/reject` | Admin         | Mark report as `REJECTED`                      |

### Alerts

| Method | Endpoint               | Access        | Description                                        |
| ------ | ---------------------- | ------------- | -------------------------------------------------- |
| POST   | `/api/alerts`          | Admin         | Create alert                                       |
| GET    | `/api/alerts`          | Authenticated | Get alerts (filtered by user state for non-admins) |
| GET    | `/api/alerts/:id`      | Authenticated | Get alert by ID                                    |
| PUT    | `/api/alerts/:id`      | Admin         | Update alert                                       |
| DELETE | `/api/alerts/:id`      | Admin         | Delete alert                                       |
| POST   | `/api/alerts/:id/send` | Admin         | Send alert to targeted users and mark as `SENT`    |

### Chatbot

| Method | Endpoint             | Access        | Description                                 |
| ------ | -------------------- | ------------- | ------------------------------------------- |
| POST   | `/api/chatbots/chat` | Authenticated | Get flood safety guidance from AI assistant |

## Data Models

### User

- `name`, `email`, `password`
- `phone`, `state`, `lga`, `location`
- `role` (`USER` or `ADMIN`)
- Notification preferences
- Password reset token and expiry fields

### Report

- `title`, `description`, `severity` (`LOW`, `MEDIUM`, `HIGH`)
- GeoJSON `location` (`Point`, coordinates `[lng, lat]`)
- `state`, `lga`, images
- Moderation fields: `status` (`PENDING`, `VERIFIED`, `REJECTED`), `verifiedBy`

### Alert

- `title`, `message`, `severity` (`INFO`, `WARNING`, `CRITICAL`)
- `target` (`state`, `lga`)
- Delivery channels (`email`, `sms`, `push`)
- `status` (`DRAFT`, `SENT`)

## Error Handling

- Invalid routes return `404 Not Found` with a message.
- Protected endpoints return `401` when token is missing/invalid.
- Admin-only endpoints return `403` for non-admin users.
- Validation and processing errors return `400` or `500` with descriptive messages.

## Troubleshooting

- Server exits on startup:
  - Confirm `MONGO_URI` is set correctly.
- Report upload fails:
  - Verify all Cloudinary keys are present and valid.
- Password reset email not sent:
  - Verify Mailjet credentials and sender identity settings.
- Chatbot returns configuration error:
  - Verify `GEMINI_API_KEY` and `GEMINI_API_BASE_URL`.

## Future Improvements

- Add OpenAPI/Swagger documentation
- Add unit and integration tests
- Add rate limiting per route category
- Implement robust audit logging and monitoring
- Add CI pipeline for automated quality checks
