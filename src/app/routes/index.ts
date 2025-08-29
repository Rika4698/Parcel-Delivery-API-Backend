import { Router } from "express";
import { userRoute } from "../modules/user/user.router";
import { authRoute } from "../modules/auth/auth.route";
import { parcelRouter } from "../modules/parcel/parcel.router";



export const router = Router();

const routes = [
    {
       path:'/auth',
       route:authRoute,
    },
    {
        path:'/user',
        route:userRoute,
    },
    {
        path:'/parcels',
        route:parcelRouter,
    }
];

routes.forEach(route => {
    router.use(route.path, route.route);
});
