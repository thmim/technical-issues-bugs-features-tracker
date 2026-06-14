import type { NextFunction, Request, Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { ROLES } from "../types";
const auth = (...roles: ROLES[]) => {
    // console.log(roles)
    return async (req: Request, res: Response, next: NextFunction) => {
        // console.log(req.headers.authorization);
        const token = req.headers.authorization;
        // console.log(token)
        try {
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized access"
                });
            }

            // verify token
            const decoded = jwt.verify(token as string, config.jwt_secret_key) as JwtPayload
            //   console.log(decoded)
            const userData = await pool.query(`
            SELECT * FROM users WHERE email=$1   
            `, [decoded.email]);

            const user = userData.rows[0];


            console.log(user);
            // check user exist or not
            if (userData.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found!",
                });
            }

            // role check
            console.log("auth theke",roles.length && !roles.includes(user.role))
            if (roles.length && !roles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden!!",
                });
            }

            req.user = decoded;

            next();
        } catch (error) {
            // next(error);
            return res.status(401).json({
                success: false,
                message: "Invalid Token",
            });
        }


    }
}
export default auth;