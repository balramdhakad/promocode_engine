import { Pool } from "pg";
import env from "../../config/env.js";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema/index.js";
const pool = new Pool({
  connectionString: env.serverConfig.DATABASE_URL,
  max: 10,
});

pool.connect();

pool.on("connect", () => {
  console.log(`Database is connected`);
});

pool.on("error", (err) => {
  console.log(`Database connection Error : ${err}`);
});

export const db = drizzle(pool,{schema});
