import "dotenv/config";
import app from "./app";
import { createServer } from "http";
import { databaseConnect } from "./database/functions";
import { databaseListeners } from "./database/listeners";
var firebase = require("firebase-admin");
import { createClient } from "redis";
import { initializeRedisServer } from "./database/redis-clinet";

const PORT = process.env.API_PORT || 8080;

const server = createServer(app);
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

function startServer() {
  databaseConnect();
  databaseListeners();
  initializeRedisServer();
  // var serviceAccount = require("../btd-app-88754-firebase-adminsdk-df9ta-289a91df9e.json");

  var serviceAccount = {
    type: process.env.type,
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    private_key: process.env.private_key?.replace(/\\n/g, "\n"),
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: process.env.auth_uri,
    token_uri: process.env.token_uri,
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.client_x509_cert_url,
    universe_domain: process.env.universe_domain,
  };

  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    projectId: "674723408270",
  });

  const envRequired = ["API_PORT", "JWT_SECRET"];

  envRequired.forEach((prop) => {
    if (!process.env[prop]) {
      console.log(`Required environment variable '${prop}' wasn't provided.`);
    }
  });
}

startServer();
