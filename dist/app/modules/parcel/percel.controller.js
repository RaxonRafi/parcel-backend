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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelController = exports.blockParcel = exports.getSingleParcel = exports.getAllParcels = exports.getReceiverDeliveryHistory = exports.confirmDeliveryByReceiver = exports.getParcelsForReceiver = exports.viewParcelAndStatusLogList = exports.cancelParcel = exports.updateParcelStatus = exports.createParcel = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const parcel_service_1 = require("./parcel.service");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
exports.createParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_service_1.ParcelServices.createParcel(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Parcel Created Successfully",
        data: parcel,
    });
}));
exports.updateParcelStatus = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackingId } = req.params;
    const userId = req.user;
    const { status, updatedBy, location, note } = req.body;
    const parcel = yield parcel_service_1.ParcelServices.updateParcelStatus(trackingId, userId, {
        status,
        updatedBy,
        location,
        note
    });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.ACCEPTED,
        message: "Parcel status Successfully",
        data: parcel,
    });
}));
exports.cancelParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackingId } = req.params;
    const userId = req.user;
    const { status, updatedBy, location, note } = req.body;
    const parcel = yield parcel_service_1.ParcelServices.cancelParcel(trackingId, userId, {
        status,
        updatedBy,
        location,
        note
    });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.ACCEPTED,
        message: "Parcel Canceled Successfully",
        data: parcel,
    });
}));
exports.viewParcelAndStatusLogList = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user;
    const parcel = yield parcel_service_1.ParcelServices.viewParcelAndStatusLogList(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.ACCEPTED,
        message: "Parcel list with status log Successfully",
        data: parcel,
    });
}));
exports.getParcelsForReceiver = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user;
    const parcel = yield parcel_service_1.ParcelServices.getParcelsForReceiver(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.ACCEPTED,
        message: "Incomming Parcels!!",
        data: parcel,
    });
}));
exports.confirmDeliveryByReceiver = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackingId } = req.params;
    const userId = req.user;
    const { note } = req.body;
    const parcel = yield parcel_service_1.ParcelServices.confirmDeliveryByReceiver(trackingId, userId, note);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.ACCEPTED,
        message: "Parcel status Successfully",
        data: parcel,
    });
}));
exports.getReceiverDeliveryHistory = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user;
    const parcel = yield parcel_service_1.ParcelServices.getReceiverDeliveryHistory(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.ACCEPTED,
        message: "Parcel delivery history!!",
        data: parcel,
    });
}));
exports.getAllParcels = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const parcel = yield parcel_service_1.ParcelServices.getAllParcels(query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "All parcels Retrieved Successfully!!",
        data: parcel.data,
        meta: parcel.meta
    });
}));
exports.getSingleParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackingId } = req.params;
    const parcel = yield parcel_service_1.ParcelServices.getSingleParcel(trackingId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "parcel Retrieved Successfully!!",
        data: parcel.data,
    });
}));
exports.blockParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackingId } = req.params;
    const user = req.user;
    const { note, location } = req.body;
    const result = yield parcel_service_1.ParcelServices.blockParcel(trackingId, user, { note, location });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel blocked successfully",
        data: result,
    });
}));
exports.ParcelController = {
    createParcel: exports.createParcel,
    updateParcelStatus: exports.updateParcelStatus,
    cancelParcel: exports.cancelParcel,
    viewParcelAndStatusLogList: exports.viewParcelAndStatusLogList,
    getParcelsForReceiver: exports.getParcelsForReceiver,
    confirmDeliveryByReceiver: exports.confirmDeliveryByReceiver,
    getReceiverDeliveryHistory: exports.getReceiverDeliveryHistory,
    getAllParcels: exports.getAllParcels,
    getSingleParcel: exports.getSingleParcel,
    blockParcel: exports.blockParcel
};
