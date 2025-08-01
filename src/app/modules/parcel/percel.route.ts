import { Router } from "express";
import { ParcelController } from "./percel.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { updateStatusZodSchema } from "./parcel.validate";

const router = Router()

router.post(
    "/",
    checkAuth(Role.SENDER,Role.ADMIN),
    ParcelController.createParcel
)
router.patch("/:trackingId/status",
    validateRequest(updateStatusZodSchema),
    checkAuth(Role.ADMIN),
    ParcelController.updateParcelStatus
)
router.patch("/:trackingId/cancel",
    validateRequest(updateStatusZodSchema),
    checkAuth(Role.SENDER),
    ParcelController.cancelParcel
)
router.get("/my-parcels",
    checkAuth(Role.SENDER),
    ParcelController.viewParcelAndStatusLogList
)
router.get("/incoming-parcels",
    checkAuth(Role.RECEIVER),
    ParcelController.getParcelsForReceiver
)
router.patch("/:trackingId/confirm",
    checkAuth(Role.RECEIVER),
    ParcelController.confirmDeliveryByReceiver
)
router.get("/delivery-history",
    checkAuth(Role.RECEIVER),
    ParcelController.getReceiverDeliveryHistory
)
router.get("/",
    checkAuth(Role.ADMIN),
    ParcelController.getAllParcels
)
router.get("/:trackingId",
    ParcelController.getSingleParcel
)
router.patch(
    "/:trackingId/block",
    checkAuth(Role.ADMIN),
    ParcelController.blockParcel
)

export const ParcelRoutes = router