import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ParcelRoutes } from "../modules/parcel/percel.route";
import { DashboardRoutes } from "../modules/dashboard/dashboard.route";
import { ContactRoutes } from "../modules/contact/contact.route";

export const router = Router()
const moduleRoutes = [
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/parcel",
        route: ParcelRoutes
    },
    {
        path: "/dashboard",
        route: DashboardRoutes
    },
    {
        path: "/contact",
        route: ContactRoutes
    },
]

moduleRoutes.forEach((route)=>{
    router.use(route.path,route.route)
})