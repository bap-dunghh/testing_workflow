// nodes/emailSend.ts
import nodemailer from "nodemailer";
import { WorkflowNode, NodeData } from "@/types";

export class EmailSendNode implements WorkflowNode {
  name = "EmailSend";

  private transporter; // Cấu hình SMTP hoặc email service

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // Ví dụ: "smtp.gmail.com"
      port: parseInt(process.env.EMAIL_PORT || "587"), // Ví dụ: 587 cho TLS
      secure: false, // true cho port 465, false cho các port khác
      auth: {
        user: process.env.EMAIL_USER, // Email của bạn
        pass: process.env.EMAIL_PASSWORD, // Mật khẩu hoặc App Password
      },
    });
  }

  async execute(input: NodeData): Promise<NodeData> {
    try {
      const content = input.content || "Default email content"; // Giả sử input.content là nội dung email
      const to = "recipient@example.com"; // Cấu hình email người nhận trong .env hoặc input
      const subject = "Workflow Email";

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text: content,
      });

      return {
        content: `Email sent to ${to}`,
        type: "text",
        status: "success",
      };
    } catch (error: any) {
      throw new Error(`Email sending error: ${error.message}`);
    }
  }
}