import { Types } from "mongoose";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./env";

export interface IUserToken
  extends Omit<
    User,
    | "password"
    | "activationCode"
    | "isActive"
    | "email"
    | "fullname"
    | "profilePicture"
    | "username"
  > {
  id?: Types.ObjectId;
}

export const generateToken = (user: IUserToken): string => {
  const token = jwt.sign(user, JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};

export const getUserData = (token: string) => {
  const user = jwt.verify(token, JWT_SECRET) as IUserToken;
  console.log(user);

  return user;
};
