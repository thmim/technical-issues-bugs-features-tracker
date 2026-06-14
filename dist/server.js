

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  jwt_secret_key: process.env.JWT_SECRET_KEY
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string,
  ssl: {
    rejectUnauthorized: false
  }
});
var initDb = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'contributor' CHECK(role IN ('contributor', 'maintainer')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT  NOT NULL CHECK (LENGTH(description) >= 20),
            type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
            status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
            reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    console.log("connected sucessfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
import jwt from "jsonwebtoken";
var createUserIntoDb = async (payload) => {
  const { name, email, password, role } = payload;
  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
         INSERT INTO users(name,email,password,role) 
         VALUES($1,$2,$3,COALESCE($4,'contributor')) 
         RETURNING *
        `,
    [name, email, hash, role]
  );
  delete result.rows[0].password;
  return result;
};
var loginUserIntoDb = async (payload) => {
  const { email, password } = payload;
  const result = await pool.query(
    `
     SELECT * FROM users WHERE email = $1
         
        `,
    [email]
  );
  if (result.rows.length === 0) {
    throw new Error("Invalid Credential");
  }
  const user = result.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credential");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  delete user.password;
  const token = jwt.sign(jwtPayload, config_default.jwt_secret_key, { expiresIn: "1d" });
  return { token, user };
};
var userServices = {
  createUserIntoDb,
  loginUserIntoDb
};

// src/modules/auth/auth.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userServices.createUserIntoDb(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await userServices.loginUserIntoDb(req.body);
    res.status(201).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = {
  createUser,
  loginUser
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/", userController.createUser);
router.post("/login", userController.loginUser);
var userRoute = router;

// src/modules/issues/issues.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issues.service.ts
var createIssuesIntoDb = async (payload) => {
  const { title, description, type, reporter_id, status } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues(title,description,type,reporter_id,status)
         VALUES($1,$2,$3,$4,COALESCE($5,'open')) 
        RETURNING *
        `,
    [title, description, type, reporter_id, status]
  );
  return result;
};
var getAllIssuesFromDb = async (filters) => {
  const { sort, type, status } = filters;
  let order = "DESC";
  if (sort === "oldest") {
    order = "ASC";
  }
  let queryText = `SELECT * FROM issues`;
  const queryParams = [];
  if (type) {
    queryText += ` WHERE type = $1`;
    queryParams.push(type);
  } else if (status) {
    queryText += ` WHERE status = $1`;
    queryParams.push(status);
  }
  queryText += ` ORDER BY created_at ${order}`;
  const result = await pool.query(queryText, queryParams);
  const reporterIds = result.rows.map((i) => i.reporter_id);
  const usersInfo = await pool.query(`
  SELECT id, name, role
  FROM users
  WHERE id = ANY($1)
`, [reporterIds]);
  const userMap = /* @__PURE__ */ new Map();
  for (const user of usersInfo.rows) {
    userMap.set(user.id, user);
  }
  const data = result.rows.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: userMap.get(issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return data;
};
var getSingleIssueFromDb = async (id) => {
  const result = await pool.query(`
            SELECT * FROM issues
            WHERE id = $1
            `, [id]);
  const reporterIds = result.rows.map((i) => i.reporter_id);
  const usersInfo = await pool.query(`
  SELECT id, name, role
  FROM users
  WHERE id = ANY($1)
`, [reporterIds]);
  const userMap = /* @__PURE__ */ new Map();
  for (const user of usersInfo.rows) {
    userMap.set(user.id, user);
  }
  const data = result.rows.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: userMap.get(issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  console.log(data);
  return data;
};
var updateIssueFromDb = async (id, payload) => {
  const { title, description, type } = payload;
  const result = await pool.query(`
        UPDATE issues
        SET 
        
        title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      updated_at = NOW()
        WHERE id=$4
        RETURNING *
        `, [title, description, type, id]);
  return result.rows[0];
};
var deleteIssueFromDb = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM issues
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );
  return result.rows[0];
};
var issuesService = {
  createIssuesIntoDb,
  getAllIssuesFromDb,
  getSingleIssueFromDb,
  updateIssueFromDb,
  deleteIssueFromDb
};

// src/modules/issues/issues.controller.ts
var createIssues = async (req, res) => {
  const payload = {
    ...req.body,
    reporter_id: req.user?.id
  };
  try {
    const result = await issuesService.createIssuesIntoDb(payload);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  const { sort, status, type } = req.query;
  try {
    const data = await issuesService.getAllIssuesFromDb({
      sort,
      status,
      type
    });
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Issues not found",
        data
      });
    }
    res.status(201).json({
      success: true,
      message: "Issues retrived successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await issuesService.getSingleIssueFromDb(id);
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        data: {}
      });
    }
    res.status(201).json({
      success: true,
      message: "Issue retrived successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  try {
    const existingIssue = await issuesService.getSingleIssueFromDb(id);
    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }
    if (user?.role === "contributor") {
      console.log(existingIssue[0]?.reporter.id !== user.id);
      if (existingIssue[0]?.reporter.id !== user.id) {
        return res.status(403).json({
          success: false,
          message: "You can update only your own issues"
        });
      }
      if (existingIssue[0]?.status !== "open") {
        return res.status(403).json({
          success: false,
          message: "you have no access"
        });
      }
    }
    const result = await issuesService.updateIssueFromDb(
      id,
      req.body
    );
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        data: {}
      });
    }
    return res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issuesService.deleteIssueFromDb(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        data: {}
      });
    }
    return res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var issuesController = {
  createIssues,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.middleware.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    try {
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access"
        });
      }
      const decoded = jwt2.verify(token, config_default.jwt_secret_key);
      const userData = await pool.query(`
            SELECT * FROM users WHERE email=$1   
            `, [decoded.email]);
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden!!"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_middleware_default = auth;

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/issues/issues.route.ts
var router2 = Router2();
router2.post("/", auth_middleware_default(), issuesController.createIssues);
router2.get("/", issuesController.getAllIssues);
router2.get("/:id", issuesController.getSingleIssue);
router2.patch("/:id", auth_middleware_default(USER_ROLE.maintainer, USER_ROLE.contributor), issuesController.updateIssue);
router2.delete("/:id", auth_middleware_default(USER_ROLE.maintainer), issuesController.deleteIssue);
var issuesRoute = router2;

// src/app.ts
import cors from "cors";

// src/middleware/globalerror.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error-"
  });
};
var globalerror_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(express.json());
var corsOptions = {
  origin: "http://localhost:3000"
};
app.use(cors(corsOptions));
app.get("/", (req, res) => {
  res.status(200).json({
    message: "server running",
    author: "ami"
  });
});
app.use("/api/auth/signup", userRoute);
app.use("/api/auth", userRoute);
app.use("/api/issues", issuesRoute);
app.use("/api/issues", issuesRoute);
app.use("/api/issues", issuesRoute);
app.use("/api/issues", issuesRoute);
app.use("/api/issues", issuesRoute);
app.use(globalerror_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDb();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map