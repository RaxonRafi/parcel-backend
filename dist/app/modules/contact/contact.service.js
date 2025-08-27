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
exports.ContactService = exports.sendMessage = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const sendEmail_1 = require("../../utils/sendEmail");
const sendMessage = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, lastname, email, subject, message } = payload;
    if (!firstname || !lastname || !email || !subject || !message) {
        throw new AppError_1.default(400, "All fields are required");
    }
    try {
        yield (0, sendEmail_1.sendEmail)({
            to: process.env.CONTACT_RECEIVER_EMAIL || "your-email@example.com",
            subject: `${subject} - From ${firstname} ${lastname}`,
            templateName: "contact",
            templateData: { firstname, lastname, email, subject, message },
        });
        return { success: true, message: "Email sent successfully!" };
    }
    catch (err) {
        console.error("Email sending error:", err.message);
        throw new AppError_1.default(500, "Failed to send email.");
    }
});
exports.sendMessage = sendMessage;
exports.ContactService = {
    sendMessage: exports.sendMessage
};
