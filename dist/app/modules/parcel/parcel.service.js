"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelServices = exports.getAllParcels = exports.getReceiverDeliveryHistory = exports.confirmDeliveryByReceiver = exports.getParcelsForReceiver = exports.viewParcelAndStatusLogList = exports.cancelParcel = exports.createParcel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const trackingIdGen_1 = require("../../utils/trackingIdGen");
const parcel_interface_1 = require("./parcel.interface");
const percel_model_1 = require("./percel.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const parcel_constants_1 = require("./parcel.constants");
const user_interface_1 = require("../user/user.interface");
const sendEmail_1 = require("../../utils/sendEmail");
const user_model_1 = require("../user/user.model");
const env_1 = require("../../config/env");
const createParcel = (Payload) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const trackingId = (0, trackingIdGen_1.generateTrackingId)();
        const { sender, receiver, fromAddress, toAddress } = Payload, rest = __rest(Payload, ["sender", "receiver", "fromAddress", "toAddress"]);
        const SenderData = yield user_model_1.User.findById(sender).select("name email");
        const statusLog = {
            status: parcel_interface_1.Status.REQUESTED,
            updatedBy: new mongoose_1.Types.ObjectId(sender),
            timestamp: new Date(),
            note: "Parcel created",
        };
        const parcel = yield percel_model_1.Parcel.create([
            Object.assign({ trackingId,
                sender,
                receiver,
                fromAddress,
                toAddress, currentStatus: parcel_interface_1.Status.REQUESTED, statusLogs: [statusLog] }, rest),
        ], { session });
        yield session.commitTransaction();
        session.endSession();
        // Send email to sender
        yield (0, sendEmail_1.sendEmail)({
            to: (SenderData === null || SenderData === void 0 ? void 0 : SenderData.email) || "user@example.com",
            subject: `Parcel Created: ${trackingId}`,
            templateName: "parcelCreated",
            templateData: { trackingId, fromAddress, toAddress, senderName: SenderData === null || SenderData === void 0 ? void 0 : SenderData.name, baseUrl: env_1.envVars.FRONTEND_URL },
        });
        return parcel[0];
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.createParcel = createParcel;
const updateParcelStatus = (trackingId, user, newStatusLog) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const parcel = yield percel_model_1.Parcel.findOne({ trackingId }).session(session);
        const { status: newStatus, location, note } = newStatusLog;
        const updatedBy = user.userId;
        if (!newStatus) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Status is required");
        }
        if (!updatedBy) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "updatedBy is required");
        }
        if (!parcel) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found");
        }
        if (parcel.isCanceled) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Parcel is canceled and cannot be updated");
        }
        if (parcel.isBlocked) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Parcel is blocked and cannot be updated");
        }
        const validTransitions = {
            [parcel_interface_1.Status.REQUESTED]: [parcel_interface_1.Status.APPROVED, parcel_interface_1.Status.CANCELED, parcel_interface_1.Status.BLOCKED],
            [parcel_interface_1.Status.APPROVED]: [parcel_interface_1.Status.DISPATCHED, parcel_interface_1.Status.CANCELED, parcel_interface_1.Status.BLOCKED],
            [parcel_interface_1.Status.DISPATCHED]: [parcel_interface_1.Status.IN_TRANSIT, parcel_interface_1.Status.BLOCKED],
            [parcel_interface_1.Status.IN_TRANSIT]: [parcel_interface_1.Status.DELIVERED, parcel_interface_1.Status.BLOCKED],
            [parcel_interface_1.Status.DELIVERED]: [],
            [parcel_interface_1.Status.CANCELED]: [],
            [parcel_interface_1.Status.BLOCKED]: [],
        };
        const currentStatus = parcel.currentStatus;
        const allowedNext = validTransitions[currentStatus];
        if (!allowedNext.includes(newStatus)) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Invalid status transition from ${currentStatus} → ${newStatus}`);
        }
        parcel.currentStatus = newStatus;
        if (newStatus === parcel_interface_1.Status.DELIVERED) {
            parcel.actualDelivery = new Date();
        }
        parcel.statusLogs.push({
            status: newStatus,
            updatedBy: new mongoose_1.Types.ObjectId(updatedBy),
            location,
            note,
            timestamp: new Date(),
        });
        yield parcel.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return parcel;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const cancelParcel = (trackingId, user, newStatusLog) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const parcel = yield percel_model_1.Parcel.findOne({ trackingId }).session(session);
        const updatedBy = user.userId;
        const receiverData = yield user_model_1.User.findById(parcel === null || parcel === void 0 ? void 0 : parcel.receiver).select("name email");
        if (!parcel) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Parcel Not Available!!!");
        }
        if (parcel.sender.toString() !== updatedBy) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not allowed to cancel this parcel");
        }
        if (parcel.isCanceled) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Parcel is already canceled!!!");
        }
        if (parcel.isBlocked) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Parcel is already blocked!!!");
        }
        const notAllowedPath = [parcel_interface_1.Status.DISPATCHED, parcel_interface_1.Status.IN_TRANSIT, parcel_interface_1.Status.DELIVERED];
        if (notAllowedPath.includes(parcel.currentStatus)) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Parcel is already ${parcel.currentStatus}. Can't cancel it.`);
        }
        parcel.currentStatus = parcel_interface_1.Status.CANCELED;
        parcel.isCanceled = true;
        parcel.statusLogs.push({
            status: parcel_interface_1.Status.CANCELED,
            updatedBy: new mongoose_1.Types.ObjectId(updatedBy),
            timestamp: new Date(),
            note: newStatusLog.note,
            location: newStatusLog.location,
        });
        yield parcel.save({ session });
        yield session.commitTransaction();
        session.endSession();
        yield (0, sendEmail_1.sendEmail)({
            to: (receiverData === null || receiverData === void 0 ? void 0 : receiverData.email) || "receiver@example.com",
            subject: `Parcel Canceled: ${trackingId}`,
            templateName: "parcelCanceled",
            templateData: { trackingId, note: newStatusLog.note },
        });
        return parcel;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.cancelParcel = cancelParcel;
