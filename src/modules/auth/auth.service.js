import authRepository from "./auth.repository.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { generateToken } from "../../utils/token.js";
import { ConflictError, UnAuthorisedError, InternalServerError } from "../../utils/errors.js";

export const signupService = async (username, password, email) => {

  const isEmailExist = await authRepository.findUserByEmail(email);
  if (isEmailExist) {
    throw new ConflictError("Email Already Registered");
  }

  const usernameExist = await authRepository.userExistWithUserName(username);
  if (usernameExist) {
    throw new ConflictError("Username Already Registered");
  }

  const hashedPassword = await hashPassword(password);

  const user = await authRepository.createUser(username, email, hashedPassword);
  if (!user) {
    throw new InternalServerError("Unable to create user at the moment");
  }

  return user;
};

export const loginService = async (email, password) => {
 
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new UnAuthorisedError("Invalid Credentials");
  }

  // Compare password
  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new UnAuthorisedError("Invalid Credentials");
  }

  // Generate token
  const token = generateToken(user.id);

  return {
    user: {
      id:       user.id,
      username: user.username,
      email:    user.email,
    },
    token,
  };
};

const authService = {
  loginService,
  signupService
}

export default authService