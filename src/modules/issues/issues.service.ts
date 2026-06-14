import { pool } from "../../db"
import type { IIssues } from "./issues.interface"

const createIssuesIntoDb = async (payload: IIssues) => {
    const { title, description, type, reporter_id,status } = payload
    const result = await pool.query(`
        INSERT INTO issues(title,description,type,reporter_id,status)
         VALUES($1,$2,$3,$4,COALESCE($5,'open')) 
        RETURNING *
        `
        , [title, description, type, reporter_id,status]
    );
    return result;
}

// get all issues from db
const getAllIssuesFromDb = async (sort: string) => {
    // decide sorting order
    let order = "DESC"; // newest first default

    if (sort === "oldest") {
        order = "ASC";
    }


    const result = await pool.query(`
            SELECT * FROM issues
            ORDER BY created_at ${order}
            `);
    // return result;
    const reporterIds = result.rows.map(i => i.reporter_id);
    // console.log(reporterIds)

    // users getting query
    const usersInfo = await pool.query(`
  SELECT id, name, role
  FROM users
  WHERE id = ANY($1)
`, [reporterIds]);
    // console.log(usersInfo)
    const userMap = new Map();
    for (const user of usersInfo.rows) {
        userMap.set(user.id, user);
    }
    // console.log(userMap)
    const data = result.rows.map(issue => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: userMap.get(issue.reporter_id),
        created_at: issue.created_at,
        updated_at: issue.updated_at
    }));
    // console.log(data)
    return data;
}

// get single issue from db
const getSingleIssueFromDb = async (id: string) => {
    const result = await pool.query(`
            SELECT * FROM issues
            WHERE id = $1
            `, [id]);

    const reporterIds = result.rows.map(i => i.reporter_id);
    // console.log(reporterIds)

    // users getting query
    const usersInfo = await pool.query(`
  SELECT id, name, role
  FROM users
  WHERE id = ANY($1)
`, [reporterIds]);
    // console.log(usersInfo)
    const userMap = new Map();
    for (const user of usersInfo.rows) {
        userMap.set(user.id, user);
    }
    // console.log(userMap)
    const data = result.rows.map(issue => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: userMap.get(issue.reporter_id),
        created_at: issue.created_at,
        updated_at: issue.updated_at
    }));
    console.log(data)
    return data;

}

// update issue from db
const updateIssueFromDb = async (id: string,payload:IIssues) => {
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

}

// issue delete from db
const deleteIssueFromDb = async (id: string) => {
    const result = await pool.query(
    `
    DELETE FROM issues
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];

}

export const issuesService = {
    createIssuesIntoDb,
    getAllIssuesFromDb,
    getSingleIssueFromDb,
    updateIssueFromDb,
    deleteIssueFromDb
}