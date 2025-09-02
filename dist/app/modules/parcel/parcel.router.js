"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parcelRouter = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const parcel_validation_1 = require("./parcel.validation");
const parcel_controller_1 = require("./parcel.controller");
const user_interface_1 = require("../user/user.interface");
const router = (0, express_1.Router)();
//for senders
router.post('/create', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), (0, validateRequest_1.validateRequest)(parcel_validation_1.createParcelZodSchema), parcel_controller_1.parcelController.createParcel);
//for sender, receiver, admin
router.get('/all', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), parcel_controller_1.parcelController.getAllParcels);
// a parcel
router.get('/single-parcel/:id', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), parcel_controller_1.parcelController.getAParcel);
// for receiver
router.get('/incoming-parcel', (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER), parcel_controller_1.parcelController.receiverIncomingParcels);
//for sender, receiver, admin
router.get('/delivery-history', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), parcel_controller_1.parcelController.deliveryHistory);
// for receiver
router.patch('/confirm/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER), parcel_controller_1.parcelController.confirmedDelivery);
// for sender
router.patch('/update-parcel/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER), (0, validateRequest_1.validateRequest)(parcel_validation_1.updateParcelZodSchema), parcel_controller_1.parcelController.updateParcel);
router.patch('/cancel/:id', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), parcel_controller_1.parcelController.cancelParcel);
// only admin
router.patch('/parcel-status/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), (0, validateRequest_1.validateRequest)(parcel_validation_1.updateParcelStatusZodSchema), parcel_controller_1.parcelController.updateParcelStatus);
router.delete('/delete/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SENDER), parcel_controller_1.parcelController.deleteParcel);
router.get('/track-parcel/:trackingId', parcel_controller_1.parcelController.trackParcel);
exports.parcelRouter = router;
