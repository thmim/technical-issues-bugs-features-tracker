import bcrypt from "bcryptjs";
import { pool } from "../../db";
import type { IUser } from "./auth.userinterface";
import jwt from "jsonwebtoken";
import config from "../../config";

const createUserIntoDb = async (payload: IUser) => {
    const { name, email, password,role ="contributor" } = payload;
    const hash = await bcrypt.hash(password,10);

    const result = await pool.query(
        `
         INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING *
        `,
        [name, email, hash,role],
        
    );
    // delete password from the response
    delete result.rows[0].password;
    return result;
}

// for login user
const loginUserIntoDb = async (payload: IUser) => {
    const { email, password } = payload;
    // const hash = await bcrypt.hash(password,10);

    const result = await pool.query(`
     SELECT * FROM users WHERE email = $1
         
        `,[email]
        
    );
    // delete password from the response
    // delete result.rows[0].password;
    // return result;
    if(result.rows.length === 0){
        throw new Error("Invalid Credential")
    }
    // console.log(result.rows[0])
    const user = result.rows[0]
    const matchPassword = await bcrypt.compare(password,user.password);
    // console.log(matchPassword)
    if(!matchPassword){
        throw new Error("Invalid Credential")
    }

    const jwtPayload = {
        id:user.id,
        name:user.name,
        email:user.email
    }

    // create token
    const accessToken = jwt.sign(jwtPayload,config.jwt_secret_key,{expiresIn:'1d'});
    return {accessToken};
}

export const userServices = {
    createUserIntoDb,
    loginUserIntoDb,
}