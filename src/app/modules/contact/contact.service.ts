/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { sendEmail } from "../../utils/sendEmail";

interface SendMessagePayload {
  firstname: string;
  lastname: string;
  email: string;
  subject: string;
  message: string;
}

export const sendMessage = async (payload: SendMessagePayload) => {
  const { firstname, lastname, email, subject, message } = payload;

  if (!firstname || !lastname || !email || !subject || !message) {
    throw new AppError(400, "All fields are required");
  }

  try {
    await sendEmail({
      to: process.env.CONTACT_RECEIVER_EMAIL || "your-email@example.com",
      subject: `${subject} - From ${firstname} ${lastname}`,
      templateName: "contact",
      templateData: { firstname, lastname, email, subject, message },
    });

    return { success: true, message: "Email sent successfully!" };
  } catch (err: any) {
    console.error("Email sending error:", err.message);
    throw new AppError(500, "Failed to send email.");
  }
};

export const ContactService = {
    sendMessage
}
