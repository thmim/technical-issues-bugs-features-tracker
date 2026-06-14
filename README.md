# Issue Feature and Bug Tracker backend

A RESTful Issue Tracking API built with **Node.js**, **Express.js**, **TypeScript**, **Neondb**, and **PostgreSQL**. This project allows users to report issues, manage issue statuses, and track software bugs or feature requests efficiently.

## Features

* User Management

  * Create users with login and signup
  * Role-based system (`contributor` and `maintainer`)

* Issue Management

  * Create issues
  * Update issue status
  * Delete issues
  * Filter issues by type and status

* PostgreSQL Database

  * Automatic table creation on startup
  * Foreign key relationships
  * Data validation using SQL constraints

* TypeScript Support

  * Type-safe development
  * Better code maintainability

## Tech Stack

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* Neondb
* pg (node-postgres)
* dotenv

## Project Structure

Follow the module-based file structure

## Database Schema

### Users Table

| Field      | Type                     |
| ---------- | ------------------------ |
| id         | SERIAL PRIMARY KEY       |
| name       | VARCHAR(100)             |
| email      | VARCHAR(100) UNIQUE      |
| password   | VARCHAR(255)             |
| role       | contributor / maintainer |
| created_at | TIMESTAMP                |
| updated_at | TIMESTAMP                |

### Issues Table

| Field       | Type                          |
| ----------- | ----------------------------- |
| id          | SERIAL PRIMARY KEY            |
| title       | VARCHAR(150)                  |
| description | TEXT                          |
| type        | bug / feature_request         |
| status      | open / in_progress / resolved |
| reporter_id | Foreign Key (users.id)        |
| created_at  | TIMESTAMP                     |
| updated_at  | TIMESTAMP                     |



## API Endpoints

### Users

| Method | Endpoint             |
| ------ | ----------           |
| POST   | /api/auth/signup     |
| POST   | /api/auth/login      |


### Issues

| Method | Endpoint    |
| ------ | ----------- |
| POST   | /api/issues    |
| GET    | /api/issues    |
| GET    |/api/issues/:id |
| PATCH  | /api/issues/:id |
| DELETE |/api/issues/:id |

### Query Parameters

Filter issues by type:

```http
GET /issues?type=bug
```

Filter issues by status:

```http
GET /issues?status=open
```

Combine filters:

```http
GET /issues?type=bug&status=open
```




This project is licensed under the MIT License.
