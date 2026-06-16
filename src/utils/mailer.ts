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

const smtpPort = Number(process.env.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
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
