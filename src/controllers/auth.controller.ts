import { Request, Response } from "express";
import * as Yup from "yup";

import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../middlewares/auth.middleware";

type TRegister = {
  fullname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TLogin = {
  identifier: string;
  password: string;
};

const registerValidateSchema = Yup.object({
  fullname: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().required(),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("password"), ""], "Password does not match"),
});

export default {
  async register(req: Request, res: Response) {
    const { fullname, username, email, password, confirmPassword } =
      req.body as TRegister;

    try {
      await registerValidateSchema.validate({
        fullname,
        username,
        email,
        password,
        confirmPassword,
      });

      const result = await UserModel.create({
        fullname,
        username,
        email,
        password,
      });

      res.status(200).json({
        message: "success registration",
        data: result,
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },
  async login(req: Request, res: Response) {
    const { identifier, password } = req.body as TLogin;

    try {
      const userByIdentifier = await UserModel.findOne({
        $or: [
          {
            email: identifier,
          },
          {
            username: identifier,
          },
        ],
      });

      if (!userByIdentifier)
        return res.status(403).json({ message: "User not found", data: null });

      const validatePassword: boolean =
        encrypt(password) === userByIdentifier.password;

      if (!validatePassword)
        return res.status(403).json({ message: "User not found", data: null });

      const token = generateToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      });

      return res.status(200).json({
        message: "success login",
        data: token,
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },
  async me(req: IReqUser, res: Response) {
    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id);

      res.status(200).json({
        message: "Success get user profile",
        data: result,
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },
};
