# AFMS Backend

## Project Overview

Advanced Flood Management System (AFMS) - Backend service for real-time flood monitoring and management.

## Table of Contents

- [Getting Started](#getting-started)
- [API Routes](#api-routes)
- [Installation](#installation)
- [Environment Variables](#environment-variables)

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn
- Database (MongoDb)

### Installation

```bash
npm install
npm start
```

## API Routes

### Authentication APIs

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | User registration |
| POST   | `/api/auth/login`    | User login        |
| POST   | `/api/auth/logout`   | User logout       |
| POST   | `/api/auth/refresh`  | Refresh token     |

### Flood Data APIs

| Method | Endpoint          | Description          |
| ------ | ----------------- | -------------------- |
| GET    | `/api/report`     | Get all flood events |
| GET    | `/api/report/:id` | Get flood by ID      |
| POST   | `/api/report`     | Create flood report  |
| PUT    | `/api/report/:id` | Update flood data    |
| DELETE | `/api/report/:id` | Delete flood record  |

### Location APIs

| Method | Endpoint                    | Description                 |
| ------ | --------------------------- | --------------------------- |
| GET    | `/api/locations`            | Get all monitored locations |
| POST   | `/api/locations`            | Add new location            |
| GET    | `/api/locations/:id/alerts` | Get location alerts         |

### Alert APIs

| Method | Endpoint                 | Description         |
| ------ | ------------------------ | ------------------- |
| GET    | `/api/alerts`            | Get all alerts      |
| POST   | `/api/alerts`            | Create alert        |
| PUT    | `/api/alerts/:id/status` | Update alert status |

## Environment Variables

Create `.env` file with required variables.

## License
