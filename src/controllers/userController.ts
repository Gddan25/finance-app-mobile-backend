import { Request, Response } from "express"
import prisma from "../prisma"
import bcrypt from "bcryptjs"
import { getUserIdFromToken } from "../utils/auth"

const checkPassword = (password: string) => password.length > 7 && password.length < 17

export const changingPassword = async (req: Request, res: Response) => {
    try {
        const userId = getUserIdFromToken(req)

        const { newPassword } = req.body

        if (!newPassword) {
            return res.status(400).json({ error: "Поле с паролем должно быть заполнено!"})
        }

        if (!checkPassword(newPassword)) {
            return res.status(400).json({ error: "Пароль введён некорректно!"})
        }

        const newhashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { id: userId },
            data: { hashedPassword: newhashedPassword }
        })

        res.status(200).json({ message: "Пароль успешно обновлён!" })
    }
    catch(error) {
        if (error instanceof Error && error.message === "Пользователь не авторизован!") {
            return res.status(401).json({ error: "Пользователь не авторизован!" })
        }

        console.error(error)

        res.status(500).json({ error: "Ошибка сервера!" })
    }
}