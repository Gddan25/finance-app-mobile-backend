import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../prisma"

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"

const checkName = (name: string) => name.length > 1

const checkSurname = (surname: string) => surname.length > 1

const checkEmail = (email: string) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)

const checkPassword = (password: string) => password.length > 7 && password.length < 17

export const register = async (req: Request, res: Response) => {
    try {
        const { name, surname, email, password } = req.body

        const existingUser = await prisma.user.findUnique({ where: { email } })

        if (existingUser) {
            return res.status(400).json({ error: "Пользователь с такой почтой уже существует!"})
        }

        if (!checkName(name)) {
            return res.status(400).json({ error: "Имя введено некорректно!"})
        }

        if (!checkSurname(surname)) {
            return res.status(400).json({ error: "Фамилия введена некорректно!"})
        }

        if (!checkEmail(email)) {
            return res.status(400).json({ error: "Почта введена некорректно!"})
        }

        if (!checkPassword(password)) {
            return res.status(400).json({ error: "Пароль введён некорректно!"})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: { name, surname, email, hashedPassword }
        })

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" })

        res.status(201).json({ token, user: { id: user.id, name: user.name, surname: user.surname, email: user.email } })
    }
    catch(error) {
        console.error(error)

        res.status(500).json({ error: "Ошибка сервера!" })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return res.status(401).json({ error: "Неверный адрес электронной почты или пароль!"})
        }

        if (!checkEmail(email)) {
            return res.status(400).json({ error: "Почта введена некорректно!"})
        }

        if (!checkPassword(password)) {
            return res.status(400).json({ error: "Пароль введён некорректно!"})
        }

        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword)

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Неверный адрес электронной почты или пароль!"})
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, {expiresIn: "7d"})

        res.status(200).json({ token, user: { id: user.id, name: user.name, surname: user.surname, email: user.email } })
    }
    catch(error) {
        console.error(error)

        res.status(500).json({error: "Ошибка сервера!"})
    }
}