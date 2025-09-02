import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { createParcelZodSchema, updateParcelStatusZodSchema, updateParcelZodSchema } from "./parcel.validation";
import { parcelController } from "./parcel.controller";
import { Role } from "../user/user.interface";




const router = Router()

//for senders
router.post('/create', checkAuth(...Object.values(Role)), validateRequest(createParcelZodSchema), parcelController.createParcel);


//for sender, receiver, admin
router.get('/all', checkAuth(...Object.values(Role)), parcelController.getAllParcels);
// a parcel
router.get('/single-parcel/:id', checkAuth(...Object.values(Role)), parcelController.getAParcel);


// for receiver
router.get('/incoming-parcel', checkAuth(Role.RECEIVER), parcelController.receiverIncomingParcels);



//for sender, receiver, admin
router.get('/delivery-history', checkAuth(...Object.values(Role)), parcelController.deliveryHistory);


// for receiver
router.patch('/confirm/:id', checkAuth(Role.RECEIVER), parcelController.confirmedDelivery);


// for sender
router.patch('/update-parcel/:id', checkAuth(Role.SENDER), validateRequest(updateParcelZodSchema), parcelController.updateParcel);

router.patch('/cancel/:id', checkAuth(...Object.values(Role)), parcelController.cancelParcel);




// only admin
router.patch('/parcel-status/:id', checkAuth(Role.ADMIN), validateRequest(updateParcelStatusZodSchema), parcelController.updateParcelStatus);

router.delete('/delete/:id', checkAuth(Role.ADMIN, Role.SENDER), parcelController.deleteParcel);

router.get('/track-parcel/:trackingId', parcelController.trackParcel);


export const parcelRouter = router