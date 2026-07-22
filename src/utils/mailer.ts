import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { EmailTemplates, EmailTemplateKey } from "../emailTemplates";

dotenv.config();

interface SendEmailOptions {
  to: string;
  subject: string;
  template: EmailTemplateKey;
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

// Copied into build/assets by scripts/copy-email-templates.js at build time.
// Embedded as a CID attachment (referenced via src="cid:btd-logo" in
// templates) so the logo renders without depending on a public image URL.
const LOGO_PATH = path.join(__dirname, "..", "assets", "btd-logo.png");
const LOGO_CID = "btd-logo";

export const sendEmail = async ({
  to,
  subject,
  template,
  variables,
}: SendEmailOptions) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "emailTemplates",
    EmailTemplates[template]
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
    attachments: fs.existsSync(LOGO_PATH)
      ? [
          {
            filename: "btd-logo.png",
            path: LOGO_PATH,
            cid: LOGO_CID,
          },
        ]
      : [],
  });
};
