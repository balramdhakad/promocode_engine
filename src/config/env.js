import dotenv from "dotenv";
dotenv.config();

const required = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`ENV Error : ${key} is Required to start the server`);
  }
  return value;
};

const convertToNumber = (key) => {
  const value = process.env[key];
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    throw new Error(
      `ENV Error : incorrect value to covert into Number : ${key}`,
    );
  }
  return value;
};

//server configs
const serverConfig = {
  PORT: process.env.PORT ? convertToNumber("PORT") : 5000,
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET : required("JWT_SECRET"),
  JWT_EXPIRES_IN : required("JWT_EXPIRES_IN"),
  FRONTEND_URL :  process.env.FRONTEND_URL,
  environment:
    process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod"
      ? "production"
      : process.env.NODE_ENV === "test"
        ? "test"
        : "development",

    
};

const timeZone = process.env.TIME_ZONE;

const redisConfig = {
  host: required("REDIS_HOST"),
  port: required("REDIS_PORT"),
};

const env = { serverConfig, redisConfig, timeZone };

export default env;
