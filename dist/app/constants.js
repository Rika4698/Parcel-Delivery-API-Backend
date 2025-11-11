"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parcelSearchableFields = exports.userFilterableFields = exports.parcelFilterableFields = exports.userSearchableFields = exports.excludeFields = exports.notAllowedStatus = void 0;
exports.notAllowedStatus = ['IN_TRANSIT', 'DELIVERED', 'CONFIRMED', 'APPROVED'];
exports.excludeFields = ['page', 'limit', 'sort', 'fields', 'searchTerm'];
exports.userSearchableFields = ['name', 'email', 'role', 'isActive'];
exports.parcelFilterableFields = ['status', 'senderEmail', 'receiverEmail', 'origin', 'destination'];
exports.userFilterableFields = ['role', 'status'];
exports.parcelSearchableFields = [
    'trackingId',
    'receiverEmail',
    'parcelDetails.address',
    'parcelDetails.phone',
    'parcelDetails.note',
    'currentStatus',
    'senderId'
];
