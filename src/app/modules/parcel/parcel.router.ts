import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { createParcelZodSchema, updateParcelStatusZodSchema } from "./parcel.validation";
import { parcelController } from "./parcel.controller";
import { Role } from "../user/user.interface";




const router = Router()

//for senders
router.post('/create', checkAuth(...Object.values(Role)), validateRequest(createParcelZodSchema), parcelController.createParcel);

router.patch('/update/:id', checkAuth(Role.SENDER), validateRequest(updateParcelStatusZodSchema), parcelController.updateParcel)

router.patch('/cancel/:id', checkAuth(...Object.values(Role)), parcelController.cancelParcel);

//for sender, receiver, admin
router.get('/all', checkAuth(...Object.values(Role)), parcelController.getAllParcels)

// for receiver
router.get('/incoming-parcel', checkAuth(Role.RECEIVER), parcelController.receiverIncomingParcels);

router.patch('/confirm/:id', checkAuth(Role.RECEIVER), parcelController.confirmedDelivery);


export const parcelRouter = router