import { Parcel } from "../parcel/percel.model";
import { Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { IDashboardStats } from "./dashboard.interface";


export const getDashboardStates = async (): Promise<IDashboardStats> =>{
    const [totalUsers, totalSenders, totalReceivers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: Role.SENDER }),
    User.countDocuments({ role: Role.RECEIVER }),
  ]);
   const [totalParcels, blockedParcels, canceledParcels] = await Promise.all([
    Parcel.countDocuments(),
    Parcel.countDocuments({ isBlocked: true }),
    Parcel.countDocuments({ isCanceled: true }),
  ]);

    const statusBreakdownAgg = await Parcel.aggregate([
    {
      $group: {
        _id: "$currentStatus",
        count: { $sum: 1 },
      },
    },
  ]);
    const statusBreakdown = statusBreakdownAgg.reduce((acc: Record<string, number>, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  return {
    users: {
      totalUsers,
      totalSenders,
      totalReceivers,
    },
    parcels: {
      totalParcels,
      blockedParcels,
      canceledParcels,
      statusBreakdown,
    },
  };

}

export const DashBoardServices = {
    getDashboardStates
}