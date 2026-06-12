import { pool } from "../../db"
import type { IIssues } from "./issues.interface"

const createIssuesIntoDb = async (payload:IIssues)=>{
    const {title,description,type,status}=payload
    const result = await pool.query(`
        INSERT INTO issues(title,description,type,status) VALUES($1,$2,$3,$4) RETURNING *
        `
        ,[title,description,type,status]
    );
    return result;
}

export const issuesService = {
    createIssuesIntoDb,
}