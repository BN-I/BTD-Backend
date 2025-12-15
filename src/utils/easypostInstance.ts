import EasyPost from "@easypost/api";

// Initialize EasyPost client with API key from environment variables
export const easypost = new EasyPost(process.env.EASYPOST_API_KEY || "");

