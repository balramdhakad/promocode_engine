import jwt from "jsonwebtoken";
import env from "../config/env.js";

const JWT_SECRET = env.serverConfig.JWT_SECRET;
const JWT_EXPIRES_IN = env.serverConfig.JWT_EXPIRES_IN;

export const generateToken = (payload) => {
  return jwt.sign({userId : payload}, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};


export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};