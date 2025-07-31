import { Router } from "express"
import { UserController } from "./user.controller"
import { createUserZodSchema } from "./user.validation"
import { validateRequest } from "../../middlewares/validateRequest"

const router = Router()

router.post(
    "/register",
    validateRequest(createUserZodSchema),
    UserController.createUser
)

export const UserRoutes = router