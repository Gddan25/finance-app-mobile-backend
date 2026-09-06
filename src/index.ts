import express, { Request, Response } from "express"
import cors from "cors"
import authRoutes from "./routes/authRoutes"
import transactionRoutes from "./routes/transactionRoutes"
import userRoutes from "./routes/userRoutes"

const app = express()
const PORT = 8080

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/user", userRoutes)

app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "OK", message: "Сервер работае!" })
})

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`)
})