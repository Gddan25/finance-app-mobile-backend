import { Request } from "express"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const getUserIdFromToken = (req: Request): number => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Пользователь не авторизован!")
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token as string, JWT_SECRET) as { userId: number }

    return decoded.userId
}