import { Router } from "express";
import { ContactController } from "./contact.controller";

const router = Router()
router.post(
    "/",
    ContactController.sendMessage
)

export const ContactRoutes = router