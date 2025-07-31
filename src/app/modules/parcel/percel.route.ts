import { Router } from "express";
import { ParcelController } from "./percel.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { updateStatusZodSchema } from "./parcel.validate";

const router = Router()

router.post("/",checkAuth(Role.SENDER,Role.ADMIN),ParcelController.createParcel)
router.patch("/:trackingId/status",
    validateRequest(updateStatusZodSchema),
    checkAuth(Role.ADMIN),
    ParcelController.updateParcelStatus
)

export const ParcelRoutes = router