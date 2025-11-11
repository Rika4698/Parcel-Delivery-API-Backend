"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactRoute = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const express_1 = require("express");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = require("http-status-codes");
const contact_model_1 = require("./contact.model");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const router = (0, express_1.Router)();
router.post('/', (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const contact = yield contact_model_1.Contact.create(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Contact message received successfully!',
        data: contact,
    });
})));
router.get('/', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const contacts = contact_model_1.Contact.find();
    const queryBuilders = new QueryBuilder_1.QueryBuilder(contacts, req.query);
    const result = yield queryBuilders.search(['name', 'email', 'subject'])
        .filter()
        .paginate();
    const [data, meta] = yield Promise.all([
        result.build().exec(),
        queryBuilders.getMeta(),
    ]);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Contacts retrieved successfully!',
        data: {
            meta,
            data
        },
    });
})));
exports.contactRoute = router;
