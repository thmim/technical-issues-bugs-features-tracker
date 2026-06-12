import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
    connectionString:config.connection_string
})

export const initDb = async () => {
    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'contributer',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `);

        // create issues table

        console.log("connected sucessfully");
    } catch (error) {
        console.log(error);
    }
}