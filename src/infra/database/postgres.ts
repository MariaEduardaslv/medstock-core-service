import { Pool } from "pg";

const password = process.env.DB_PASSWORD;

if (!password) {
  throw new Error("DB_PASSWORD não configurada no .env");
}

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: password,
  connectionTimeoutMillis: 5000
});