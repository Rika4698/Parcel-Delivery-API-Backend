import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { userController } from "./user.controller";
import { Role } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";




const router = Router()
router.post('/register', validateRequest(createUserZodSchema), userController.createUser)


router.get('/all-users', checkAuth(Role.ADMIN), userController.getAllUser)

router.patch('/:id', checkAuth(Role.ADMIN), validateRequest(updateUserZodSchema), userController.updateUser)
router.patch('/update-profile/:id', checkAuth(...Object.values(Role)), validateRequest(updateUserZodSchema), userController.updateUserProfile)

export const userRoute = router