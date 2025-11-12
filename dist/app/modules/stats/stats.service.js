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
exports.statsService = exports.getUserStats = void 0;
const parcel_model_1 = require("../parcel/parcel.model");
const user_model_1 = require("../user/user.model");
const getParcelsStats = (decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserAdmin = decodedUser.role === 'ADMIN';
    if (!isUserAdmin) {
        throw new Error('Unauthorized access');
    }
    const parcelStats = yield parcel_model_1.Parcel.aggregate([
        {
            $group: {
                _id: '$currentStatus',
                count: { $sum: 1 },
            },
        },
    ]);
    const dailyTrend = yield parcel_model_1.Parcel.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                },
            },
        },
        {
            $group: {
                _id: {
                    day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    status: '$currentStatus',
                },
                count: { $sum: 1 },
            },
        },
        {
            $group: {
                _id: '$_id.day',
                statuses: {
                    $push: { status: '$_id.status', count: '$count' },
                },
            },
        },
        { $sort: { _id: 1 } },
    ]);
    const monthlyShipments = yield parcel_model_1.Parcel.aggregate([
        {
            $group: {
                _id: {
                    month: { $month: '$createdAt' },
                    year: { $year: '$createdAt' },
                },
                total: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    const topSenders = yield parcel_model_1.Parcel.aggregate([
        {
            $group: {
                _id: '$senderId',
                totalParcels: { $sum: 1 },
            },
        },
        { $sort: { totalParcels: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'sender',
            },
        },
        { $unwind: '$sender' },
        {
            $project: {
                _id: 0,
                senderId: '$sender._id',
                name: '$sender.name',
                email: '$sender.email',
                totalParcels: 1,
            },
        },
    ]);
    const userStats = yield user_model_1.User.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 },
            },
        },
    ]);
    return {
        parcelStats,
        dailyTrend,
        monthlyShipments,
        topSenders,
        userStats,
    };
});
const getUserStats = (decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserAdmin = decodedUser.role === 'ADMIN';
    if (!isUserAdmin) {
        throw new Error('Unauthorized access');
    }
    // Role  distribution
    const roleStats = yield user_model_1.User.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 },
            },
        },
    ]);
    //  Active or Inactive
    const activeUsers = yield user_model_1.User.countDocuments({ isActive: 'ACTIVE' });
    const inactiveUsers = yield user_model_1.User.countDocuments({ isActive: 'INACTIVE' });
    // Verified or Unverified
    const verifiedUsers = yield user_model_1.User.countDocuments({ isVerified: true });
    const unverifiedUsers = yield user_model_1.User.countDocuments({ isVerified: false });
    //Monthly Growth (last 6 months)
    const monthlyGrowth = yield user_model_1.User.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    //Auth Provider stat
    const providerStats = yield user_model_1.User.aggregate([
        { $unwind: '$auths' },
        {
            $group: {
                _id: '$auths.provider',
                count: { $sum: 1 },
            },
        },
    ]);
    return {
        roleStats,
        activeInactive: { active: activeUsers, inactive: inactiveUsers },
        verification: { verified: verifiedUsers, unverified: unverifiedUsers },
        monthlyGrowth,
        providerStats,
    };
});
exports.getUserStats = getUserStats;
exports.statsService = {
    getParcelsStats,
    getUserStats: exports.getUserStats,
};
