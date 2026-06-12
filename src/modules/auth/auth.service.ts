import { pool } from "../../db";
import type { IUser } from "./auth.userinterface";

const createUserIntoDb = async (payload: IUser) => {
    const { name, email, password } = payload;


    const result = await pool.query(
        `
         INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING *
        `,
        [name, email, password],
        
    );
    return result;
}

export const userServices = {
    createUserIntoDb,
}