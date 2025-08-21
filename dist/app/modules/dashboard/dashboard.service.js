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
exports.DashBoardServices = exports.getDashboardStates = void 0;
const percel_model_1 = require("../parcel/percel.model");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const getDashboardStates = () => __awaiter(void 0, void 0, void 0, function* () {
    const [totalUsers, totalSenders, totalReceivers] = yield Promise.all([
        user_model_1.User.countDocuments(),
        user_model_1.User.countDocuments({ role: user_interface_1.Role.SENDER }),
        user_model_1.User.countDocuments({ role: user_interface_1.Role.RECEIVER }),
    ]);
    const [totalParcels, blockedParcels, canceledParcels] = yield Promise.all([
        percel_model_1.Parcel.countDocuments(),
        percel_model_1.Parcel.countDocuments({ isBlocked: true }),
        percel_model_1.Parcel.countDocuments({ isCanceled: true }),
    ]);
    const statusBreakdownAgg = yield percel_model_1.Parcel.aggregate([
        {
            $group: {
                _id: "$currentStatus",
                count: { $sum: 1 },
            },
        },
    ]);
    const statusBreakdown = statusBreakdownAgg.reduce((acc, curr) => {
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
});
exports.getDashboardStates = getDashboardStates;
exports.DashBoardServices = {
    getDashboardStates: exports.getDashboardStates
};
