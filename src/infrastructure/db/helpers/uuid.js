import { uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const uuidv7 = () =>
  uuid("id").default(sql`uuidv7()`).primaryKey();
