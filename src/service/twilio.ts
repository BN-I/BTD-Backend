const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

export async function createMessage(
  recipientPhone: string,
  text: string,
  signature?: string
) {
  try {
    await client.messages.create({
      body: `${text}\n\n${signature}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: recipientPhone,
    });
  } catch (err) {
    console.log(err);
  }
}
