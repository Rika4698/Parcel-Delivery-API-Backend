import { JwtPayload } from "jsonwebtoken";
import { Parcel } from "../parcel/parcel.model";
import { User } from "../user/user.model";

const getParcelsStats = async (decodedUser: JwtPayload) => {
  const isUserAdmin = decodedUser.role === 'ADMIN';
  if (!isUserAdmin) {
    throw new Error('Unauthorized access');
  }
  const parcelStats = await Parcel.aggregate([
    {
      $group: {
        _id: {
          $cond: [
            { $in: ['$currentStatus', ['DELIVERED', 'CONFIRMED']] },
            'COMPLETED',
            '$currentStatus',
          ],
        },
        count: { $sum: 1 },
      },
    },
  ]);


  const dailyTrend = await Parcel.aggregate([
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

  const monthlyShipments = await Parcel.aggregate([
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

  const topSenders = await Parcel.aggregate([
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

  const userStats = await User.aggregate([
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
};



export const statsService = {
  getParcelsStats,
  
};
