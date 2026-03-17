import { defineConfig } from "drizzle-kit";
import "dotenv/config"; 

export default defineConfig({
  schema:    "./src/infrastructure/db/schema/index.js",
  out:       "./drizzle",
  dialect:   "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});