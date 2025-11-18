import dotenv from "dotenv";

dotenv.config();

export const DATABASE_URL: string = process.env.DATABASE_URL || "";
export const PASSWORD_SECRET: string = process.env.SECRET_PASSWORD || "";
export const JWT_SECRET: string = process.env.JWT_SECRET || "";