const viewParcelAndStatusLogList = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = user.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User ID is missing");
    }
    const parcels = yield percel_model_1.Parcel.find({ sender: new mongoose_1.Types.ObjectId(userId) }).populate("statusLogs.updatedBy");
    return parcels.map(parcel => parcel.toObject());
});
exports.viewParcelAndStatusLogList = viewParcelAndStatusLogList;
const getParcelsForReceiver = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = user.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User ID is missing");
    }
    const parcels = yield percel_model_1.Parcel.find({ receiver: new mongoose_1.Types.ObjectId(userId) });
    return parcels.map(parcel => parcel.toObject());
});
exports.getParcelsForReceiver = getParcelsForReceiver;
const confirmDeliveryByReceiver = (trackingId, user, note) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const userId = user.userId;
        const parcel = yield percel_model_1.Parcel.findOne({ trackingId }).session(session);
        const senderData = yield user_model_1.User.findById(parcel === null || parcel === void 0 ? void 0 : parcel.sender).select("name email");
        if (!parcel) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found");
        }
        if (user.role !== user_interface_1.Role.RECEIVER) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only receiver can confirm delivery");
        }
        if (parcel.receiver.toString() !== userId) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Not authorized to confirm this delivery");
        }
        if (parcel.currentStatus !== parcel_interface_1.Status.IN_TRANSIT) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Parcel is not in transit and cannot be marked as delivered");
        }
        parcel.currentStatus = parcel_interface_1.Status.DELIVERED;
        parcel.actualDelivery = new Date();
        parcel.statusLogs.push({
            status: parcel_interface_1.Status.DELIVERED,
            updatedBy: new mongoose_1.Types.ObjectId(userId),
            note,
            timestamp: new Date(),
            location: "DELIVERED BY RECEIVER",
        });
        yield parcel.save({ session });
        yield session.commitTransaction();
        session.endSession();
        // Send email
        yield (0, sendEmail_1.sendEmail)({
            to: (senderData === null || senderData === void 0 ? void 0 : senderData.email) || "sender@example.com",
            subject: `Parcel Delivered: ${trackingId}`,
            templateName: "parcelDelivered",
            templateData: { trackingId, note, deliveredBy: user.name },
        });
        return parcel;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.confirmDeliveryByReceiver = confirmDeliveryByReceiver;
