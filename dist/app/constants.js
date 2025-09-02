"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.excludeFields = exports.notAllowedStatus = void 0;
exports.notAllowedStatus = ['IN_TRANSIT', 'DELIVERED', 'CONFIRMED', 'APPROVED'];
exports.excludeFields = ['page', 'limit', 'sort', 'fields'];
