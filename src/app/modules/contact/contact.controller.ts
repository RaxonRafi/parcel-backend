import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ContactService } from "./contact.service";


export const sendMessage = catchAsync(async (req: Request, res: Response) => {

  const result = await ContactService.sendMessage(req.body)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Message sent successfully",
    data: result,
  });
});

export const ContactController = {
    sendMessage
}