const getReceiverDeliveryHistory = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const receiverId = user.userId;
    const parcels = yield percel_model_1.Parcel.find({
        receiver: new mongoose_1.Types.ObjectId(receiverId),
        currentStatus: parcel_interface_1.Status.DELIVERED,
    });
    const result = parcels.map(parcel => (Object.assign(Object.assign({}, parcel.toObject()), { statusLogs: parcel.statusLogs || [] })));
    return result;
});
exports.getReceiverDeliveryHistory = getReceiverDeliveryHistory;
const getAllParcels = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(percel_model_1.Parcel.find()
        .populate("sender")
        .populate("receiver"), query);
    const parcelData = queryBuilder
        .filter()
        .search(parcel_constants_1.ParcelSearchableFields)
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        parcelData.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
exports.getAllParcels = getAllParcels;
const getSingleParcel = (trackingId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield percel_model_1.Parcel.findOne({ trackingId });
    return {
        data: parcel
    };
});
const blockParcel = (trackingId, user, details) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const parcel = yield percel_model_1.Parcel.findOne({ trackingId }).session(session);
        const updatedBy = user.userId;
        const receiverData = yield user_model_1.User.findById(parcel === null || parcel === void 0 ? void 0 : parcel.receiver).select("name email");
        if (!parcel) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found");
        }
        if (parcel.isBlocked) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Parcel is already blocked");
        }
        if (parcel.currentStatus === parcel_interface_1.Status.DELIVERED ||
            parcel.currentStatus === parcel_interface_1.Status.CANCELED) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Parcel is already ${parcel.currentStatus} and cannot be blocked`);
        }
        parcel.isBlocked = true;
        parcel.currentStatus = parcel_interface_1.Status.BLOCKED;
        parcel.statusLogs.push({
            status: parcel_interface_1.Status.BLOCKED,
            updatedBy: new mongoose_1.Types.ObjectId(updatedBy),
            timestamp: new Date(),
            location: details.location || "BLOCKED",
            note: details.note || "Parcel was blocked",
        });
        yield parcel.save({ session });
        yield session.commitTransaction();
        session.endSession();
        // Send email to receiver/sender
        yield (0, sendEmail_1.sendEmail)({
            to: (receiverData === null || receiverData === void 0 ? void 0 : receiverData.email) || "receiver@example.com",
            subject: `Parcel Blocked: ${trackingId}`,
            templateName: "parcelBlocked",
            templateData: { trackingId, note: details.note, location: details.location },
        });
        return parcel;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const unblockParcel = (trackingId, user, details) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield percel_model_1.Parcel.findOne({ trackingId });
    if (!parcel)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found");
    parcel.isBlocked = false;
    parcel.currentStatus = parcel_interface_1.Status.APPROVED;
    const updatedBy = user.userId;
    parcel.statusLogs.push({
        status: parcel_interface_1.Status.APPROVED,
        updatedBy: new mongoose_1.Types.ObjectId(updatedBy),
        location: details.location,
        note: details.note || "Parcel was unblocked",
    });
    return parcel.save();
});
exports.ParcelServices = {
    createParcel: exports.createParcel,
    updateParcelStatus,
    cancelParcel: exports.cancelParcel,
    viewParcelAndStatusLogList: exports.viewParcelAndStatusLogList,
    getParcelsForReceiver: exports.getParcelsForReceiver,
    confirmDeliveryByReceiver: exports.confirmDeliveryByReceiver,
    getReceiverDeliveryHistory: exports.getReceiverDeliveryHistory,
    getAllParcels: exports.getAllParcels,
    getSingleParcel,
    blockParcel,
    unblockParcel
};
