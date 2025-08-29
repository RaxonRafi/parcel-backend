import { Router } from "express"
import { UserController } from "./user.controller"
import { createUserZodSchema } from "./user.validation"
import { validateRequest } from "../../middlewares/validateRequest"
import { checkAuth } from "../../middlewares/checkAuth"
import { Role } from "./user.interface"
import { multerUpload } from "../../config/multer.config"


const router = Router()

router.post(
    "/register",
    validateRequest(createUserZodSchema),
    UserController.createUser
)
router.patch(
    "/submit-nid",
    checkAuth(...Object.values(Role)),
    multerUpload.array("files"),
    UserController.submitNid
)
router.patch(
    "/approve-delivery-personnel/:id",
    checkAuth(Role.ADMIN),
    UserController.approveDeliveryPersonnels
)
router.patch(
    "/update-profile", 
    checkAuth(...Object.values(Role)),
    UserController.updateUser
)
router.get(
    "/me",
    checkAuth(...Object.values(Role)),
    UserController.getMe
)
router.get(
    "/all-users", 
    checkAuth(Role.ADMIN), 
    UserController.getAllUsers
)
router.get(
    "/sender-list", 
    checkAuth(...Object.values(Role)), 
    UserController.senderList
)
router.get(
    "/receiver-list", 
    checkAuth(...Object.values(Role)), 
    UserController.receiverList
)
router.get(
    "/delivery-personnels", 
    checkAuth(Role.ADMIN), 
    UserController.getAllDeliveryPersonnels
)
router.get(
    "/:id", 
    checkAuth(Role.ADMIN), 
    UserController.getSingleUser
)
router.delete(
    "/:id", 
    checkAuth(Role.ADMIN), 
    UserController.deleteUser
)
router.patch(
    "/:userId/block", 
    checkAuth(Role.ADMIN), 
    UserController.blockUser
)
router.patch(
    "/:userId/unblock", 
    checkAuth(Role.ADMIN), 
    UserController.unblockUser
)


export const UserRoutes = router