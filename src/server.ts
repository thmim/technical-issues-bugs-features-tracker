import express, { type Application, type Request, type Response } from "express";
import { Pool } from "pg";
const app: Application = express();
const port = 3000
app.use(express.json());

const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_MRIHZQFanU90@ep-green-night-atkuypps-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
})

const initDb = async () => {
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
        `)
        console.log("connected sucessfully");
    } catch (error) {
        console.log(error);
    }
}
initDb();

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: "choltece",
        author: "ami"
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})