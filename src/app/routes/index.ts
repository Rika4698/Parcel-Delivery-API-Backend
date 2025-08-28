import { Router } from "express";
import { userRoute } from "../modules/user/user.router";
import { authRoute } from "../modules/auth/auth.route";



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
];

routes.forEach(route => {
    router.use(route.path, route.route);
});
