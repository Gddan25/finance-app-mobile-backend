import { Request, Response } from "express"
import prisma from "../prisma"
import { getUserIdFromToken } from "../utils/auth"

const checkDate = (date: string) => /^\d{2}\.\d{2}\.\d{4}$/.test(date)

const checkTitle = (title: string) => title.length > 0

const checkCategory = (category: string) => category === "доход" || category === "расход"

const checkSum = (sum: string) => parseFloat(sum) > 0

const checkDatesSequence = (startDate: string, endDate: string) => {
    const [startDateDay, startDateMonth, startDateYear] = startDate.split(".").map(datePart => parseInt(datePart, 10))
    const [endDateDay, endDateMonth, endDateYear] = endDate.split(".").map(datePart => parseInt(datePart, 10))

    if (!startDateDay || !startDateMonth || !startDateYear || !endDateDay || !endDateMonth || !endDateYear) {
        return false
    }

    if (isNaN(startDateDay) || isNaN(startDateMonth) || isNaN(startDateYear) || isNaN(endDateDay) || isNaN(endDateMonth) || isNaN(endDateYear)) {
        return false
    }

    if (startDateYear > endDateYear) {
        return false
    }

    if (startDateMonth > endDateMonth && startDateYear === endDateYear) {
        return false
    }

    if (startDateDay > endDateDay && startDateMonth === endDateMonth && startDateYear === endDateYear) {
        return false
    }

    return true
}

export const createTransaction = async (req: Request, res: Response) => {
    try {
        const userId = getUserIdFromToken(req)

        const { transactionDate, title, transactionType, amount } = req.body

        if (!transactionDate || !title || !transactionType || !amount) {
            return res.status(400).json({ error: "Все поля карточки должны быть заполнены!" })
        }

        if (!checkDate(transactionDate)) {
            return res.status(400).json({ error: "Дата транзакции введена некорректно!" })
        }

        if (!checkTitle(title)) {
            return res.status(400).json({ error: "Название транзакции введено некорректно!" })
        }

        if (!checkCategory(transactionType)) {
            return res.status(400).json({ error: "Категория транзакции введена некорректно!" })
        }

        if (!checkSum(amount)) {
            return res.status(400).json({ error: "Сумма введена некорректно!" })
        }

        const formattedTransactionDate = transactionDate.split(".").reverse().join("-")

        const transaction = await prisma.transactions.create({
            data: { userId, transactionDate: formattedTransactionDate, title, transactionType, amount }
        })

        res.status(201).json(transaction)
    }
    catch(error) {
        if (error instanceof Error && error.message === "Пользователь не авторизован!") {
            return res.status(401).json({ error: "Пользователь не авторизован!" })
        }

        console.error(error)

        res.status(500).json({ error: "Ошибка сервера!" })
    }
}

export const getTransactionsByDate = async (req: Request, res: Response) => {
    try {
        const userId = getUserIdFromToken(req)

        const chosenDate = req.query.chosenDate as string

        if (!chosenDate) {
            return res.status(400).json({ error: "Поле с датой должно быть заполнено!" })
        }

        if (!checkDate(chosenDate)) {
            return res.status(400).json({ error: "Дата транзакции введена некорректно!" })
        }

        const formattedChosenDate = chosenDate.split(".").reverse().join("-")

        const transactions = await prisma.transactions.findMany({
            where: { userId, transactionDate: formattedChosenDate },
            orderBy: { createdAt: "desc"}
        })

        res.status(200).json(transactions)
    }
    catch(error) {
        if (error instanceof Error && error.message === "Пользователь не авторизован!") {
            return res.status(401).json({ error: "Пользователь не авторизован!" })
        }

        console.error(error)

        res.status(500).json({ error: "Ошибка сервера!" })
    }
}

export const getTransactionsByPeriod = async (req: Request, res: Response) => {
    try {
        const userId = getUserIdFromToken(req)

        const startDate = req.query.startDate as string
        const endDate = req.query.endDate as string

        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Поля с датами начала и окончания периода должны быть заполнены!" })
        }

        if (!checkDate(startDate)) {
            return res.status(400).json({ error: "Дата начала периода транзакций введена некорректно!" })
        }

        if (!checkDate(endDate)) {
            return res.status(400).json({ error: "Дата окончания периода транзакций введена некорректно!" })
        }

        if (!checkDatesSequence(startDate, endDate)) {
             return res.status(400).json({ error: "Период транзакций введён некорректно!" })
        }

        const formattedStartDate = startDate.split(".").reverse().join("-")
        const formattedEndDate = endDate.split(".").reverse().join("-")

        const transactions = await prisma.transactions.findMany({
            where: { userId, transactionDate: {
                    gte: formattedStartDate,
                    lte: formattedEndDate
                }
            },
            orderBy: { transactionDate: "asc"}
        })

        res.status(200).json(transactions)
    }
    catch(error) {
        if (error instanceof Error && error.message === "Пользователь не авторизован!") {
            return res.status(401).json({ error: "Пользователь не авторизован!" })
        }

        console.error(error)

        res.status(500).json({ error: "Ошибка сервера!" })
    }
}