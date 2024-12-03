import "dotenv/config";
import app from "./app";
import { createServer } from "http";
import { databaseConnect } from "./database/functions";
import { databaseListeners } from "./database/listeners";

const PORT = process.env.API_PORT || 8080;

const server = createServer(app);
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

function startServer() {
  databaseConnect();
  databaseListeners();

  const envRequired = ["API_PORT", "JWT_SECRET"];

  envRequired.forEach((prop) => {
    if (!process.env[prop]) {
      console.log(`Required environment variable '${prop}' wasn't provided.`);
    }
  });
}

startServer();
