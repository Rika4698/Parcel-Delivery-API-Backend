"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_router_1 = require("../modules/user/user.router");
const auth_route_1 = require("../modules/auth/auth.route");
const parcel_router_1 = require("../modules/parcel/parcel.router");
exports.router = (0, express_1.Router)();
const routes = [
    {
        path: '/auth',
        route: auth_route_1.authRoute,
    },
    {
        path: '/user',
        route: user_router_1.userRoute,
    },
    {
        path: '/parcels',
        route: parcel_router_1.parcelRouter,
    }
];
routes.forEach(route => {
    exports.router.use(route.path, route.route);
});
