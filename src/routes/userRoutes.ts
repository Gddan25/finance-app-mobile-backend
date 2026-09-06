import { Router } from "express"
import { changingPassword } from "../controllers/userController"

const router = Router()

router.patch("/changing-password", changingPassword)

export default router