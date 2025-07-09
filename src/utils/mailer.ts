import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  variables: Record<string, string>;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({
  to,
  subject,
  templateName,
  variables,
}: SendEmailOptions) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "emailTemplates",
    templateName
  );
  let html = fs.readFileSync(templatePath, "utf8");

  for (const [key, value] of Object.entries(variables)) {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};
