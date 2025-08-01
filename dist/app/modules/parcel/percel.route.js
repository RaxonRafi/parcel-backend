"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelRoutes = void 0;
const express_1 = require("express");
const percel_controller_1 = require("./percel.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const validateRequest_1 = require("../../middlewares/validateRequest");
const parcel_validate_1 = require("./parcel.validate");
const router = (0, express_1.Router)();
router.post("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, user_interface_1.Role.ADMIN), percel_controller_1.ParcelController.createParcel);
router.patch("/:trackingId/status", (0, validateRequest_1.validateRequest)(parcel_validate_1.updateStatusZodSchema), (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), percel_controller_1.ParcelController.updateParcelStatus);
router.patch("/:trackingId/cancel", (0, validateRequest_1.validateRequest)(parcel_validate_1.updateStatusZodSchema), (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER), percel_controller_1.ParcelController.cancelParcel);
router.get("/my-parcels", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER), percel_controller_1.ParcelController.viewParcelAndStatusLogList);
router.get("/incoming-parcels", (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER), percel_controller_1.ParcelController.getParcelsForReceiver);
router.patch("/:trackingId/confirm", (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER), percel_controller_1.ParcelController.confirmDeliveryByReceiver);
router.get("/delivery-history", (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER), percel_controller_1.ParcelController.getReceiverDeliveryHistory);
router.get("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), percel_controller_1.ParcelController.getAllParcels);
router.get("/:trackingId", percel_controller_1.ParcelController.getSingleParcel);
router.patch("/:trackingId/block", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), percel_controller_1.ParcelController.blockParcel);
exports.ParcelRoutes = router;
