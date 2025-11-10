import {  Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { statsController } from "./stats.controller";



const router = Router()

router.get('/parcel-stat', checkAuth(Role.ADMIN) , statsController.getParcelsStats)
router.get('/user-stats', checkAuth(Role.ADMIN) , statsController.getUsersStats)



export const statsRoute = router;