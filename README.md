# 🐞 BugTracker

> A collaborative issue tracker for software teams to report bugs, suggest features, and coordinate resolutions.

**BugTracker** is a RESTful backend API built with **Node.js, Express.js, TypeScript and PostgreSQL**. It features secure JWT authentication, role-based access control, and hand-written raw SQL queries (no ORM, no query builder).

- 🔗 **Live API:** `https://technical-issues-bug-tracker-server.vercel.app/`
- 📦 **GitHub:** `https://github.com/thmim/technical-issues-bugs-features-tracker/tree/main`
- 📦 **Postman API Collection:** `https://documenter.getpostman.com/view/45092075/2sBYHSxLMV` 

---

## ✨ Features

- 🔐 **Secure authentication**: signup and login with bcrypt-hashed passwords and signed JWT tokens
- 👥 **Role-based access control**: two roles, `contributor` and `maintainer`, with permission checks before every privileged action
- 🐛 **Issue management**: create, view, update and delete bug reports and feature requests
- 🔎 **Filtering & sorting**: filter issues by `type` and `status`, and sort by newest or oldest
- 🔄 **Workflow statuses**: issues move through `open` → `in_progress` → `resolved`
- ✅ **Input validation**: title length, description length, allowed types and statuses, and unique emails
- 📦 **Consistent API responses**: one standard success and error format across every endpoint
- 🧱 **Modular architecture**: separate `config`, `middleware`, `modules` and `utils` layers
- 🛡️ **Security-first**: passwords are never returned in responses or logged

---

## 🛠️ Tech Stack

| Technology | Purpose |
| --- | --- |
| **Node.js** | JavaScript runtime |
| **TypeScript** | Strictly typed code (no `any`) |
| **Express.js** | Web framework with modular routers |
| **PostgreSQL** | Relational database |
| **pg** | Native PostgreSQL driver with raw SQL via `pool.query()` |
| **bcrypt** | Password hashing |
| **jsonwebtoken** | JWT generation and verification |

---

## 👥 Roles & Permissions

| Action | Contributor | Maintainer |
| --- | :---: | :---: |
| Register and log in | ✅ | ✅ |
| View all issues | ✅ | ✅ |
| Create an issue | ✅ | ✅ |
| Update own issue (only while status is `open`) | ✅ | ✅ |
| Update any issue | ❌ | ✅ |
| Change issue workflow status | ❌ | ✅ |
| Delete any issue | ❌ | ✅ |

---

## 🗄️ Database Schema

### `users`

| Field | Details |
| --- | --- |
| `id` | Auto-incrementing primary key |
| `name` | Required, full display name |
| `email` | Required, unique |
| `password` | Required, stored as a bcrypt hash, never returned |
| `role` | `contributor` (default) or `maintainer` |
| `created_at` | Set automatically on insert |
| `updated_at` | Refreshed automatically on update |

### `issues`

| Field | Details |
| --- | --- |
| `id` | Auto-incrementing primary key |
| `title` | Required, maximum 150 characters |
| `description` | Required, minimum 20 characters |
| `type` | `bug` or `feature_request` |
| `status` | `open` (default), `in_progress` or `resolved` |
| `reporter_id` | ID of the user who created the issue (validated in application logic) |
| `created_at` | Set automatically on insert |
| `updated_at` | Refreshed automatically on update |

---

## 🌐 API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Log in and receive a JWT |

### Issues

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/issues` | Authenticated | Create a new issue |
| `GET` | `/api/issues` | Public | Get all issues (supports `sort`, `type`, `status`) |
| `GET` | `/api/issues/:id` | Public | Get a single issue with reporter details |
| `PATCH` | `/api/issues/:id` | Maintainer, or contributor (own open issue) | Update an issue |
| `DELETE` | `/api/issues/:id` | Maintainer only | Delete an issue |

### Query Parameters for `GET /api/issues`

| Param | Values | Default |
| --- | --- | --- |
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | none |
| `status` | `open`, `in_progress`, `resolved` | none |

**Example:** `GET /api/issues?type=bug&status=open&sort=oldest`

### Authentication Header

Protected routes expect the JWT in the `Authorization` header:

```
Authorization: <JWT_TOKEN>
```

---

## 📬 Example Requests

**Sign up**

```json
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

**Create an issue**

```json
POST /api/issues
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

---

## 📦 Response Format

**Success**

```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

**Error**

```json
{
  "success": false,
  "message": "Error description",
  "errors": "Error details"
}
```

### HTTP Status Codes

| Code | Meaning |
| --- | --- |
| `200` | Success |
| `201` | Resource created |
| `400` | Validation error or invalid input |
| `401` | Missing, invalid or expired token |
| `403` | Insufficient role or permissions |
| `404` | Resource not found |
| `409` | Business logic conflict |
| `500` | Unexpected server error |

---

## 📁 Project Structure

<!-- Adjust this to match your actual folders -->

```
bugtracker/
├── src/
│   ├── config/          # Environment variables and database pool
│   ├── middleware/      # Auth, role checks, error handling
│   ├── modules/
│   │   ├── auth/        # Signup and login (routes, controller, service)
│   │   └── issues/      # Issue CRUD (routes, controller, service)
│   ├── utils/           # Response helpers and shared functions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version)
- PostgreSQL database (local, or hosted on Neon or Supabase)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/thmim/technical-issues-bugs-features-tracker.git
cd bugtracker

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
```

### Environment Variables

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

### Run the project

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

The server will start on `http://localhost:3000`.

---

## 🔒 Security Practices

- Passwords are hashed with bcrypt before being stored
- Passwords are never exposed in responses or logs
- Protected routes reject requests without a valid, unexpired JWT
- Role checks run before any privileged operation
- Secrets and credentials are loaded from environment variables
- Raw SQL uses parameterized queries to prevent SQL injection

---

## 💡 What I Learned

- Designing a modular, maintainable Express and TypeScript backend
- Writing raw SQL with the `pg` driver, including dynamic filtering and sorting
- Implementing JWT authentication with role-based authorization
- Building consistent API responses and centralized error handling

---

## 👨‍💻 Author

**Taharim Hasan Mim**
Full Stack Developer | Khulna, Bangladesh

📧 mdtaharimmim1010@gmail.com
🔗 [GitHub](https://github.com/thmim) · [LinkedIn](https://www.linkedin.com/in/th-mim10/) · [Portfolio](https://taharim-hasan.vercel.app/)
