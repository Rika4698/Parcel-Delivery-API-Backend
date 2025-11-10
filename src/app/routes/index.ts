import { Router } from "express";
import { userRoute } from "../modules/user/user.router";
import { authRoute } from "../modules/auth/auth.route";
import { parcelRouter } from "../modules/parcel/parcel.router";
import { statsRoute } from "../modules/stats/stats.route";
import { contactRoute } from "../modules/contact/contact.route";



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
    },
    {
    path: '/stats',
    route: statsRoute,
  },
  {
    path: '/contact',
    route: contactRoute,
  },
];

routes.forEach(route => {
    router.use(route.path, route.route);
});
