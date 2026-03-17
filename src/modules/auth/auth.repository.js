import { and, eq, sql } from "drizzle-orm";
import { db } from "../../infrastructure/db/index.js";
import { users } from "../../infrastructure/db/schema/user.js";

const findUserById = async (userId) => {
  const [user] = await db
    .select({
      id:   users.id,
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
      id:           users.id,
      username:     users.username,
      email:        users.email,
      role:         users.role,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(
      and(
        eq(users.email, email),
        eq(users.status, "active")      
      )
    )
    .limit(1);

  return user ?? null;
};


const userExistWithUserName = async (username) => {
  const [result] = await db
    .select({
      exists: sql`exists(select 1 from users where username = ${username})`,
    })
    .from(users)
    .limit(1);

  return result.exists;            
};


const createUser = async (username, email, hashedPassword) => {
  const [user] = await db
    .insert(users)
    .values({
      username:     username,
      email:        email,
      passwordHash: hashedPassword,
    })
    .returning({
      id:        users.id,
      username:  users.username,
      email:     users.email,
      role:      users.role,
      createdAt: users.createdAt,
    });

  return user ?? null;
};

const authRepository = {
  findUserById,
  findUserByEmail,
  userExistWithUserName, 
  createUser,
};

export default authRepository;