# Tutoring Center

**Tutoring Center** is an internal web application that provides a back-end API and database configuration to manage tutoring sessions, tutors, and students. It leverages a containerized Node.js service, a PostgreSQL database, and Docker Compose for easy local development.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation \& setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)


## Features

- Exposes a RESTful API for:
    - Managing tutors (CRUD)
    - Managing students (CRUD)
    - Scheduling and tracking tutoring sessions
- Containerized services for consistent development and testing
- Automated database initialization and migrations


## Tech Stack

- **Node.js** \& **Express** (API server)
- **PostgreSQL** (Database)
- **Docker** \& **Docker Compose** (Containerization)
- **JavaScript**, **HTML**, **CSS**


## Prerequisites

- Docker ≥ 20.x
- Docker Compose ≥ 1.29
- Git


## Installation \& setup

1. **Clone the repository**

```bash
git clone https://github.com/rollroyces/tutoring-center.git
cd tutoring-center
```

2. **Copy environment template**

```bash
cp .env.example .env
```

> _Note: A sample `.env.example` should be provided alongside `.env` in the repo. If missing, create one with the variables listed [below](#environment-variables)._
3. **Build and start containers**

```bash
docker-compose up --build
```

This will:
    - Build the API service from `Dockerfile`
    - Spin up a PostgreSQL instance as defined in `docker-compose.yml`
    - Run any database initialization scripts

## Configuration

All configuration values are set in the `.env` file:


| Variable | Description | Example |
| :-- | :-- | :-- |
| `POSTGRES_USER` | PostgreSQL superuser name | `admin` |
| `POSTGRES_PASSWORD` | PostgreSQL user password | `password123` |
| `POSTGRES_DB` | Name of the default database | `tutoring_center` |
| `API_PORT` | Port on which the API server will listen | `4000` |
| `DB_PORT` | Port on which PostgreSQL will expose | `5432` |
| `NODE_ENV` | Application environment (`development`/`production`) | `development` |

## Running the Application

- **Start services**

```bash
docker-compose up
```

The API will be available at `http://localhost:<API_PORT>` (default `4000`).
- **Stopping**

```bash
docker-compose down
```

- **Rebuild** (after changing Dockerfile or dependencies)

```bash
docker-compose up --build
```


## Project Structure

```
tutoring-center/
├── api/                   # Express.js API service
│   ├── controllers/       # Route handlers
│   ├── models/            # Data models & migrations
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   └── index.js           # App entry point
├── db/                    # Database setup scripts / migrations
│   └── init.sql           # Schema and seed data
├── .env                   # Environment configuration (ignored by Git)
├── Dockerfile             # API service container definition
├── docker-compose.yml     # Orchestrates API + PostgreSQL containers
└── README.md              # Project documentation
```


## Environment Variables

Define these in your `.env` file:

```bash
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=your_db_name
API_PORT=4000
DB_PORT=5432
NODE_ENV=development
```


## Usage

1. **Health check**

```bash
curl http://localhost:4000/health
```

2. **List all tutors**

```bash
curl http://localhost:4000/api/tutors
```

3. **Create a new session**

```bash
curl -X POST http://localhost:4000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"tutorId":1,"studentId":2,"startTime":"2025-07-23T14:00:00Z"}'
```


Refer to the API documentation (e.g., Swagger or Postman collection) for full endpoint details.

## Contributing

This repository is for internal use. To propose changes:

1. **Create a feature branch:**

```bash
git checkout -b feature/your-feature
```

2. **Commit your changes:**

```bash
git commit -m "Add your feature"
```

3. **Push and open a pull request** against `main`.
4. Upon approval, merge and delete the branch.

## License

This project is for internal use and is not publicly licensed. If redistributed outside the organization, please consult legal.

