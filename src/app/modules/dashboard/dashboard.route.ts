import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { DashboardController } from "./dashboard.controller";

const router = Router()

router.get("/",checkAuth(Role.ADMIN),DashboardController.getDashboardStates)

export const DashboardRoutes = router