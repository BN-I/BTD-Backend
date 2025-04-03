import { createClient } from "redis";

export const redisClient = createClient({
  url: `redis://${process.env.Redis_Host}:${process.env.Redis_Port}`,
});

export const initializeRedisServer = async () => {
  redisClient.on("error", (err) => {
    console.log("Redis Client Error", err);
    process.exit(1);
  });
  await redisClient.connect();
};
