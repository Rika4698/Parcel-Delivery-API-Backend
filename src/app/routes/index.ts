import { Router } from "express";
import { userRoute } from "../modules/user/userRoute";


export const router = Router();

const routes = [
    {
        path:'/user',
        route:userRoute,
    },
];

routes.forEach(route => {
    router.use(route.path, route.route);
});
