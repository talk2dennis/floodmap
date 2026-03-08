# FloodMap Project

FloodMap is an Advanced Flood Management System (AFMS) project focused on improving flood incident reporting, early warning dissemination, and citizen safety support.

This repository is part of my academic project for **MSc Information Technology at the National Open University, Nigeria**.

## Table of Contents

- [Project Summary](#project-summary)
- [Repository Structure](#repository-structure)
- [Current Implementation Scope](#current-implementation-scope)
- [Related Repositories](#related-repositories)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Backend Setup](#backend-setup)
- [Core Features](#core-features)
- [API Surface](#api-surface)
- [Development Notes](#development-notes)
- [Roadmap](#roadmap)

## Project Summary

FloodMap addresses practical flood management workflows:

- Capturing flood incidents from users
- Managing and verifying reports
- Broadcasting targeted flood alerts
- Providing AI-assisted flood safety guidance

The system is designed for extensibility and can support integration with dashboards, mobile applications, and decision-support workflows.

## Repository Structure

```text
floodmap/
  afms-backend/          # Main API server (Express + MongoDB)
```

## Current Implementation Scope

At present, this repository contains the backend service implementation in `afms-backend`.

Mobile and admin dashboard clients are maintained in separate repositories.

## Related Repositories

- Mobile app: `https://github.com/talk2dennis/afms`
- Admin dashboard: `https://github.com/talk2dennis/afms-dashboard`

## Technology Stack

- Backend runtime: Node.js
- API framework: Express
- Database: MongoDB + Mongoose
- Authentication: JWT
- Security middleware: Helmet, CORS
- File uploads: Multer
- Cloud media storage: Cloudinary
- Email delivery: Nodemailer (SMTP)
- AI integration: Google GenAI (Gemini)

## Quick Start

From the repository root:

```bash
cd afms-backend
npm install
npm start
```

The API will run on the configured port (default: `5000`) after loading environment variables.

## Backend Setup

Detailed backend setup, environment configuration, endpoint references, and troubleshooting are documented in:

- `afms-backend/README.md`

Client application repositories:

- Mobile app: `https://github.com/talk2dennis/afms`
- Admin dashboard: `https://github.com/talk2dennis/afms-dashboard`

## Core Features

- User registration and login
- Admin access and user management
- Flood report submission with image uploads
- Report moderation (verify/reject)
- Alert creation, update, and broadcast
- Password reset via email
- Location-aware chatbot responses for flood safety

## API Surface

Base routes are served from the backend:

- `GET /` - API welcome
- `GET /api/ping` - health check
- `/api/auth/*` - authentication and admin user operations
- `/api/reports/*` - report CRUD and moderation
- `/api/alerts/*` - alert CRUD and send workflows
- `/api/chatbots/chat` - AI assistant endpoint

For full endpoint tables and access rules, see `afms-backend/README.md`.

## Development Notes

- The backend uses ESM imports (`"type": "module"`).
- Ensure all required `.env` variables are set before startup.
- Cloudinary and SMTP are required for full feature execution.
- MongoDB connection must be valid for service boot.

## Roadmap

- Add automated tests (unit/integration)
- Add API documentation (OpenAPI/Swagger)
- Add CI/CD pipeline
- Improve observability (logs, metrics, health diagnostics)
