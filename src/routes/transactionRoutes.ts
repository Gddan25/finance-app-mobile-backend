import { Router } from "express"
import { createTransaction, getTransactionsByDate, getTransactionsByPeriod } from "../controllers/transactionController"

const router = Router()

router.post("/create", createTransaction)

router.get("/date", getTransactionsByDate)

router.get("/period", getTransactionsByPeriod)

export default router