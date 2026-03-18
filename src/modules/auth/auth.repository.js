import { and, eq, SQL, sql } from "drizzle-orm";
import { db } from "../../infrastructure/db/index.js";
import { users } from "../../infrastructure/db/schema/user.js";

const findUserById = async (userId) => {
  const [user] = await db
    .select({
      id: users.id,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
};

const findUserByEmail = async (email) => {
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(and(eq(users.email, email), eq(users.status, "active")))
    .limit(1);

  return user ?? null;
};

const userExistWithUserName = async (username) => {
  const result = await db.execute(
    sql`SELECT EXISTS (
    SELECT 1 FROM users WHERE username = ${username}
  ) AS exists`,
  );
};

const userExistWithEmailId = async (email) => {
  const result = await db.execute(
    sql`SELECT EXISTS (
    SELECT 1 FROM users WHERE email = ${email}
  ) AS exists`,
  );

  const exists = result.rows[0].exists;
  return exists;
};

const createUser = async (username, email, hashedPassword) => {
  const [user] = await db
    .insert(users)
    .values({
      username: username,
      email: email,
      passwordHash: hashedPassword,
    })
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    });

  return user ?? null;
};

const authRepository = {
  findUserById,
  findUserByEmail,
  userExistWithUserName,
  createUser,
  userExistWithEmailId
};

export default authRepository;
